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
  artSubstatRollData
} from '@genshin-optimizer/consts'
import type { IArtifact, ISubstat } from '@genshin-optimizer/gi-good'
import { allStats } from '@genshin-optimizer/gi-stats'
import type { Unit } from '@genshin-optimizer/util'
import {
  clampPercent,
  getRandomElementFromArray,
  getRandomIntInclusive,
  toPercent,
  unit
} from '@genshin-optimizer/util'

export function artDisplayValue(value: number, unit: Unit): string {
  switch (unit) {
    case '%':
      return (Math.round(value * 10) / 10).toFixed(1)
    default:
      return Math.round(value).toFixed(0)
  }
}

export function getSubstatValuesPercent(
  substatKey: SubstatKey,
  rarity: RarityKey
) {
  return allStats.art.sub[rarity][substatKey].map((v) =>
    toPercent(v, substatKey)
  )
}

export function getSubstatRolls(
  substatKey: SubstatKey,
  substatValue: number,
  rarity: RarityKey
): number[][] {
  const rollData = getSubstatValuesPercent(substatKey, rarity)
  const table = allStats.art.subRoll[rarity][substatKey]
  const lookupValue = artDisplayValue(substatValue, unit(substatKey))
  return (
    table[lookupValue as unknown as keyof typeof table]?.map((roll) =>
      roll.map((i) => rollData[i])
    ) ?? []
  )
}

export function getSubstatSummedRolls(
  rarity: RarityKey,
  key: SubstatKey
): number[] {
  return Object.keys(allStats.art.subRoll[rarity][key]).map((v) =>
    parseFloat(v)
  )
}

export function getSubstatEfficiency(
  substatKey: SubstatKey | '',
  rolls: number[]
): number {
  const sum = rolls.reduce((a, b) => a + b, 0)
  const max = substatKey ? getSubstatValue(substatKey) * rolls.length : 0
  return max ? clampPercent((sum / max) * 100) : 0
}

export function getSubstatValue(
  substatKey: SubstatKey,
  rarity: RarityKey = 5,
  type: 'max' | 'min' | 'mid' = 'max'
): number {
  const substats = allStats.art.sub[rarity][substatKey]
  const value =
    type === 'max'
      ? Math.max(...substats)
      : type === 'min'
      ? Math.min(...substats)
      : substats.reduce((a, b) => a + b, 0) / substats.length
  return toPercent(value, substatKey)
}

/**
 * NOTE: this gives the toPercent value of the main stat
 * @param rarity
 * @param statKey
 * @returns
 */
export function getMainStatDisplayValues(
  rarity: RarityKey,
  statKey: MainStatKey
): number[] {
  return allStats.art.main[rarity][statKey].map((k: number) =>
    toPercent(k, statKey)
  )
}

export function getMainStatDisplayValue(
  key: MainStatKey,
  rarity: RarityKey,
  level: number
): number {
  return getMainStatDisplayValues(rarity, key)[level]
}

export function getMainStatDisplayStr(
  key: MainStatKey,
  rarity: RarityKey,
  level: number,
  showUnit = true
): string {
  return (
    artDisplayValue(getMainStatDisplayValue(key, rarity, level), unit(key)) +
    (showUnit ? unit(key) : '')
  )
}

export function getSubstatRange(rarity: RarityKey, key: SubstatKey) {
  const values = Object.keys(allStats.art.subRoll[rarity][key])
  const low = parseFloat(values[0])
  const high = parseFloat(values[values.length - 1])
  return { low, high }
}

export function getRollsRemaining(level: number, rarity: RarityKey) {
  return Math.ceil((artMaxLevel[rarity] - level) / 4)
}

export function getTotalPossibleRolls(rarity: RarityKey) {
  return (
    artSubstatRollData[rarity].high + artSubstatRollData[rarity].numUpgrades
  )
}

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
