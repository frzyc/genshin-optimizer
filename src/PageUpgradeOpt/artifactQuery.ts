import { Data, NumNode } from "../Formula/type"
import { precompute, optimize } from "../Formula/optimization"
import { ddx, zero_deriv } from "../Formula/differentiate"
import { ArtifactBuildData, ArtifactsBySlot, DynStat } from "../PageBuild/background"
import { SubstatKey, allSubstats, IArtifact, MainStatKey } from "../Types/artifact"
import { allSlotKeys, ArtifactSetKey, CharacterKey, SlotKey, Rarity } from '../Types/consts';
import Artifact from "../Data/Artifacts/Artifact"
import { crawlUpgrades, allUpgradeValues } from "./artifactUpgradeCrawl"
import { erf } from "../Util/MathUtil"

type StructuredNumber = {
  v: number,
  grads: number[],
}
export type UpgradeOptResult = {
  id: string,
  subs: SubstatKey[],
  rollsLeft: number,
  statsBase: DynStat,

  prob: number,
  upAvg: number,
  params: OptSummary[],
  evalFn: (values: Dict<string, number>) => StructuredNumber[],
  skippableDerivs: boolean[][]
}
type OptSummary = {
  appxDist: GaussianMixture
  thr: number,
}
type Query = {
  formulas: NumNode[],
  curBuild: QueryBuild,

  thresholds: number[],
  evalFn: (values: Dict<string, number>) => StructuredNumber[],
  skippableDerivs: boolean[][]
}
export type QueryArtifact = {
  id: string,
  level: number,
  rarity: Rarity,
  slot: SlotKey,
  values: DynStat,
  subs: SubstatKey[]
}
export type QueryBuild = {
  [key in SlotKey]: QueryArtifact | undefined
}

function toStats(build: QueryBuild): DynStat {
  let stats: DynStat = {}
  Object.values(build).forEach(a => {
    if (a) Object.entries(a.values).forEach(([key, value]) => stats[key] = (stats[key] ?? 0) + value)
  })
  return stats
}

// From a Gaussian mean & variance, get P(x > mu) and E[x | x > mu]
function gaussianPE(mean: number, variance: number, x: number) {
  if (variance < 1e-5) {
    if (mean > x) return { x: x, p: 1, upAvg: mean - x }
    return { x: x, p: 0, upAvg: 0 }
  }

  const z = (x - mean) / Math.sqrt(variance)
  const p = (1 - erf(z / Math.sqrt(2))) / 2
  if (z > 5) {
    // Z-score large means p will be very small.
    // We can use taylor expansion at infinity to evaluate upAvg.
    const y = 1 / z, y2 = y * y
    return { x: x, p: p, upAvg: y * (1 - 2 * y2 * (1 - y2 * (5 + 37 * y2))) }
  }

  const phi = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI)
  return { x: x, p: p, upAvg: mean - x + Math.sqrt(variance) * phi / p }
}

export function evalArtifact(objective: Query, art: QueryArtifact, slow = false): UpgradeOptResult {
  let newBuild = { ...objective.curBuild }
  newBuild[art.slot] = art
  let stats = toStats(newBuild)
  const statsBase = { ...stats }
  let scale = (key: SubstatKey) => key.endsWith('_') ? Artifact.maxSubstatValues(key, art.rarity) / 1000 : Artifact.maxSubstatValues(key, art.rarity) / 10

  const rollsLeft = Artifact.rollsRemaining(art.level, art.rarity) - (4 - art.subs.length)
  const iq: InternalQuery = {
    rollsLeft: rollsLeft,
    subs: art.subs,
    stats: stats,
    thresholds: objective.thresholds,
    scale: scale,
    objectiveEval: (stats) => objective.evalFn(stats).map(({ v, grads }) => ({ v: v, ks: art.subs.map(key => grads[allSubstats.indexOf(key)] * scale(key)) }))
  }

  const out = slow ? gmm1d(iq) : totalGaussian1d(iq)
  return {
    id: art.id,
    subs: art.subs,
    rollsLeft: rollsLeft,
    statsBase: statsBase,

    prob: out.p,
    upAvg: out.upAvg,
    params: [
      // { appxDist: gmm1d(iq), thr: out.x }
      { appxDist: out.appxDist, thr: out.x }
    ],
    evalFn: objective.evalFn,
    skippableDerivs: objective.skippableDerivs,
  }
}

