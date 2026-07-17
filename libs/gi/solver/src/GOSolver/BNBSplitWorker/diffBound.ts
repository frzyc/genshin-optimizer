import { objMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ConstantNode, OptNode } from '@genshin-optimizer/gi/wr'
import { allOperations, forEachNodes } from '@genshin-optimizer/gi/wr'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  DynMinMax,
  MinMax,
} from '../../common.js'
import { computeFullArtRange, computeNodeRange } from '../../common.js'

/**
 * Pairwise "swap dominance" bounds.
 *
 * For two artifacts `m`, `n` occupying the same slot, consider swapping
 * `m -> n` while the artifacts `r` in the remaining slots stay fixed. For each
 * node `f` (opt target + constraints), we compute an interval `[lo, hi]` with
 *
 *      lo <= f(n + r) - f(m + r) <= hi     for all `r` in the remaining slots.
 *
 * If `lo >= 0` for *every* node, any build containing `m` can be replaced by a
 * feasible build containing `n` that is at least as good (constraints only
 * have minimums), so `m` is dominated by `n` and can be removed from its slot
 * (subject to `numTop` counting; see `pruneDominance`).
 *
 * The bound is computed by propagating difference intervals through the node
 * DAG. Everything `m` and `n` have in common cancels *exactly*; the interval
 * slack only comes from the interaction of the stat difference
 * `d = n.values - m.values` with the value ranges of intermediate nodes, so
 * the slack scales with |d| (single-artifact size) rather than with the size
 * of the whole search box. That is what makes this test effective at the root
 * of the branch-and-bound tree, where absolute upper bounds are hopelessly
 * loose and the existing threshold-based pruning is inert (threshold = -inf).
 *
 * Alongside the difference interval `D(g)`, we track *conditioned* value
 * ranges per artifact: `V_a(g)` is the range of `g(a + r)` with the slot
 * pinned to artifact `a` and `r` ranging over the remaining slots' bounding
 * box. These are per-artifact (not per-pair), so they are precomputed once
 * per slot (`SlotDiffBound.context`) and make the pairwise rules much tighter
 * than full-box ranges. Every node's structural bound is also intersected
 * with the direct bound `V_n(g) - V_m(g)`.
 *
 * Per-operation difference rules:
 *  - `read k`:    exactly `[d_k, d_k]`; the box cancels.
 *  - `add`:       sum of operand intervals.
 *  - `mul`:       telescoping: P·g at `n` minus at `m` is
 *                     (P_n - P_m)·g_n + P_m·(g_n - g_m)
 *                 folded left to right as D(P·g) ⊆ D(P)⊗V_n(g) ⊕ V_m(P)⊗D(g).
 *  - `min`/`max`: monotone, 1-Lipschitz in each operand:
 *                 D ⊆ [min_i D(g_i).lo, max_i D(g_i).hi].
 *  - `threshold`: enumerate branch combinations (pass/fail on each side)
 *                 consistent with the conditioned ranges of `v` and with
 *                 D(v); non-constant `pass` (with `fail === 0`) contributes
 *                 its conditioned range on the crossing combinations.
 *  - `res`, `sum_frac`: continuous, piecewise-differentiable scalar maps; by
 *                 the mean value theorem D ⊆ slopeRange(V_m(x) ∪ V_n(x)) ⊗ D(x).
 *
 * Repeated/shared subexpressions are treated as independent when combining
 * intervals, which can only widen the result (standard interval-arithmetic
 * dependency effect), so the bounds stay sound.
 *
 * Supported node patterns are a strict superset of `polyUB`'s, so any formula
 * that reaches `BNBSplitWorker` (whose constructor requires `linearUB` to
 * succeed) is supported here.
 */
export type ArtContext = {
  /** Artifact stats, aligned with `readKeys` */
  vec: Float64Array
  /** Conditioned value range (lo/hi per DAG node) of every node, given this
   * artifact in the slot and the rest ranging over their slots */
  lo: Float64Array
  hi: Float64Array
}

