import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { OptNode } from '@genshin-optimizer/gi/wr'
import type {
  ArtifactBuildData,
  DynMinMax,
  MinMax,
  PartialBuildCandidates,
  PartialBuildsSetup,
} from '../common.js'
import { extendArtRangeArts, profileBoundingBox } from '../common.js'
import type { ArtContext, SlotDiffBound } from './BNBSplitWorker/diffBound.js'
import { compileDiffBound } from './BNBSplitWorker/diffBound.js'
import { linearUB, maxLinCont } from './BNBSplitWorker/linearUB.js'

/**
 * Streaming per-slot frontier of *candidate* partial builds, fed by
 * `ComputeWorker` with every region it enumerates (the plot-data analog for
 * `Setup.partialBuilds`). The final tight set with witnesses is produced from
 * these candidates by the post-merge `tighten` pass; this tracker only has to
 * be sound (keep everything that pass may need) and small enough to ship.
 *
 * Everything runs in the *original* stat space of `PartialBuildsSetup`,
 * joined to the (reaffined, pruned) solve by artifact ids — so upstream stat
 * transforms are invisible here.
 *
 * For a tracked slot `s` with future-artifact bounding box `X` (from its
 * profiles), a partial build `r` (one artifact in each of the other four
 * slots) is *relevant* if some x ∈ X makes `x + r` feasible with opt target
 * >= the current top-N `threshold` (a lower bar than the final top-1 value
 * the tighten pass uses; using it here is sound and needs no extra
 * plumbing). Among relevant partials, `p` dominates `r` when, for every
 * x ∈ X, `x + p` is feasible wherever `x + r` is and its target is at least
 * as good — a conditioned diff-bound certificate (transposed swap dominance
 * via `DiffBound.forRest`, with the always-feasible constraint bypass and
 * target-anchored tie-breaking; see `tightenPartials.ts` for the underlying
 * math). The frontier keeps every offered partial not dominated by a member,
 * so it ends up dominating everything offered.
 *
 * Offers are pre-gated by a cheap linear bound (the `linearUB` weights over
 * the box-extended stat space), with whole enumeration subtrees skipped when
 * even their best completion cannot reach the thresholds, so garbage regions
 * cost ~nothing.
 *
 * The constructor throws (like `BNBSplitWorker`'s) if the nodes cannot be
 * bounded; callers should treat that as "partial builds unavailable".
 */
export class PartialBuildTracker {
  /** Current top-N opt-target threshold; irrelevant partials are excused. */
  threshold = Number.NEGATIVE_INFINITY
  /** Dominance tests per offer, best-first. */
  maxCandidates = 64
  /** Per-slot frontier size at which the slot overflows (reported as
   * `undefined`: too incomparable for an explicit list to be useful). */
  maxPartials = 20_000

  /** `[optTarget, ...constraints]`, original stat space */
  readonly nodes: OptNode[]
  /** aligned with `nodes`; `mins[0]` is unused (the target gates on
   * `threshold` instead) */
  readonly mins: number[]
  readonly nKeys: number
  /** original-space stat vector per artifact id */
  readonly idVec = new Map<string, Float64Array>()
  /** per-node cheap linear contribution per artifact id */
  readonly idCont = new Map<string, Float64Array>()
  /** per-node cheap linear bound of `arts.base` (incl. the constant term) */
  readonly baseCont: Float64Array
  private trackedSlots: TrackedSlot[]

