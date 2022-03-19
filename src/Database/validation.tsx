import { ascensionMaxLevel } from "../Data/LevelData";
import KeyMap from "../KeyMap";
import { maxBuildsToShowDefault, maxBuildsToShowList } from "../PageBuild/Build";
import { initialBuildSettings } from "../PageBuild/BuildSetting";
import { allMainStatKeys, allSubstats, ICachedArtifact, IArtifact, ICachedSubstat, ISubstat, SubstatKey } from "../Types/artifact";
import { ICachedCharacter, ICharacter } from "../Types/character_WR";
import { allArtifactRarities, allArtifactSets, allCharacterKeys, allElements, allHitModes, allReactionModes, allSlotKeys, allWeaponKeys } from "../Types/consts";
import { IWeapon, ICachedWeapon } from "../Types/weapon";
import Artifact from "../Data/Artifacts/Artifact";
import { objectKeyMap } from "../Util/Util";

// MIGRATION STEP: Always keep validate/parse in sync with the latest format

/// Returns the closest (not necessarily valid) artifact, including errors as necessary
export function validateArtifact(flex: IArtifact, id: string): { artifact: ICachedArtifact, errors: Displayable[] } {
  const { location, exclude, lock, setKey, slotKey, rarity, mainStatKey } = flex
  const level = Math.round(Math.min(Math.max(0, flex.level), rarity >= 3 ? rarity * 4 : 4))
  const mainStatVal = Artifact.mainStatValue(mainStatKey, rarity, level)!

  const errors: Displayable[] = []
  const substats: ICachedSubstat[] = flex.substats.map(substat => ({ ...substat, rolls: [], efficiency: 0, accurateValue: substat.value }))
  const validated: ICachedArtifact = { id, setKey, location, slotKey, exclude, lock, mainStatKey, rarity, level, substats, mainStatVal }

  const allPossibleRolls: { index: number, substatRolls: number[][] }[] = []
  let totalUnambiguousRolls = 0

  function efficiency(value: number, key: SubstatKey): number {
    return value / Artifact.maxSubstatValues(key) * 100
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
/// Returns the closest flex artifact, or undefined if it's not recoverable
export function parseArtifact(obj: any): IArtifact | undefined {
  if (typeof obj !== "object") return

  let {
    setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock,
  } = obj ?? {}

  if (!allArtifactSets.includes(setKey) ||
    !allSlotKeys.includes(slotKey) ||
    !allMainStatKeys.includes(mainStatKey) ||
    !allArtifactRarities.includes(rarity) ||
    typeof level !== "number" || level < 0 || level > 20)
    return // non-recoverable

  // TODO:
  // These two requires information from artifact sheet,
  // which normally isn't loaded at this point yet.
  // - Validate artifact set vs slot
  // - Validate artifact set vs rarity
  substats = parseSubstats(substats)
  lock = !!lock
  exclude = !!exclude
  level = Math.round(level)
  const plausibleMainStats = Artifact.slotMainStats(slotKey)
  if (!plausibleMainStats.includes(mainStatKey))
    if (plausibleMainStats.length === 1) mainStatKey = plausibleMainStats[0]
    else return // ambiguous mainstat
  if (!allCharacterKeys.includes(location)) location = ""
  return { setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock }
}
/// Return a new flex artifact from given artifact. All extra keys are removed
export function removeArtifactCache(artifact: ICachedArtifact): IArtifact {
  const { setKey, rarity, level, slotKey, mainStatKey, substats, location, exclude, lock } = artifact
  return { setKey, rarity, level, slotKey, mainStatKey, substats: substats.map(substat => ({ key: substat.key, value: substat.value })), location, exclude, lock }
}
function parseSubstats(obj: any): ISubstat[] {
  if (!Array.isArray(obj))
    return new Array(4).map(_ => ({ key: "", value: 0 }))
  const substats = obj.slice(0, 4).map(({ key = undefined, value = undefined }) => {
    if (!allSubstats.includes(key) || typeof value !== "number" || !isFinite(value))
      return { key: "", value: 0 }
    value = key.endsWith("_") ? Math.round(value * 10) / 10 : Math.round(value)
    return { key, value }
  })
  while (substats.length < 4)
    substats.push({ key: "", value: 0 })

  return substats
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
/// Returns the closest flex character, or undefined if it's not recoverable
export function parseCharacter(obj: any): ICharacter | undefined {
  if (typeof obj !== "object") return

  let {
    key: characterKey, level, ascension, hitMode, elementKey, reactionMode, conditional,
    bonusStats, enemyOverride, talent, infusionAura, constellation, buildSettings, team, compareData
  } = obj

  if (!allCharacterKeys.includes(characterKey) ||
    typeof level !== "number" || level < 0 || level > 90)
    return // non-recoverable

  if (!allHitModes.includes(hitMode)) hitMode = "avgHit"
  if (characterKey !== "Traveler") elementKey = undefined
  else if (!allElements.includes(elementKey)) elementKey = "anemo"
  if (!allReactionModes.includes(reactionMode)) reactionMode = ""
  if (!allElements.includes(infusionAura)) infusionAura = ""
  if (typeof constellation !== "number" && constellation < 0 && constellation > 6) constellation = 0
  if (typeof ascension !== "number" ||
    !(ascension in ascensionMaxLevel) ||
    level > ascensionMaxLevel[ascension] ||
    level < (ascensionMaxLevel[ascension - 1] ?? 0))
    ascension = ascensionMaxLevel.findIndex(maxLvl => level <= maxLvl)
  if (typeof talent !== "object") talent = { auto: 1, skill: 1, burst: 1 }
  else {
    let { auto, skill, burst } = talent
    if (typeof auto !== "number" || auto < 1 || auto > 15) auto = 1
    if (typeof skill !== "number" || skill < 1 || skill > 15) skill = 1
    if (typeof burst !== "number" || burst < 1 || burst > 15) burst = 1
    talent = { auto, skill, burst }
  }
  if (buildSettings && typeof buildSettings === "object") {//buildSettings
    let { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh } = buildSettings ?? {}
    if (!Array.isArray(setFilters)) setFilters = initialBuildSettings().setFilters

    //make sure set effects are all numbers
    setFilters = setFilters.map(({ key, num }) => {
      if (Number.isInteger(num)) return { key, num }
      return { key: "", num: 0 }
    })
    //move all the empty entries to the back
    setFilters = [...setFilters.filter(s => s.key), ...setFilters.filter(s => !s.key)]

    if (typeof statFilters !== "object") statFilters = {}

    if (!mainStatKeys || !mainStatKeys.sands || !mainStatKeys.goblet || !mainStatKeys.circlet) {
      const tempmainStatKeys = initialBuildSettings().mainStatKeys
      if (Array.isArray(mainStatKeys)) {
        const [sands, goblet, circlet] = mainStatKeys
        if (sands) tempmainStatKeys.sands = [sands]
        if (goblet) tempmainStatKeys.goblet = [goblet]
        if (circlet) tempmainStatKeys.circlet = [circlet]
      }
      mainStatKeys = tempmainStatKeys
    }

    if (!optimizationTarget || !Array.isArray(optimizationTarget)) optimizationTarget = undefined
    if (typeof mainStatAssumptionLevel !== "number" || mainStatAssumptionLevel < 0 || mainStatAssumptionLevel > 20)
      mainStatAssumptionLevel = 0
    useExcludedArts = !!useExcludedArts
    useEquippedArts = !!useEquippedArts
    if (!Array.isArray(builds) || !builds.every(b => Array.isArray(b) && b.every(s => typeof s === "string"))) {
      builds = []
      buildDate = 0
    }
    if (!Number.isInteger(buildDate)) buildDate = 0
    if (!maxBuildsToShowList.includes(maxBuildsToShow)) maxBuildsToShow = maxBuildsToShowDefault
    if (typeof plotBase !== "string") plotBase = ""
    if (compareBuild === undefined) compareBuild = false
    if (levelLow === undefined) levelLow = 0
    if (levelHigh === undefined) levelHigh = 20
    buildSettings = { setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow, plotBase, compareBuild, levelLow, levelHigh }
  }

  if (!conditional)
    conditional = {}
  if (!team)
    team = ["", "", ""]

  if (typeof compareData !== "boolean") compareData = false

  // TODO: validate bonusStats
  if (typeof bonusStats !== "object" || !Object.entries(bonusStats).map(([_, num]) => typeof num === "number")) bonusStats = {}
  if (typeof enemyOverride !== "object" || !Object.entries(enemyOverride).map(([_, num]) => typeof num === "number")) enemyOverride = {}
  const result: ICharacter = {
    key: characterKey, level, ascension, hitMode, reactionMode, conditional,
    bonusStats, enemyOverride, talent, infusionAura, constellation, team, compareData
  }
  if (buildSettings) result.buildSettings = buildSettings
  if (elementKey) result.elementKey = elementKey
  return result
}
/// Return a new flex character from given character. All extra keys are removed
export function removeCharacterCache(char: ICachedCharacter): ICharacter {
  const {
    key: characterKey, level, ascension, hitMode, elementKey, reactionMode, conditional,
    bonusStats, enemyOverride, talent, infusionAura, constellation, buildSettings, team, compareData
  } = char
  const result: ICharacter = {
    key: characterKey, level, ascension, hitMode, reactionMode, conditional,
    bonusStats, enemyOverride, talent, infusionAura, constellation, buildSettings, team, compareData
  }
  if (elementKey) result.elementKey = elementKey
  return result
}

export function validateWeapon(flex: IWeapon, id: string): ICachedWeapon {
  //TODO: weapon validation
  return { ...flex, id }
}
export function parseWeapon(obj: any): IWeapon | undefined {
  if (typeof obj !== "object") return

  let { key, level, ascension, refinement, location, lock } = obj
  if (!allWeaponKeys.includes(key)) return
  if (typeof level !== "number" || level < 1 || level > 90) level = 1
  if (typeof ascension !== "number" || ascension < 0 || ascension > 6) ascension = 0
  // TODO: Check if level-ascension matches
  if (typeof refinement !== "number" || refinement < 1 || refinement > 5) refinement = 1
  if (!allCharacterKeys.includes(location)) location = ""

  return { key, level, ascension, refinement, location, lock }
}
/// Return a new flex character from given character. All extra keys are removed
export function removeWeaponCache(weapon: ICachedWeapon): IWeapon {
  const { key, level, ascension, refinement, location, lock } = weapon
  return { key, level, ascension, refinement, location, lock }
}
