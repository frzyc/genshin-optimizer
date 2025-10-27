import {
  crawlUpgrades,
  erf,
  factorial,
  gaussPDF,
  quadrinomial,
  rollCountProb,
} from './mathUtil'
import { gaussianPE, mvnPE_bad } from './mvncdf'

test('quadranomial', () => {
  expect(quadrinomial(1, 1)).toEqual(1)
  expect(quadrinomial(0, 1)).toEqual(0)
  expect(quadrinomial(5, 0)).toEqual(1)
  expect(quadrinomial(5, 12)).toEqual(35)
  expect(quadrinomial(8, 20)).toEqual(322)
})

test('factorial', () => {
  const wolframFactorials = [
    1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600,
    6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000,
    6402373705728000, 121645100408832000, 2432902008176640000,
    51090942171709440000, 1124000727777607680000,
  ]

  wolframFactorials.forEach((fi, i) => expect(factorial(i)).toEqual(fi))
})

test('gaussPDF', () => {
  expect(gaussPDF(2.5)).toBeCloseTo(0.01752830049356854)
  expect(gaussPDF(1, 2, 3)).toBeCloseTo(0.19496965572274114)
  expect(gaussPDF(1, -1, 1)).toBeCloseTo(0.053990966513188056)
  expect(gaussPDF(0, 0, 1e-6)).toBeCloseTo(398.9422804014328)
})

test('erf', () => {
  expect(erf(0)).toBeCloseTo(0)
  expect(erf(Infinity)).toEqual(1)
  expect(erf(-Infinity)).toEqual(-1)
  expect(erf(1)).toBeCloseTo(0.8427007929497148)
  expect(erf(Math.PI)).toBeCloseTo(0.9999911238536323)
  expect(erf(-0.1234)).toBeCloseTo(-0.13853843435647298)
})

test('crawlUpgrade', () => {
  const correctValues: Record<string, number> = {
    '0005': 1 / 1024,
    '0014': 5 / 1024,
    '0023': 5 / 512,
    '0113': 5 / 256,
    '0122': 15 / 512,
    '1112': 15 / 256,
  }
  crawlUpgrades(5).forEach((ns) => {
    const strKey = ns.sort().join('')
    const p = rollCountProb(ns)
    expect(p).toEqual(correctValues[strKey])
  })
})

test('mvncdf', () => {
  const r1 = gaussianPE(0.3, 0.2, 0.1)
  const r2 = mvnPE_bad([0.3], [[0.2]], [0.1])
  expect(r1.p).toBeCloseTo(r2.p)
  expect(r1.upAvg).toBeCloseTo(r2.upAvg)

  // Ensure edge case: 0 variance is consistent
  const s1 = gaussianPE(0, 0, 0)
  const s2 = mvnPE_bad([0], [[0]], [0])
  expect(s1.p).toEqual(0)
  expect(s1.upAvg).toEqual(0)
  expect(s2.p).toEqual(0)
  expect(s2.upAvg).toEqual(0)
})
