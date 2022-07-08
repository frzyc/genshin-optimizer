import type { NumNode } from '../../../../Formula/type';
import { allArtifactSets, allSlotKeys, ArtifactSetKey, SlotKey } from '../../../../Types/consts';
import type { InterimResult, Setup, Split } from './BackgroundWorker';
import { ArtifactsBySlot, ArtifactsBySlotVec, filterArtsVec, filterArtsVec2 } from './common';
import { cartesian, objectKeyMap, objectKeyValueMap, partition } from '../../../../Util/Util';
import { LinearForm } from '../../../../Formula/linearUpperBound';
import { applyLinearForm, countBuildsU, reduceSubProblem, RequestFilter2, slotUpperLowerVec, slotUpperLowerVecW, statsUpperLowerVec, SubProblem, SubProblemWC, UnionFilter2, unionFilterUpperLower } from './subproblemUtil';

export class SplitWorker {
  min: number[]

  arts: ArtifactsBySlot
  artsVec: ArtifactsBySlotVec
  nodes: NumNode[]
  artSet: Dict<ArtifactSetKey | 'uniqueKey', number[]>

  subproblems: { count: number, upperBound: number, subproblem: SubProblem }[] = []

  splitcounter: number = 0

  callback: (interim: InterimResult) => void

  constructor({ arts, artsVec, optimizationTarget, filters, artSetExclusion }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.artsVec = artsVec  // buffer is volatile, shared memory problems?
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
    const count = countBuildsU(subproblem.filters)
    if (count === 0) return
    const maxEst = Math.max(...subproblem.filters.map(({ maxw }) => maxw[maxw.length - 1]))
    this.subproblems.push({ count, upperBound: maxEst, subproblem })
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
      // console.log('work queue', this.subproblems)
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
      const { upperBound: heur } = this.subproblems[i]
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
    // 1. check threshold
    subproblem.filters = subproblem.filters.filter(({ maxw }) => maxw[maxw.length - 1] > threshold)
    if (subproblem.filters.length === 0) return []

    // 2. Pick branching method
    let branches0: SubProblem[] = []
    const maxFilters = 50
    if (subproblem.filters.length > maxFilters) {
      // console.log('large problem detected', subproblem.filters.length)
      // too many filters; just split them somehow I guess?
      const filts = subproblem.filters.sort((a, b) => a.maxw[a.maxw.length - 1] - b.maxw[b.maxw.length - 1])
      const nsplit = Math.ceil(filts.length / maxFilters)
      const newFilts = partition(filts, nsplit)

      branches0 = newFilts.map(filt => ({
        ...subproblem,
        filters: filt
      }))
    }
    else {
      const origBuilds = countBuildsU(subproblem.filters)
      const pruned = performSingletonPrune(this.artsVec, threshold, subproblem)
      const newBuilds = countBuildsU(subproblem.filters)
      if (pruned && countBuildsU(subproblem.filters) === 0) return []
      if (pruned && (origBuilds - newBuilds) > .3 * origBuilds) {
        // if more than a third got pruned due to buillshit
        branches0 = [subproblem]
      }
      else {
        branches0 = this.makeBranches(threshold, subproblem)
      }
    }

    // 3. Perform branching. Check bounding during the branching phase as well.
    let branches = [] as { numBuilds: number, heur: number, subproblem: SubProblemWC }[]
    branches0.forEach(branch => {
      let numBuilds = countBuildsU(branch.filters)
      if (numBuilds === 0) return;

      let sub2 = reduceSubProblem(this.artsVec, threshold, branch)
      if (sub2 === undefined) return;
      sub2.depth += 1

      const me = Math.max(...sub2.filters.map(({ maxw }) => maxw[maxw.length - 1]))
      const li = sub2.lin
      branches.push({
        numBuilds, heur: me - li[li.length - 1].err,
        subproblem: sub2
      })
    })
    // branches.sort((a, b) => a.heur - b.heur)  // Alternative: sort by increasing maxEst - err
    branches.sort((a, b) => b.numBuilds - a.numBuilds)  // Alternative: sort by decreasing num builds

    // console.log('adding branches', branches)
    return branches.map(({ subproblem }) => subproblem)
  }

