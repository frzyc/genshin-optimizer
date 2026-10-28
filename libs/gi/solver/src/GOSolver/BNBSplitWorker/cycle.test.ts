import { cartesian, objKeyMap } from '@genshin-optimizer/common/util'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { dynRead, prod } from '@genshin-optimizer/gi/wr'
import type { ArtifactsBySlot } from '../../common.js'
import { linearUB } from './linearUB.js'
import * as lp from './solveLP.js'

vi.mock('./solveLP.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./solveLP.js')>()
  return { ...actual, solveLP: vi.fn(actual.solveLP) }
})

/** Build an artifact pool whose stat ranges match the supplied endpoints. */
function artifactsForBounds(bounds: number[][]): ArtifactsBySlot {
  const keys = bounds.map((_, i) => `x${i}`)
  return {
    base: objKeyMap(keys, () => 0),
    values: objKeyMap(allArtifactSlotKeys, (slot) =>
      slot === 'flower'
        ? [1, 0].map((i) => ({
            id: `${i}`,
            values: Object.fromEntries(
              keys.map((key, k) => [key, bounds[k][i]])
            ),
          }))
        : [{ id: slot, values: {} }]
    ),
  }
}

describe('linear bound for a cycling LP', () => {
  // Normalized factor ranges extracted from the issue #3324 database.
  const bounds = [
    [0.47345254793330704, 1],
    [0.47345254793330704, 1],
    [0, 1],
    [0.3882352941176471, 1],
    [0.32429656260317696, 1],
    [-1, -0.61322206095791],
  ]
  const keys = bounds.map((_, i) => `x${i}`)
  const arts = artifactsForBounds(bounds)

  test.each([1, -1])('keeps a valid upper bound for coefficient %s', (sign) => {
    const [bound] = linearUB(
      [prod(sign, ...keys.map((key) => dynRead(key)))],
      arts
    )
    expect(Object.values(bound).every(Number.isFinite)).toBe(true)
    for (const values of cartesian(...bounds)) {
      const actual = sign * values.reduce((a, b) => a * b, 1)
      const estimate = keys.reduce(
        (total, key, i) => total + (bound[key] ?? 0) * values[i],
        bound.$c
      )
      expect(estimate).toBeGreaterThanOrEqual(actual - 1e-10)
    }
  })

  test('recovers a cycling lower LP using the rescaled minimum endpoint', () => {
    const lowerBounds = [
      [-0.47345254793330704, 1],
      [-1, 0.47345254793330704],
      [-1, 0.32429656260317696],
      [0.32429656260317696, 1],
      [-1, 0],
      [-0.3882352941176471, 1],
    ].map((range, i) => range.map((value) => value * 2 ** (i + 1)))
    const solve = vi.mocked(lp.solveLP)
    solve.mockClear()
    try {
      const [bound] = linearUB(
        [prod(-1, ...keys.map((key) => dynRead(key)))],
        artifactsForBounds(lowerBounds)
      )
      // This real LP must cycle, rather than merely exercising the lower path.
      expect(solve).toHaveBeenCalledTimes(1)
      expect(solve.mock.results[0].type).toBe('throw')
      expect(solve.mock.results[0].value).toBeInstanceOf(lp.LPCycleError)

      // min(product) = -2^(1+2+3+4+5+6); negating it gives the upper bound.
      expect(bound.$c).toBe(2 ** 21)
      for (const key of keys) expect(bound[key]).toBe(0)
      for (const values of cartesian(...lowerBounds)) {
        const actual = -values.reduce((a, b) => a * b, 1)
        expect(bound.$c).toBeGreaterThanOrEqual(actual - 1e-10)
      }
    } finally {
      solve.mockClear()
    }
  })
})
