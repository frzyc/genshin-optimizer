import type { NumNode } from '../../../../Formula/type';
import { precompute } from '../../../../Formula/optimization';
import { allArtifactSets, allSlotKeys, ArtifactSetKey } from '../../../../Types/consts';
import { estimateMaximum, fillBuffer, reducePolynomial, slotUpperLower, statsUpperLower } from '../../../../Formula/addedUtils';
import type { ArtSetExclusionFull, InterimResult, Setup, Split, SubProblem, SubProblemNC, SubProblemWC } from './BackgroundWorker';
import { ArtifactsBySlot, countBuilds, DynStat, filterArts, RequestFilter } from './common';
import { cartesian, objectKeyMap, objectKeyValueMap, range } from '../../../../Util/Util';
import { sparseMatmul, sparseMatmulMax } from '../../../../Formula/linearUpperBound';
import { toNumNode } from '../../../../Formula/expandPoly';

export class SplitWorker {
  min: number[]

  arts: ArtifactsBySlot
  nodes: NumNode[]
  artSet: Dict<ArtifactSetKey | 'uniqueKey', number[]>

  subproblems: { count: number, heur: number, subproblem: SubProblem }[] = []

  callback: (interim: InterimResult) => void

  constructor({ arts, optimizationTarget, filters, artSetExclusion }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.min = filters.map(x => x.min)
    this.nodes = filters.map(x => x.value)
    this.callback = callback

    this.min.push(-Infinity)
    this.nodes.push(optimizationTarget)

    this.artSet = objectKeyValueMap(Object.entries(artSetExclusion), ([setKey, v]) => {
      if (setKey === 'rainbow') return ['uniqueKey', v.map(v => v + 1)]
      return [setKey, v.flatMap(v => (v === 2) ? [2, 3] : [4, 5])]
    })
  }

  addSubProblem(subproblem: SubProblem) {
    const count = countBuilds(filterArts(this.arts, subproblem.filter))
    if (count === 0) return
    let maxEst = subproblem.cache ? subproblem.cachedCompute.maxEst[subproblem.cachedCompute.maxEst.length - 1] : 0
    this.subproblems.push({ count, heur: maxEst, subproblem })
  }

  /**
   * Iteratively splits the subproblem (depth-first) into smaller chunks until it is small enough,
   *   as determined by `minCount`. Repeat up to `maxIter` times before returning control to the main thread.
   * @param minCount
   * @param maxIter
   * @returns Either ONE [subproblem] of size `minCount` or ZERO [] subproblems.
   */
  split({ threshold, minCount, maxIter, subproblem }: Split): SubProblem[] {
    if (threshold > this.min[this.min.length - 1]) this.min[this.min.length - 1] = threshold
    if (subproblem) this.addSubProblem(subproblem)
    const initialProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0)

    let n = 0
    while (n < maxIter && this.subproblems.length) {
      n += 1
      const { count, subproblem } = this.subproblems.pop()!
      if (count <= minCount) {
        const newProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0) + count
        this.callback({ command: 'interim', tested: 0, failed: 0, skipped: initialProblemTotal - newProblemTotal, buildValues: undefined })
        return [subproblem]
      }

