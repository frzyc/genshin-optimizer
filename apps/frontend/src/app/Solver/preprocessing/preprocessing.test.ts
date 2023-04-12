import { foldProd, foldSum, reaffine2 } from './reaffine'
import { constant, customRead, prod, sum } from '../../Formula/utils'
import type { ArtifactsBySlot } from '../common'

const exampleArts: ArtifactsBySlot = {
  base: {
    hp: 13471,
    hp_: 0.496,
    atk: 842,
    def: 657,
    enerRech_: 1,
    hydroDmg_: 0.288,
    critDMG_: 0.5,
    critRate_: 0.05,
    zc1: -1,
    zc2: -10,
    zc3: -0.44,
    zc4: -1,
  },
  values: {
    flower: [
      {
        id: 'f1',
        set: 'OceanHuedClam',
        values: {
          hp: 4780,
          eleMas: 44,
          hp_: 0.058,
          atk: 31,
          enerRech_: 0.227,
          OceanHuedClam: 1,
          zc1: 1,
        },
      },
      {
        id: 'f2',
        set: 'OceanHuedClam',
        values: {
          hp: 4780,
          eleMas: 43,
          hp_: 0.06,
          atk: 32,
          enerRech_: 0.207,
          OceanHuedClam: 1,
          zc2: 10,
        },
      },
      {
        id: 'f3',
        set: 'HeartOfDepth',
        values: {
          hp: 717,
          critDMG_: 0.054,
          hp_: 0.047,
          critRate_: 0.031,
          def_: 0.066,
          HeartOfDepth: 1,
          zc3: 2,
        },
      },
    ],
    plume: [
      {
        id: 'p1',
        set: 'OceanHuedClam',
        values: {
          atk: 311,
          hp_: 0.163,
          def: 37,
          eleMas: 37,
          hp: 568,
          OceanHuedClam: 1,
          zc4: -0.002,
        },
      },
      {
        id: 'p2',
        set: 'OceanHuedClam',
        values: {
          atk: 311,
          hp_: 0.173,
          def: 35,
          eleMas: 39,
          hp: 508,
          OceanHuedClam: 1,
          zc4: -0.0005,
        },
      },
      {
        id: 'p3',
        set: 'HeartOfDepth',
        values: {
          atk: 311,
          critDMG_: 0.062,
          enerRech_: 0.065,
          eleMas: 40,
          atk_: 0.262,
          HeartOfDepth: 1,
          zc4: 0.002,
        },
      },
    ],
    sands: [
      {
        id: 's1',
        set: 'OceanHuedClam',
        values: {
          enerRech_: 0.518,
          hp: 568,
          atk_: 0.105,
          eleMas: 56,
          hp_: 0.105,
          OceanHuedClam: 1,
          zc2: 22,
        },
      },
      {
        id: 's2',
        set: 'OceanHuedClam',
        values: {
          enerRech_: 0.518,
          hp: 538,
          atk_: 0.115,
          eleMas: 52,
          hp_: 0.115,
          OceanHuedClam: 1,
          zc2: 21.95,
        },
      },
      {
        id: 's3',
        set: 'HeartOfDepth',
        values: {
          hp_: 0.466,
          atk_: 0.058,
          eleMas: 40,
          atk: 45,
          enerRech_: 0.155,
          HeartOfDepth: 1,
        },
      },
    ],
    goblet: [
      {
        id: 'g1',
        set: 'OceanHuedClam',
        values: {
          hydroDmg_: 0.466,
          hp: 478,
          def_: 0.204,
          def: 23,
          eleMas: 35,
          OceanHuedClam: 1,
        },
      },
      {
        id: 'g2',
        set: 'OceanHuedClam',
        values: {
          hydroDmg_: 0.466,
          hp: 498,
          def_: 0.194,
          def: 28,
          eleMas: 31,
          OceanHuedClam: 1,
        },
      },
      {
        id: 'g3',
        set: 'HeartOfDepth',
        values: {
          hydroDmg_: 0.466,
          critDMG_: 0.124,
          eleMas: 79,
          def: 23,
          hp_: 0.099,
          HeartOfDepth: 1,
        },
      },
    ],
    circlet: [
      {
        id: 'c1',
        set: 'OceanHuedClam',
        values: {
          heal_: 0.359,
          critRate_: 0.058,
          hp_: 0.198,
          atk: 14,
          eleMas: 19,
        },
      },
      {
        id: 'c2',
        set: 'OceanHuedClam',
        values: {
          heal_: 0.359,
          critRate_: 0.063,
          hp_: 0.178,
          atk: 15,
          eleMas: 18,
          zc1: 2,
        },
      },
      {
        id: 'c3',
        set: 'HeartOfDepth',
        values: {
          critRate_: 0.311,
          hp: 299,
          critDMG_: 0.155,
          atk_: 0.105,
          eleMas: 56,
          zc1: 2,
        },
      },
    ],
  },
}

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

describe('test', () => {
  test('foldProd', () => {
    const x1 = customRead(['dyn', 'x1']),
      x2 = customRead(['dyn', 'x2']),
      x3 = customRead(['dyn', 'x3'])

    expect(foldProd(x1, constant(1), constant(2), prod(x2, x3, 3))).toEqual(
      prod(x1, x2, x3, 6)
    )
    expect(foldProd(constant(15), constant(1 / 3))).toEqual(constant(5))
    expect(foldProd(x1, prod(8, 0.25, 0.5))).toEqual(x1)
    expect(foldProd()).toEqual(constant(1))
    expect(foldProd(prod(), prod(), prod(prod(prod())))).toEqual(constant(1))
    expect(foldProd(prod(), prod(4), prod(1 / 4, prod(prod(x3))))).toEqual(x3)
  })
  test('foldSum', () => {
    const x1 = customRead(['dyn', 'x1']),
      x2 = customRead(['dyn', 'x2']),
      x3 = customRead(['dyn', 'x3'])

    expect(foldSum(x1, constant(1), constant(2), sum(x2, x3, 3))).toEqual(
      sum(x1, x2, x3, 6)
    )
    expect(foldSum(constant(15), constant(1 / 2))).toEqual(constant(15.5))
    expect(foldSum(x1, sum(2, -3, 1, 0))).toEqual(x1)
    expect(foldSum()).toEqual(constant(0))
    expect(foldSum(sum(), sum(), sum(sum(sum())))).toEqual(constant(0))
    expect(foldSum(sum(), sum(4), sum(-4, sum(sum(x3))))).toEqual(x3)
  })
  test('prods', () => {
    const n = [prod(1, prod(2, prod(3, prod(hp, prod(atk, 4)))))]
    console.log('Initial:', n[0])
    reaffine2(n, exampleArts)
  })
  test('test', () => {
    const n = [prod(sum(prod(0.08, hp), atk), crcd)]
    reaffine2(n, exampleArts)
  })
})