export type SlotDiffBound = {
  /** Precompute the conditioned node ranges for one artifact of this slot. */
  context: (vec: Float64Array) => ArtContext
  /**
   * Difference intervals of the top-level nodes for the swap `m -> n`.
   * The returned buffers (length = nodes.length) are reused across calls.
   */
  evaluate: (
    m: ArtContext,
    n: ArtContext
  ) => { lo: Float64Array; hi: Float64Array }
}

export type DiffBound = {
  /** Dyn-stat keys read by the nodes; vectors below are indexed in this order. */
  readKeys: string[]
  /** Densify an artifact's stats into a vector aligned with `readKeys`. */
  toVector: (art: ArtifactBuildData) => Float64Array
  /** Midpoint estimate of `nodes[0]` (the opt target) — used to order
   * dominator candidates from most to least promising. */
  score: (ctx: ArtContext) => number
  /** Conditioned range of top-level node `j` under a context. */
  nodeRange: (ctx: ArtContext, j: number) => MinMax
  forSlot: (slot: ArtifactSlotKey) => SlotDiffBound
  /**
   * Like `forSlot`, but with an explicit rest box over `readKeys` (absolute,
   * i.e. including `arts.base` and every stat not part of the swapped
   * vector). The swapped entity can be any stat vector layered on top of the
   * box — e.g. a whole 4-slot combo, with the box covering only the
   * remaining slot (see `PartialBuildTracker.ts` / `tightenPartials.ts`).
   */
  forRest: (restLo: Float64Array, restHi: Float64Array) => SlotDiffBound
}

export class DiffBoundError extends Error {
  constructor(cause: string, operation: string) {
    super(`Found ${cause} in ${operation} node when computing diff bound`)
  }
}

// Shared scratch for interval products; single-threaded use only.
const prod = { lo: 0, hi: 0 }
function imul(aLo: number, aHi: number, bLo: number, bHi: number) {
  const x1 = aLo * bLo,
    x2 = aLo * bHi,
    x3 = aHi * bLo,
    x4 = aHi * bHi
  prod.lo = Math.min(x1, x2, x3, x4)
  prod.hi = Math.max(x1, x2, x3, x4)
}

// Shared scratch for slope ranges.
const slope = { lo: 0, hi: 0 }
/**
 * Range of the derivative of `res` over `[min, max]`:
 *    x < 0:        1 - x/2       -> slope -1/2
 *    0 <= x < .75: 1 - x         -> slope -1
 *    x >= .75:     1 / (1 + 4x)  -> slope -4/(1+4x)^2, increasing toward 0
 * `res` is continuous and piecewise C^1, so by the mean value theorem its
 * difference lies in slopeRange ⊗ Δx.
 */
function resSlopeRange(min: number, max: number) {
  let lo = Number.POSITIVE_INFINITY,
    hi = Number.NEGATIVE_INFINITY
  if (min < 0) {
    lo = Math.min(lo, -0.5)
    hi = Math.max(hi, -0.5)
  }
  if (max >= 0 && min < 0.75) {
    lo = Math.min(lo, -1)
    hi = Math.max(hi, -1)
  }
  if (max >= 0.75) {
    const a = Math.max(min, 0.75)
    lo = Math.min(lo, -4 / (1 + 4 * a) ** 2) // steepest end of the tail
    hi = Math.max(hi, -4 / (1 + 4 * max) ** 2) // shallowest end
  }
  slope.lo = lo
  slope.hi = hi
}

