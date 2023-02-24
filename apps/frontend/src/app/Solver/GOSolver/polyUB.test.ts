import { OptNode, precompute } from "../../Formula/optimization"
import { constant, customRead, max, min, prod, sum, threshold } from "../../Formula/utils"
import { cartesian } from "../../Util/Util"
import { ArtifactsBySlot } from "../common"
import { DynStat } from "../common"
import { SumOfMonomials, polyUB } from "./polyUB"

const zero = 1e-6
function evalPoly(polys: SumOfMonomials[], x: DynStat) {
  return polys.map(poly =>
    poly.reduce((tot, mon) => {
      const trm = mon.$k * mon.terms.reduce((v, k) => v * (x[k] ?? 0), 1)
      return tot + trm
    }, 0)
  )
}

/* 90/90 Kokomi with Donut */
const hp = sum(customRead(['dyn', 'hp']), prod(13471, customRead(['dyn', 'hp_'])))
const atk = sum(customRead(['dyn', 'atk']), prod(842, customRead(['dyn', 'atk_'])))
const def = sum(customRead(['dyn', 'def']), prod(657, customRead(['dyn', 'def_'])))
const crcd = sum(1, prod(customRead(['dyn', 'critRate_']), customRead(['dyn', 'critDMG_'])))
const crcd0 = sum(1, prod(max(sum(customRead(['dyn', 'critRate_']), -.3), 0), customRead(['dyn', 'critDMG_'])))
const dmg_ = sum(1, customRead(['dyn', 'hydroDmg_']), threshold(customRead(['dyn', 'HeartOfDepth']), 2, .2, 0))
const er = customRead(['dyn', 'enerRech_'])
const exampleArts: ArtifactsBySlot = {
  base: { 'hp': 13471, 'hp_': .496, 'atk': 842, 'def': 657, 'enerRech_': 1, 'hydroDmg_': .288, 'critDMG_': .5, 'critRate_': .05 },
  values: {
    flower: [{ id: 'f1', set: 'OceanHuedClam', values: { 'hp': 4780, 'eleMas': 44, 'hp_': .058, 'atk': 31, 'enerRech_': .227, 'OceanHuedClam': 1 } },
    { id: 'f2', set: 'OceanHuedClam', values: { 'hp': 4780, 'eleMas': 43, 'hp_': .06, 'atk': 32, 'enerRech_': .207, 'OceanHuedClam': 1 } },
    { id: 'f3', set: 'HeartOfDepth', values: { 'hp': 717, 'critDMG_': .054, 'hp_': .047, 'critRate_': .031, 'def_': .066, 'HeartOfDepth': 1 } }],
    plume: [{ id: 'p1', set: 'OceanHuedClam', values: { 'atk': 311, 'hp_': .163, 'def': 37, 'eleMas': 37, 'hp': 568, 'OceanHuedClam': 1 } },
    { id: 'p2', set: 'OceanHuedClam', values: { 'atk': 311, 'hp_': .173, 'def': 35, 'eleMas': 39, 'hp': 508, 'OceanHuedClam': 1 } },
    { id: 'p3', set: 'HeartOfDepth', values: { 'atk': 311, 'critDMG_': .062, 'enerRech_': .065, 'eleMas': 40, 'atk_': .262, 'HeartOfDepth': 1 } }],
    sands: [{ id: 's1', set: 'OceanHuedClam', values: { 'enerRech_': .518, 'hp': 568, 'atk_': .105, 'eleMas': 56, 'hp_': .105, 'OceanHuedClam': 1 } },
    { id: 's2', set: 'OceanHuedClam', values: { 'enerRech_': .518, 'hp': 538, 'atk_': .115, 'eleMas': 52, 'hp_': .115, 'OceanHuedClam': 1 } },
    { id: 's3', set: 'HeartOfDepth', values: { 'hp_': .466, 'atk_': .058, 'eleMas': 40, 'atk': 45, 'enerRech_': .155, 'HeartOfDepth': 1 } }],
    goblet: [{ id: 'g1', set: 'OceanHuedClam', values: { 'hydroDmg_': .466, 'hp': 478, 'def_': .204, 'def': 23, 'eleMas': 35, 'OceanHuedClam': 1 } },
    { id: 'g2', set: 'OceanHuedClam', values: { 'hydroDmg_': .466, 'hp': 498, 'def_': .194, 'def': 28, 'eleMas': 31, 'OceanHuedClam': 1 } },
    { id: 'g3', set: 'HeartOfDepth', values: { 'hydroDmg_': .466, 'critDMG_': .124, 'eleMas': 79, 'def': 23, 'hp_': .099, 'HeartOfDepth': 1 } }],
    circlet: [{ id: 'c1', set: 'OceanHuedClam', values: { 'heal_': .359, 'critRate_': .058, 'hp_': .198, 'atk': 14, 'eleMas': 19 } },
    { id: 'c2', set: 'OceanHuedClam', values: { 'heal_': .359, 'critRate_': .063, 'hp_': .178, 'atk': 15, 'eleMas': 18 } },
    { id: 'c3', set: 'HeartOfDepth', values: { 'critRate_': .311, 'hp': 299, 'critDMG_': .155, 'atk_': .105, 'eleMas': 56 } }]
  }
}

