import { constant, prod, cmp } from "./utils"
import { NumNode } from "./type"
import { ArtifactsBySlot, DynStat } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { toLinearUpperBound, LinearForm } from './linearUpperBound'
import { precompute, optimize } from "./optimization"
import { expandPoly, productPossible } from './expandPoly'
import { mapFormulas } from "./internal"
import { PriorityQueue } from './priorityQueue'
import { cartesian } from '../Util/Util'

function feasibleObjVal(f: NumNode, a: ArtifactsBySlot, lin: LinearForm) {
  // "randomly" pick any 5 artifacts
  let selected = [] as string[]
  let statsFeasible = Object.values(a.values).reduce((pv, arts) => {
    if (arts.length === 0) return pv

    const bestArt = arts.reduce((bestArt, art) => {
      let cmp = Object.entries(lin.w).reduce((pv, [k, w]) => pv + w * (bestArt.values[k] - art.values[k]), 0)
      return cmp > 0 ? bestArt : art
    })
    selected.push(bestArt.id)
    return Object.fromEntries(Object.entries(pv).map(([k, v]) => [k, v + bestArt.values[k]]))
  }, { ...a.base })

  const [compute, mapping, buffer] = precompute([f], n => n.path[1])
  // return { dmgVal: compute(statsFeasible)[0], arts: selected }
  return { dmgVal: 0, arts: selected }
}

function boundsUpperLower(a: ArtifactsBySlot) {
  let minStats = Object.entries(a.values).reduce((pv, [slotKey, slotArts]) => {
    let minStatSlot: DynStat = {}
    slotArts.forEach(art => {
      for (const statKey in art.values) minStatSlot[statKey] = Math.min(art.values[statKey], minStatSlot[statKey] ?? Infinity)
    })
    Object.entries(minStatSlot).forEach(([k, v]) => pv[k] = v + (pv[k] ?? 0))
    return pv
  }, { ...a.base })
  let maxStats = Object.entries(a.values).reduce((pv, [slotKey, slotArts]) => {
    let maxStatSlot: DynStat = {}
    slotArts.forEach(art => {
      for (const statKey in art.values) maxStatSlot[statKey] = Math.max(art.values[statKey], maxStatSlot[statKey] ?? 0)
    })
    Object.entries(maxStatSlot).forEach(([k, v]) => pv[k] = v + (pv[k] ?? 0))
    return pv
  }, { ...a.base })
  return { statsMin: minStats, statsMax: maxStats }
}

function maxWeight(a: ArtifactsBySlot, lin: LinearForm) {
  const baseVal = Object.entries(lin.w).reduce((dotProd, [statKey, w]) => dotProd + w * a.base[statKey], lin.c)
  const maxTot = Object.entries(a.values).reduce((maxTotVal, [slotKey, slotArts]) => {
    const maxSlot = slotArts.reduce((maxArt, art) => {
      const artVal = Object.entries(lin.w).reduce((dotProd, [statkey, w]) => dotProd + w * art.values[statkey], 0)
      return maxArt.v > artVal ? maxArt : { v: artVal, id: art.id }
    }, { v: 0, id: '' })
    maxTotVal.v += maxSlot.v
    maxTotVal.ids.push(maxSlot.id)
    return maxTotVal
  }, { v: baseVal, ids: [] as string[] })
  return maxTot.v
}