type InternalQuery = {
  rollsLeft: number,
  subs: SubstatKey[],
  stats: DynStat,
  thresholds: number[],
  objectiveEval: (values: Dict<string, number>) => { v: number, ks: number[] }[],
  scale: (key: SubstatKey) => number,
}
type GaussianMixture = {
  gmm: {
    p: number,
    mu: number,
    sig2: number
  }[],
  x0: number,
  x1: number,
}
type InternalResult = {
  x: number,
  p: number,
  upAvg: number,
  appxDist: GaussianMixture
}

function totalGaussian1d({ rollsLeft, subs, stats, scale, objectiveEval, thresholds }: InternalQuery, ix = 0): InternalResult {
  // Evaluate derivatives at center of 4-D upgrade distribution
  let stats2 = { ...stats }
  subs.forEach(key => {
    // console.log(key, 17 / 8 * rollsLeft * scale(key))
    stats2[key] = (stats2[key] ?? 0) + 17 / 8 * rollsLeft * scale(key)
  })

  const { v, ks } = objectiveEval(stats2)[ix]
  const ksum = ks.reduce((a, b) => a + b)
  const ksum2 = ks.reduce((a, b) => a + b * b, 0)
  const N = rollsLeft

  const mean = v
  const variance = (147 / 8 * ksum2 - 289 / 64 * ksum * ksum) * N
  const appx: GaussianMixture = {
    gmm: [{ p: 1, mu: mean, sig2: variance }], x0: mean - 4 * Math.sqrt(variance), x1: mean + 4 * Math.sqrt(variance)
  }

  return { ...gaussianPE(mean, variance, thresholds[ix]), appxDist: appx }
}

function gmm1d({ rollsLeft, stats, subs, thresholds, scale, objectiveEval }: InternalQuery, ix = 0): InternalResult {
  const appx: GaussianMixture = { gmm: [], x0: thresholds[0], x1: thresholds[0] }
  let lpe: { l: number, p: number, upAvg: number }[] = []
  crawlUpgrades(rollsLeft, (ns, p) => {
    let stat2 = { ...stats }
    subs.forEach((sub, i) => {
      stat2[sub] = (stat2[sub] ?? 0) + 17 / 2 * ns[i] * scale(sub)
    })

    const { v, ks } = objectiveEval(stat2)[ix]
    const mean = v
    const variance = 5 / 4 * ks.reduce((pv, cv, i) => pv + cv * cv * ns[i], 0)
    appx.gmm.push({ p: p, mu: mean, sig2: variance })
    appx.x0 = Math.min(appx.x0, mean - 4 * Math.sqrt(variance))
    appx.x1 = Math.max(appx.x1, mean + 4 * Math.sqrt(variance))

    lpe.push({ l: p, ...gaussianPE(mean, variance, thresholds[ix]) })
  })

  // Aggregate gaussian mixture statistics.
  let p_ret = 0, upAvg_ret = 0
  lpe.forEach(({ l, p, upAvg }) => {
    p_ret += l * p
    upAvg_ret += l * p * upAvg
  })

  if (p_ret < 1e-10) return { p: 0, upAvg: 0, x: thresholds[ix], appxDist: appx }
  upAvg_ret = upAvg_ret / p_ret
  return { p: p_ret, upAvg: upAvg_ret, x: thresholds[ix], appxDist: appx }
}

function querySetup(formulas: NumNode[], curBuild: QueryBuild, data: Data = {}): Query {
  // TODO: expand math to multi-objective
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

  let stats = toStats(curBuild)
  const dmg0 = evalFn(stats)[0]

  const skippableDerivs = formulas.map(f => allSubstats.map(sub => zero_deriv(f, f => f.path[1], sub)))
  const structuredEval = (stats: Dict<string, number>) => {
    const out = evalFn(stats)
    return formulas.map((_, i) => {
      const ix = i * (1 + allSubstats.length)
      return { v: out[ix], grads: allSubstats.map((sub, si) => out[ix + 1 + si]) }
    })
  }
  return { formulas: formulas, thresholds: [dmg0], curBuild: curBuild, evalFn: structuredEval, skippableDerivs: skippableDerivs }
}

export function queryDebug(nodes: NumNode[], curEquip: QueryBuild, data: Data, arts: QueryArtifact[]) {
  const query = querySetup(nodes, curEquip, data)

  let evaluated: UpgradeOptResult[] = []
  arts.forEach(art => {
    if (art.rarity == 5) {
      let toSav = evalArtifact(query, art, true)
      evaluated.push(toSav)
      // if (art.id == 'artifact_1215')
        // console.log(evaluated)
    }
  })
  evaluated = evaluated.sort((a, b) => b.prob * b.upAvg - a.prob * a.upAvg)

  // Now iteratively replace the top `toDisplay` of the evaluated artifacts with a slower, more accurate method
  // evalArtifact(query, art, true)

  return evaluated;
}