      this.splitBNB(this.min[this.min.length - 1], subproblem).forEach(subp => this.addSubProblem(subp))
    }
    const newProblemTotal = this.subproblems.reduce((a, { count }) => a + count, 0)
    this.callback({ command: 'interim', tested: 0, failed: 0, skipped: initialProblemTotal - newProblemTotal, buildValues: undefined })
    return []
  }

  popOne() {
    // Yield largest subproblem (requests => level-order / prio queue order)
    if (this.subproblems.length === 0) return undefined
    let ret = { i: -1, heur: -Infinity }
    for (let i = 1; i < this.subproblems.length; i++) {
      const { heur, subproblem } = this.subproblems[i]
      if (heur > ret.heur) ret = { i, heur }
    }
    if (ret.i < 0) return undefined
    return this.subproblems.splice(ret.i, 1)[0].subproblem
  }

  /**
   * splitBNB takes a SubProblem and tries to perform Branch and Bound (BnB) pruning to solve for the
   *   optimal damage value. As the name states, there are two main phases: Branching and Bounding.
   *   The bounding is handled by an `estimateMaximum()` function call, and the branching is done by `pickBranch()`.
   *
   * @param threshold  Objective function lower bound threshold
   * @param subproblem The subproblem to split
   * @returns An array of up to 32 splits of the input subproblem.
   */
  splitBNB(threshold: number, subproblem: SubProblem) {
    const a = filterArts(this.arts, subproblem.filter)

    // 1. check constraints & simplify formula.
    if (subproblem.cache === false) {
      const { statsMin, statsMax } = statsUpperLower(a)

      // 1a. Simplify formula, cut off always-satisfied constraints, and validate setExclusion stuff.
      let sub2 = reduceSubProblem(subproblem, statsMin, statsMax)
      if (sub2 === undefined) return []

      // 1b. Check that remaining constraints are satisfiable
      let f = [...sub2.constraints.map(({ value }) => value), sub2.optimizationTarget]
      const cachedCompute = estimateMaximum({ f, a, cachedCompute: { lower: statsMin, upper: statsMax } })
      if (sub2.constraints.some(({ min }, i) => cachedCompute.maxEst[i] < min)) return []
      if (cachedCompute.maxEst[cachedCompute.maxEst.length - 1] < threshold) return []

      subproblem = { ...sub2, cache: true, cachedCompute }
    }
    // 1c. A cached subproblem skips most of the above constraint checking, but `threshold` may change between iterations.
    const { cachedCompute: { maxEst, lin } } = subproblem
    if (maxEst[maxEst.length - 1] <= threshold) return []

    // 2. Pick branching parameter
    const branchArts = pickBranch(a, threshold, subproblem)
    const w0 = sparseMatmulMax(lin, [a.base]).map((wi, i) => wi + lin[i].c)

    // 3. Perform branching. Check bounding during the branching phase as well.
    let branches = [] as { numBuilds: number, heur: number, subproblem: SubProblemWC }[]
    cartesian(branchArts.flower, branchArts.plume, branchArts.sands, branchArts.goblet, branchArts.circlet).forEach(([flower, plume, sands, goblet, circlet]) => {
      const selected = { flower, plume, sands, goblet, circlet }

      let z: ArtifactsBySlot = {
        base: { ...a.base },
        values: objectKeyValueMap(Object.entries(selected), ([k, { arts }]) => [k, arts])
      }

      let numBuilds = Object.values(z.values).reduce((tot, arts) => tot * arts.length, 1)
      if (numBuilds === 0) return;

      // 1b. (fast) Check that existing constraints are satisfiable
      const maxEstC = [...w0]
      Object.values(selected).forEach(({ ww }) => ww.forEach((w, i) => maxEstC[i] += w))
      if (subproblem.constraints.some(({ min }, i) => maxEstC[i] < min)) return;
      if (maxEstC[maxEstC.length - 1] < threshold) return;

      let statsMin = { ...a.base }
      let statsMax = { ...a.base }
      Object.values(selected).forEach(({ statsMin: smin, statsMax: smax }) => {
        Object.entries(smin).forEach(([k, v]) => statsMin[k] = v + (statsMin[k] ?? 0))
        Object.entries(smax).forEach(([k, v]) => statsMax[k] = v + (statsMax[k] ?? 0))
      })

      // 1a. Simplify formula, cut off always-satisfied constraints, and validate setExclusion stuff.
      let sub2 = reduceSubProblem(subproblem, statsMin, statsMax)
      if (sub2 === undefined) return;

      // 1b. (slow) Check that existing constraints are satisfiable
      let f = [...sub2.constraints.map(({ value }) => value), sub2.optimizationTarget]
      let cc2 = estimateMaximum({ a: z, f, cachedCompute: { lower: statsMin, upper: statsMax } })
      if (sub2.constraints.some(({ min }, i) => cc2.maxEst[i] < min)) return;
      if (cc2.maxEst[cc2.maxEst.length - 1] < threshold) return;

      let newFilter: RequestFilter = objectKeyMap(allSlotKeys, slot => ({ kind: 'id' as 'id', ids: new Set(z.values[slot].map(art => art.id)) }))
      branches.push({
        numBuilds,
        heur: cc2.maxEst[cc2.maxEst.length - 1] - cc2.lin[cc2.lin.length - 1].err,
        subproblem: {
          ...sub2,
          filter: newFilter,

          cache: true,
          cachedCompute: cc2,
          depth: sub2.depth + 1
        }
      })
    })
    branches.sort((a, b) => b.heur - a.heur)  // Alternative: sort by decreasing maxEst
    return branches.map(({ subproblem }) => subproblem)
  }
}

