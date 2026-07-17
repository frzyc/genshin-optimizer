import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import { precompute } from '@genshin-optimizer/gi/wr'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  DynStat,
  FutureArtifactProfile,
  PartialBuildCandidates,
  PartialBuildWitness,
  PartialBuildsData,
  PartialBuildsSetup,
  SolverPartialBuild,
} from '../common'
import { profileBoundingBox } from '../common'
import type {
  ArtContext,
  DiffBound,
  SlotDiffBound,
} from './BNBSplitWorker/diffBound'
import { compileDiffBound } from './BNBSplitWorker/diffBound'

/**
 * Winnow the accumulated candidate partial builds down to a *tight* set, and
 * attach a *witness* to each survivor.
 *
 * Setting: for a tracked slot, a candidate `r` fills the other four slots;
 * `g_r(x) = optTarget(x + r)` for a hypothetical slot artifact `x` drawn from
 * the requested `FutureArtifactProfile`s; constraints define feasibility;
 * `threshold` (θ) is the solve's final top-1 build value. The candidates
 * dominate everything the solve enumerated, so tightening only compares
 * candidates among themselves (coverage is pointwise transitive).
 *
 * Deletion criterion — pointwise union coverage: delete `m` iff for every
 * legal `x`, either `g_m(x) < θ` (the already-returned best build stands), or
 * `x + m` is infeasible, or some live member `q` has `x + q` feasible and
 * `g_q(x) >= g_m(x)`. Different members may cover different parts of the
 * space; no single dominator is required. Members are deleted one at a time
 * against the *live* set, so no tie-breaking asymmetry is needed: of two
 * exact ties, whichever is examined first is deleted (covered by the other),
 * and deleting a covered member never changes the upper envelope
 * `max(θ, max_q g_q)` — which also makes the deletion order irrelevant.
 *
 * The comparison test (bounding oracle) is the conditioned difference bound
 * of `diffBound.ts`, transposed: `sb.evaluate(ctx_m, ctx_q)` bounds
 * `g_q(x) − g_m(x)` over a *box* of x (`forRest(base + fixed + box)`).
 * Linear reads cancel exactly, so the interval slack comes only from the
 * interaction of `Δstats(q, m)` with the box ranges and vanishes as the box
 * shrinks — which is what makes it usable as a branch-and-bound oracle.
 * `q` covers `m` on a box iff the target diff has `lo >= 0` and every
 * constraint has `lo_j >= 0` *or* `q` provably meets it on the whole box
 * (either way "x+m feasible ⇒ x+q feasible").
 *
 * Per member and profile, a branch and bound over the substat box:
 *  - a box is *excused* when `m` cannot be relevant on it (conditioned target
 *    max < θ, a constraint unreachable), or when it contains no legal
 *    artifact (more than `maxSubstats` keys forced nonzero, or the roll
 *    budget already exceeded by the box minima);
 *  - a box is *covered* when some live member covers `m` on it;
 *  - otherwise the box center is *legalized* (top `maxSubstats` substats by
 *    invested rolls, scaled into the roll budget — net of each substat
 *    slot's mandatory roll — and rounded to whole rolls) and evaluated
 *    **exactly**.
 *    If `m` is feasible and beats `max(θ, every live member)` there, that
 *    point is the witness: `margin > 0` is a strict proof of necessity;
 *  - failing all three, bisect the highest-impact dimension and recurse.
 *
 * Soundness vs tightness: a member is deleted only with a full coverage
 * certificate, so the output always covers the candidates (no ε-error
 * chaining). When the search budget (`maxBoxes`, `minWidthRel`) runs out
 * undecided, the member is *kept*, carrying its best sampled point as an
 * honest witness with `margin <= 0` — tightness degrades, never coverage.
 *
 * Runs entirely in the original stat space of `PartialBuildsSetup` (witness
 * artifacts must be expressed in real stat keys). Throws `DiffBoundError` on
 * unsupported node patterns, like the tracker.
 */
