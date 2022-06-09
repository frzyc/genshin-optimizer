import { constant, sum, prod, cmp, res } from "./utils"
import { AnyNode, ComputeNode, ConstantNode, NumNode, ReadNode } from "./type"
import { ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/background"
import { toLinearUpperBound, LinearForm } from './linearUpperBound'
import { precompute, allOperations, optimize } from "./optimization"
import { expandPoly, productPossible } from './expandPoly'
import { forEachNodes, mapFormulas } from "./internal"
import { PriorityQueue } from './priorityQueue'
import { allArtifactSets, allSlotKeys } from "../Types/consts"
import { cartesian } from '../Util/Util'

function feasibleObjVal(f: NumNode, a: ArtifactsBySlot, lin: LinearForm) {
  // "randomly" pick any 5 artifacts
  let statsFeasible = Object.values(a.values).reduce((pv, arts) => {
    if (arts.length === 0) return pv

    const bestArt = arts.reduce((bestArt, art) => {
      let cmp = Object.entries(lin.w).reduce((pv, [k, w]) => pv + w * (bestArt.values[k] - art.values[k]), 0)
      return cmp > 0 ? bestArt : art
    })
    return Object.fromEntries(Object.entries(pv).map(([k, v]) => [k, v + bestArt.values[k]]))
  }, a.base)

  const compute = precompute([f], n => n.path[1])
  return compute(statsFeasible)[0]
}

function boundsUpperLower(a: ArtifactsBySlot) {
  let minStats = Object.entries(a.values).reduce((pv, [slotKey, slotArts]) => {
    let minStatSlot = slotArts.reduce((pv, cv) =>
      Object.fromEntries(Object.entries(cv.values).map(([k, v]) => [k, Math.min(v, pv[k] ?? Infinity)])), {})
    return Object.fromEntries(Object.entries(pv).map(([k, v]) => [k, v + (minStatSlot[k] ?? 0)]))
  }, { ...a.base })
  let maxStats = Object.entries(a.values).reduce((pv, [slotKey, slotArts]) => {
    let maxStatSlot = slotArts.reduce((pv, cv) =>
      Object.fromEntries(Object.entries(cv.values).map(([k, v]) => [k, Math.max(v, pv[k] ?? 0)])), {})
    return Object.fromEntries(Object.entries(pv).map(([k, v]) => [k, v + (maxStatSlot[k] ?? 0)]))
  }, { ...a.base })
  return { statsMin: minStats, statsMax: maxStats }
}

function maxWeight(a: ArtifactsBySlot, lin: LinearForm) {
  const baseVal = Object.entries(lin.w).reduce((dotProd, [statKey, w]) => dotProd + w * a.base[statKey], lin.c)
  const maxTotVal = Object.entries(a.values).reduce((maxTotVal, [slotKey, slotArts]) => {
    const maxSlotVal = slotArts.reduce((maxArtVal, art) => {
      const artVal = Object.entries(lin.w).reduce((dotProd, [statkey, w]) => dotProd + w * art.values[statkey], 0)
      return Math.max(maxArtVal, artVal)
    }, 0)
    return maxTotVal + maxSlotVal
  }, baseVal)
  return maxTotVal
}

function estimateMaximum(func: NumNode, a: ArtifactsBySlot): { maxEst: number, lin: LinearForm } {
  const { statsMin, statsMax } = boundsUpperLower(a)

  function isVari(n: NumNode) {
    switch (n.operation) {
      case 'read':
        // if (mainStatExclusiveKeys.includes(n.path[1])) return true
        return true
      case 'max': case 'min':
      case 'sum_frac':
      case 'threshold':
        return true
      case 'res':
      default:
        return false
    }
  }

  let expandedFunc = expandPoly(func, isVari)
  let products = expandedFunc.operands as NumNode[]
  products = products.filter(productPossible)
  let linUBs = products.flatMap(n => toLinearUpperBound(n, statsMin, statsMax))

  let linUBtot = linUBs.reduce((pv, lin) => {
    Object.entries(lin.w).forEach(([k, v]) => pv.w[k] = v + (pv.w[k] ?? 0))
    return { w: pv.w, c: pv.c + lin.c, err: pv.err + lin.err }
  }, { w: {}, c: 0, err: 0 })

  return { maxEst: maxWeight(a, linUBtot), lin: linUBtot }
}

function subStats(f: NumNode, lower: DynStat, upper: DynStat) {
  const fixedStats = Object.fromEntries(Object.entries(lower).filter(([statKey, v]) => v === upper[statKey]))
  let [f2] = mapFormulas([f], n => n, n => {
    if (n.operation === 'read' && n.path[1] in fixedStats) return constant(fixedStats[n.path[1]])
    if (n.operation === 'threshold') {
      const [branch, branchVal] = n.operands
      if (branch.operation === 'read' && branchVal.operation === 'const') {
        if (lower[branch.path[1]] >= branchVal.value) return n.operands[2]
        if (upper[branch.path[1]] < branchVal.value) return n.operands[3]
      }
    }
    return n
  })

  let [f3] = optimize([f2], {})
  return f3
}

export function debugMe(func: NumNode, a: ArtifactsBySlot) {
  a = {
    base: a.base,
    values: {
      flower: a.values.flower.filter(art => art.id !== ''),
      plume: a.values.plume.filter(art => art.id !== ''),
      sands: a.values.sands.filter(art => art.id !== ''),
      goblet: a.values.goblet.filter(art => art.id !== ''),
      circlet: a.values.circlet.filter(art => art.id !== ''),
    }
  }

  // 1 more optimize loop for good measure.
  let { statsMin, statsMax } = boundsUpperLower(a)
  func = subStats(func, statsMin, statsMax)

  // careful, this may consume O(n^5) memory.
  type Packet = { maxEst: number, f: NumNode, a: ArtifactsBySlot, lin: LinearForm }
  let pq = new PriorityQueue<Packet>((a, b) => a.maxEst > b.maxEst)

  const { maxEst, lin } = estimateMaximum(func, a)
  let lowerBoundDmg = feasibleObjVal(func, a, lin)
  // First search node; contains ALL builds.
  pq.push({ maxEst, f: func, a, lin })

  let niter = 0
  const tottal = Object.values(a.values).reduce((tot, arts) => tot * arts.length, 1)
  let pruned = 0
  let enumerated = 0
  while (!pq.isEmpty()) {
    let { maxEst, f, a, lin } = pq.pop()
    let numBuilds = Object.values(a.values).reduce((tot, arts) => tot * arts.length, 1)

    //  Stats *should* already be subbed in, but it doesn't hurt to try again.
    let { statsMin, statsMax } = boundsUpperLower(a)
    f = subStats(f, statsMin, statsMax)

    let est = estimateMaximum(f, a)
    if (est.maxEst < maxEst) {
      maxEst = est.maxEst;
      lin = est.lin;
    }
    // If re-evaluation tells us this branch is worthless, then just skip.
    lowerBoundDmg = Math.max(feasibleObjVal(f, a, lin), lowerBoundDmg)
    if (maxEst < lowerBoundDmg) {
      pruned += numBuilds
      continue
    }

    console.log({ niter, numBuilds, pqsize: pq.size() }, lowerBoundDmg, '/', maxEst, lin.err)
    console.log('Total pruned: ', pruned)

    // TODO: count `a`, if small then just enumerate it all.
    if (numBuilds < 1000) {
      // TODO: enumerate
      enumerated += numBuilds
      console.log('--------------- ENUMERATE ---------------')
      continue
    }

    niter += 1
    if (niter > 150) break;

    if (niter < 4) {
      // For earlier iterations, shatter search space on `score` to separate
      //   obviously good vs obviously bad artifacts (e.g. fully leveled vs lvl 0 artifacts)
      //
      // Performance of shattering on score degrades quickly because overall BnB performance
      //   depends mostly on approximation error; On an level playing field we prefer branching
      //   on stat values or artifact set.
      const scores = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
        let scores = arts.map(a => Object.entries(lin.w).reduce((dot, [statKey, w]) => dot + w * a.values[statKey], 0))
        return [slotKey, scores]
      }))
      const scoreBranchVal = Object.fromEntries(Object.entries(scores).map(([slotKey, scores]) =>
        [slotKey, (Math.min(...scores) + Math.max(...scores)) / 2]
      ))
      cartesian([0, 1], [0, 1], [0, 1], [0, 1], [0, 1])
        .forEach(([s1, s2, s3, s4, s5]) => {
          let z = {
            base: { ...a.base }, values: {
              flower: a.values.flower.filter((art, i) => scores.flower[i] < scoreBranchVal.flower ? s1 === 0 : s1 === 1),
              plume: a.values.plume.filter((art, i) => scores.plume[i] < scoreBranchVal.plume ? s2 === 0 : s2 === 1),
              sands: a.values.sands.filter((art, i) => scores.sands[i] < scoreBranchVal.sands ? s3 === 0 : s3 === 1),
              goblet: a.values.goblet.filter((art, i) => scores.goblet[i] < scoreBranchVal.goblet ? s4 === 0 : s4 === 1),
              circlet: a.values.circlet.filter((art, i) => scores.circlet[i] < scoreBranchVal.circlet ? s5 === 0 : s5 === 1),
            }
          }
          let numBuilds = Object.values(z.values).reduce((tot, arts) => tot * arts.length, 1)
          if (numBuilds === 0) return;

          const { statsMin, statsMax } = boundsUpperLower(z)
          let f2 = subStats(f, statsMin, statsMax)

          const maxEst1 = maxWeight(z, lin)
          if (maxEst1 < lowerBoundDmg) {
            pruned += numBuilds
            return
          }

          // Possible TODO: re-compute `lin` on `z`.
          // let est2 = estimateMaximum(f2, z)

          // const maxEst2 = maxWeight(z, est2.lin)
          const [maxEst, linToUse] = [maxEst1, lin]
          lowerBoundDmg = Math.max(feasibleObjVal(f2, z, linToUse), lowerBoundDmg)
          if (maxEst < lowerBoundDmg) {
            pruned += numBuilds
            return
          }

          console.log(s1, s2, s3, s4, s5, '(', numBuilds, ')', maxEst, linToUse.err)
          pq.push({ maxEst, lin: linToUse, f: f2, a: z })
        })

      continue
    }

    // Heuristically pick branch parameter by picking the one with
    //   linear weight & the largest reduction in stat range.
    let shatterOn = { k: '', heur: -1 }
    Object.keys(lin.w).forEach(k => {
      const postShatterRange = Object.entries(a.values).reduce((newRange, [slotKey, arts]) => {
        const vals = arts.map(a => a.values[k])
        const minv = Math.min(...vals)
        const maxv = Math.max(...vals)
        const branchVal = (minv + maxv) / 2

        // greatest lower bound/least upper bound for estimating range post-shatter
        const glb = Math.max(...vals.filter(v => v < branchVal))
        const lub = Math.min(...vals.filter(v => v >= branchVal))
        const newRangeSlot = Math.max(glb - minv, maxv - lub)
        return newRangeSlot + newRange
      }, 0)
      let shatterHeur = lin.w[k] * (statsMax[k] - statsMin[k] - postShatterRange)
      if (shatterHeur > shatterOn.heur) shatterOn = { k: k, heur: shatterHeur }
    })

    console.log('shatterOn', shatterOn)

    const branchVals = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
      const vals = arts.map(a => a.values[shatterOn.k])
      return [slotKey, (Math.min(...vals) + Math.max(...vals)) / 2]
    }))

    let correctnessCount = 0

    cartesian([0, 1], [0, 1], [0, 1], [0, 1], [0, 1]).forEach(sel => {
      const [s1, s2, s3, s4, s5] = sel
      let z = {
        base: { ...a.base }, values: {
          flower: a.values.flower.filter(art => art.values[shatterOn.k] > branchVals.flower ? s1 === 0 : s1 === 1),
          plume: a.values.plume.filter(art => art.values[shatterOn.k] > branchVals.plume ? s2 === 0 : s2 === 1),
          sands: a.values.sands.filter(art => art.values[shatterOn.k] > branchVals.sands ? s3 === 0 : s3 === 1),
          goblet: a.values.goblet.filter(art => art.values[shatterOn.k] > branchVals.goblet ? s4 === 0 : s4 === 1),
          circlet: a.values.circlet.filter(art => art.values[shatterOn.k] > branchVals.circlet ? s5 === 0 : s5 === 1),
        }
      }
      let numBuilds = Object.values(z.values).reduce((tot, arts) => tot * arts.length, 1)
      correctnessCount += numBuilds
      if (numBuilds === 0) return;

      const { statsMin, statsMax } = boundsUpperLower(z)
      let f2 = subStats(f, statsMin, statsMax)

      const maxEst1 = maxWeight(z, lin)
      if (maxEst1 < lowerBoundDmg) {
        pruned += numBuilds
        return
      }

      // Possible TODO: re-compute `lin` on `z`.
      let est2 = estimateMaximum(f2, z)

      const maxEst2 = maxWeight(z, est2.lin)
      const [maxEst, linToUse] = maxEst1 < maxEst2 ? [maxEst1, lin] : [maxEst2, est2.lin]
      lowerBoundDmg = Math.max(feasibleObjVal(f2, z, linToUse), lowerBoundDmg)
      if (maxEst < lowerBoundDmg) {
        pruned += numBuilds
        return
      }

      console.log(s1, s2, s3, s4, s5, '(', numBuilds, ')', maxEst, linToUse.err)
      pq.push({ maxEst, lin: linToUse, f: f2, a: z })
    })

    // console.log('SHOULD BE SAME', correctnessCount, numBuilds)
    continue

    console.log(maxEst, lin, a)
    console.log(statsMin, statsMax)

    console.log(pq)
    throw Error('I didnt think Id get this far.')
  }

  console.log(pq)
  let totbuilds = 0
  while (!pq.isEmpty()) {
    let { a } = pq.pop()
    let numBuilds = Object.values(a.values).reduce((tot, arts) => tot * arts.length, 1)
    totbuilds = totbuilds + numBuilds
  }

  console.log('builds left:', totbuilds)
  console.log('Total enumerated vs pruned:', enumerated, pruned, ' out of total ', tottal)
}
