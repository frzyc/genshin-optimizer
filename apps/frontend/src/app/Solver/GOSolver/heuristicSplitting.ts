import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import type { ArtifactsBySlot } from '../common'
import { cartesian, objectKeyMap, range } from '../../Util/Util'

/** Splits a filter based on the set key into 32 chunks. */
export function splitOnSetKey(
  setKey: ArtifactSetKey,
  arts: ArtifactsBySlot
): ArtifactsBySlot[] {
  const partitions = objectKeyMap(allArtifactSlotKeys, (slot) => {
    const slotArts = arts.values[slot]
    return [
      slotArts.filter((art) => art.set === setKey),
      slotArts.filter((art) => art.set !== setKey),
    ]
  })

  const splitArts: ArtifactsBySlot[] = cartesian(
    partitions.flower,
    partitions.plume,
    partitions.sands,
    partitions.goblet,
    partitions.circlet
  ).map(([flower, plume, sands, goblet, circlet]) => ({
    base: arts.base,
    values: { flower, plume, sands, goblet, circlet },
  }))

  return splitArts
}

/**
 * Splits a filter based on one stat around `splitVal` into 32 chunks. Guarantees the min split
 *   is below `splitVal`, and the max split is above.
 *
 * Will try to split the filters "evenly", maximizing the size of the min and max splits.
 *
 * The splitting problem can be efficiently solved because it is has a unique maximum. Solve by starting with any feasible
 *   split, then doing pairwise coordinate ascent until convergence. From numerical experiments, pairwise ascent converges
 *   in 1 iteration, so there is no loop in this code and takes `O(u^2)` steps overall, where `u` is the number of
 *   unique artifact values. (around ~10-15 on 1200-artifact database)
 */
export function splitOnStatValue(
  stat: string,
  splitVal: number,
  arts: ArtifactsBySlot
): ArtifactsBySlot[] {
  splitVal = splitVal - arts.base[stat]

  // 1. Represent artifacts as art[stat]
  const artVals = allArtifactSlotKeys.map((slot) => {
    const slotVals = arts.values[slot]
      .map(({ values }, i) => ({ ixs: [i], v: values[stat] }))
      .sort((v1, v2) => v1.v - v2.v)

    for (let i = slotVals.length - 1; i > 0; i -= 1) {
      if (slotVals[i].v === slotVals[i - 1].v) {
        slotVals[i - 1].ixs.push(...slotVals[i].ixs)
        slotVals.splice(i, 1)
      }
    }
    return slotVals
  })

  // 2. Find any feasible split
  const x0 = artVals.map(([{ v }]) => v)
  const valRange = artVals.map((vals) => vals[vals.length - 1].v - vals[0].v)
  if (valRange.every((vr) => vr === 0)) valRange.fill(1)
  const totRange = valRange.reduce((a, b) => a + b)
  const coeff = (splitVal - x0.reduce((a, b) => a + b)) / totRange
  const feas0 = artVals.map((vals, si) => {
    // Implements np.searchsorted(artVals[si], x0[si] + coeff * valRange[si]) for each slot
    let z = -1
    for (let i = 0; i < vals.length; i++) {
      if (vals[i].v >= x0[si] + coeff * valRange[si]) {
        z = i
        break
      }
    }
    if (z < 0) z = vals.length
    return z
  })

  // 3a. Convenience function for checking that a split actually splits `splitVal`
  function isFeasible(split: number[]) {
    let glb = 0,
      lub = 0
    for (let i = 0; i < artVals.length; i++) {
      const j = split[i]
      glb += artVals[i][j - 1]?.v ?? -Infinity
      lub += artVals[i][j]?.v ?? Infinity
    }
    return glb <= splitVal + 1e-6 && splitVal <= lub + 1e-6 // Numerical stability
  }
  function scoreSplit(split: number[]) {
    const counts = allArtifactSlotKeys.map((slot, i) => {
      const cnt = artVals[i]
        .slice(split[i])
        .reduce((totv, { ixs }) => totv + ixs.length, 0)
      return { lowerCount: cnt, upperCount: arts.values[slot].length - cnt }
    })
    return (
      counts.reduce((ltot, { lowerCount }) => ltot * lowerCount, 1) +
      counts.reduce((ltot, { upperCount }) => ltot * upperCount, 1)
    )
  }

  // 3b. Verify initial solution is feasible
  if (!isFeasible(feas0)) {
    // Should never throw.
    throw new Error('calculateSplit failed! Initial solution infeasible!')
  }

  // 4. Greedy optimization of score function via pairwise coordinate ascent
  const pairs = [
    [0, 1],
    [2, 3],
    [4, 0],
    [1, 2],
    [3, 4],
    [0, 2],
    [3, 1],
    [2, 4],
    [0, 3],
    [4, 1],
  ]
  let score = scoreSplit(feas0)
  pairs.forEach(([c1, c2]) => {
    const spl12 = [...feas0]
    // Can be improved by searching only the boundary values rather than all (i, j).
    range(0, artVals[c1].length).forEach((i) =>
      range(0, artVals[c2].length).forEach((j) => {
        spl12[c1] = i
        spl12[c2] = j
        const sc12 = scoreSplit(spl12)
        if (isFeasible(spl12) && sc12 > score) {
          score = sc12
          feas0[c1] = i
          feas0[c2] = j
        }
      })
    )
  })

  const partitions = objectKeyMap(allArtifactSlotKeys, (slot, i) => {
    const upperIxs = new Set(
      artVals[i].slice(feas0[i]).flatMap(({ ixs }) => ixs)
    )
    return [
      arts.values[slot].filter((_, i) => upperIxs.has(i)),
      arts.values[slot].filter((_, i) => !upperIxs.has(i)),
    ]
  })

  const splitArts: ArtifactsBySlot[] = cartesian(
    partitions.flower,
    partitions.plume,
    partitions.sands,
    partitions.goblet,
    partitions.circlet
  ).map(([flower, plume, sands, goblet, circlet]) => ({
    base: arts.base,
    values: { flower, plume, sands, goblet, circlet },
  }))

  return splitArts
}