export type TightenOptions = {
  /** Live members tried as coverers per box, most promising first. */
  maxCoverers?: number
  /** Boxes explored per (member, profile) before giving up as inconclusive. */
  maxBoxes?: number
  /** Stop bisecting a dimension below this fraction of its root width. */
  minWidthRel?: number
}

export function tightenPartialBuilds(
  setup: PartialBuildsSetup,
  candidates: PartialBuildCandidates,
  threshold: number,
  options: TightenOptions = {}
): PartialBuildsData {
  const result: PartialBuildsData = {}
  for (const [slot, combos] of Object.entries(candidates) as [
    ArtifactSlotKey,
    string[][] | undefined,
  ][])
    result[slot] =
      combos && new SlotTightener(setup, slot, combos, threshold, options).run()
  return result
}

/** Profiles that agree on every key the formulas read span the same search
 * space (unread keys cannot affect any comparison); keep one representative
 * each. The representative's unread `fixed` keys still appear in witness
 * artifacts, standing in for every merged combo. */
export function dedupeProfiles(
  profiles: FutureArtifactProfile[],
  readKeys: string[]
): FutureArtifactProfile[] {
  const seen = new Set<string>()
  const out: FutureArtifactProfile[] = []
  for (const p of profiles) {
    const sig = JSON.stringify([
      readKeys.map((k) => p.fixed[k] ?? 0),
      readKeys.map((k) => {
        const s = p.substats[k]
        return s ? [s.min, s.max, p.rollBudget?.rollSize[k] ?? null] : null
      }),
      p.maxSubstats ?? 4,
      p.rollBudget?.totalRolls ?? null,
    ])
    if (seen.has(sig)) continue
    seen.add(sig)
    out.push(p)
  }
  return out
}

type Member = {
  ids: string[]
  arts: ArtifactBuildData[]
  /** summed stats over the bound's `readKeys` */
  vec: Float64Array
  /** opt-target bound midpoint over the slot's bounding box; only used to
   * order members (weak first for deletion checks, promising first as
   * coverers) */
  score: number
  minValue: number
  maxValue: number
  witness?: PartialBuildWitness
}

/** A (sub-)box of one profile's substat space: value ranges per `dims` entry
 * of the owning `ProfileSpace`. */
type Box = { lo: Float64Array; hi: Float64Array }

type Sample = { artifact: DynStat; value: number; margin: number }

class SlotTightener {
  private nodes: OptNode[]
  private mins: number[]
  private threshold: number
  private maxCoverers: number
  private maxBoxes: number
  private minWidthRel: number

  private bound: DiffBound
  private profiles: ProfileSpace[]
  private members: Member[]
  /** exact evaluator: `[x, ...four arts] -> node values` */
  private compute: (arts: ArtifactBuildData[]) => number[]

  constructor(
    { nodes, mins, arts, profiles }: PartialBuildsSetup,
    slot: ArtifactSlotKey,
    combos: string[][],
    threshold: number,
    { maxCoverers = 64, maxBoxes = 8192, minWidthRel = 1 / 64 }: TightenOptions
  ) {
    this.nodes = nodes
    this.mins = mins
    this.threshold = threshold
    this.maxCoverers = maxCoverers
    this.maxBoxes = maxBoxes
    this.minWidthRel = minWidthRel

    const slotProfiles = profiles[slot] ?? []
    const box = profileBoundingBox(slotProfiles)
    this.bound = compileDiffBound(nodes, arts, { [slot]: box })
    this.profiles = dedupeProfiles(slotProfiles, this.bound.readKeys).map(
      (p) => new ProfileSpace(p, this.bound, arts)
    )
    this.compute = precompute(nodes, arts.base, (f) => f.path[1], 5) as (
      arts: ArtifactBuildData[]
    ) => number[]

    // Bounding-box context, for member scores and min/max value reporting.
    const wholeBox = this.bound.forRest(
      Float64Array.from(
        this.bound.readKeys,
        (k) => (arts.base[k] ?? 0) + (box[k]?.min ?? 0)
      ),
      Float64Array.from(
        this.bound.readKeys,
        (k) => (arts.base[k] ?? 0) + (box[k]?.max ?? 0)
      )
    )
    const byId = new Map(
      Object.values(arts.values)
        .flat()
        .map((a) => [a.id, a])
    )
    const seen = new Set<string>()
    this.members = []
    for (const ids of combos) {
      const key = ids.join('|')
      if (seen.has(key)) continue
      seen.add(key)
      const combo = ids.map((id) => byId.get(id))
      if (combo.some((a) => !a)) continue
      const arts4 = combo as ArtifactBuildData[]
      const vec = new Float64Array(this.bound.readKeys.length)
      for (const a of arts4) {
        const v = this.bound.toVector(a)
        for (let k = 0; k < vec.length; k++) vec[k] += v[k]
      }
      const ctx = wholeBox.context(vec)
      const { min, max } = this.bound.nodeRange(ctx, 0)
      if (max < threshold) continue // never relevant, excused by the best build
      this.members.push({
        ids,
        arts: arts4,
        vec,
        score: this.bound.score(ctx),
        minValue: min,
        maxValue: max,
      })
    }
  }

