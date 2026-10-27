import { cartesian, objKeyMap } from '@genshin-optimizer/common/util'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { dynRead, prod } from '@genshin-optimizer/gi/wr'
import type { ArtifactsBySlot } from '../../common.js'
import { linearUB } from './linearUB.js'

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
  const arts: ArtifactsBySlot = {
    base: objKeyMap(keys, () => 0),
    values: objKeyMap(allArtifactSlotKeys, (slot) =>
      slot === 'flower'
        ? [0, 1].map((i) => ({
            id: `${i}`,
            values: Object.fromEntries(
              keys.map((key, k) => [key, bounds[k][i]])
            ),
          }))
        : [{ id: slot, values: {} }]
    ),
  }

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
})
