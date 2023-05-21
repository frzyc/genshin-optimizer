import type { OptNode } from '../../../Formula/optimization'
import { precompute } from '../../../Formula/optimization'
import {
  constant,
  customRead,
  max,
  min,
  prod,
  res,
  sum,
  threshold,
  frac,
} from '../../../Formula/utils'
import { cartesian } from '../../../Util/Util'
import type { ArtifactsBySlot, DynStat } from '../../common'
import type { Linear } from './linearUB'
import { linearUB } from './linearUB'
import type { SumOfMonomials } from './polyUB'
import { polyUB } from './polyUB'

const prettyMuchZero = 1e-6
function evalPoly(polys: SumOfMonomials[], x: DynStat) {
  return polys.map((poly) =>
    poly.reduce((tot, mon) => {
      const trm = mon.$k * mon.terms.reduce((v, k) => v * (x[k] ?? 0), 1)
      return tot + trm
    }, 0)
  )
}
function evalLinear(lins: Linear[], x: DynStat) {
  return lins.map((lin) =>
    Object.entries(lin).reduce((tot, [k, v]) => tot + v * (x[k] ?? 0), lin.$c)
  )
}

/* 90/90 Kokomi with Donut */
const hp = sum(
  customRead(['dyn', 'hp']),
  prod(13471, customRead(['dyn', 'hp_']))
)
const atk = sum(
  customRead(['dyn', 'atk']),
  prod(842, customRead(['dyn', 'atk_']))
)
const def = sum(
  customRead(['dyn', 'def']),
  prod(657, customRead(['dyn', 'def_']))
)
const crcd = sum(
  1,
  prod(customRead(['dyn', 'critRate_']), customRead(['dyn', 'critDMG_']))
)
const crcd0 = sum(
  1,
  prod(
    max(sum(customRead(['dyn', 'critRate_']), -0.3), 0),
    customRead(['dyn', 'critDMG_'])
  )
)
const ohc = customRead(['dyn', 'OceanHuedClam'])
const hod = customRead(['dyn', 'HeartOfDepth'])
const dmg_ = sum(
  1,
  customRead(['dyn', 'hydroDmg_']),
  threshold(hod, 2, 0.2, 0),
  threshold(hod, 4, 0.35, 0)
)
const er = customRead(['dyn', 'enerRech_'])
const em = prod(2.78, frac(customRead(['dyn', 'eleMas']), 1400))
// prettier-ignore
const exampleArts: ArtifactsBySlot = {base:{hp:13471,hp_:0.496,atk:842,def:657,enerRech_:1,hydroDmg_:0.288,critDMG_:0.5,critRate_:0.05,zc1:-1,zc2:-10,zc3:-0.44,zc4:-1},values:{flower:[{id:'f1',set:'OceanHuedClam',values:{hp:4780,eleMas:44,hp_:0.058,atk:31,enerRech_:0.227,OceanHuedClam:1,zc1:1}},{id:'f2',set:'OceanHuedClam',values:{hp:4780,eleMas:43,hp_:0.06,atk:32,enerRech_:0.207,OceanHuedClam:1,zc2:10}},{id:'f3',set:'HeartOfDepth',values:{hp:717,critDMG_:0.054,hp_:0.047,critRate_:0.031,def_:0.066,HeartOfDepth:1,zc3:2}}],plume:[{id:'p1',set:'OceanHuedClam',values:{atk:311,hp_:0.163,def:37,eleMas:37,hp:568,OceanHuedClam:1,zc4:-0.002}},{id:'p2',set:'OceanHuedClam',values:{atk:311,hp_:0.173,def:35,eleMas:39,hp:508,OceanHuedClam:1,zc4:-0.0005}},{id:'p3',set:'HeartOfDepth',values:{atk:311,critDMG_:0.062,enerRech_:0.065,eleMas:40,atk_:0.262,HeartOfDepth:1,zc4:0.002}}],sands:[{id:'s1',set:'OceanHuedClam',values:{enerRech_:0.518,hp:568,atk_:0.105,eleMas:56,hp_:0.105,OceanHuedClam:1,zc2:22}},{id:'s2',set:'OceanHuedClam',values:{enerRech_:0.518,hp:538,atk_:0.115,eleMas:52,hp_:0.115,OceanHuedClam:1,zc2:21.95}},{id:'s3',set:'HeartOfDepth',values:{hp_:0.466,atk_:0.058,eleMas:40,atk:45,enerRech_:0.155,HeartOfDepth:1}}],goblet:[{id:'g1',set:'OceanHuedClam',values:{hydroDmg_:0.466,hp:478,def_:0.204,def:23,eleMas:35,OceanHuedClam:1}},{id:'g2',set:'OceanHuedClam',values:{hydroDmg_:0.466,hp:498,def_:0.194,def:28,eleMas:31,OceanHuedClam:1}},{id:'g3',set:'HeartOfDepth',values:{hydroDmg_:0.466,critDMG_:0.124,eleMas:79,def:23,hp_:0.099,HeartOfDepth:1}}],circlet:[{id:'c1',set:'OceanHuedClam',values:{heal_:0.359,critRate_:0.058,hp_:0.198,atk:14,eleMas:19}},{id:'c2',set:'OceanHuedClam',values:{heal_:0.359,critRate_:0.063,hp_:0.178,atk:15,eleMas:18,zc1:2}},{id:'c3',set:'HeartOfDepth',values:{critRate_:0.311,hp:299,critDMG_:0.155,atk_:0.105,eleMas:56,zc1:2}}]}}

