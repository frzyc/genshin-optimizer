import { Data, NumNode } from "../Formula/type"
import { precompute, optimize } from "../Formula/optimization"
import { ddx } from "../Formula/differentiate"
import { ArtifactBuildData, ArtifactsBySlot, DynStat } from "../PageBuild/background"
import { SubstatKey, allSubstats, IArtifact, MainStatKey } from "../Types/artifact"
import { assert } from "console"
import { allSlotKeys, ArtifactSetKey, CharacterKey, SlotKey, Rarity } from '../Types/consts';
import Artifact from "../Data/Artifacts/Artifact"
import { crawlUpgrades, allUpgradeValues } from "./artifactUpgradeCrawl"
import { erf } from "../Util/MathUtil"

type OptSummary = {
  c: number,
  ks: number[],
  mu: number,
  std: number,
  thr: number,
  evalFn: (values: Dict<string, number>) => number[]
}
export type UpgradeOptResult = {
  id: string,
  prob: number,
  Edmg: number,
  rollsLeft: number,

  statsBase: DynStat,
  subs: SubstatKey[],
  params: OptSummary[]
}
type Query = {
  formulas: NumNode[],
  thresholds: number[]
  arts: QueryBuild,
  evalFn: (values: Dict<string, number>) => number[]
}
export type QueryArtifact = {
  id: string,
  level: number,
  rarity: Rarity,
  slot: SlotKey,
  values: DynStat,
  substatKeys: SubstatKey[]
}
export type QueryBuild = {
  [key in SlotKey]: QueryArtifact
}

function evalArtifact(objective: Query, art: QueryArtifact): UpgradeOptResult {
  // Get stats of equipping 'art'
  let stats: DynStat = {}
  allSlotKeys.forEach(slotKey => {
    let a = (art.slot == slotKey ? art : objective.arts[slotKey])
    // console.log(a)
    Object.entries(a.values).forEach(([key, value]) => stats[key] = (stats[key] ?? 0) + value)
  })
  const statsBase = { ...stats }
  let scale = (key: SubstatKey) => key.endsWith('_') ? Artifact.maxSubstatValues(key, art.rarity) / 1000 : Artifact.maxSubstatValues(key, art.rarity) / 10

  // Increase each stat by their expected increase
  const rollsLeft = Artifact.rollsRemaining(art.level, art.rarity) - (4 - art.substatKeys.length)
  art.substatKeys.forEach(key => {
    // console.log(key, 17 / 8 * rollsLeft * scale(key))
    stats[key] = (stats[key] ?? 0) + 17 / 8 * rollsLeft * scale(key)
  })

  // linearize
  const out = objective.evalFn(stats)
  const val = out[0]
  const grad = art.substatKeys.map(key => out[1 + allSubstats.indexOf(key)] * scale(key))

  const c = val - 17 / 8 * rollsLeft * grad.reduce((a, b) => a + b)
  const ks = grad

  // coeff2normal
  const ksum = ks.reduce((a, b) => a + b)
  const ksum2 = ks.reduce((a, b) => a + b * b, 0)
  const N = rollsLeft
  const mean = 17 / 8 * N * ksum + c
  const variance = (147 / 8) * N * ksum2 - N * 289 / 64 * ksum * ksum
  const x = objective.thresholds[0] // target

  const summ: OptSummary = { c: c, ks: ks, mu: mean, std: Math.sqrt(variance), thr: x, evalFn: objective.evalFn }
  let ret = { id: art.id, params: [summ], statsBase: statsBase, subs: art.substatKeys, rollsLeft: rollsLeft }

  if (Math.abs(variance) < 1e-5) {
    if (mean > x) return { prob: 1, Edmg: mean - x, ...ret }
    return { prob: 0, Edmg: 0, ...ret }
  }
  const p = (1 - erf((x - mean) / Math.sqrt(2 * variance))) / 2
  if (Math.abs(p) < 1e-8) return { prob: p, Edmg: 0, ...ret }

  const phi = Math.exp((-(x - mean) * (x - mean)) / variance / 2) / Math.sqrt(2 * Math.PI)
  return { prob: p, Edmg: mean + Math.sqrt(variance) * phi / p - x, ...ret }
}


function querySetup(objective: NumNode, curBuild: QueryBuild, data: Data = {}): Query {
  // TODO: expand math to multi-objective
  const formulas = [objective]
  if (formulas.length != 1)
    throw new Error("Implementation only works with one objective formula rn.")

  let toEval: NumNode[] = []
  formulas.forEach(f => {
    toEval.push(f, ...allSubstats.map(sub => ddx(f, fo => fo.path[1], sub)))
  })
  // Opt loop a couple times to ensure all constants folded?
  let evalOpt = optimize(toEval, data, ({ path: [p] }) => p !== "dyn")
  evalOpt = optimize(evalOpt, data, ({ path: [p] }) => p !== "dyn")
  const evalFn = precompute(evalOpt, f => f.path[1])

  let stats: DynStat = {}
  Object.values(curBuild).forEach(art => {
    if (art && art.values) {
      Object.entries(art.values).forEach(([k, v]) => {
        stats[k] = v + (stats[k] ?? 0)
      })
    }
  })
  const dmg0 = evalFn(stats)[0]

  return { formulas: formulas, thresholds: [dmg0], arts: curBuild, evalFn: evalFn }
}

export function queryDebug(nodes: NumNode[], curEquip: QueryBuild, data: Data, arts: QueryArtifact[]) {
  console.log('Youve reached query!!!')

  let stats: DynStat = {}
  Object.values(curEquip).forEach(art => {
    if (art && art.values) {
      Object.entries(art.values).forEach(([k, v]) => {
        stats[k] = v + (stats[k] ?? 0)
      })
    }
  })

  const query = querySetup(nodes[0], curEquip, data)

  // console.log(curEquip)
  // console.log('cureqip stats:', stats)
  // console.log('cur Objective', query.evalFn(stats)[0])

  let evaluated: UpgradeOptResult[] = []
  arts.forEach(art => {
    if (art.rarity == 5)
      evaluated.push(evalArtifact(query, art))
    // return { id: art.id, p: 100 * prob, dmg: Edmg }
  })
  evaluated = evaluated.sort((a, b) => b.prob * b.Edmg - a.prob * a.Edmg)
  // console.log(evaluated)

  // let fn_evals = 0
  // crawlUpgrades(5, ([n1, n2, n3, n4], p) => {
  //   fn_evals += (1 + 3 * n1) * (1 + 3 * n2) * (1 + 3 * n3) * (1 + 3 * n4)
  // })
  // console.log('n_evals:', fn_evals)

  // let res0 = monteCarloInfinite(evaluated[0])
  // let ptot = 0
  // res0.forEach(a => {
  //   ptot += a.p
  // })
  // console.log(ptot, 'should be 1')

  // let res1 = monteCarloInfinite(evaluated[1])
  // ptot = 0
  // res1.forEach(a => {
  //   ptot += a.p
  // })
  // console.log(ptot, 'should be 1')
  return evaluated;
}