function estimateMaximum(func: NumNode, a: ArtifactsBySlot): { maxEst: number, lin: LinearForm } {
  const { statsMin, statsMax } = boundsUpperLower(a)

  if (func.operation === 'const') {
    return { maxEst: func.value, lin: toLinearUpperBound(func, statsMin, statsMax) as LinearForm }
  }
  if (func.operation === 'read') {
    return { maxEst: statsMax[func.path[1]], lin: toLinearUpperBound(func, statsMin, statsMax) as LinearForm }
  }

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

function simplifyFormulaSubstitution(f: NumNode, lower: DynStat, upper: DynStat) {
  const fixedStats = Object.fromEntries(Object.entries(lower).filter(([statKey, v]) => v === upper[statKey]))
  let [f2] = mapFormulas([f], n => n, n => {
    if (n.operation === 'read' && n.path[1] in fixedStats) return constant(fixedStats[n.path[1]])
    if (n.operation === 'threshold') {
      const [branch, branchVal, ge, lt] = n.operands
      if (branch.operation === 'read' && branchVal.operation === 'const') {
        if (lower[branch.path[1]] >= branchVal.value) return n.operands[2]
        if (upper[branch.path[1]] < branchVal.value) return n.operands[3]
      }

      if (ge.operation !== 'const') {
        if (lt.operation === 'const' && lt.value === 0) {
          return prod(cmp(branch, branchVal, 1, 0), ge)
        }
        throw Error('Threshold between non-const `pass` and non-zero `fail` not supported.')
      }
    }
    return n
  })

  let [f3] = optimize([f2], {})
  return f3
}

type WorkerPayload = {
  f: NumNode[],
  a: ArtifactsBySlot,
  thresh: number[],

  cachedCompute?: {
    maxEst: number,
    lin: LinearForm
  }
}
type Build = {
  arts: string[],
  dmgVal: number,
}

function bnbWorker({ f, a, thresh, cachedCompute }: WorkerPayload): { branches: { heur: number, work: WorkerPayload }[], builds: Build[], enum?: number } {
  // For now only consider first element in list.
  let numBuilds = Object.values(a.values).reduce((tot, arts) => tot * arts.length, 1)
  let builds = [] as Build[]
  let { statsMin, statsMax } = boundsUpperLower(a)

  let f0 = simplifyFormulaSubstitution(f[0], statsMin, statsMax)
  let thr0 = thresh[0]

  let est = estimateMaximum(f0, a)
  let feas = feasibleObjVal(f0, a, est.lin)
  builds.push(feas)
  if (est.maxEst < feas.dmgVal) {
    console.log('~~~~~~~~~~~~ BIG PROBLEM UH OH ~~~~~~~~~~~~')
    // debug2(a, f0)
    throw Error('BIG PROBLEM: UPPER BOUND VIOLATED')
  }

  let { maxEst, lin } = (cachedCompute && cachedCompute.maxEst < est.maxEst) ? cachedCompute : est
  feas = feasibleObjVal(f0, a, lin)
  thr0 = Math.max(feas.dmgVal, thr0)
  if (maxEst < thr0) {
    return { branches: [], builds }
  }

  if (numBuilds < 2000) {
    console.log('--------------- ENUMERATE (implement me please) ---------------', { numBuilds })
    return { branches: [], builds, enum: numBuilds }
  }

  // Heuristically pick branch parameter by picking the one with largest
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
    // console.log(k, shatterHeur, statsMax[k] - statsMin[k], postShatterRange)
    if (shatterHeur > shatterOn.heur) shatterOn = { k: k, heur: shatterHeur }
  })

  const branchVals = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const vals = arts.map(a => a.values[shatterOn.k])
    return [slotKey, (Math.min(...vals) + Math.max(...vals)) / 2]
  }))

  const branchArts = Object.fromEntries(Object.entries(a.values).map(([slotKey, arts]) => {
    const above = arts.filter(art => art.values[shatterOn.k] < branchVals[slotKey] ? true : false)
    const below = arts.filter(art => art.values[shatterOn.k] < branchVals[slotKey] ? false : true)
    return [slotKey, [below, above]]
  }))

  let branches: { heur: number, work: WorkerPayload }[] = []
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

    const { statsMin, statsMax } = boundsUpperLower(z)
    let f2 = simplifyFormulaSubstitution(f0, statsMin, statsMax)

    const maxEst1 = maxWeight(z, lin)
    if (maxEst1 < thr0) return

    let est2 = estimateMaximum(f2, z)
    const { maxEst, lin: linToUse } = maxEst1 < est2.maxEst ? { maxEst: maxEst1, lin } : est2
    if (maxEst < thr0) return

    let feas = feasibleObjVal(f0, a, est.lin)
    builds.push(feas)

    let fout = [...f]
    fout[0] = f2
    const out: WorkerPayload = {
      f: fout,
      a: z,
      thresh: thresh,

      cachedCompute: { maxEst, lin: linToUse }
    }
    branches.push({ heur: maxEst, work: out })
  })
  return { branches, builds }
}


