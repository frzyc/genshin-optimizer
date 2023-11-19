import type {
  ArtifactRarity,
  ArtifactSlotKey,
  MainStatKey,
  RarityKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allSubstatKeys,
  artMaxLevel,
  artSlotsData,
  artSubstatRollData,
} from '@genshin-optimizer/consts'
import type { IArtifact, ISubstat } from '@genshin-optimizer/gi-good'
import { allStats } from '@genshin-optimizer/gi-stats'
import {
  getRandomElementFromArray,
  getRandomIntInclusive,
  unit,
} from '@genshin-optimizer/util'
import { artDisplayValue, getSubstatValuesPercent } from './artifact'

// do not randomize Prayers since they don't have all slots
const artSets = allArtifactSetKeys.filter((k) => !k.startsWith('Prayers'))
export function randomizeArtifact(base: Partial<IArtifact> = {}): IArtifact {
  const setKey = base.setKey ?? getRandomElementFromArray(artSets)
  const data = allStats.art.data[setKey]

  const rarity = (base.rarity ??
    getRandomElementFromArray(
      data.rarities.filter((r: number) =>
        // GO only supports artifacts from 3 to 5 stars
        allArtifactRarityKeys.includes(r as ArtifactRarity)
      )
    )) as ArtifactRarity
  const slot: ArtifactSlotKey =
    base.slotKey ?? getRandomElementFromArray(data.slots)
  const mainStatKey: MainStatKey =
    base.mainStatKey ?? getRandomElementFromArray(artSlotsData[slot].stats)
  const level =
    base.level ?? getRandomIntInclusive(0, artMaxLevel[rarity as RarityKey])
  const substats: ISubstat[] = [0, 1, 2, 3].map(() => ({ key: '', value: 0 }))

  const { low, high } = artSubstatRollData[rarity]
  const totRolls = Math.floor(level / 4) + getRandomIntInclusive(low, high)
  const numOfInitialSubstats = Math.min(totRolls, 4)
  const numUpgradesOrUnlocks = totRolls - numOfInitialSubstats

  const RollStat = (substat: SubstatKey): number =>
    getRandomElementFromArray(getSubstatValuesPercent(substat, rarity))

  let remainingSubstats = allSubstatKeys.filter((key) => mainStatKey !== key)
  for (const substat of substats.slice(0, numOfInitialSubstats)) {
    substat.key = getRandomElementFromArray(remainingSubstats)
    substat.value = RollStat(substat.key as SubstatKey)
    remainingSubstats = remainingSubstats.filter((key) => key !== substat.key)
  }
  for (let i = 0; i < numUpgradesOrUnlocks; i++) {
    const substat = getRandomElementFromArray(substats)
    substat.value += RollStat(substat.key as any)
  }
  for (const substat of substats)
    if (substat.key) {
      const value = artDisplayValue(substat.value, unit(substat.key))
      substat.value = parseFloat(
        allStats.art.subRollCorrection[rarity]?.[substat.key]?.[value] ?? value
      )
    }

  return {
    setKey,
    rarity,
    slotKey: slot,
    mainStatKey,
    level,
    substats,
    location: base.location ?? '',
    lock: false,
  }
}