  constructor({ nodes, mins, arts, profiles }: PartialBuildsSetup) {
    this.nodes = nodes
    this.mins = mins
    const boxes = Object.fromEntries(
      Object.entries(profiles).map(([slot, ps]) => [
        slot,
        profileBoundingBox(ps ?? []),
      ])
    ) as Partial<Record<ArtifactSlotKey, DynMinMax>>
    const bound = compileDiffBound(nodes, arts, boxes)
    this.nKeys = bound.readKeys.length
    const lins = linearUB(nodes, extendArtRangeArts(arts, boxes))
    this.baseCont = Float64Array.from(lins, (lin) =>
      Object.entries(arts.base).reduce(
        (a, [k, v]) => a + (lin[k] ?? 0) * v,
        lin.$c
      )
    )
    for (const list of Object.values(arts.values))
      for (const art of list) {
        this.idVec.set(art.id, bound.toVector(art))
        this.idCont.set(
          art.id,
          Float64Array.from(lins, (lin) =>
            Object.entries(art.values).reduce(
              (a, [k, v]) => a + (lin[k] ?? 0) * v,
              0
            )
          )
        )
      }

    this.trackedSlots = (
      Object.entries(boxes) as [ArtifactSlotKey, DynMinMax][]
    ).map(([slot, box]) => {
      const restLo = Float64Array.from(
        bound.readKeys,
        (k) => (arts.base[k] ?? 0) + (box[k]?.min ?? 0)
      )
      const restHi = Float64Array.from(
        bound.readKeys,
        (k) => (arts.base[k] ?? 0) + (box[k]?.max ?? 0)
      )
      return new TrackedSlot(
        this,
        slot,
        bound.forRest(restLo, restHi),
        (ctx, j) => bound.nodeRange(ctx, j),
        (ctx) => bound.score(ctx),
        Float64Array.from(lins, (lin) => maxLinCont(lin, box))
      )
    })
  }

  /** Offer every partial build of a region about to be enumerated. `values`
   * are the region's artifacts per slot; only ids are used, so upstream
   * reaffine/pruning stat transforms are irrelevant. */
  processFilter(values: Record<ArtifactSlotKey, ArtifactBuildData[]>): void {
    for (const tracked of this.trackedSlots) tracked.processFilter(values)
  }

  candidates(): PartialBuildCandidates {
    const result: PartialBuildCandidates = {}
    for (const tracked of this.trackedSlots)
      result[tracked.slot] = tracked.candidates()
    return result
  }
}

type Member = {
  key: string
  ids: string[]
  ctx: ArtContext
  score: number
  /** per node: constraint met for every x in the box */
  always: boolean[]
}

const strictTol = 1e-9

class TrackedSlot {
  readonly slot: ArtifactSlotKey
  private overflowed = false
  /** frontier, ordered by `score` descending */
  private members: Member[] = []
  /** every key ever accepted; removed members were certified dominated, so
   * (by transitivity) they must not be re-admitted */
  private memberKeys = new Set<string>()
  private compactAt = 1024

  constructor(
    private tracker: PartialBuildTracker,
    slot: ArtifactSlotKey,
    private sb: SlotDiffBound,
    private nodeRange: (ctx: ArtContext, j: number) => MinMax,
    private score: (ctx: ArtContext) => number,
    /** per node: max contribution of a future artifact from the box, under
     * the cheap linear bound */
    private futureCont: Float64Array
  ) {
    this.slot = slot
  }

  processFilter(values: Record<ArtifactSlotKey, ArtifactBuildData[]>): void {
    if (this.overflowed) return
    const { idCont, baseCont, mins, nodes } = this.tracker
    const lists = allArtifactSlotKeys
      .filter((s) => s !== this.slot)
      .map((s) => values[s])
    if (lists.some((l) => !l.length)) return
    const nOut = nodes.length

    // Cheap linear bound scaffolding: at recursion depth d, the best possible
    // remaining contribution is the future artifact's box max plus the
    // per-slot maxima of the not-yet-chosen slots (depths >= d).
    const conts = lists.map((l) => l.map(({ id }) => idCont.get(id)!))
    const remMax: Float64Array[] = Array(lists.length + 1)
    remMax[lists.length] = this.futureCont
    for (let d = lists.length - 1; d >= 0; d--) {
      const acc = remMax[d + 1].slice()
      for (let j = 0; j < nOut; j++) {
        let m = Number.NEGATIVE_INFINITY
        for (const c of conts[d]) if (c[j] > m) m = c[j]
        acc[j] += m
      }
      remMax[d] = acc
    }

    const reqs = mins.map((m, j) => (j === 0 ? this.tracker.threshold : m))
    const partial = new Float64Array(nOut)
    const ids: string[] = Array(lists.length)
    const recurse = (d: number) => {
      // subtree gate: even the best completion cannot reach every threshold
      for (let j = 0; j < nOut; j++)
        if (baseCont[j] + partial[j] + remMax[d][j] < reqs[j]) return
      if (d === lists.length) return this.offer(ids)
      const cs = conts[d]
      lists[d].forEach(({ id }, i) => {
        const c = cs[i]
        for (let j = 0; j < nOut; j++) partial[j] += c[j]
        ids[d] = id
        recurse(d + 1)
        for (let j = 0; j < nOut; j++) partial[j] -= c[j]
      })
    }
    recurse(0)
  }