/**
 * ============================ PROFILING RESULTS ============================
 *
 * - estimateMaximum()      ┬ 67%
 *   - toLinearUpperBound() ├─┬ 41%
 *     - lub()              │ ├─┬ 26.7%
 *       - solveLP()        │ │ └─ 23.8%
 *     - expandPoly()       │ ├── 8.4%
 *     - copyData() (?)     │ └── 3.3%
 *   - expandPoly()         ├── 12.5%
 *   - boundsUpperLower()   └── 10.1%
 * - boundsUpperLower()     ─ 17.1%
 * - feasibleObjective()    ─ 4.9%
 * - simplifyFormula()      ─ 4.4%
 * - maxWeight()            ─ 3.4%
 *
 * Stuff that can be improved:
 *   boundsUpperLower() - during shattering phase, we could save the bounds for each slot's splits
 *                        to reduce upperLower() calls from 32 -> 2
 *                      - pass bounds into pq, avoid re-computing
 *   estimateMaximum()  - pass into pq, avoid re-computing (should reduce 2x)
 *   expandPoly()       - Right now I notice some variables are duplicated, for example
 *                        Venti 14 ticks has stats => {0: -, 1: -, 2: -, 3: -, atk, CR, ...} but
 *                        the "1" and "2" both correspond to CDmg for some reason. Also seems to
 *                        be equal for all aritfacts, so we can roughly halve the number of formulas
 *                        we need to expand by combining those stats.
 *                      - Subroutine `gatherSumOfProds()`. Current implementation is very jank. expandPoly()
 *                        spends roughly 70% of its time trying to gather like terms.
 *
 *   solveLP()          - Something something warm start? I'm fairly certain this can be improved
 *                        more than 100x, but up to (you) how sophisticated a solving algorithm you
 *                        want to implement. Current implementation spends 85% of its time pivoting
 *                        the tableau; lazy pivoting or better pivot selection algo would help.
 *
 * ===========================================================================
 */
export function optimizeBNB(func: NumNode, a: ArtifactsBySlot) {
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

  console.log('arts: ', a)
  console.log('f', func)


  // TODO: preprocessing
  let { statsMin, statsMax } = boundsUpperLower(a)
  func = simplifyFormulaSubstitution(func, statsMin, statsMax)

  type Packet = { heur: number, work: WorkerPayload }
  let pq = new PriorityQueue<Packet>((a, b) => a.heur > b.heur)

  const { maxEst, lin } = estimateMaximum(func, a)
  let { dmgVal: lowerBoundDmg, arts: bestBuild } = feasibleObjVal(func, a, lin)
  pq.push({ heur: maxEst, work: { f: [func], a, thresh: [lowerBoundDmg] } })

  let niter = 0
  const tottal = Object.values(a.values).reduce((tot, arts) => tot * arts.length, 1)
  let pruned = 0
  let enumerated = 0
  while (!pq.isEmpty()) {
    let { heur, work } = pq.pop()
    const inputSize = Object.values(work.a.values).reduce((cnt, arts) => cnt * arts.length, 1)
    work.thresh[0] = lowerBoundDmg

    console.log({ niter, inputSize, pqsize: pq.size() }, { lower: lowerBoundDmg, upper: heur })
    let { branches, builds, enum: numEnum } = bnbWorker(work)
    builds.forEach(({ dmgVal, arts }) => {
      if (dmgVal > lowerBoundDmg) {
        lowerBoundDmg = dmgVal
        bestBuild = arts
      }
    })

    let newSize = branches.reduce((tot, br) => tot + Object.values(br.work.a.values).reduce((cnt, arts) => cnt * arts.length, 1), 0)

    pruned += inputSize - newSize - (numEnum ?? 0)
    enumerated += numEnum ?? 0
    pq.push(...branches)

    niter += 1
  }

  console.log('Best found:', { dmg: lowerBoundDmg, bestBuild })
  console.log({ enumerated, pruned, tottal })
}