function doTest(...nodes: OptNode[]) {
  const poly = polyUB(nodes, exampleArts)
  const linear = linearUB(nodes, exampleArts)
  const abd = exampleArts.values
  const compute = precompute(nodes, exampleArts.base, (f) => f.path[1], 5)
  cartesian(abd.flower, abd.plume, abd.sands, abd.goblet, abd.circlet).forEach(
    (arts) => {
      const out = compute(arts)
      const stats = { ...exampleArts.base }
      arts.forEach((art) =>
        Object.entries(art.values).forEach(
          ([k, v]) => (stats[k] = v + (stats[k] ?? 0))
        )
      )
      const ubsPoly = evalPoly(poly, stats)
      const ubsLin = evalLinear(linear, stats)
      ubsPoly.forEach((ub, i) =>
        expect(ub).toBeGreaterThanOrEqual(out[i] - prettyMuchZero)
      )
      ubsLin.forEach((ub, i) =>
        expect(ub).toBeGreaterThanOrEqual(out[i] - prettyMuchZero)
      )
    }
  )
}

function toFakeArts(...stats: number[][]): ArtifactsBySlot {
  return {
    base: {},
    values: {
      flower: [],
      plume: [],
      sands: [],
      goblet: [],
      circlet: stats.map((stat) => {
        return {
          id: '',
          values: Object.fromEntries(stat.map((v, i) => [i, v])),
        }
      }),
    },
  }
}