export function compileDiffBound(
  nodes: OptNode[],
  arts: ArtifactsBySlot,
  /** Per-slot stat boxes (e.g. of hypothetical future artifacts) unioned
   * into that slot's range, widening every rest box the bound quantifies
   * over. See `Setup.partialBuilds`. */
  extraSlotRange?: Partial<Record<ArtifactSlotKey, DynMinMax>>
): DiffBound {
  // Full-box ranges, for compile-time pattern guards only; the runtime uses
  // the tighter per-artifact conditioned ranges.
  const globalRange = computeNodeRange(
    nodes,
    computeFullArtRange(arts, extraSlotRange)
  )

  // Topological order (operands before parents), shared nodes visited once.
  const order: OptNode[] = []
  const idx = new Map<OptNode, number>()
  forEachNodes(
    nodes,
    () => {},
    (f) => {
      idx.set(f, order.length)
      order.push(f)
    }
  )
  const nNodes = order.length

  const readKeys: string[] = []
  const readIdx = new Map<string, number>()
  function registerRead(key: string): number {
    let i = readIdx.get(key)
    if (i === undefined) {
      i = readKeys.length
      readIdx.set(key, i)
      readKeys.push(key)
    }
    return i
  }

  /** Computes conditioned value ranges (same rules as `computeNodeRange`,
   * with reads resolved as `rest[k] + vec[k]`). */
  type CtxInstr = (
    lo: Float64Array,
    hi: Float64Array,
    vec: Float64Array,
    restLo: Float64Array,
    restHi: Float64Array
  ) => void
  /** Computes the difference interval, reading conditioned ranges off the
   * two artifact contexts. */
  type EvalInstr = (
    dLo: Float64Array,
    dHi: Float64Array,
    m: ArtContext,
    n: ArtContext
  ) => void

  const ctxInstrs: CtxInstr[] = []
  const evalInstrs: EvalInstr[] = []

  /** Structural bound ∩ direct bound `V_n - V_m`; both contain the truth. */
  function setD(
    i: number,
    l: number,
    h: number,
    dLo: Float64Array,
    dHi: Float64Array,
    m: ArtContext,
    n: ArtContext
  ) {
    const directLo = n.lo[i] - m.hi[i],
      directHi = n.hi[i] - m.lo[i]
    dLo[i] = directLo > l ? directLo : l
    dHi[i] = directHi < h ? directHi : h
  }

  order.forEach((f, i) => {
    const { operation } = f
    const ops = f.operands.map((op) => idx.get(op)!)
    switch (operation) {
      case 'const': {
        const v = f.value
        ctxInstrs.push((lo, hi) => {
          lo[i] = hi[i] = v
        })
        evalInstrs.push((dLo, dHi) => {
          dLo[i] = dHi[i] = 0
        })
        break
      }
      case 'read': {
        if (f.path[0] !== 'dyn')
          throw new DiffBoundError(`non-dyn path ${f.path}`, operation)
        const k = registerRead(f.path[1])
        ctxInstrs.push((lo, hi, vec, restLo, restHi) => {
          lo[i] = restLo[k] + vec[k]
          hi[i] = restHi[k] + vec[k]
        })
        evalInstrs.push((dLo, dHi, m, n) => {
          dLo[i] = dHi[i] = n.vec[k] - m.vec[k] // exact; the box cancels
        })
        break
      }
      case 'add':
        ctxInstrs.push((lo, hi) => {
          let l = 0,
            h = 0
          for (const j of ops) {
            l += lo[j]
            h += hi[j]
          }
          lo[i] = l
          hi[i] = h
        })
        evalInstrs.push((dLo, dHi, m, n) => {
          let l = 0,
            h = 0
          for (const j of ops) {
            l += dLo[j]
            h += dHi[j]
          }
          setD(i, l, h, dLo, dHi, m, n)
        })
        break
      case 'mul':
        ctxInstrs.push((lo, hi) => {
          let l = lo[ops[0]],
            h = hi[ops[0]]
          for (let j = 1; j < ops.length; j++) {
            imul(l, h, lo[ops[j]], hi[ops[j]])
            l = prod.lo
            h = prod.hi
          }
          lo[i] = l
          hi[i] = h
        })
        evalInstrs.push((dLo, dHi, m, n) => {
          // Fold the telescoping product left to right, tracking the m-side
          // range [pl, ph] of the prefix product alongside its Δ.
          let dl = dLo[ops[0]],
            dh = dHi[ops[0]]
          let pl = m.lo[ops[0]],
            ph = m.hi[ops[0]]
          for (let j = 1; j < ops.length; j++) {
            const g = ops[j]
            imul(dl, dh, n.lo[g], n.hi[g])
            const aLo = prod.lo,
              aHi = prod.hi
            imul(pl, ph, dLo[g], dHi[g])
            dl = aLo + prod.lo
            dh = aHi + prod.hi
            imul(pl, ph, m.lo[g], m.hi[g])
            pl = prod.lo
            ph = prod.hi
          }
          setD(i, dl, dh, dLo, dHi, m, n)
        })
        break
      case 'min':
      case 'max': {
        const op = operation
        ctxInstrs.push((lo, hi) => {
          let l =
              op === 'min'
                ? Number.POSITIVE_INFINITY
                : Number.NEGATIVE_INFINITY,
            h = l
          for (const j of ops) {
            if (op === 'min') {
              if (lo[j] < l) l = lo[j]
              if (hi[j] < h) h = hi[j]
            } else {
              if (lo[j] > l) l = lo[j]
              if (hi[j] > h) h = hi[j]
            }
          }
          lo[i] = l
          hi[i] = h
        })
        evalInstrs.push((dLo, dHi, m, n) => {
          let l = Number.POSITIVE_INFINITY,
            h = Number.NEGATIVE_INFINITY
          for (const j of ops) {
            if (dLo[j] < l) l = dLo[j]
            if (dHi[j] > h) h = dHi[j]
          }
          setD(i, l, h, dLo, dHi, m, n)
        })
        break
      }
      case 'res': {
        const resOp = allOperations.res
        const x = ops[0]
        ctxInstrs.push((lo, hi) => {
          lo[i] = resOp([hi[x]]) // decreasing
          hi[i] = resOp([lo[x]])
        })
        evalInstrs.push((dLo, dHi, m, n) => {
          resSlopeRange(Math.min(m.lo[x], n.lo[x]), Math.max(m.hi[x], n.hi[x]))
          imul(slope.lo, slope.hi, dLo[x], dHi[x])
          setD(i, prod.lo, prod.hi, dLo, dHi, m, n)
        })
        break
      }
      case 'sum_frac': {
        const [xOp, cOp] = f.operands
        if (cOp.operation !== 'const')
          throw new DiffBoundError('non-constant node', operation)
        const c = cOp.value
        if (globalRange.get(xOp)!.min + c <= 0)
          throw new DiffBoundError('non-positive denominator', operation)
        const x = ops[0]
        ctxInstrs.push((lo, hi) => {
          lo[i] = lo[x] / (lo[x] + c) // increasing (x + c > 0)
          hi[i] = hi[x] / (hi[x] + c)
        })
        evalInstrs.push((dLo, dHi, m, n) => {
          // d/dx [x / (x + c)] = c / (x + c)^2, monotone over x + c > 0
          const xl = Math.min(m.lo[x], n.lo[x]),
            xh = Math.max(m.hi[x], n.hi[x])
          const sA = c / (xl + c) ** 2,
            sB = c / (xh + c) ** 2
          imul(Math.min(sA, sB), Math.max(sA, sB), dLo[x], dHi[x])
          setD(i, prod.lo, prod.hi, dLo, dHi, m, n)
        })
        break
      }
      case 'threshold': {
        const [, tOp, pOp, fOp] = f.operands
        if (tOp.operation !== 'const')
          throw new DiffBoundError('non-constant threshold', operation)
        const t = tOp.value
        const v = ops[0],
          p = ops[2],
          fl = ops[3]
        const constBranches =
          pOp.operation === 'const' && fOp.operation === 'const'
        if (
          !constBranches &&
          !(
            fOp.operation === 'const' &&
            (fOp as ConstantNode<number>).value === 0
          )
        )
          throw new DiffBoundError('unsupported pass/fail pattern', operation)

        ctxInstrs.push((lo, hi) => {
          if (lo[v] >= t) {
            lo[i] = lo[p]
            hi[i] = hi[p]
          } else if (hi[v] < t) {
            lo[i] = lo[fl]
            hi[i] = hi[fl]
          } else {
            lo[i] = Math.min(lo[p], lo[fl])
            hi[i] = Math.max(hi[p], hi[fl])
          }
        })
        if (constBranches) {
          const d = (pOp as ConstantNode<number>).value - fOp.value
          evalInstrs.push((dLo, dHi, m, n) => {
            // Enumerate (n branch, m branch) combos consistent with the
            // conditioned ranges of `v` and with D(v).
            const mA = m.lo[v] >= t, // m always passes
              mN = m.hi[v] < t // m never passes
            const nA = n.lo[v] >= t,
              nN = n.hi[v] < t
            const bothMaybe = !mA && !mN && !nA && !nN
            let l = Number.POSITIVE_INFINITY,
              h = Number.NEGATIVE_INFINITY
            if ((!nN && !mN) || (!nA && !mA)) {
              l = 0 // same branch on both sides
              h = 0
            }
            // n passes, m fails: needs v_n >= t > v_m for the same rest `r`
            if (!nN && !mA && !(bothMaybe && dHi[v] <= 0)) {
              if (d < l) l = d
              if (d > h) h = d
            }
            // n fails, m passes
            if (!nA && !mN && !(bothMaybe && dLo[v] >= 0)) {
              if (-d < l) l = -d
              if (-d > h) h = -d
            }
            setD(i, l, h, dLo, dHi, m, n)
          })
        } else {
          // node = s * pass with s = [v >= t] ∈ {0, 1} and fail = 0
          evalInstrs.push((dLo, dHi, m, n) => {
            const mA = m.lo[v] >= t,
              mN = m.hi[v] < t
            const nA = n.lo[v] >= t,
              nN = n.hi[v] < t
            const bothMaybe = !mA && !mN && !nA && !nN
            let l = Number.POSITIVE_INFINITY,
              h = Number.NEGATIVE_INFINITY
            if (!nN && !mN) {
              // both pass: p_n - p_m = D(p)
              if (dLo[p] < l) l = dLo[p]
              if (dHi[p] > h) h = dHi[p]
            }
            if (!nA && !mA) {
              // both fail: 0
              if (0 < l) l = 0
              if (0 > h) h = 0
            }
            if (!nN && !mA && !(bothMaybe && dHi[v] <= 0)) {
              // n passes, m fails: + p_n
              if (n.lo[p] < l) l = n.lo[p]
              if (n.hi[p] > h) h = n.hi[p]
            }
            if (!nA && !mN && !(bothMaybe && dLo[v] >= 0)) {
              // n fails, m passes: - p_m
              if (-m.hi[p] < l) l = -m.hi[p]
              if (-m.lo[p] > h) h = -m.lo[p]
            }
            setD(i, l, h, dLo, dHi, m, n)
          })
        }
        break
      }
      default: {
        const _exhaustive: never = operation
        throw new DiffBoundError(`unsupported operation ${_exhaustive}`, 'node')
      }
    }
  })

  const outIdx = nodes.map((node) => idx.get(node)!)
  const i0 = outIdx[0]
  // Per-slot stat ranges over `readKeys` (missing stat counts as 0),
  // unioned with `extraSlotRange`.
  const slotLo = objMap(arts.values, (list, slot) => {
    const extra = extraSlotRange?.[slot]
    return Float64Array.from(readKeys, (k) =>
      Math.min(
        list.reduce(
          (a, art) => Math.min(a, art.values[k] ?? 0),
          Number.POSITIVE_INFINITY
        ),
        extra?.[k]?.min ?? Number.POSITIVE_INFINITY
      )
    )
  })
  const slotHi = objMap(arts.values, (list, slot) => {
    const extra = extraSlotRange?.[slot]
    return Float64Array.from(readKeys, (k) =>
      Math.max(
        list.reduce(
          (a, art) => Math.max(a, art.values[k] ?? 0),
          Number.NEGATIVE_INFINITY
        ),
        extra?.[k]?.max ?? Number.NEGATIVE_INFINITY
      )
    )
  })

  const outLo = new Float64Array(nodes.length)
  const outHi = new Float64Array(nodes.length)
  const dLo = new Float64Array(nNodes)
  const dHi = new Float64Array(nNodes)

  const forRest = (
    restLo: Float64Array,
    restHi: Float64Array
  ): SlotDiffBound => ({
    context: (vec) => {
      const lo = new Float64Array(nNodes)
      const hi = new Float64Array(nNodes)
      for (const instr of ctxInstrs) instr(lo, hi, vec, restLo, restHi)
      return { vec, lo, hi }
    },
    evaluate: (m, n) => {
      for (const instr of evalInstrs) instr(dLo, dHi, m, n)
      for (let j = 0; j < outIdx.length; j++) {
        outLo[j] = dLo[outIdx[j]]
        outHi[j] = dHi[outIdx[j]]
      }
      return { lo: outLo, hi: outHi }
    },
  })

  return {
    readKeys,
    toVector: (art) => Float64Array.from(readKeys, (k) => art.values[k] ?? 0),
    score: (ctx) => (ctx.lo[i0] + ctx.hi[i0]) / 2,
    nodeRange: (ctx, j) => ({ min: ctx.lo[outIdx[j]], max: ctx.hi[outIdx[j]] }),
    forRest,
    forSlot: (slot) => {
      const restLo = Float64Array.from(
        readKeys,
        (k, ki) =>
          (arts.base[k] ?? 0) +
          allArtifactSlotKeys.reduce(
            (a, s) => (s === slot ? a : a + slotLo[s][ki]),
            0
          )
      )
      const restHi = Float64Array.from(
        readKeys,
        (k, ki) =>
          (arts.base[k] ?? 0) +
          allArtifactSlotKeys.reduce(
            (a, s) => (s === slot ? a : a + slotHi[s][ki]),
            0
          )
      )
      return forRest(restLo, restHi)
    },
  }
}

