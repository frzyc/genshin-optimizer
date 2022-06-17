import type { NumNode } from '../../../../Formula/type';
import { precompute } from '../../../../Formula/optimization';
import { toLinearUpperBound, maxWeight, LinearForm } from '../../../../Formula/linearUpperBound';
import { allArtifactSets, allSlotKeys, ArtifactSetKey } from '../../../../Types/consts';
import { estimateMaximum, reduceFormula, statsUpperLower } from '../../../../Formula/addedUtils';
import type { CachedCompute, InterimResult, Setup, Split, SplitWork, SubProblem, SubProblemNC, SubProblemWC } from './BackgroundWorker';
import { ArtifactsBySlot, countBuilds, DynStat, filterArts, RequestFilter } from './common';
import { cartesian, objectKeyMap, objectKeyValueMap } from '../../../../Util/Util';

type SplitRequest = {
  threshold: number,
  minCount: number,
  maxIter: number,
  filter?: RequestFilter,
}

export class SplitWorker {
  min: number[]

  arts: ArtifactsBySlot
  nodes: NumNode[]
  artSet: Dict<ArtifactSetKey | 'uniqueKey', number[]>

  subproblems: { count: number, subproblem: SubProblem }[] = []

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
    this.subproblems.push({ count, subproblem })
  }
  split({ threshold, minCount, maxIter, subproblem }: Split): SubProblem[] {
    if (threshold > this.min[this.min.length - 1]) this.min[this.min.length - 1] = threshold
    if (subproblem) this.addSubProblem(subproblem)

    console.log('split', this.min[this.min.length - 1], {
      todo: this.subproblems.length, buildsleft: this.subproblems.reduce((a, { count }) => a + count, 0)
    })

    let n = 0
    while (n < maxIter && this.subproblems.length) {
      n += 1
      const { count, subproblem } = this.subproblems.pop()!
      if (count <= minCount) return [subproblem]

      this.splitBNB(this.min[this.min.length - 1], subproblem).forEach(subp => this.addSubProblem(subp))
      // console.log('[bnb iter]', this.min[this.min.length - 1], {
      //   todo: this.filters.length, buildsleft: this.filters.reduce((a, { count }) => a + count, 0)
      // })
    }
    return []
  }
  splitWork({ threshold, numSplits, subproblem }: SplitWork) {
    if (threshold > this.min[this.min.length - 1]) this.min[this.min.length - 1] = threshold
    if (subproblem) this.addSubProblem(subproblem)

    while (this.subproblems.length > 0 && this.subproblems.length <= numSplits) {
      const { subproblem } = this.subproblems.shift()!
      this.splitBNB(this.min[this.min.length - 1], subproblem).forEach(subp => this.addSubProblem(subp))
    }
    console.log('exit splitWork. Filters pre-exit', this.subproblems)
    return this.subproblems.splice(0, numSplits).map(({ subproblem }) => subproblem)
  }

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
      const cachedCompute = estimateMaximum({ f, a })
      if (sub2.constraints.some(({ min }, i) => cachedCompute.maxEst[i] < min)) return []
      if (cachedCompute.maxEst[cachedCompute.maxEst.length - 1] < threshold) return []

      subproblem = { ...sub2, cache: true, cachedCompute }
    }

    // 2. Pick branching parameter
    const { k } = pickBranch(a, subproblem.cachedCompute)
    const branchVals = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
      const vals = arts.map(a => a.values[k])
      return [slotKey, (Math.min(...vals) + Math.max(...vals)) / 2]
    }))
    const branchArts = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
      const above = arts.filter(art => art.values[k] < branchVals[slotKey] ? true : false)
      const below = arts.filter(art => art.values[k] < branchVals[slotKey] ? false : true)
      return [slotKey, [below, above]]
    }))


    const { optimizationTarget, cachedCompute } = subproblem
    if (cachedCompute.maxEst[cachedCompute.maxEst.length - 1] < threshold) return []

    // 3. Perform branching
    // let { f, thr } = cachedCompute
    // let cachedCompute = cachedCompute
    let results = [] as { numBuilds: number, subproblem: SubProblemWC }[]
    cartesian([0, 1], [0, 1], [0, 1], [0, 1], [0, 1]).forEach(([s1, s2, s3, s4, s5]) => {
      let z = {
        base: { ...a.base },
        values: {
          flower: branchArts.flower[s1],
          plume: branchArts.plume[s2],
          sands: branchArts.sands[s3],
          goblet: branchArts.goblet[s4],
          circlet: branchArts.circlet[s5],
        }
      }

      let numBuilds = Object.values(z.values).reduce((tot, arts) => tot * arts.length, 1)
      if (numBuilds === 0) return;
      const { statsMin, statsMax } = statsUpperLower(z)

      // 1a. Simplify formula, cut off always-satisfied constraints, and validate setExclusion stuff.
      let sub2 = reduceSubProblem(subproblem, statsMin, statsMax)
      if (sub2 === undefined) return;

      // 1b. (fast) Check that existing constraints are satisfiable
      let { maxEst } = estimateMaximum({ a: z, cachedCompute })
      if (sub2.constraints.some(({ min }, i) => maxEst[i] < min)) return;
      if (maxEst[maxEst.length - 1] < threshold) return;

      // 1b. (slow) Check that existing constraints are satisfiable
      let f = [...sub2.constraints.map(({ value }) => value), sub2.optimizationTarget]
      let cc2 = estimateMaximum({ a: z, f })
      if (sub2.constraints.some(({ min }, i) => cc2.maxEst[i] < min)) return;
      if (cc2.maxEst[cc2.maxEst.length - 1] < threshold) return;

      let newFilter: RequestFilter = objectKeyMap(allSlotKeys, slot => ({ kind: 'id' as 'id', ids: new Set(z.values[slot].map(art => art.id)) }))
      results.push({
        numBuilds,
        subproblem: {
          ...sub2,
          filter: newFilter,
          cache: true,
          cachedCompute: cc2
        }
      })
    })
    results.sort((a, b) => b.numBuilds - a.numBuilds)
    return results.map(({ subproblem }) => subproblem)
  }



}