  run(): SolverPartialBuild[] {
    // Weakest members first: the likely-redundant die early, shrinking the
    // live set for later (more expensive) checks. Order does not affect the
    // result set beyond tie choices — see the coverage-deletion argument.
    const order = [...this.members].sort((a, b) => a.score - b.score)
    const live = new Set(this.members)
    for (const m of order) {
      live.delete(m)
      const others = [...live].sort((a, b) => b.score - a.score)
      if (!this.examine(m, others)) continue // covered everywhere: deleted
      live.add(m)
    }
    return [...live]
      .sort((a, b) => b.score - a.score)
      .map(({ ids, minValue, maxValue, witness }) => ({
        artifactIds: ids,
        minValue,
        maxValue,
        witness,
      }))
  }

  /** Decide `m`'s fate against the live `others`; on keep, set `m.witness`.
   * Returns whether `m` is kept. */
  private examine(m: Member, others: Member[]): boolean {
    let best: Sample | undefined
    let coveredEverywhere = true
    for (const profile of this.profiles) {
      const res = this.searchProfile(m, others, profile)
      if (res.witness) {
        // strict proof found; no need to consult other profiles
        m.witness = res.witness
        return true
      }
      if (!res.covered) coveredEverywhere = false
      if (res.best && (!best || res.best.margin > best.margin)) best = res.best
    }
    if (coveredEverywhere) return false
    // Budget ran out somewhere without a certificate: keep (sound), with the
    // best exact sample as an unproven witness (margin <= 0).
    if (best) m.witness = best
    return true
  }

  /**
   * Branch and bound over one profile's substat box, exploring the region of
   * `m`'s largest advantage bound first (witnesses live there, and it is
   * where coverage takes longest to certify). Returns `covered: true` when
   * every sub-box was certified excused or covered; `witness` when an exact
   * sample proved `m` strictly necessary.
   */
  private searchProfile(
    m: Member,
    others: Member[],
    profile: ProfileSpace
  ): { covered: boolean; witness?: PartialBuildWitness; best?: Sample } {
    const queue: { box: Box; prio: number }[] = [
      { box: profile.rootBox(), prio: Infinity },
    ]
    let boxes = 0
    let undecided = false
    let best: Sample | undefined

    while (queue.length) {
      if (++boxes > this.maxBoxes) {
        undecided = true
        break
      }
      let at = 0
      for (let i = 1; i < queue.length; i++)
        if (queue[i].prio > queue[at].prio) at = i
      const { box } = queue.splice(at, 1)[0]
      if (profile.noLegalArtifact(box)) continue // excused: nothing to cover

      const sb = profile.forBox(box)
      const ctxM = sb.context(m.vec)
      if (this.excused(ctxM)) continue
      const advantage = this.coverOrAdvantage(sb, ctxM, others)
      if (advantage === undefined) continue // covered

      // Bounds failed here; consult reality at legal points (the box center,
      // and the greedy corner where the budget is stacked into the most
      // invested substats — winners tend to live at corners).
      for (const x of profile.legalSamples(box)) {
        const sample = this.evaluate(m, others, x)
        if (!sample) continue
        if (sample.margin > 0) return { covered: false, witness: sample }
        if (!best || sample.margin > best.margin) best = sample
      }

      const d = profile.splitDim(box, this.minWidthRel)
      if (d < 0) {
        // too small to split: neither covered nor witnessed — inconclusive
        undecided = true
        continue
      }
      const mid = (box.lo[d] + box.hi[d]) / 2
      const left = { lo: box.lo.slice(), hi: box.hi.slice() }
      left.hi[d] = mid
      const right = { lo: box.lo.slice(), hi: box.hi.slice() }
      right.lo[d] = mid
      queue.push(
        { box: left, prio: advantage },
        { box: right, prio: advantage }
      )
    }
    return { covered: !undecided && queue.length === 0, best }
  }

