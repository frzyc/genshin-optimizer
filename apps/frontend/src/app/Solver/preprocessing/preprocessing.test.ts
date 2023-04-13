import { slowReaffine } from './reaffine'
import { constant, customRead, dynRead, prod, sum } from '../../Formula/utils'
import { pruneAll, type ArtifactsBySlot } from '../common'
import { precompute } from '../../Formula/optimization'
import { foldProd, foldSum } from './util'
import { makeLinearIndependent, zeroLowerBounds } from './linearIndependence'

const hp = sum(dynRead('hp'), prod(13471, dynRead('hp_')))
const atk = sum(dynRead('atk'), prod(842, dynRead('atk_')))
const crcd = sum(1, prod(dynRead('critRate_'), dynRead('critDMG_')))

describe('preprocessing', () => {
  test('foldProd', () => {
    const x1 = dynRead('x1'),
      x2 = dynRead('x2'),
      x3 = dynRead('x3')

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
    const x1 = dynRead('x1'),
      x2 = dynRead('x2'),
      x3 = dynRead('x3')

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
    const hp0 = dynRead('hp')
    const atk0 = dynRead('atk')
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
  test('Eliminate Linear Dependencies', () => {
    const artsTest: ArtifactsBySlot = {
      base: {
        a: 1,
        '2a': 2,
        b: 2,
        c: 3,
        'a+b': 3,
      },
      values: {
        flower: [{ id: '', values: { a: 4, '2a': 8, 'a+b': 4 } }],
        plume: [{ id: '', values: { b: 1, 'a+b': 1 } }],
        sands: [{ id: '', values: { a: 1, b: 1, '2a': 2, 'a+b': 2 } }],
        goblet: [{ id: '', values: { c: 10 } }],
        circlet: [{ id: '', values: { a: 1, '2a': 2, 'a+b': 1, c: 4 } }],
      },
    }
    const { arts } = makeLinearIndependent([], artsTest)
    expect(arts.base.a).toEqual(1)
    expect(arts.base.b).toEqual(2)
    expect(arts.base.c).toEqual(3)

    expect(arts.base['2a']).toEqual(undefined)
    expect(arts.base['a+b']).toEqual(undefined)
  })
  test('Constants in Base', () => {
    const artsTest: ArtifactsBySlot = {
      base: {
        a: 0,
        b: 1,
      },
      values: {
        flower: [
          { id: '', values: { a: 3, b: 2 } },
          { id: '', values: { a: 3, b: 3 } },
          { id: '', values: { a: 3, b: 4 } },
        ],
        plume: [
          { id: '', values: { b: -3 } },
          { id: '', values: { b: -2 } },
          { id: '', values: { b: -3, a: 1 } },
        ],
        sands: [],
        goblet: [],
        circlet: [],
      },
    }

    zeroLowerBounds(artsTest)
    expect(artsTest.base.a).toEqual(3)
    expect(artsTest.base.b).toEqual(0)
  })
  test('debug', () => {
    const arts: ArtifactsBySlot = {
      base: { atk: 25, atk_: 0.05, critRate_: 0.3, critDMG_: 0.6 },
      values: {
        flower: [
          { id: '', values: { atk: 1 } },
          { id: '', values: { atk_: 1 } },
          { id: '', values: { critRate_: 1 } },
          { id: '', values: { critDMG_: 1 } },
        ],
        plume: [],
        sands: [],
        goblet: [],
        circlet: [],
      },
    }
    const n = sum(dynRead('atk'), prod(1500, dynRead('atk_')))
    const zz = pruneAll(
      [n],
      [-Infinity],
      arts,
      1,
      {},
      {
        reaffine: true,
      }
    )

    console.log(JSON.stringify(zz.nodes[0]))
    console.log(zz.arts)
  })
})
