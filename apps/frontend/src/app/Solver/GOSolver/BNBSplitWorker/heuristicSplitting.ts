import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import { cartesian } from '../../../Util/Util'
import {
  computeFullArtRange,
  countBuilds,
  type ArtifactBuildData,
  type ArtifactsBySlot,
} from '../../common'
import type { Linear } from './linearUB'

/**
 * Heuristically picks splitting key based on minimizing the approximation error.
 *
 * Computing approximation error is difficult, so we use this scuffed guesstimate is:
 *   \sqrt[ \sum ((u_i - l_i) * w_i)^2 ]
 */
export function pickSplitKey(
  appxs: Linear[],
  arts: ArtifactsBySlot
): { splitOn: string; splitVal: number } {
  const minMax = computeFullArtRange(arts)

  const allKeys = [
    ...new Set(
      appxs.flatMap((appx) => Object.keys(appx).filter((k) => k !== '$c'))
    ),
  ]

  const { bestKey } = allKeys.reduce(
    ({ bestKey, minHeur }, stat) => {
      const { min, max } = minMax[stat]
      const oldHeur = appxs.reduce(
        (h, lin) => h + ((max - min) * (lin[stat] ?? 0)) ** 2,
        0
      )

      const { lowerRange, upperRange } = allArtifactSlotKeys.reduce(
        ({ lowerRange, upperRange }, slot) => {
          const vals = arts.values[slot].map((art) => art.values[stat])
          const minv = Math.min(...vals),
            maxv = Math.max(...vals),
            mid = (minv + maxv) / 2,
            glb = Math.max(...vals.filter((v) => v <= mid)),
            lub = Math.min(...vals.filter((v) => v >= mid))
          // Heuristic could be improved by tracking lowerRange & upperRange for all stats.
          return {
            lowerRange: lowerRange + (glb - minv),
            upperRange: upperRange + (maxv - lub),
          }
        },
        { lowerRange: 0, upperRange: 0 }
      )
      const newHeur =
        appxs.reduce(
          (h, lin) =>
            h +
            (lowerRange * (lin[stat] ?? 0)) ** 2 +
            (upperRange * (lin[stat] ?? 0)) ** 2,
          0
        ) / 2

      const heur = newHeur - oldHeur
      if (heur < minHeur) return { bestKey: stat, minHeur: heur }
      return { bestKey, minHeur }
    },
    { bestKey: '', minHeur: Infinity }
  )

  // Pick key that gives minimum heur (maximum reduction old -> new)
  return {
    splitOn: bestKey,
    splitVal: (minMax[bestKey].min + minMax[bestKey].max) / 2,
  }
}

/** Splits a filter based on the set key into 32 chunks. */
export function splitOnSet(
  setKey: ArtifactSetKey,
  arts: ArtifactsBySlot
): ArtifactsBySlot[] {
  return splitArts(arts, (arts) => arts.map((art) => art.set === setKey))
}

/**
 * Splits `arts` into 32 chunks such that the total `stat` of min split is below `threshold`, and that the max
 * split is above.
 */
export function splitAtValue(
  stat: string,
  threshold: number,
  arts: ArtifactsBySlot
): ArtifactsBySlot[] {
  threshold -= arts.base[stat]
  const valsBySlot = allArtifactSlotKeys.map((slot) =>
    arts.values[slot]
      .map((art) => ({ art, val: art.values[stat] }))
      .sort((a, b) => a.val - b.val)
  )
  const mins = valsBySlot.map(([first]) => first.val)
  const ranges = valsBySlot.map(
    (arts) => arts[arts.length - 1].val - arts[0].val
  )
  const totalRange = ranges.reduce((a, b) => a + b)
  const cutoff =
    (threshold - mins.reduce((a, b) => a + b)) / Math.max(totalRange, 1e-9)
  const split = valsBySlot.map((arts, slot) => {
    const splitVal = mins[slot] + cutoff * ranges[slot]
    let start = 0,
      end = arts.length
    while (start !== end) {
      const mid = Math.floor((start + end) / 2)
      if (splitVal > arts[mid].val) start = mid + 1
      else end = mid
    }
    return end
  })

  return splitArts(arts, (arts, si) => {
    const upper = new Set(valsBySlot[si].slice(split[si]).map((a) => a.art))
    return arts.map((art) => upper.has(art))
  })
}

function splitArts(
  { base, values }: ArtifactsBySlot,
  predicate: (arts: ArtifactBuildData[], slotIndex: number) => boolean[]
): ArtifactsBySlot[] {
  const partition = allArtifactSlotKeys.map((slot, si) => {
    const arts = values[slot]
    const group = predicate(arts, si)
    return [
      arts.filter((_, i) => group[i]),
      arts.filter((_, i) => !group[i]),
    ].filter((a) => a.length)
  })
  return cartesian(...partition)
    .map((partition) => ({
      base,
      values: objKeyMap(allArtifactSlotKeys, (_, i) => partition[i]),
    }))
    .sort((a, b) => countBuilds(b) - countBuilds(a))
}