  private offer(ids: string[]): void {
    const key = ids.join('|')
    if (this.memberKeys.has(key)) return
    const { idVec, mins, nKeys, maxCandidates } = this.tracker

    const vec = new Float64Array(nKeys)
    for (const id of ids) {
      const v = idVec.get(id)!
      for (let k = 0; k < nKeys; k++) vec[k] += v[k]
    }
    const ctx = this.sb.context(vec)
    // relevance gate: some x must reach the threshold, feasibly
    if (this.nodeRange(ctx, 0).max < this.tracker.threshold) return
    const always: boolean[] = [true]
    for (let j = 1; j < mins.length; j++) {
      const { min, max } = this.nodeRange(ctx, j)
      if (max < mins[j]) return // infeasible for every x
      always.push(min >= mins[j])
    }

    let tested = 0
    for (const p of this.members) {
      if (++tested > maxCandidates) break
      if (this.dominates(ctx, key, p)) return
    }

    const member: Member = {
      key,
      ids: [...ids],
      ctx,
      score: this.score(ctx),
      always,
    }
    // insert sorted by score, descending
    let lo = 0
    let hi = this.members.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.members[mid].score >= member.score) lo = mid + 1
      else hi = mid
    }
    this.members.splice(lo, 0, member)
    this.memberKeys.add(key)

    if (this.members.length >= this.compactAt) {
      this.compact()
      if (this.members.length > this.tracker.maxPartials) {
        this.overflowed = true
        this.members = []
        this.memberKeys.clear()
      } else this.compactAt = Math.max(1024, 2 * this.members.length)
    }
  }

  /** `n` dominates the entry (`mCtx`, `mKey`): its builds are feasible and
   * at least as good for every x. Constraints `n` always meets drop out of
   * the comparison; only target-strictness (or the id order) breaks tie
   * symmetry — see `tightenPartials.ts` for why that stays acyclic. */
  private dominates(mCtx: ArtContext, mKey: string, n: Member): boolean {
    const { lo } = this.sb.evaluate(mCtx, n.ctx)
    if (lo[0] < 0) return false
    const nOut = this.tracker.nodes.length
    for (let j = 1; j < nOut; j++) if (lo[j] < 0 && !n.always[j]) return false
    return lo[0] > strictTol || n.key > mKey
  }

  /** Re-gate by the current threshold and drop members dominated within the
   * frontier (sound by the acyclic-order induction plus pointwise
   * transitivity of domination). */
  private compact(): void {
    const { maxCandidates } = this.tracker
    const gated = this.members.filter(
      ({ ctx }) => this.nodeRange(ctx, 0).max >= this.tracker.threshold
    )
    this.members = gated.filter((m, mi) => {
      let tested = 0
      for (let ni = 0; ni < gated.length; ni++) {
        if (ni === mi) continue
        if (++tested > maxCandidates) break
        if (this.dominates(m.ctx, m.key, gated[ni])) return false
      }
      return true
    })
  }

  candidates(): string[][] | undefined {
    if (this.overflowed) return undefined
    this.compact()
    return this.members.map(({ ids }) => ids)
  }
}