  /** `m` cannot be relevant anywhere on the box: its best case misses the
   * top-1 threshold, or a constraint is unreachable. */
  private excused(ctxM: ArtContext): boolean {
    if (this.bound.nodeRange(ctxM, 0).max < this.threshold) return true
    for (let j = 1; j < this.nodes.length; j++)
      if (this.bound.nodeRange(ctxM, j).max < this.mins[j]) return true
    return false
  }

  /** Some live member covers `m` on the whole box (target diff `lo >= 0`,
   * and each constraint diff `lo >= 0` unless the coverer meets that
   * constraint for every x in the box) — then returns `undefined`.
   * Otherwise returns `m`'s *advantage bound*: the smallest amount by which
   * no tried coverer could be certified — a search priority (where `m` might
   * win big) for the branch and bound. */
  private coverOrAdvantage(
    sb: SlotDiffBound,
    ctxM: ArtContext,
    others: Member[]
  ): number | undefined {
    let advantage = Infinity
    let tried = 0
    for (const q of others) {
      if (++tried > this.maxCoverers) break
      const ctxQ = sb.context(q.vec)
      const { lo } = sb.evaluate(ctxM, ctxQ)
      // -lo[0] bounds how much m may exceed q somewhere in the box
      if (-lo[0] < advantage) advantage = -lo[0]
      if (lo[0] < 0) continue
      let ok = true
      for (let j = 1; j < this.nodes.length; j++)
        if (lo[j] < 0 && this.bound.nodeRange(ctxQ, j).min < this.mins[j]) {
          ok = false
          break
        }
      if (ok) return undefined
    }
    return advantage
  }

  /** Exact evaluation of `m` vs `others` at the artifact `x`. Returns
   * `undefined` when `x + m` is infeasible; otherwise the margin of `m` over
   * `max(θ, best feasible alternative)` — i.e. `margin > 0` exactly when the
   * drop `x` improves the re-solve answer and only `m` delivers it. The
   * alternative sweep early-exits once `m` is beaten, so a negative margin
   * may understate the deficit; positive margins are always exact. */
  private evaluate(
    m: Member,
    others: Member[],
    x: ArtifactBuildData
  ): Sample | undefined {
    const outM = this.compute([x, ...m.arts])
    if (!this.feasible(outM)) return undefined
    let bestAlt = this.threshold
    for (const q of others) {
      const outQ = this.compute([x, ...q.arts])
      if (this.feasible(outQ) && outQ[0] > bestAlt) bestAlt = outQ[0]
      if (bestAlt >= outM[0]) break // beaten; enough for a verdict
    }
    return { artifact: x.values, value: outM[0], margin: outM[0] - bestAlt }
  }

  private feasible(out: number[]): boolean {
    for (let j = 1; j < this.nodes.length; j++)
      if (out[j] < this.mins[j]) return false
    return true
  }
}

/**
 * One profile's search space: the free dimensions are the substat-pool keys
 * the formulas actually read (unread substats cannot change any comparison),
 * on top of the profile's fixed stats. Legality (`maxSubstats`, roll budget)
 * is enforced by excusing boxes that contain no legal artifact and by
 * legalizing sampled points.
 */
