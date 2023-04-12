import { slowReaffine } from './reaffine'
import { constant, customRead, prod, sum } from '../../Formula/utils'
import type { ArtifactsBySlot } from '../common'
import { precompute } from '../../Formula/optimization'
import { foldProd, foldSum } from './util'

const hp = sum(
  customRead(['dyn', 'hp']),
  prod(13471, customRead(['dyn', 'hp_']))
)
const atk = sum(
  customRead(['dyn', 'atk']),
  prod(842, customRead(['dyn', 'atk_']))
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
  test('Eliminates Products', () => {
    const artsTest: ArtifactsBySlot = {
      base: { hp: 12, atk: 200 },
      values: {
        flower: [{ id: '', values: { hp: 22, atk: 100 } }],
        plume: [{ id: '', values: { hp: 22, atk: 100 } }],
        sands: [{ id: '', values: { hp: 22, atk: 100 } }],
        goblet: [{ id: '', values: { hp: 22, atk: 100 } }],
        circlet: [{ id: '', values: { hp: 22, atk: 100 } }],
      },
    }
    const hp0 = customRead(['dyn', 'hp'])
    const atk0 = customRead(['dyn', 'atk'])
    const n = [prod(1, prod(2, prod(3, prod(hp0, prod(atk0, 4)))))]
    const compute1 = precompute(n, artsTest.base, (n) => n.path[1], 1)
    const truth = compute1(artsTest.values.flower)

    const { arts: arts2, nodes: n2 } = slowReaffine(n, artsTest)
    const compute2 = precompute(n2, arts2.base, (n) => n.path[1], 1)
    expect(compute2(arts2.values.flower)).toEqual(truth)
  })
  test('Eliminates Sums', () => {
    const artsTest: ArtifactsBySlot = {
      base: {
        hp: 12,
        hp_: 0.25,
        atk: 200,
        atk_: 0.125,
        critRate_: 0.05,
        critDMG_: 0.5,
      },
      values: {
        flower: [{ id: '', values: { atk: 100 } }],
        plume: [],
        sands: [],
        goblet: [],
        circlet: [],
      },
    }
    const n = [prod(sum(prod(0.08, hp), atk), crcd, prod(sum(12, sum(hp))))]
    const compute1 = precompute(n, artsTest.base, (n) => n.path[1], 1)
    const truth = compute1(artsTest.values.flower)

    const { arts: arts2, nodes: n2 } = slowReaffine(n, artsTest)
    const compute2 = precompute(n2, arts2.base, (n) => n.path[1], 1)
    expect(compute2(arts2.values.flower)).toEqual(truth)
  })
})