  makeBranches(threshold: number, subproblem: SubProblemWC): SubProblemWC[] {
    const { constraints, lin, artSetExclusion, filters } = subproblem
    // 1a. Get min & max upper bound estimates for objective & constraints
    const { minw, maxw, lower, upper } = unionFilterUpperLower(filters)

    // console.log('splitting info', { nsp: this.splitcounter, nfilt: filters.length, cnt: countBuildsU(filters) }, { max: maxw[maxw.length - 1], min: minw[minw.length - 1] })
    this.splitcounter += 1

    // 1b. Take subset of relevant artifacts
    const allIDs = {
      flower: { kind: 'id', ids: new Set<string>() },
      plume: { kind: 'id', ids: new Set<string>() },
      sands: { kind: 'id', ids: new Set<string>() },
      goblet: { kind: 'id', ids: new Set<string>() },
      circlet: { kind: 'id', ids: new Set<string>() },
    } as StrictDict<SlotKey, { kind: 'id', ids: Set<string> }>
    filters.forEach(filt => {
      allSlotKeys.forEach(slotKey => {
        const setptr = allIDs[slotKey].ids
        filt.filterVec[slotKey].forEach(ix => setptr.add(this.arts.values[slotKey][ix].id))
      })
    })
    const aarts = filterArtsVec(this.artsVec, allIDs)

    const thr = [...constraints.map(({ min }) => min), threshold]
    const decisionHeur = thr.map((th, i) => (th - minw[i]) / (maxw[i] - minw[i]))
    let argMax = -1
    for (let i = decisionHeur.length - 1; i >= 0; i--) {
      if (Object.keys(lin[i].w).length === 0) continue  // don't branch on an empty `lin`
      if (argMax < 0) argMax = i                        // by default, pick optTarget to branch on
      if (decisionHeur[argMax] < .5) continue           // Discard constraints with low probability of violation
      if (decisionHeur[i] > decisionHeur[argMax]) argMax = i
    }

    // TODO: figure out a heuristic for when to branch on artSetExclusion instead. Currently doing so
    //  when no other options available.
    let branches: UnionFilter2[];
    if (argMax < 0) {
      // Split on set exclusion by just picking the most popular set key.
      const feasibleKeys = allArtifactSets.filter(setKey => upper[setKey] > 0)

      var branchOn = { k: undefined as ArtifactSetKey | undefined, cnt: -1 }
      feasibleKeys.forEach(k => {
        let cnt = upper[k]
        if (artSetExclusion[k] && artSetExclusion[k].includes(cnt))
          cnt = Math.min(...artSetExclusion[k]) - 1

        if (cnt > branchOn.cnt) branchOn = { k, cnt }
      })

      const k = this.artsVec.keys.indexOf(branchOn.k!)
      applyLinearForm(this.artsVec, lin)
      branches = branchOnSetKey(k, this.artsVec, filters, lin)
    }
    else {
      let linToConsider = lin[argMax]
      let keysToConsider = Object.keys(linToConsider.w)

      let shatterOn = { k: '', heur: -1 }
      keysToConsider.forEach(k => {
        const kix = this.artsVec.keys.indexOf(k)
        const postShatterRangeReduction = Object.entries(aarts.values).reduce((rangeReduc, [slot, arts]) => {
          const vals = arts.map(a => a.values[kix])
          const minv = Math.min(...vals)
          const maxv = Math.max(...vals)
          if (minv === maxv) return rangeReduc

          const branchVal = (minv + maxv) / 2
          const glb = Math.max(...vals.filter(v => v <= branchVal))
          const lub = Math.min(...vals.filter(v => v > branchVal))
          return rangeReduc + Math.min(maxv - glb, lub - minv)
        }, 0)
        const heur = linToConsider.w[k] * postShatterRangeReduction * ((allArtifactSets as readonly string[]).includes(k) ? 5 : 1)
        if (heur > shatterOn.heur) shatterOn = { k, heur }
      })

      if (shatterOn.k === '') {
        console.log('===================== SHATTER BROKE ====================', lin, aarts)
        throw Error('Shatter broke...')
      }
      // console.log('shatterOn', shatterOn)

      const k = this.artsVec.keys.indexOf(shatterOn.k)
      const targetBranchVal = (lower[k] + upper[k]) / 2

      applyLinearForm(this.artsVec, lin)
      if ((allArtifactSets as readonly string[]).includes(shatterOn.k)) {
        branches = branchOnSetKey(k, this.artsVec, filters, lin)
      }
      else {
        branches = branchOnValue(k, targetBranchVal, this.artsVec, filters, lin)
      }
    }
    return branches.map(filters => ({ ...subproblem, filters, cache: true }))
  }
}

