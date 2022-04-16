import { assertUnreachable, objPathValue } from "../Util/Util"
import { forEachNodes, mapFormulas } from "./internal"
import { constant, sum, prod, cmp } from "./utils"
import { CommutativeMonoidOperation, ComputeNode, ConstantNode, Data, NumNode, Operation, ReadNode, StrNode, StrPrioNode } from "./type"
import { precompute, optimize } from "./optimization"
import { ddx } from "./differentiate"
import { ArtifactBuildData, ArtifactsBySlot, DynStat } from "../PageBuild/background"
import { SubstatKey, allSubstats, IArtifact, MainStatKey } from "../Types/artifact"
import { assert } from "console"
import { allSlotKeys, ArtifactSetKey, CharacterKey, SlotKey, Rarity } from '../Types/consts';
import Artifact from "../Data/Artifacts/Artifact"
import { query } from "express"

export type UpgradeOpt = {
  id: string,
  p: number,
  dmg: number
}

// https://hewgill.com/picomath/javascript/erf.js.html
// very good algebraic approximation of erf function. Maximum deviation below 1.5e-7
function erf(x: number) {
  // constants
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;

  // Save the sign of x
  var sign = 1;
  if (x < 0) sign = -1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  var t = 1.0 / (1.0 + p * x);
  var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}


function evalArtifact(objective: Query, art: QueryArtifact): EvalResult {
  if (art.rarity != 5) throw new Error('Only works with 5* artifacts')

  // Get stats of equipping 'art'
  let stats: DynStat = {}
  allSlotKeys.forEach(slotKey => {
    let a = (art.slot == slotKey ? art : objective.arts[slotKey])
    // console.log(a)
    Object.entries(a.values).forEach(([key, value]) => stats[key] = (stats[key] ?? 0) + value)
  })
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

  const c = val - grad.reduce((a, b) => a + b)
  const ks = grad

  // verify gradient
  // stats['critDMG_'] += .0001 * scale('critDMG_')
  // console.log(val, grad)
  // console.log('deriv cmp:', (objective.evalFn(stats)[0] - val) / .0001, grad[2])

  // coeff2normal
  const ksum = grad.reduce((a, b) => a + b)
  const ksum2 = grad.reduce((a, b) => a + b * b, 0)
  const N = rollsLeft
  const mean = 17 / 8 * N * ksum
  const variance = (147 / 8) * N * ksum2 - N * 289 / 64 * ksum * ksum

  // return prob & dmg
  const x = objective.thresholds[0] - c // target
  // mean // mu
  // variance // var

  if (Math.abs(variance) < 1e-5) {
    if (mean > x) return { prob: 1, Edmg: mean - x }
    return { prob: 0, Edmg: 0 }
  }
  const p = (1 - erf((x - mean) / Math.sqrt(2 * variance))) / 2
  if (Math.abs(p) < 1e-8) return { prob: p, Edmg: 0 }

  const phi = Math.exp((-(x - mean) * (x - mean)) / variance / 2) / Math.sqrt(2 * Math.PI)
  return { prob: p, Edmg: mean + Math.sqrt(variance) * phi / p - x }
}


function querySetup(objective: NumNode, arts: QueryBuild, data: Data = {}): Query {
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
  // evalOpt = optimize(evalOpt, data, ({ path: [p] }) => p !== "dyn")
  // evalOpt = optimize(evalOpt, data, ({ path: [p] }) => p !== "dyn")
  const evalFn = precompute(evalOpt, f => f.path[1])

  let stats: DynStat = {}
  Object.values(arts).forEach(art => {
    if (art && art.values){

    Object.entries(art.values).forEach(([k, v]) => {
      stats[k] = v + (stats[k] ?? 0)
    })}
  })
  const dmg0 = evalFn(stats)[0]

  return { formulas: formulas, thresholds: [dmg0], arts: arts, evalFn: evalFn }
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
type EvalResult = {
  prob: number,
  Edmg: number
}
// export type QueryArtifactsBySlot = {
//   [key in SlotKey]: QueryArtifact
// }

export function queryDebug(nodes: NumNode[], curEquip: QueryBuild, data: Data, arts: QueryArtifact[]) {
  console.log('Youve reached query!!!')
  console.log(curEquip)

  let stats: DynStat = {}
  Object.values(curEquip).forEach(art => {
  if (art && art.values){
      Object.entries(art.values).forEach(([k, v]) => {
      stats[k] = v + (stats[k] ?? 0)
    })
  }

  })

  const query = querySetup(nodes[0], curEquip, data)

  console.log(curEquip)
  console.log('cureqip stats:', stats)
  console.log(query.evalFn(stats)[0])

  let evaluated : UpgradeOpt[] = arts.map(art => {
    if (art.rarity != 5) return { id: art.id, p: 0, dmg: 0 }
    let { prob, Edmg } = evalArtifact(query, art)
    return { id: art.id, p: prob, dmg: Edmg }
  })
  evaluated = evaluated.sort((a, b) => b.p * b.dmg - a.p * a.dmg)
  console.log(evaluated)

  arts.forEach(art => {
    if (art.id == evaluated[0].id) console.log(art)
  })
  return evaluated;
}
