import type {
  ArtifactRarity,
  ArtifactSlotKey,
  MainStatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allSubstatKeys,
  artMaxLevel,
  artSlotMainKeys,
  artSubstatRollData,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  getMainStatValue,
  getSubstatValue,
  getTotalPossibleRolls,
} from '@genshin-optimizer/gi/util'
import type {
  DynStat,
  FutureArtifactProfile,
  PartialBuildsRequest,
} from './common.js'

/**
 * Future-drop profiles for partial-build tracking: for every slot, one
 * profile per (set, allowed main stat) combination — sets from the game data
 * (each at its highest obtainable rarity, only in the slots it drops in),
 * main stats from the optimize config's `mainStatKeys` filter (an empty or
 * missing list allows every main stat of the slot, mirroring the artifact
 * filter). `artSetExclusion` needs no handling here: it can only forbid
 * 2/4-piece counts, never a single future piece, and it is baked into the
 * solve's constraint nodes anyway.
 *
 * Each profile describes a fully-leveled artifact with any legal substats:
 * the full pool minus the main stat, roll sizes and total-roll budget of the
 * rarity (`FutureArtifactProfile.rollBudget` accounts for one mandatory roll
 * per substat). Stat values match the dyn-stat space of `compactArtifacts`
 * (raw datamine units).
 */
export function futureArtifactProfiles(
  mainStatKeys: Partial<Record<ArtifactSlotKey, readonly MainStatKey[]>> = {}
): PartialBuildsRequest {
  // The substat pool and budget depend only on (rarity, main stat): share.
  const pools = new Map<
    string,
    Pick<FutureArtifactProfile, 'substats' | 'maxSubstats' | 'rollBudget'>
  >()
  const pool = (rarity: ArtifactRarity, main: MainStatKey) => {
    const key = `${rarity}|${main}`
    let p = pools.get(key)
    if (!p) {
      const rollSize: DynStat = {}
      const substats: FutureArtifactProfile['substats'] = {}
      // 1 initial roll + one per upgrade tier, all at the max roll value
      const maxRollsPerKey = artSubstatRollData[rarity].numUpgrades + 1
      for (const sub of allSubstatKeys) {
        if ((sub as string) === main) continue
        const size = getSubstatValue(sub, rarity, 'max', false)
        rollSize[sub] = size
        substats[sub] = { min: 0, max: maxRollsPerKey * size }
      }
      p = {
        substats,
        maxSubstats: 4,
        rollBudget: { rollSize, totalRolls: getTotalPossibleRolls(rarity) },
      }
      pools.set(key, p)
    }
    return p
  }

  const result: PartialBuildsRequest = {}
  for (const setKey of allArtifactSetKeys) {
    const { rarities, slots } = allStats.art.data[setKey]
    const rarity = Math.max(
      ...rarities.filter((r) =>
        allArtifactRarityKeys.includes(r as ArtifactRarity)
      )
    ) as ArtifactRarity
    for (const slotKey of slots) {
      const allowed = mainStatKeys[slotKey]
      const mains = allowed?.length ? allowed : artSlotMainKeys[slotKey]
      for (const main of mains)
        (result[slotKey] ??= []).push({
          fixed: {
            [setKey]: 1,
            [main]: getMainStatValue(main, rarity, artMaxLevel[rarity]),
          },
          ...pool(rarity, main),
        })
    }
  }
  return result
}
