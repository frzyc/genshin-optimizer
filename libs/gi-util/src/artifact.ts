import type {
  MainStatKey,
  RarityKey,
  SubstatKey,
} from '@genshin-optimizer/consts'
import { artMaxLevel, artSubstatRollData } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import type { Unit } from '@genshin-optimizer/util'
import { clampPercent, toPercent, unit } from '@genshin-optimizer/util'

export function artDisplayValue(value: number, unit: Unit): string {
  switch (unit) {
    case '%':
      return (Math.round(value * 10) / 10).toFixed(1) // TODO: % conversion
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
