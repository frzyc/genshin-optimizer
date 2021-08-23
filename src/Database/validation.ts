import Artifact from "../Artifact/Artifact";
import { ascensionMaxLevel } from "../Data/CharacterData";
import Stat from "../Stat";
import { allMainStatKeys, allSubstats, IArtifact, IFlexArtifact, IFlexSubstat, Substat, SubstatKey } from "../Types/artifact";
import { ICharacter, IFlexCharacter } from "../Types/character";
import { allArtifactSets, allCharacterKeys, allElements, allHitModes, allRarities, allReactionModes, allSlotKeys, allWeaponKeys } from "../Types/consts";

/// Returns the closest (not necessarily valid) artifact, including errors as necessary
export function validateFlexArtifact(flex: IFlexArtifact): { artifact: IArtifact, errors: string[] } {
  const { id, location, lock, setKey, slotKey, numStars, mainStatKey } = flex
  const level = Math.round(Math.min(Math.max(0, flex.level), numStars >= 3 ? numStars * 4 : 4))
  const mainStatVal = Artifact.mainStatValue(mainStatKey, numStars, level)!

  const errors: string[] = []
  const substats: Substat[] = flex.substats.map(substat => ({ ...substat, rolls: [], efficiency: 0 }))
  const validated: IArtifact = { id, setKey, location, slotKey, lock, mainStatKey, numStars, level, substats, mainStatVal }

  const allPossibleRolls: { index: number, substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  function efficiency(rolls: number[], key: SubstatKey): number {
    return rolls.map(Math.fround).reduce((a, b) => Math.fround(a + b)) / Artifact.maxSubstatValues(key) * 100 / rolls.length
  }

  substats.forEach((substat, index) => {
    const { key, value } = substat
    if (!key) {
      substat.value = 0
      return
    }

    const possibleRolls = Artifact.getSubstatRolls(key, value, numStars)

    if (possibleRolls.length) { // Valid Substat
      const possibleLengths = new Set(possibleRolls.map(roll => roll.length))

      if (possibleLengths.size !== 1) { // Ambiguous Rolls
        allPossibleRolls.push({ index, substatRolls: possibleRolls })
      } else { // Unambiguous Rolls
        totalUnambiguousRolls += possibleRolls[0].length
      }

      substat.rolls = possibleRolls.reduce((best, current) => best.length < current.length ? best : current)
      substat.efficiency = efficiency(substat.rolls, key)
    } else { // Invalid Substat
      substat.rolls = []
      substat.efficiency = 0
      errors.push(`Invalid substat ${Stat.getStatNameWithPercent(substat.key)}`)
    }
  })

  if (errors.length) return { artifact: validated, errors }

  const { low, high } = Artifact.rollInfo(numStars), lowerBound = low + Math.floor(level / 4), upperBound = high + Math.floor(level / 4)

  let highestScore = -Infinity // -Max(substats.rolls[i].length) over ambiguous rolls
  const tryAllSubstats = (rolls: { index: number, roll: number[] }[], currentScore: number, total: number) => {
    if (rolls.length === allPossibleRolls.length) {
      if (total <= upperBound && total >= lowerBound && highestScore < currentScore) {
        highestScore = currentScore
        for (const { index, roll } of rolls) {
          const key = substats[index].key as SubstatKey
          substats[index].rolls = roll
          substats[index].efficiency = efficiency(roll, key)
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
    errors.push(`${numStars}-star artifact (level ${level}) should have no more than ${upperBound} rolls. It currently has ${totalRolls} rolls.`)
  else if (totalRolls < lowerBound)
    errors.push(`${numStars}-star artifact (level ${level}) should have at least ${lowerBound} rolls. It currently has ${totalRolls} rolls.`)

  if (substats.some((substat) => !substat.key)) {
    let substat = substats.find(substat => (substat.rolls?.length ?? 0) > 1)
    if (substat)
      errors.push(`Substat ${Stat.getStatNameWithPercent(substat.key)} has > 1 roll, but not all substats are unlocked.`)
  }

  return { artifact: validated, errors }
}
/// Returns the closest flex artifact, or undefined if it's not recoverable
export function validateDBArtifact(obj: any, key: string): IFlexArtifact | undefined {
  if (typeof obj !== "object") return

  let {
    setKey, numStars, level, slotKey, mainStatKey, substats, location, lock,
  } = obj ?? {}

  if (!allArtifactSets.includes(setKey) ||
    !allSlotKeys.includes(slotKey) ||
    !allMainStatKeys.includes(mainStatKey) ||
    !allRarities.includes(numStars) ||
    typeof level !== "number" || level < 0 || level > 20)
    return // non-recoverable

  substats = validateSubstats(substats)
  lock = !!lock
  level = Math.round(level)
  if (!allCharacterKeys.includes(location)) location = ""
  return { id: key, setKey, numStars, level, slotKey, mainStatKey, substats, location, lock }
}
/// Return a new flex artifact from given artifact. All extra keys are removed
export function extractFlexArtifact(artifact: IArtifact): IFlexArtifact {
  const { id, setKey, numStars, level, slotKey, mainStatKey, substats, location, lock } = artifact
  return { id, setKey, numStars, level, slotKey, mainStatKey, substats: substats.map(substat => ({ key: substat.key, value: substat.value })), location, lock }
}
function validateSubstats(obj: any): IFlexSubstat[] {
  if (!Array.isArray(obj))
    return new Array(4).map(_ => ({ key: "", value: 0 }))
  const substats = obj.map(({ key = undefined, value = undefined }) => {
    if (!allSubstats.includes(key))
      return { key: "", value: 0 }
    return { key, value: typeof value === "number" && isFinite(value) ? value : 0 }
  })
  while (substats.length !== 4)
    substats.push({ key: "", value: 0 })

  return substats
}
/// Returns the closest character
export function validateFlexCharacter(flex: IFlexCharacter): ICharacter {
  // TODO: Add more validations to make sure the returned value is a "valid" character
  return {
    ...flex,
    equippedArtifacts: Object.fromEntries(allSlotKeys.map(slot => [slot, ""])) as any
  }
}
/// Returns the closest flex character, or undefined if it's not recoverable
export function validateDBCharacter(obj: any, key: string): IFlexCharacter | undefined {
  if (typeof obj !== "object") return

  let {
    characterKey, level, ascension, hitMode, elementKey, reactionMode, conditionalValues,
    baseStatOverrides, weapon, talentLevelKeys, infusionAura, constellation, buildSettings,
  } = obj

  if (key !== `char_${characterKey}` ||
    !allCharacterKeys.includes(characterKey) ||
    typeof level !== "number" || level < 0 || level > 90 ||
    typeof weapon !== "object" || !allWeaponKeys.includes(weapon.key))
    return // non-recoverable

  if (!allHitModes.includes(hitMode)) hitMode = "avgHit"
  if (characterKey !== "traveler") elementKey = undefined
  else if (!allElements.includes(elementKey)) elementKey = "anemo"
  if (!allReactionModes.includes(reactionMode)) reactionMode = null
  if (!allElements.includes(infusionAura)) infusionAura = ""
  if (typeof constellation !== "number" && constellation < 0 && constellation > 6) constellation = 0
  if (typeof ascension !== "number" ||
    !(ascension in ascensionMaxLevel) ||
    level > ascensionMaxLevel[ascension] ||
    level < (ascensionMaxLevel[ascension - 1] ?? 0))
    ascension = ascensionMaxLevel.findIndex(maxLvl => level <= maxLvl)
  if (typeof talentLevelKeys !== "object") talentLevelKeys = { auto: 0, skill: 0, burst: 0 }
  else {
    let { auto = 0, skill = 0, burst = 0 } = talentLevelKeys
    if (typeof auto !== "number" || auto < 0 || auto > 15) auto = 0
    if (typeof skill !== "number" || skill < 0 || skill > 15) skill = 0
    if (typeof burst !== "number" || burst < 0 || burst > 15) burst = 0
    talentLevelKeys = { auto, skill, burst }
  }
  {
    let { key, level, ascension, refineIndex } = weapon
    if (typeof level !== "number" || level < 1 || level > 90) level = 1
    if (typeof ascension !== "number" || ascension < 0 || ascension > 6) ascension = 0
    if (typeof refineIndex !== "number" || refineIndex < 0 || refineIndex > 5) refineIndex = 0
    weapon = { key, level, ascension, refineIndex }
  }
  {
    if (typeof buildSettings !== "object") buildSettings = {}
    let { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useLockedArts, useEquippedArts, ascending } = buildSettings ?? {}
    if (!Array.isArray(setFilters)) setFilters = [{ key: "", num: 0 }, { key: "", num: 0 }, { key: "", num: 0 }]
    if (typeof statFilters !== "object") statFilters = {}
    if (!Array.isArray(mainStatKeys)) mainStatKeys = ["", "", ""]
    if (!optimizationTarget) optimizationTarget = "finalAtk"
    if (typeof mainStatAssumptionLevel !== "number" || mainStatAssumptionLevel < 0 || mainStatAssumptionLevel > 20)
      mainStatAssumptionLevel = 0
    useLockedArts = !!useLockedArts
    useEquippedArts = !!useEquippedArts
    ascending = !!ascending
    buildSettings = { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useLockedArts, useEquippedArts, ascending }
  }

  // TODO: validate baseStatOverrides, conditionalValues
  return {
    characterKey, level, ascension, hitMode, elementKey, reactionMode, conditionalValues,
    baseStatOverrides, weapon, talentLevelKeys, infusionAura, constellation, buildSettings,
  }
}
/// Return a new flex character from given character. All extra keys are removed
export function extractFlexCharacter(char: ICharacter): IFlexCharacter {
  const {
    characterKey, level, ascension, hitMode, elementKey, reactionMode, conditionalValues,
    baseStatOverrides, weapon, talentLevelKeys, infusionAura, constellation, buildSettings,
  } = char
  return {
    characterKey, level, ascension, hitMode, elementKey, reactionMode, conditionalValues,
    baseStatOverrides, weapon, talentLevelKeys, infusionAura, constellation, buildSettings,
  }
}