function branchOnValue(k: number, target: number, arts: ArtifactsBySlotVec, filts: UnionFilter2, lin: LinearForm[]) {
  let left: UnionFilter2 = []
  let right: UnionFilter2 = []
  // let allSeparate: UnionFilter2[] = []
  // const allSplits: RequestFilter2[] = []
  filts.forEach(filt => {
    const { filterVec } = filt
    const branchSplitsIx = splitToTargetIx(arts, k, target, filt)  // returns array of 1-2 splits per slot

    const branchArts = objectKeyMap(allSlotKeys, slotKey => branchSplitsIx[slotKey]
      .filter(ixs => ixs.length > 0)
      .map(ixs => {
        // const slotArts = a.values[slotKey].filter(({ id }) => ids.includes(id))
        const slotArts = filterVec[slotKey].map(ix => arts.values[slotKey][ix])
        return { slotArts, ixs, ...slotUpperLowerVec(slotArts) }
      }))

    cartesian(branchArts.flower, branchArts.plume, branchArts.sands, branchArts.goblet, branchArts.circlet)
      .forEach(slots => {
        const [flower, plume, sands, goblet, circlet] = slots
        const lower = flower.lower.map((_, i) => slots.reduce((tot, { lower }) => tot + lower[i], arts.base[i]))// np.sum(-, axis=1)
        const upper = flower.upper.map((_, i) => slots.reduce((tot, { upper }) => tot + upper[i], arts.base[i]))
        const maxw = flower.maxw.map((_, i) => slots.reduce((tot, { maxw }) => tot + maxw[i], arts.baseBuffer[i]))
        const minw = flower.minw.map((_, i) => slots.reduce((tot, { minw }) => tot + minw[i], arts.baseBuffer[i]))

        const toPush: RequestFilter2 = {
          filterVec: {
            flower: flower.ixs,
            plume: plume.ixs,
            sands: sands.ixs,
            goblet: goblet.ixs,
            circlet: circlet.ixs,
          },
          lower, upper, minw, maxw
        }

        if (upper[k] - target > target - lower[k]) {
          left.push(toPush)
        }
        else {
          right.push(toPush)
        }
      })
  })

  return [left, right]
}

function branchOnSetKey(k: number, arts: ArtifactsBySlotVec, filts: UnionFilter2, lin: LinearForm[]): UnionFilter2[] {
  function format(slotKey: SlotKey, set: 0 | 1, ixVec: number[]) {
    const arts2 = ixVec.map(ix => arts.values[slotKey][ix])
    return { set, ...slotUpperLowerVec(arts2), ixs: ixVec }
  }

  let left: UnionFilter2 = []
  let middle: UnionFilter2 = []
  let right: UnionFilter2 = []
  filts.forEach(({ filterVec }) => {
    const branchArts = objectKeyMap(allSlotKeys, slotKey => {
      const slotArts = arts.values[slotKey]
      const ixVec1 = filterVec[slotKey].filter(artIx => slotArts[artIx].values[k] === 0)
      const ixVec2 = filterVec[slotKey].filter(artIx => slotArts[artIx].values[k] === 1)

      const ret: ReturnType<typeof format>[] = []
      if (ixVec1.length > 0) ret.push(format(slotKey, 0, ixVec1))
      if (ixVec2.length > 0) ret.push(format(slotKey, 1, ixVec2))
      return ret
    })

    cartesian(branchArts.flower, branchArts.plume, branchArts.sands, branchArts.goblet, branchArts.circlet)
      .forEach(slots => {
        const [flower, plume, sands, goblet, circlet] = slots
        const lower = flower.lower.map((_, i) => slots.reduce((tot, { lower }) => tot + lower[i], arts.base[i]))  // np.sum(-, axis=1)
        const upper = flower.upper.map((_, i) => slots.reduce((tot, { upper }) => tot + upper[i], arts.base[i]))
        const maxw = flower.maxw.map((_, i) => slots.reduce((tot, { maxw }) => tot + maxw[i], arts.baseBuffer[i]))
        const minw = flower.minw.map((_, i) => slots.reduce((tot, { minw }) => tot + minw[i], arts.baseBuffer[i]))

        const toPush: RequestFilter2 = {
          filterVec: {
            flower: flower.ixs,
            plume: plume.ixs,
            sands: sands.ixs,
            goblet: goblet.ixs,
            circlet: circlet.ixs,
          },
          lower, upper, minw, maxw
        }

        const setCount = slots.reduce((setCount, { set }) => setCount + set, 0)
        switch (setCount) {
          case 0: case 1:
            left.push(toPush)
            break
          case 2: case 3:
            middle.push(toPush)
            break
          case 4: case 5:
            right.push(toPush)
            break
          default:
            throw Error('Unreachable')
        }
      })
  })
  return [left, middle, right]
}