describe('polyUB', () => {
  describe('simple', () => {
    test('constant', () => {
      const poly = polyUB([constant(5)], exampleArts)
      const lin = linearUB([constant(5)], exampleArts)
      expect(evalPoly(poly, {})).toEqual([5])
      expect(evalLinear(lin, {})).toEqual([5])
    })
    test('linear', () => {
      const poly = polyUB([customRead(['dyn', 'atk_'])], exampleArts)
      const lin = linearUB([customRead(['dyn', 'atk_'])], exampleArts)
      expect(evalPoly(poly, { atk_: 5 })).toEqual([5])
      expect(evalPoly(poly, { atk_: 20.5 })).toEqual([20.5])
      expect(evalLinear(lin, { atk_: 5 })).toEqual([5])
      expect(evalLinear(lin, { atk_: 20.5 })).toEqual([20.5])
    })
    test('sum', () => doTest(hp, atk, def))
    test('mul', () => doTest(prod(hp, atk)))
    test('negative mul', () => doTest(prod(-1, hp, atk)))
    test('min', () => doTest(min(atk, 1400)))
    test('max', () => doTest(max(atk, 1400)))
    test('res', () =>
      doTest(res(sum(er, 0.1)), res(sum(er, -1.5)), res(sum(er, -2.2)))) // TODO: check better intervals
    test('sum_frac', () => doTest(em))
    test('threshold', () => {
      doTest(
        // test always pass/always fail
        threshold(ohc, 0, 1, 0),
        threshold(ohc, 10, 1, 0),

        // test upper bound thresh
        threshold(ohc, 4, 1, 0),
        threshold(ohc, 4, 0, 1),

        // test lower bound thresh
        prod(-1, threshold(ohc, 4, 1, 0)),
        prod(-1, threshold(ohc, 4, 0, 1))
      )
    })
  })
  describe('composite', () => {
    test('koko auto', () => doTest(prod(atk, dmg_, crcd0)))
    test('koko vape auto', () => doTest(prod(atk, dmg_, crcd, em)))
    test('silliness', () =>
      doTest(sum(prod(atk, dmg_, crcd, em), prod(def, hp, dmg_, em))))
    test('higher powers', () =>
      doTest(prod(atk, atk), prod(em, em, em, crcd), prod(dmg_, dmg_, em)))
  })
  describe('wacky', () => {
    /* These cases probably wont come up in normal use, but just to test the system. */
    test('prod context flip', () => {
      const n = res(
        sum(
          prod(
            min(1, customRead(['dyn', '0'])),
            min(1, customRead(['dyn', '1']))
          ),
          -1
        )
      )
      const fakeArts = toFakeArts(
        [0, 0],
        [1, 1],
        [2, 2],
        [1, 0.5],
        [1.5, 1],
        [1, 0],
        [2, 1],
        [2, 0]
      )
      const p = polyUB([n], fakeArts)
      const l = linearUB([n], fakeArts)
      const compute = precompute([n], {}, (f) => f.path[1], 1)
      fakeArts.values.circlet.forEach((art) => {
        expect(evalPoly(p, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0]
        )
        expect(evalLinear(l, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0]
        )
      })
    })
    test('threshold nonlinear argument', () => {
      const n = prod(
        -1,
        sum(
          prod(
            min(1, customRead(['dyn', '0'])),
            min(1, customRead(['dyn', '1']))
          ),
          1
        )
      )
      const fakeArts = toFakeArts(
        [0, 0],
        [1, 1],
        [2, 2],
        [1, 0.5],
        [1.5, 1],
        [1, 0],
        [2, 1],
        [2, 0]
      )

      const nodes = [
        n,
        n,
        threshold(n, -1.35, -1, 0),
        threshold(n, -1.35, 0, -1),
        res(threshold(n, -1.65, -1, 0)),
        res(threshold(n, -1.65, 0, -1)),
      ]
      const p = polyUB(nodes, fakeArts)
      const l = linearUB(nodes, fakeArts)
      const compute = precompute(nodes, {}, (f) => f.path[1], 1)
      fakeArts.values.circlet.forEach((art) => {
        expect(evalPoly(p, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0] - prettyMuchZero
        )
        expect(evalPoly(p, art.values)[1]).toBeGreaterThanOrEqual(
          compute([art])[1] - prettyMuchZero
        )
        expect(evalPoly(p, art.values)[2]).toBeGreaterThanOrEqual(
          compute([art])[2] - prettyMuchZero
        )
        expect(evalPoly(p, art.values)[3]).toBeGreaterThanOrEqual(
          compute([art])[3] - prettyMuchZero
        )
        expect(evalPoly(p, art.values)[4]).toBeGreaterThanOrEqual(
          compute([art])[4] - prettyMuchZero
        )

        expect(evalLinear(l, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0] - prettyMuchZero
        )
        expect(evalLinear(l, art.values)[1]).toBeGreaterThanOrEqual(
          compute([art])[1] - prettyMuchZero
        )
        expect(evalLinear(l, art.values)[2]).toBeGreaterThanOrEqual(
          compute([art])[2] - prettyMuchZero
        )
        expect(evalLinear(l, art.values)[3]).toBeGreaterThanOrEqual(
          compute([art])[3] - prettyMuchZero
        )
        expect(evalLinear(l, art.values)[4]).toBeGreaterThanOrEqual(
          compute([art])[4] - prettyMuchZero
        )
      })
    })
    test('product of mixed signs', () => {
      // Boundable, but not currently handled
      const n = prod(
        sum(customRead(['dyn', '0']), -2),
        customRead(['dyn', '1'])
      )
      const n2 = prod(
        sum(customRead(['dyn', '0']), -2),
        min(1, customRead(['dyn', '1']))
      )
      const fakeArts = toFakeArts(
        [0, 0],
        [1, 1],
        [2, 2],
        [1, 0.5],
        [1.5, 1],
        [1, 0],
        [2, 1],
        [2, 0]
      )

      const p = polyUB([n, n2], fakeArts)
      const l = linearUB([n, n2], fakeArts)
      const compute = precompute([n, n2], {}, (f) => f.path[1], 1)
      fakeArts.values.circlet.forEach((art) => {
        expect(evalPoly(p, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0] - prettyMuchZero
        )
        expect(evalPoly(p, art.values)[1]).toBeGreaterThanOrEqual(
          compute([art])[1] - prettyMuchZero
        )

        expect(evalLinear(l, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0] - prettyMuchZero
        )
        expect(evalLinear(l, art.values)[1]).toBeGreaterThanOrEqual(
          compute([art])[1] - prettyMuchZero
        )
      })
    })
    test('zero-crossing bounds', () => {
      const z1 = customRead(['dyn', 'zc1']),
        z2 = customRead(['dyn', 'zc2']),
        z3 = customRead(['dyn', 'zc3']),
        z4 = customRead(['dyn', 'zc4'])
      doTest(
        z1,
        z2,
        z3,
        z4,
        prod(z1, z2, z3, z4),
        sum(prod(z1, z2), prod(-0.3, z3, z4), z2)
      )
    })
  })
  describe('errors', () => {
    test('non-polynomial zero crossing in product', () => {
      // Could be boundable, but involves polynomial factorization.
      const n = prod(
        sum(customRead(['dyn', '0']), -1),
        min(customRead(['dyn', '1']), 1.5)
      )
      const fakeArts = toFakeArts(
        [0, 0],
        [1, 1],
        [2, 2],
        [1, 0.5],
        [1.5, 1],
        [1, 0],
        [2, 1],
        [2, 0]
      )

      expect(() => polyUB([n], fakeArts)).toThrow()
    })
    test('non-const threshold p/f', () => {
      // Boundable, but not currently handled
      const n = threshold(ohc, 3, atk, 2000)
      expect(() => polyUB([n], exampleArts)).toThrow()
    })
  })
  describe('fucky wucky products', () => {
    test('small post-product zero crossing', () => {
      const n = prod(
        -1,
        sum(min(0.1, customRead(['dyn', '0'])), -1.5),
        sum(min(0.1, customRead(['dyn', '1'])), -1.5)
      )
      const fakeArts = toFakeArts(
        [0, 0],
        [1, 1],
        [2, 2],
        [1, 0.5],
        [1.5, 1],
        [1, 0],
        [2, 1],
        [2, 0]
      )

      const p = polyUB([n], fakeArts)
      const l = linearUB([n], fakeArts)
      const compute = precompute([n], {}, (f) => f.path[1], 1)
      fakeArts.values.circlet.forEach((art) => {
        expect(evalPoly(p, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0] - prettyMuchZero
        )

        expect(evalLinear(l, art.values)[0]).toBeGreaterThanOrEqual(
          compute([art])[0] - prettyMuchZero
        )
      })
    })
    test('large post-product zero crossing', () => {
      // Boundable, but not currently handled
      const n = prod(
        -1,
        sum(min(0.1, customRead(['dyn', '0'])), -0.2),
        sum(min(0.1, customRead(['dyn', '1'])), -0.2)
      )
      const fakeArts = toFakeArts(
        [0, 0],
        [1, 1],
        [2, 2],
        [1, 0.5],
        [1.5, 1],
        [1, 0],
        [2, 1],
        [2, 0]
      )

      expect(() => polyUB([n], fakeArts)).toThrow()
    })
    test('artSet cross-terms', () => {
      const ohc4 = threshold(ohc, 4, 1, 0),
        ohc2 = threshold(ohc, 2, 1, 0),
        hod4 = threshold(hod, 4, 1, 0),
        hod2 = threshold(hod, 2, 1, 0)
      const n = [
        prod(ohc4, hod2),
        prod(ohc2, hod2),
        prod(ohc2, sum(hod4, hod2)),
        prod(sum(ohc4, ohc2), sum(hod2, hod4)),
      ]
      const p = polyUB(n, exampleArts)

      expect(p[0]).toEqual([])
      expect(p[1].length).toBeGreaterThanOrEqual(1)
      expect(p[2]).toEqual(p[1])
      expect(p[3]).toEqual(p[1])
    })
  })
})