/**
 * Remove artifacts that are swap-dominated by at least `numTop` others in the
 * same slot.
 *
 * `n` dominates `m` when every node's diff bound satisfies `lo >= 0` and
 * either some node is strictly positive or (to break exact ties without
 * removing both artifacts) `n.id > m.id`. Strictness is sound as an
 * asymmetry-breaker: if some `lo > 0` for `m -> n`, the true difference is
 * everywhere positive in that node, so a sound bound can never certify the
 * reverse swap, and certified domination stays acyclic. An artifact with
 * `numTop` distinct dominators cannot appear in any of the top `numTop`
 * builds: each dominator yields a distinct, feasible, at-least-as-good build,
 * and by induction along the (acyclic) domination order, `numTop` of the
 * *surviving* artifacts also dominate it.
 *
 * Do not use this when a `plotBase` node is in play: a dominated build can
 * still be the best within its plot bin.
 *
 * Candidates are tested from highest to lowest opt-target midpoint (dominators
 * are almost always high-value artifacts), so `maxCandidates` caps the work
 * per artifact at little cost in pruning power; pass a finite cap when calling
 * this repeatedly on branch-and-bound subproblems.
 */
export function pruneDominance(
  nodes: OptNode[],
  arts: ArtifactsBySlot,
  numTop: number,
  maxCandidates = Number.POSITIVE_INFINITY,
  /** Widen each slot's rest box (see `compileDiffBound`); pass the
   * future-artifact boxes when partial builds are being tracked so that a
   * swap is only certified if it also holds for every future completion. */
  extraSlotRange?: Partial<Record<ArtifactSlotKey, DynMinMax>>
): { arts: ArtifactsBySlot; dominators: Map<string, string[]> } {
  const dominators = new Map<string, string[]>()
  if (Object.values(arts.values).some((l) => !l.length))
    return { arts, dominators }
  const bound = compileDiffBound(nodes, arts, extraSlotRange)
  const nNodes = nodes.length
  const strictTol = 1e-9

  const values = objMap(arts.values, (list, slot) => {
    if (list.length <= 1) return list
    const slotBound = bound.forSlot(slot)
    const ctxs = list.map((art) => slotBound.context(bound.toVector(art)))
    const order = ctxs
      .map((ctx, i) => [bound.score(ctx), i] as const)
      .sort(([a], [b]) => b - a)
      .map(([, i]) => i)

    return list.filter((m, mi) => {
      const ctxM = ctxs[mi]
      const doms: string[] = []
      let tested = 0
      for (const ni of order) {
        if (ni === mi) continue
        if (++tested > maxCandidates) break
        const { lo } = slotBound.evaluate(ctxM, ctxs[ni])
        let ok = true,
          strict = false
        for (let j = 0; j < nNodes; j++) {
          if (lo[j] < 0) {
            ok = false
            break
          }
          if (lo[j] > strictTol) strict = true
        }
        if (ok && (strict || list[ni].id > m.id)) {
          doms.push(list[ni].id)
          if (doms.length >= numTop) break
        }
      }
      if (doms.length >= numTop) {
        dominators.set(m.id, doms)
        return false
      }
      return true
    })
  })
  return { arts: { base: arts.base, values }, dominators }
}
