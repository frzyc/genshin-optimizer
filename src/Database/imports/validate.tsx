import Artifact from "../../Data/Artifacts/Artifact";
import KeyMap from "../../KeyMap";
import { IArtifact, ICachedArtifact, ICachedSubstat, SubstatKey } from "../../Types/artifact";
import { ICachedCharacter, ICharacter } from "../../Types/character";
import { allSlotKeys } from "../../Types/consts";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { objectKeyMap } from "../../Util/Util";

// MIGRATION STEP: Always keep validation in sync with current DB format

/// Returns the closest (not necessarily valid) artifact, including errors as necessary
export function validateArtifact(flex: IArtifact, id: string): { artifact: ICachedArtifact, errors: Displayable[] } {
  const { location, exclude, lock, setKey, slotKey, rarity, mainStatKey } = flex
  const level = Math.round(Math.min(Math.max(0, flex.level), rarity >= 3 ? rarity * 4 : 4))
  const mainStatVal = Artifact.mainStatValue(mainStatKey, rarity, level)!

  const errors: Displayable[] = []
  const substats: ICachedSubstat[] = flex.substats.map(substat => ({ ...substat, rolls: [], efficiency: 0, accurateValue: substat.value }))
  // Carry over the probability, since its a cached value calculated outside of the artifact.
  const validated: ICachedArtifact = { id, setKey, location, slotKey, exclude, lock, mainStatKey, rarity, level, substats, mainStatVal, probability: ((flex as any).probability) }

  const allPossibleRolls: { index: number, substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  function efficiency(value: number, key: SubstatKey): number {
    return value / Artifact.substatValue(key) * 100
  }

  substats.forEach((substat, index) => {
    const { key, value } = substat
    if (!key) return substat.value = 0
    substat.efficiency = efficiency(value, key)

    const possibleRolls = Artifact.getSubstatRolls(key, value, rarity)

    if (possibleRolls.length) { // Valid Substat
      const possibleLengths = new Set(possibleRolls.map(roll => roll.length))

      if (possibleLengths.size !== 1) { // Ambiguous Rolls
        allPossibleRolls.push({ index, substatRolls: possibleRolls })
      } else { // Unambiguous Rolls
        totalUnambiguousRolls += possibleRolls[0].length
      }

      substat.rolls = possibleRolls.reduce((best, current) => best.length < current.length ? best : current)
      substat.efficiency = efficiency(substat.rolls.reduce((a, b) => a + b, 0), key)
      substat.accurateValue = substat.rolls.reduce((a, b) => a + b, 0)
    } else { // Invalid Substat
      substat.rolls = []
      errors.push(<>Invalid substat {KeyMap.get(substat.key)}</>)
    }
  })

  if (errors.length) return { artifact: validated, errors }

  const { low, high } = Artifact.rollInfo(rarity), lowerBound = low + Math.floor(level / 4), upperBound = high + Math.floor(level / 4)

  let highestScore = -Infinity // -Max(substats.rolls[i].length) over ambiguous rolls
  const tryAllSubstats = (rolls: { index: number, roll: number[] }[], currentScore: number, total: number) => {
    if (rolls.length === allPossibleRolls.length) {
      if (total <= upperBound && total >= lowerBound && highestScore < currentScore) {
        highestScore = currentScore
        for (const { index, roll } of rolls) {
          const key = substats[index].key as SubstatKey
          const accurateValue = roll.reduce((a, b) => a + b, 0)
          substats[index].rolls = roll
          substats[index].accurateValue = accurateValue
          substats[index].efficiency = efficiency(accurateValue, key)
        }
      }

      return
    }

    const { index, substatRolls } = allPossibleRolls[rolls.length]
    for (const roll of substatRolls) {
      rolls.push({ index, roll })
      let newScore = Math.min(currentScore, -roll.length)
      if (newScore >= highestScore) // Scores won't get better, so we can skip.
        tryAllSubstats(rolls, newScore, total + roll.length)
      rolls.pop()
    }
  }

  tryAllSubstats([], Infinity, totalUnambiguousRolls)

  const totalRolls = substats.reduce((accu, { rolls }) => accu + rolls.length, 0)

  if (totalRolls > upperBound)
    errors.push(`${rarity}-star artifact (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`)
  else if (totalRolls < lowerBound)
    errors.push(`${rarity}-star artifact (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`)

  if (substats.some((substat) => !substat.key)) {
    let substat = substats.find(substat => (substat.rolls?.length ?? 0) > 1)
    if (substat)
      errors.push(<>Substat {KeyMap.get(substat.key)} has {'>'} 1 roll, but not all substats are unlocked.</>)
  }

  return { artifact: validated, errors }
}
/// Returns the closest character
export function validateCharacter(flex: ICharacter): ICachedCharacter {
  // TODO: Add more validations to make sure the returned value is a "valid" character
  return {
    equippedArtifacts: objectKeyMap(allSlotKeys, () => ""),
    equippedWeapon: "",
    ...flex,
  }
}
export function validateWeapon(flex: IWeapon, id: string): ICachedWeapon {
  //TODO: weapon validation
  return { ...flex, id }
}