type BNBSplitRequest = {
  filter: RequestFilter,
  bnbCompute?: CachedCompute
}
type BNBHelper = {
  a: ArtifactsBySlot,
  statsMin: DynStat,
  statsMax: DynStat,

  threshold: number
}

function reduceSubProblem(sub: SubProblem, statsMin: DynStat, statsMax: DynStat): SubProblemNC | undefined {
  const { optimizationTarget, constraints, artSetExclusion } = sub
  let subnodes = [optimizationTarget, ...constraints.map(({ value }) => value)]
  const submin = constraints.map(({ min }) => min)

  subnodes = reduceFormula(subnodes, statsMin, statsMax)

  // 1. Check for always-feasible constraints.
  const [compute, mapping, buffer] = precompute(subnodes, n => n.path[1])
  Object.entries(statsMin).forEach(([k, v]) => buffer[mapping[k] ?? 0] = v)
  const result = compute()

  const newOptTarget = subnodes.shift()!
  const active = submin.map((m, i) => m > result[i])
  active[0] = true  // Always preserve main dmg formula
  const newConstraints = subnodes.map((value, i) => ({ value, min: submin[i] })).filter((_, i) => active[i])

  // 2. Check for never-active and always-active ArtSetExcl constraints.
  let newArtExcl = {} as Dict<ArtifactSetKey, number[]>
  for (const [setKey, exclude] of Object.entries(artSetExclusion)) {
    if (setKey === 'uniqueKey') {
      // let minSets = Object.fromEntries(Object.entries(statsMin).filter(([statKey, v]) => v > 0 && allArtifactSets.includes(statKey as any)))
      // let numSets = Object.keys(minSets).length
      // let numSlotsUsed = Object.values(minSets).reduce((a, b) => a + b)

      // TODO: Check and exclude rainbow bullshit.
      newArtExcl[setKey] = exclude
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

    filter: sub.filter
  }

  // const newArtExcl = Object.entries(artSetExclusion)
  //   .reduce((ret, [setKey, exclude]) => {
  //     if (setKey === 'uniqueKey') {
  //       let minSets = Object.fromEntries(Object.entries(statsMin).filter(([statKey, v]) => v > 0 && allArtifactSets.includes(statKey as any)))
  //       let numSets = Object.keys(minSets).length
  //       let numSlotsUsed = Object.values(minSets).reduce((a, b) => a + b)
  //       ret[setKey] = exclude.filter(v => {
  //         // TODO: logic for checking if never active
  //         return true
  //       })
  //       return ret
  //     }
  //     const reducedExcl = [...exclude].filter(n => statsMin[setKey] <= n && n <= statsMax[setKey])
  //     if (reducedExcl.length > 0) ret[setKey] = reducedExcl
  //     return ret
  //   }, {} as Dict<ArtifactSetKey | 'uniqueKey', number[]>
  //   )

  // 3. Check for always-active ArtSetExcle constraints. (problem is never feasible)
}

/**
 * Decides how to split between different branches.
 * TODO: Branch values should also be calculated & returned here
 * @param a     Artifact set
 * @param lin   Linear form from compute
 * @returns     The key to branch on.
 */
function pickBranch(a: ArtifactsBySlot, { lin }: CachedCompute) {
  // TODO: Experiment with
  let linToConsider = lin[lin.length - 1]
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

  if (shatterOn.k === '') throw Error('Shatter broke...')
  return shatterOn
}











function splitBySetOrID(_arts: ArtifactsBySlot, filter: RequestFilter, limit: number): RequestFilter[] {
  const arts = filterArts(_arts, filter)

  const candidates = allSlotKeys
    .map(slot => ({ slot, sets: new Set(arts.values[slot].map(x => x.set)) }))
    .filter(({ sets }) => sets.size > 1)
  if (!candidates.length)
    return splitByID(arts, filter, limit)
  const { sets, slot } = candidates.reduce((a, b) => a.sets.size < b.sets.size ? a : b)
  return [...sets].map(set => ({ ...filter, [slot]: { kind: "required", sets: new Set([set]) } }))
}
function splitByID(_arts: ArtifactsBySlot, filter: RequestFilter, limit: number): RequestFilter[] {
  const arts = filterArts(_arts, filter)
  const count = countBuilds(arts)

  const candidates = allSlotKeys
    .map(slot => ({ slot, length: arts.values[slot].length }))
    .filter(x => x.length > 1)
  const { slot, length } = candidates.reduce((a, b) => a.length < b.length ? a : b)

  const numChunks = Math.ceil(count / limit)
  const boundedNumChunks = Math.min(numChunks, length)
  const chunk = Array(boundedNumChunks).fill(0).map(_ => new Set<string>())
  arts.values[slot].forEach(({ id }, i) => chunk[i % boundedNumChunks].add(id))
  return chunk.map(ids => ({ ...filter, [slot]: { kind: "id", ids } }))
}
//