/**
 * Takes a Subproblem and reduces whatever formulas it can. Also deletes any constraint equations that are always active
 *   (and therefore have no contribution)
 *
 * @param sub          Subproblem to reduce/simplify.
 * @param statsMinMax  Reduction is based on the range of valid stats.
 * @returns  A new subproblem that should be identical to the previous one, but with fewer components.
 *           If the subproblem is unsatisfiable, return `undefined`
 */
function reduceSubProblem({ optimizationTarget, constraints, artSetExclusion, filter, depth }: SubProblem, statsMin: DynStat, statsMax: DynStat, debug = false): SubProblemNC | undefined {
  // const { optimizationTarget, constraints, artSetExclusion } = sub
  let subnodes = [...constraints.map(({ value }) => value), optimizationTarget]
  const submin = constraints.map(({ min }) => min)

  subnodes = reducePolynomial(subnodes, statsMin, statsMax)

  // 1. Check for always-feasible constraints.
  const [compute, mapping, buffer] = precompute(constraints.map(({ value }) => toNumNode(value)), n => n.path[1])
  fillBuffer(statsMin, mapping, buffer)
  const result = compute()
  const active = submin.map((m, i) => m > result[i])

  const newOptTarget = subnodes.pop()!
  const newConstraints = subnodes.map((value, i) => ({ value, min: submin[i] })).filter((_, i) => active[i])
  if (debug) console.log('reduceSubP', { statsMin, subnodes, submin, result, active })

  // 2. Check for never-active and always-active ArtSetExcl constraints.
  let newArtExcl = {} as ArtSetExclusionFull
  for (const [setKey, exclude] of Object.entries(artSetExclusion)) {
    if (setKey === 'uniqueKey') {
      // TODO: Check and exclude rainbow bullshit.
      newArtExcl[setKey] = exclude
      const feasibleKeys = allArtifactSets.filter(setKey => statsMax[setKey] > 0)
      let feasible4sets = 0
      let feasible2sets = 0
      feasibleKeys.forEach(k => {
        let allowedCnts = range(statsMin[k], statsMax[k])
        if (artSetExclusion[k])
          allowedCnts = allowedCnts.filter(cnt => !artSetExclusion[k].includes(cnt))

        if (allowedCnts.includes(4) || allowedCnts.includes(5)) feasible4sets++
        if (allowedCnts.includes(2) || allowedCnts.includes(3)) feasible2sets++
      })

      if (exclude.includes(5) && feasible4sets === 0) {
        if (feasible2sets === 0) return; // No feasible 4sets or 2sets along with rainbow5 excluded is never satisfiable
        if (exclude.includes(3) && feasible2sets < 2) return; // No 4sets, rainbow5 excluded, rainbow3 excluded means we need at least 2 2sets
      }
      continue
    }
    const reducedExcl = exclude.filter(n => statsMin[setKey] <= n && n <= statsMax[setKey])        // Cut away never-active
    if (reducedExcl.includes(statsMin[setKey]) && reducedExcl.includes(statsMax[setKey])) return;  // Always active.
    if (reducedExcl.length > 0) newArtExcl[setKey] = reducedExcl
  }

  return {
    cache: false,
    optimizationTarget: newOptTarget,
    constraints: newConstraints,
    artSetExclusion: newArtExcl,

    filter, depth
  }
}

/**
 * Decides how to split between different branches.
 * @param a     Artifact set
 * @param lin   Linear form from compute
 * @returns     The key to branch on.
 */