class ProfileSpace {
  /** substat keys that appear in `readKeys`, i.e. the box dimensions */
  private dims: string[]
  private dimIdx: number[] // position of each dim in readKeys
  private root: Box
  /** rest box shared parts: base + fixed, over readKeys */
  private restLo: Float64Array
  private restHi: Float64Array
  private maxSubstats: number
  private rollSize: (d: number) => number
  private totalRolls: number

  constructor(
    private profile: FutureArtifactProfile,
    private bound: DiffBound,
    arts: ArtifactsBySlot
  ) {
    const { readKeys } = bound
    this.dims = Object.keys(profile.substats).filter((k) =>
      readKeys.includes(k)
    )
    this.dimIdx = this.dims.map((k) => readKeys.indexOf(k))
    this.root = {
      lo: Float64Array.from(this.dims, (k) =>
        Math.min(0, profile.substats[k].min)
      ),
      hi: Float64Array.from(this.dims, (k) =>
        Math.max(0, profile.substats[k].max)
      ),
    }
    this.restLo = Float64Array.from(
      readKeys,
      (k) => (arts.base[k] ?? 0) + (profile.fixed[k] ?? 0)
    )
    this.restHi = this.restLo.slice()
    this.maxSubstats = profile.maxSubstats ?? 4
    const budget = profile.rollBudget
    this.rollSize = (d) => budget?.rollSize[this.dims[d]] ?? Infinity
    this.totalRolls = budget?.totalRolls ?? Infinity
  }

  rootBox(): Box {
    return { lo: this.root.lo.slice(), hi: this.root.hi.slice() }
  }

  /** Mandatory rolls of the substat slots not carrying tracked value: a real
   * artifact has exactly `maxSubstats` substats, one roll minimum each, so
   * slots beyond the `present` tracked ones still consume a roll apiece. */
  private junkRolls(present: number): number {
    return Number.isFinite(this.maxSubstats)
      ? Math.max(0, this.maxSubstats - present)
      : 0
  }

  /** Rolls a present substat consumes: at least its mandatory single roll. */
  private rollFloor(d: number, value: number): number {
    const size = this.rollSize(d)
    return Math.max(1, Number.isFinite(size) ? value / size : 0)
  }

  /** The box forces more nonzero substats than an artifact may carry, or
   * more rolls than the budget allows (each forced substat consumes at least
   * `max(1, lo/rollSize)` rolls, and every remaining substat slot at least
   * its mandatory one) — nothing legal lives here. */
  noLegalArtifact({ lo }: Box): boolean {
    let forced = 0
    let floor = 0
    for (let d = 0; d < lo.length; d++)
      if (lo[d] > 0) {
        forced++
        floor += this.rollFloor(d, lo[d])
      }
    return (
      forced > this.maxSubstats ||
      floor + this.junkRolls(forced) > this.totalRolls + 1e-9
    )
  }

  /** Conditioned bound with x restricted to `fixed + box`, with each
   * dimension's top end clamped by the roll budget left after every other
   * dimension's forced minimum and every other substat slot's mandatory
   * roll — a per-axis relaxation of the budget simplex that stays a (sound)
   * box. */
  forBox(box: Box): SlotDiffBound {
    const lo = this.restLo.slice()
    const hi = this.restHi.slice()
    let forced = 0
    let floorAll = 0
    for (let d = 0; d < this.dims.length; d++)
      if (box.lo[d] > 0) {
        forced++
        floorAll += this.rollFloor(d, box.lo[d])
      }
    for (let d = 0; d < this.dims.length; d++) {
      const size = this.rollSize(d)
      let budgetHi = Infinity
      if (Number.isFinite(size) && Number.isFinite(this.totalRolls)) {
        const isForced = box.lo[d] > 0
        const floorOther =
          floorAll - (isForced ? this.rollFloor(d, box.lo[d]) : 0)
        const forcedOther = forced - (isForced ? 1 : 0)
        // d occupies one substat slot; each remaining slot, forced or not,
        // consumes at least one roll
        budgetHi =
          (this.totalRolls - floorOther - this.junkRolls(forcedOther + 1)) *
          size
      }
      lo[this.dimIdx[d]] += box.lo[d]
      hi[this.dimIdx[d]] += Math.min(box.hi[d], Math.max(box.lo[d], budgetHi))
    }
    return this.bound.forRest(lo, hi)
  }

