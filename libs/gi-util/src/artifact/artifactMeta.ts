import type { SubstatKey } from '@genshin-optimizer/consts'
import { artSubstatRollData } from '@genshin-optimizer/consts'
import type { IArtifact } from '@genshin-optimizer/gi-good'
import {
  getMainStatDisplayValue,
  getSubstatRolls,
  getSubstatValue,
} from './artifact'

export interface ArtifactMeta {
  mainStatVal: number
  substats: SubstatMeta[]
}

export interface SubstatMeta {
  rolls: number[]
  efficiency: number
  accurateValue: number
}

const defSubMeta = () => ({
  rolls: [],
  efficiency: 0,
  accurateValue: 0,
})
/**
 * Generate meta data for artifacts, and also output some errors during meta generation
 * @param flex
 * @param id
 * @returns
 */
export function getArtifactMeta(flex: IArtifact): {
  artifactMeta: ArtifactMeta
  errors: string[]
} {
  const { rarity, mainStatKey, level } = flex
  const mainStatVal = getMainStatDisplayValue(mainStatKey, rarity, level)

  const errors: string[] = []

  const allPossibleRolls: { index: number; substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  const substats = flex.substats.map((substat, index): SubstatMeta => {
    const { key, value } = substat
    if (!key || !value) return defSubMeta()
    const max5Value = getSubstatValue(key)
    let efficiency = value / max5Value

    const possibleRolls = getSubstatRolls(key, value, rarity)

    if (possibleRolls.length) {
      // Valid Substat
      const possibleLengths = new Set(possibleRolls.map((roll) => roll.length))

      if (possibleLengths.size !== 1) {
        // Ambiguous Rolls
        allPossibleRolls.push({ index, substatRolls: possibleRolls })
      } else {
        // Unambiguous Rolls
        totalUnambiguousRolls += possibleRolls[0].length
      }

      const rolls = possibleRolls.reduce((best, current) =>
        best.length < current.length ? best : current
      )
      const accurateValue = rolls.reduce((a, b) => a + b, 0)
      efficiency = accurateValue / max5Value
      return {
        rolls,
        efficiency,
        accurateValue,
      }
    } else {
      // Invalid Substat
      errors.push(`Invalid substat ${substat.key}`)
      return defSubMeta()
    }
  })

  const validated = {
    mainStatVal,
    substats,
  }

  if (errors.length) return { artifactMeta: validated, errors }

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
          const key = flex.substats[index].key as SubstatKey
          const accurateValue = roll.reduce((a, b) => a + b, 0)
          substats[index].rolls = roll
          substats[index].accurateValue = accurateValue
          substats[index].efficiency = accurateValue / getSubstatValue(key)
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

  const totalRolls = substats.reduce(
    (accu, { rolls }) => accu + rolls.length,
    0
  )

  if (totalRolls > upperBound)
    errors.push(
      `${rarity}-star artifact (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`
    )
  else if (totalRolls < lowerBound)
    errors.push(
      `${rarity}-star artifact (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`
    )

  if (substats.length < 4 || flex.substats.some(({ key }) => !key)) {
    const index = substats.findIndex(
      (substat) => (substat.rolls?.length ?? 0) > 1
    )
    if (index !== -1)
      errors.push(
        `Substat ${flex.substats[index].key} has > 1 roll, but not all substats are unlocked.`
      )
  }

  return { artifactMeta: validated, errors }
}