describe("polyUB", () => {
  describe("simple", () => {
    test("constant", () => {
      const poly = polyUB([constant(5)], exampleArts)
      expect(evalPoly(poly, {})).toEqual([5])
    })
    test("linear", () => {
      const poly = polyUB([customRead(['dyn', 'atk_'])], exampleArts)
      expect(evalPoly(poly, { 'atk_': 5 })).toEqual([5])
      expect(evalPoly(poly, { 'atk_': 20.5 })).toEqual([20.5])
    })
    test("sum", () => {
      const nodes = [hp, atk, def]
      const poly = polyUB(nodes, exampleArts)
      const out = precompute(nodes, {}, f => f.path[1], 1)([{ id: '0', values: exampleArts.base }])
      expect(evalPoly(poly, exampleArts.base)).toEqual(out)
    })
    test("mul", () => {
      const nodes = [prod(hp, atk)]
      const poly = polyUB(nodes, exampleArts)
      const abd = exampleArts.values
      const compute = precompute(nodes, exampleArts.base, f => f.path[1], 5)
      cartesian(abd.flower, abd.plume, abd.sands, abd.goblet, abd.circlet).forEach(arts => {
        const out = compute(arts)
        const stats = { ...exampleArts.base }
        arts.forEach(art => Object.entries(art.values).forEach(([k, v]) => stats[k] = v + (stats[k] ?? 0)))
        expect(evalPoly(poly, stats)[0]).toBeGreaterThanOrEqual(out[0] - zero)
      })
    })
    test("min", () => {
      const nodes = [min(atk, 1400)]
      const poly = polyUB(nodes, exampleArts)
      const abd = exampleArts.values
      const compute = precompute(nodes, exampleArts.base, f => f.path[1], 5)
      cartesian(abd.flower, abd.plume, abd.sands, abd.goblet, abd.circlet).forEach(arts => {
        const out = compute(arts)
        const stats = { ...exampleArts.base }
        arts.forEach(art => Object.entries(art.values).forEach(([k, v]) => stats[k] = v + (stats[k] ?? 0)))
        expect(evalPoly(poly, stats)[0]).toBeGreaterThanOrEqual(out[0] - zero)
      })
    })
    test("max", () => {
      const nodes = [max(atk, 1400)]
      const poly = polyUB(nodes, exampleArts)
      const abd = exampleArts.values
      const compute = precompute(nodes, exampleArts.base, f => f.path[1], 5)
      cartesian(abd.flower, abd.plume, abd.sands, abd.goblet, abd.circlet).forEach(arts => {
        const out = compute(arts)
        const stats = { ...exampleArts.base }
        arts.forEach(art => Object.entries(art.values).forEach(([k, v]) => stats[k] = v + (stats[k] ?? 0)))
        expect(evalPoly(poly, stats)[0]).toBeGreaterThanOrEqual(out[0] - zero)
      })
    })
  })
})