  /** Legal points worth an exact look: the box center and the greedy top
   * corner (winners tend to live at corners, where the budget concentrates
   * into the strongest substats). */
  legalSamples(box: Box): ArtifactBuildData[] {
    const center = this.legalize(
      this.dims.map((_, d) => (box.lo[d] + box.hi[d]) / 2)
    )
    const corner = this.legalize(this.dims.map((_, d) => box.hi[d]))
    return [center, corner]
  }

  /** Make a point legal: keep the `maxSubstats` most-invested substats (in
   * rolls, or fraction of the root range when no roll size is given), drop
   * the rest, scale into the roll budget net of every other substat slot's
   * mandatory roll, and round each budgeted substat to a whole number of
   * rolls (witnesses must be attainable artifacts, not box geometry). Dims
   * without a roll size stay continuous. */
  private legalize(point: number[]): ArtifactBuildData {
    const invested = point.map((c, d) =>
      Number.isFinite(this.rollSize(d))
        ? c / this.rollSize(d)
        : c / (this.root.hi[d] || 1)
    )
    const keep = this.dims
      .map((_, d) => d)
      .filter((d) => point[d] > 0)
      .sort((a, b) => invested[b] - invested[a])
      .slice(0, this.maxSubstats)
    // Proportional pre-scale into the kept dims' share of the budget. The
    // mandatory-roll floors do not scale, so this is only a heuristic; the
    // shed loop below enforces the budget exactly.
    let budget = this.totalRolls - this.junkRolls(keep.length)
    let rolls = 0
    for (const d of keep)
      if (Number.isFinite(this.rollSize(d)))
        rolls += this.rollFloor(d, point[d])
    const scale = rolls > budget ? budget / rolls : 1

    const quantized = keep.map((d) => {
      const size = this.rollSize(d)
      if (!Number.isFinite(size)) return point[d]
      const maxRolls = Math.floor(this.root.hi[d] / size + 1e-9)
      return Math.min(maxRolls, Math.round((point[d] * scale) / size)) * size
    })
    if (Number.isFinite(this.totalRolls)) {
      // Dims rounded out became junk: their slots still eat a roll each.
      let present = 0
      let total = 0
      keep.forEach((d, i) => {
        if (quantized[i] <= 1e-12) return
        present++
        if (Number.isFinite(this.rollSize(d)))
          total += quantized[i] / this.rollSize(d)
      })
      budget = this.totalRolls - this.junkRolls(present)
      // Shed whole rolls from the most over-rounded dims (never below the
      // mandatory one) until the budget fits. Terminates: with every kept
      // dim at a single roll, `total = present <= budget` for any profile
      // with `totalRolls >= maxSubstats`.
      while (total > budget + 1e-9) {
        let at = -1
        let over = -Infinity
        keep.forEach((d, i) => {
          const size = this.rollSize(d)
          if (!Number.isFinite(size) || quantized[i] < 2 * size - 1e-9) return
          const o = quantized[i] - point[d] * scale
          if (o > over) {
            over = o
            at = i
          }
        })
        if (at < 0) break
        quantized[at] -= this.rollSize(keep[at])
        total -= 1
      }
    }

    const values: DynStat = { ...this.profile.fixed }
    keep.forEach((d, i) => {
      if (quantized[i] > 1e-12)
        values[this.dims[d]] = (values[this.dims[d]] ?? 0) + quantized[i]
    })
    return { id: '!witness', values }
  }

  /** Highest-impact dimension to bisect: widest remaining range relative to
   * the root, and above `minWidthRel`. Returns -1 when none qualifies. */
  splitDim(box: Box, minWidthRel: number): number {
    let bestD = -1
    let bestW = minWidthRel
    for (let d = 0; d < this.dims.length; d++) {
      const rootW = this.root.hi[d] - this.root.lo[d]
      if (!rootW) continue
      const w = (box.hi[d] - box.lo[d]) / rootW
      if (w > bestW) {
        bestW = w
        bestD = d
      }
    }
    return bestD
  }
}
