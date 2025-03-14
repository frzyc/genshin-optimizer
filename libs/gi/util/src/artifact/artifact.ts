import type { Unit } from '@genshin-optimizer/common/util'
import {
  clampPercent,
  getUnitStr,
  objKeyMap,
  toPercent,
} from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allSubstatKeys,
  artMaxLevel,
  artSubstatRollData,
} from '@genshin-optimizer/gi/consts'
import type { IArtifact } from '@genshin-optimizer/gi/good'
import { allStats, getArtSetStat } from '@genshin-optimizer/gi/stats'
import { getArtifactMeta } from './artifactMeta'

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
  rarity: ArtifactRarity,
) {
  return allStats.art.sub[rarity][substatKey].map((v) =>
    toPercent(v, substatKey),
  )
}

export function getSubstatRolls(
  substatKey: SubstatKey,
  substatValue: number,
  rarity: ArtifactRarity,
): number[][] {
  const rollData = getSubstatValuesPercent(substatKey, rarity)
  const table = allStats.art.subRoll[rarity][substatKey]
  const lookupValue = artDisplayValue(substatValue, getUnitStr(substatKey))
  return (
    table[lookupValue as unknown as keyof typeof table]?.map((roll) =>
      roll.map((i) => rollData[i]),
    ) ?? []
  )
}

export function getSubstatSummedRolls(
  rarity: ArtifactRarity,
  key: SubstatKey,
): number[] {
  return Object.keys(allStats.art.subRoll[rarity][key]).map((v) =>
    parseFloat(v),
  )
}

export function getSubstatEfficiency(
  substatKey: SubstatKey | '',
  rolls: number[],
): number {
  const sum = rolls.reduce((a, b) => a + b, 0)
  const max = substatKey ? getSubstatValue(substatKey) * rolls.length : 0
  return max ? clampPercent((sum / max) * 100) : 0
}

const substatCache = new Map<string, number>()
export function getSubstatValue(
  substatKey: SubstatKey,
  rarity: ArtifactRarity = 5,
  type: 'max' | 'min' | 'mid' = 'max',
  percent = true,
): number {
  const cacheKey = `${substatKey},${rarity},${type}`
  let value = substatCache.get(cacheKey)
  if (!value) {
    const substats = allStats.art.sub[rarity][substatKey]
    value =
      type === 'max'
        ? Math.max(...substats)
        : type === 'min'
          ? Math.min(...substats)
          : substats.reduce((a, b) => a + b, 0) / substats.length
    substatCache.set(cacheKey, value)
  }
  return percent ? toPercent(value, substatKey) : value
}

/**
 * Raw number from the datamine.
 * @param rarity
 * @param statKey
 * @param level
 * @returns
 */
export function getMainStatValue(
  statKey: MainStatKey,
  rarity: ArtifactRarity,
  level: number,
) {
  return allStats.art.main[rarity][statKey][level]
}

/**
 * NOTE: this gives the toPercent value of the main stat
 * @param rarity
 * @param statKey
 * @returns
 */
export function getMainStatDisplayValues(
  rarity: ArtifactRarity,
  statKey: MainStatKey,
): number[] {
  return allStats.art.main[rarity][statKey].map((k: number) =>
    statKey === 'eleMas' ? Math.round(k) : toPercent(k, statKey),
  )
}

export function getMainStatDisplayValue(
  key: MainStatKey,
  rarity: ArtifactRarity,
  level: number,
): number {
  const val = getMainStatValue(key, rarity, level)
  return key === 'eleMas' ? Math.round(val) : toPercent(val, key)
}

export function getMainStatDisplayStr(
  key: MainStatKey,
  rarity: ArtifactRarity,
  level: number,
  showUnit = true,
): string {
  return (
    artDisplayValue(
      getMainStatDisplayValue(key, rarity, level),
      getUnitStr(key),
    ) + (showUnit ? getUnitStr(key) : '')
  )
}

export function getSubstatRange(rarity: ArtifactRarity, key: SubstatKey) {
  const values = Object.keys(allStats.art.subRoll[rarity][key])
  const low = parseFloat(values[0])
  const high = parseFloat(values[values.length - 1])
  return { low, high }
}

export function getRollsRemaining(level: number, rarity: ArtifactRarity) {
  return Math.ceil((artMaxLevel[rarity] - level) / 4)
}

export function getTotalPossibleRolls(rarity: ArtifactRarity) {
  return (
    artSubstatRollData[rarity].high + artSubstatRollData[rarity].numUpgrades
  )
}
const maxSubstatRollEfficiency = objKeyMap(allArtifactRarityKeys, (rarity) =>
  Math.max(
    ...allSubstatKeys.map(
      (substat) => getSubstatValue(substat, rarity) / getSubstatValue(substat),
    ),
  ),
)

export function getArtifactEfficiency(
  artifact: IArtifact,
  filter: Set<SubstatKey> = new Set(allSubstatKeys),
): { currentEfficiency: number; maxEfficiency: number } {
  const { substats, rarity, level } = artifact
  const { artifactMeta } = getArtifactMeta(artifact)
  // Relative to max star, so comparison between different * makes sense.
  const currentEfficiency = artifact.substats.reduce(
    (sum, { key }, i) =>
      key && filter.has(key)
        ? sum + (artifactMeta.substats[i]?.efficiency ?? 0)
        : sum,
    0,
  )

  const rollsRemaining = getRollsRemaining(level, rarity)
  const emptySlotCount = substats.filter((s) => !s.key).length
  const matchedSlotCount = substats.filter(
    (s) => s.key && filter.has(s.key),
  ).length
  const unusedFilterCount =
    filter.size -
    matchedSlotCount -
    (filter.has(artifact.mainStatKey as any) ? 1 : 0)

  let maxEfficiency = currentEfficiency
  const maxRollEff = maxSubstatRollEfficiency[rarity]
  // Rolls into good empty slots, assuming max-level artifacts have no empty slots
  maxEfficiency += maxRollEff * Math.min(emptySlotCount, unusedFilterCount)
  // Rolls into an existing good slot
  if (matchedSlotCount || (emptySlotCount && unusedFilterCount))
    maxEfficiency += maxRollEff * (rollsRemaining - emptySlotCount)

  return { currentEfficiency, maxEfficiency }
}

export const setKeysByRarities = Object.fromEntries(
  allArtifactRarityKeys.map((r) => [r, [] as ArtifactSetKey[]]),
) as Record<ArtifactRarity, ArtifactSetKey[]>
allArtifactSetKeys.forEach((setKey) =>
  setKeysByRarities[
    Math.max(...getArtSetStat(setKey).rarities) as ArtifactRarity
  ].push(setKey),
)
