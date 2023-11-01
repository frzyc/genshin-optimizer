import type {
  MainStatKey,
  RarityKey,
  SubstatKey
} from '@genshin-optimizer/consts'
import {
  allRarityKeys,
  allSubstatKeys,
  artMaxLevel,
  artSubstatRollData
} from '@genshin-optimizer/consts'
import type { IArtifact } from '@genshin-optimizer/gi-good'
import { allStats } from '@genshin-optimizer/gi-stats'
import type { Unit } from '@genshin-optimizer/util'
import {
  clampPercent,
  objKeyMap,
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
const maxSubstatRollEfficiency = objKeyMap(allRarityKeys, (rarity) =>
  Math.max(
    ...allSubstatKeys.map(
      (substat) => getSubstatValue(substat, rarity) / getSubstatValue(substat)
    )
  )
)

export function getArtifactEfficiency(
  artifact: IArtifact,
  substatMetas: SubstatMeta[],
  filter: Set<SubstatKey>
): { currentEfficiency: number; maxEfficiency: number } {
  const { substats, rarity, level } = artifact
  // Relative to max star, so comparison between different * makes sense.
  const currentEfficiency = substatMetas
    .filter(({ key }) => key && filter.has(key))
    .reduce((sum, { efficiency }) => sum + (efficiency ?? 0), 0)

  const rollsRemaining = getRollsRemaining(level, rarity)
  const emptySlotCount = substats.filter((s) => !s.key).length
  const matchedSlotCount = substats.filter(
    (s) => s.key && filter.has(s.key)
  ).length
  const unusedFilterCount =
    filter.size -
    matchedSlotCount -
    (filter.has(artifact.mainStatKey as any) ? 1 : 0)
  let maxEfficiency
  if (emptySlotCount && unusedFilterCount)
    maxEfficiency =
      currentEfficiency + maxSubstatRollEfficiency[rarity] * rollsRemaining
  // Rolls into good empty slot
  else if (matchedSlotCount)
    maxEfficiency =
      currentEfficiency +
      maxSubstatRollEfficiency[rarity] * (rollsRemaining - emptySlotCount)
  // Rolls into existing matched slot
  else maxEfficiency = currentEfficiency // No possible roll

  return { currentEfficiency, maxEfficiency }
}


export type SubstatMeta = {
  key: SubstatKey | ''
  value: number
  accurateValue: number
  rolls: number[]
  efficiency: number
}

export function getSubstatMetas(artifact: IArtifact) {
  const { substats, rarity, level } = artifact
  const allPossibleRolls: { index: number; substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  const substatMetas = substats.map((substat, index): SubstatMeta => {
    const { key, value } = substat
    let efficiency = 0
    let rolls: number[] = []
    let accurateValue = value

    if (key && value) {
      const max5Value = getSubstatValue(key)
      efficiency = value / max5Value

      const possibleRolls = getSubstatRolls(key, value, rarity)

      if (possibleRolls.length) {
        // Valid Substat
        const possibleLengths = new Set(
          possibleRolls.map((roll) => roll.length)
        )

        if (possibleLengths.size !== 1) {
          // Ambiguous Rolls
          allPossibleRolls.push({ index, substatRolls: possibleRolls })
        } else {
          // Unambiguous Rolls
          totalUnambiguousRolls += possibleRolls[0].length
        }

        rolls = possibleRolls.reduce((best, current) =>
          best.length < current.length ? best : current
        )
        accurateValue = rolls.reduce((a, b) => a + b, 0)
        efficiency = accurateValue / max5Value
      }
    }
    return {
      key,
      value,
      accurateValue,
      rolls,
      efficiency,
    }
  })

  const { low, high } = artSubstatRollData[rarity],
    lowerBound = low + Math.floor(level / 4),
    upperBound = high + Math.floor(level / 4)

  let highestScore = -Infinity // -Max(substats.rolls[i].length) over ambiguous rolls
  const tryAllSubstats = (
    rolls: { index: number; roll: number[] }[],
    currentScore: number,
    total: number
  ) => {
    if (rolls.length === allPossibleRolls.length) {
      if (
        total <= upperBound &&
        total >= lowerBound &&
        highestScore < currentScore
      ) {
        highestScore = currentScore
        for (const { index, roll } of rolls) {
          const key = substatMetas[index].key as SubstatKey
          const accurateValue = roll.reduce((a, b) => a + b, 0)
          substatMetas[index].rolls = roll
          substatMetas[index].accurateValue = accurateValue
          substatMetas[index].efficiency = accurateValue / getSubstatValue(key)
        }
      }

      return
    }

    const { index, substatRolls } = allPossibleRolls[rolls.length]
    for (const roll of substatRolls) {
      rolls.push({ index, roll })
      const newScore = Math.min(currentScore, -roll.length)
      if (newScore >= highestScore)
        // Scores won't get better, so we can skip.
        tryAllSubstats(rolls, newScore, total + roll.length)
      rolls.pop()
    }
  }

  tryAllSubstats([], Infinity, totalUnambiguousRolls)

  const totalRolls = substatMetas.reduce(
    (accu, { rolls }) => accu + rolls.length,
    0
  )

  if (totalRolls > upperBound)
    console.error(
      `${rarity}-star artifact (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`
    )
  else if (totalRolls < lowerBound)
    console.error(
      `${rarity}-star artifact (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`
    )
  if (substatMetas.some((substat) => !substat.key)) {
    const substat = substatMetas.find(
      (substat) => (substat.rolls?.length ?? 0) > 1
    )
    if (substat)
      console.error(
        `Substat ${substat.key} has > 1 roll, but not all substats are unlocked.`
      )
  }
  return substatMetas
}