function pickBranch(a: ArtifactsBySlot, threshold: number, subproblem: SubProblemWC, debug = false) {
  const { constraints, cachedCompute: { lin }, artSetExclusion } = subproblem
  let wMins = sparseMatmulMax(lin, [a.base])
  let wMaxs = sparseMatmulMax(lin, [a.base])
  Object.entries(a.values).forEach(([slotKey, arts]) => {
    const matmul = sparseMatmul(lin, arts.map(({ values }) => values))
    wMins.forEach((_, i) => {
      wMaxs[i] += Math.max(...matmul.map(row => row[i]))
      wMins[i] += Math.min(...matmul.map(row => row[i]))
    })
  })

  const thr = [...constraints.map(({ min }) => min), threshold]
  // Consider this the "probability" a randomly chosen set of 5 artifacts will violate
  //   the constraints; assuming the marginal distribution of the values are uniform on
  //   their ranges. Honestly it's a really wacky heuristic but it does a good job
  //   at telling the algorithm to branch targeting a constraint when that constraint
  //   becomes difficult to satsify. (>50% chance to violate)
  const decisionHeur = thr.map((th, i) => (th - wMins[i]) / (wMaxs[i] - wMins[i]))

  let argMax = -1
  for (let i = decisionHeur.length - 1; i >= 0; i--) {
    if (Object.keys(lin[i].w).length === 0) continue  // don't branch on an empty `lin`
    if (argMax < 0) argMax = i                        // by default, pick optTarget to branch on
    if (decisionHeur[argMax] < .5) continue           // Discard constraints with low probability of violation
    if (decisionHeur[i] > decisionHeur[argMax]) argMax = i
  }

  // TODO: figure out a heuristic for when to branch on artSetExclusion instead. Currently doing so
  //  when no other options available.
  if (argMax < 0)
    return splitOnSetExclusion(a, subproblem)

  let linToConsider = lin[argMax]
  let keysToConsider = Object.keys(linToConsider.w)

  let shatterOn = { k: '', heur: -1 }
  keysToConsider.forEach(k => {
    const postShatterRangeReduction = Object.entries(a.values).reduce((rangeReduc, [slot, arts]) => {
      const vals = arts.map(a => a.values[k])
      const minv = Math.min(...vals)
      const maxv = Math.max(...vals)
      if (minv === maxv) return rangeReduc

      const branchVal = (minv + maxv) / 2
      const glb = Math.max(...vals.filter(v => v <= branchVal))
      const lub = Math.min(...vals.filter(v => v > branchVal))
      return rangeReduc + Math.min(maxv - glb, lub - minv)
    }, 0)
    const heur = linToConsider.w[k] * postShatterRangeReduction
    if (heur > shatterOn.heur) shatterOn = { k, heur }
  })

  if (shatterOn.k === '') {
    console.log(subproblem, reduceSubProblem(subproblem, subproblem.cachedCompute.lower, subproblem.cachedCompute.upper, true))
    console.log('===================== SHATTER BROKE ====================', lin, a)
    throw Error('Shatter broke...')
  }

  const branchVals = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const vals = arts.map(a => a.values[shatterOn.k])
    return [slotKey, (Math.min(...vals) + Math.max(...vals)) / 2]
  }))
  const branchArts = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const above = arts.filter(art => art.values[shatterOn.k] < branchVals[slotKey] ? true : false)
    const below = arts.filter(art => art.values[shatterOn.k] < branchVals[slotKey] ? false : true)
    const artBranches = [above, below]

    const wAbove = sparseMatmulMax(lin, above.map(({ values }) => values))
    const wBelow = sparseMatmulMax(lin, below.map(({ values }) => values))
    const wBranches = [wAbove, wBelow]

    return [slotKey, [0, 1]
      .filter(i => artBranches[i].length > 0)
      .map(i => ({ arts: artBranches[i], ...slotUpperLower(artBranches[i]), ww: wBranches[i] }))
    ]
  }))
  return branchArts
}

function splitOnSetExclusion(a: ArtifactsBySlot, { artSetExclusion, cachedCompute: { lin, upper } }: SubProblemWC) {
  // Split on set exclusion by just picking the most popular set key.
  const feasibleKeys = allArtifactSets.filter(setKey => upper[setKey] > 0)

  var branchOn = { k: undefined as ArtifactSetKey | undefined, cnt: -1 }
  feasibleKeys.forEach(k => {
    let cnt = upper[k]
    if (artSetExclusion[k] && artSetExclusion[k].includes(cnt))
      cnt = Math.min(...artSetExclusion[k]) - 1

    if (cnt > branchOn.cnt) branchOn = { k, cnt }
  })

  const sk = branchOn.k!
  const branchArts = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const above = arts.filter(art => art.set === sk ? true : false)
    const below = arts.filter(art => art.set === sk ? false : true)
    const artBranches = [above, below]

    const wAbove = sparseMatmulMax(lin, above.map(({ values }) => values))
    const wBelow = sparseMatmulMax(lin, below.map(({ values }) => values))
    const wBranches = [wAbove, wBelow]

    return [slotKey, [0, 1]
      .filter(i => artBranches[i].length > 0)
      .map(i => ({ arts: artBranches[i], ...slotUpperLower(artBranches[i]), ww: wBranches[i] }))
    ]
  }))

  return branchArts
}