function splitToTargetIx(a: ArtifactsBySlotVec, k: number, targ: number, { filterVec }: RequestFilter2) {
  const n = 5
  targ = targ - a.base[k]

  // 1. Convert artifacts to simpler form & sort them on each slot
  const ababa0 = allSlotKeys.map(slotKey => filterVec[slotKey]
    .map(ix => ({ ix, v: a.values[slotKey][ix].values[k] }))
    .sort(({ v: v1 }, { v: v2 }) => v1 - v2))
  // 1b. Collapse same-values
  const ababa = ababa0.map(arts => arts.map(({ ix, v }) => ({ ixs: [ix], v })))
  for (let i = 0; i < ababa.length; i += 1) {
    const aa = ababa[i]
    for (let j = aa.length - 1; j > 0; j -= 1) {
      if (aa[j].v == aa[j - 1].v) {
        aa[j - 1].ixs.push(...aa[j].ixs)
        aa.splice(j, 1)
      }
    }
  }

  // 2. Find a feasible solution
  const x0 = ababa.map(arts => arts[0].v)
  const v = ababa.map(arts => arts[arts.length - 1].v - arts[0].v)
  if (v.every(vi => vi === 0)) v.fill(1)
  const coeff = (targ - x0.reduce((a, b) => a + b)) / v.reduce((a, b) => a + b)

  let feas = [] as number[]
  ababa.forEach((arts, si) => {
    let z = -1
    for (let i = 0; i < arts.length; i++) {
      // This can be replaced with binary search.
      // if v[si] === 0 theres an ambiguity...
      if (arts[i].v >= x0[si] + coeff * v[si]) {
        z = i
        break
      }
    }
    if (z < 0) z = arts.length
    feas.push(z)
  })

  // 3a. Convenience functions for checking correctness and scoring breaking schemes
  function checkFeasible(breaks: number[]) {
    let glb = 0, lub = 0
    for (let i = 0; i < n; i++) {
      const b = breaks[i]
      glb += ababa[i][b - 1]?.v ?? -Infinity
      lub += ababa[i][b]?.v ?? Infinity
    }
    return glb - targ <= 1e-6 && targ - lub <= 1e-6  // numerical silliness
  }
  function score(breaks: number[]) {
    return breaks.reduce((p, bi) => p * bi, 1) + breaks.reduce((p, bi, i) => p * (ababa[i].length - bi), 1)
  }

  // 3b. Verify the feasible solution actually works
  if (!checkFeasible(feas)) {
    console.log('feas', feas, checkFeasible(feas), score(feas))
    console.log({ x0, v, coeff, targ })
    console.log(ababa)
    throw Error('hmmm feas not working')
  }

  // 4. Greedily take 1-step or 2-steps until we cannot improve further.
  //    TODO: more intelligent way to search.
  const onesteps: readonly number[][] = [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1], [3, 1], [3, -1], [4, 1], [4, -1]]
  const twosteps: readonly number[][] = [[0, 1, -1, -1], [0, 1, -1, 1], [0, 1, 1, -1], [0, 1, 1, 1], [0, 2, -1, -1], [0, 2, -1, 1], [0, 2, 1, -1], [0, 2, 1, 1], [0, 3, -1, -1], [0, 3, -1, 1], [0, 3, 1, -1], [0, 3, 1, 1], [0, 4, -1, -1], [0, 4, -1, 1], [0, 4, 1, -1], [0, 4, 1, 1], [1, 2, -1, -1], [1, 2, -1, 1], [1, 2, 1, -1], [1, 2, 1, 1], [1, 3, -1, -1], [1, 3, -1, 1], [1, 3, 1, -1], [1, 3, 1, 1], [1, 4, -1, -1], [1, 4, -1, 1], [1, 4, 1, -1], [1, 4, 1, 1], [2, 3, -1, -1], [2, 3, -1, 1], [2, 3, 1, -1], [2, 3, 1, 1], [2, 4, -1, -1], [2, 4, -1, 1], [2, 4, 1, -1], [2, 4, 1, 1], [3, 4, -1, -1], [3, 4, -1, 1], [3, 4, 1, -1], [3, 4, 1, 1]]
  while (true) {  // This must terminate within O(ababa[i].length) steps
    let greedyStep: { score: number, next?: number[] } = { score: score(feas) }
    onesteps.forEach(([i, di]) => {
      let breaks = [...feas]
      breaks[i] += di
      if (breaks[i] < 0 || breaks[i] >= ababa[i].length) return
      if (!checkFeasible(breaks)) return
      const score = breaks.reduce((pr, b) => pr * b, 1) + breaks.reduce((pr, b, i) => pr * (ababa[i].length - b), 1)
      if (score > greedyStep.score) greedyStep = { score, next: breaks }
    })
    twosteps.forEach(([i, j, di, dj]) => {
      let breaks = [...feas]
      breaks[i] += di
      breaks[j] += dj
      if (breaks[i] < 0 || breaks[i] >= ababa[i].length) return
      if (breaks[j] < 0 || breaks[j] >= ababa[j].length) return
      if (!checkFeasible(breaks)) return
      const score = breaks.reduce((pr, b) => pr * b, 1) + breaks.reduce((pr, b, i) => pr * (ababa[i].length - b), 1)
      if (score > greedyStep.score) greedyStep = { score, next: breaks }
    })

    if (greedyStep.next === undefined) break
    feas = greedyStep.next
  }

  return objectKeyMap(allSlotKeys, (slotKey, i) => ([ababa[i].slice(0, feas[i]).flatMap(({ ixs }) => ixs), ababa[i].slice(feas[i]).flatMap(({ ixs }) => ixs)]))
}

function performSingletonPrune(arts: ArtifactsBySlotVec, threshold: number, { constraints, filters, lin }: SubProblem) {
  applyLinearForm(arts, lin)
  const mins = [...constraints.map(({ min }) => min), threshold]

  let changed = false
  for (let i = filters.length - 1; i >= 0; i--) {
    const { maxw, filterVec } = filters[i]

    const toremove = objectKeyMap(allSlotKeys, slot => {
      const slotArts = filterVec[slot].map(ix => arts.values[slot][ix])
      const { minw: minwSlot, maxw: maxwSlot } = slotUpperLowerVecW(slotArts)

      const toremove: number[] = []
      maxw.forEach((mv, j) => {
        const cutoff = mins[j] - maxw[j] + maxwSlot[j]
        if (minwSlot[j] > cutoff) return

        toremove.push(...filterVec[slot].filter(ix => arts.values[slot][ix].buffer[j] < cutoff))
      })
      return new Set(toremove)
    })
    if (Object.values(toremove).every(rm => rm.size === 0)) continue

    changed = true
    const newFilterVec = objectKeyMap(allSlotKeys, slot => filterVec[slot].filter(ix => !toremove[slot].has(ix)))

    const numBuilds = allSlotKeys.reduce((tot, slot) => tot * newFilterVec[slot].length, 1)
    if (numBuilds === 0) {
      filters.splice(i, 1)
      continue
    }

    filters[i] = {
      filterVec: newFilterVec,
      ...statsUpperLowerVec(filterArtsVec2(arts, newFilterVec))
    }
  }

  return changed
}
