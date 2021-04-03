import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { CurrentDatabaseVersion } from "../Database/DatabaseUtil";
import { deepClone } from "./Util";
import { exportArtifact, importArtifact } from "./EximUtil"

export function createFlexObj(characterKey) {
  const character = deepClone(CharacterDatabase.get(characterKey))
  if (!character) return null
  const { levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, talentLevelKeys, autoInfused, talentConditionals, constellation, overrideLevel } = character
  const artifacts = []
  Object.values(character.equippedArtifacts).forEach(id => {
    const art = deepClone(ArtifactDatabase.get(id))
    if (!art) return
    artifacts.push(exportArtifact(art))
  });
  const { auto, skill, burst } = talentLevelKeys

  return { dbv: 3, characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel, artifacts, tlvl: [auto, skill, burst] }
}

export function parseFlexObj(character) {
  if (character.dbv === 3) {
    return parseFlexObj3(character)
  } else if (character.dbv === 2) {
    return parseFlexObj2(character)
  }
}

function parseFlexObj3(character) {
  const { dbv, characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel, tlvl, artifacts: artifactStrings } = character

  const artifacts = artifactStrings.map(string => importArtifact(string))
  const characterkey = character.characterKey
  artifacts.forEach(art => {
    art.location = characterkey
  });
  const [auto, skill, burst] = tlvl
  return {
    databaseVersion: CurrentDatabaseVersion,
    characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel,
    talentLevelKeys: { auto, skill, burst }, artifacts
  }
}
function parseFlexObj2(character) {
  const { dbv, characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel, tlvl, artifacts } = character
  const characterkey = character.characterKey
  character.artifacts.forEach(art => {
    art.location = characterkey
    art.substats = Object.entries(art.substats).map(([key, value]) => ({ key, value }))
  });
  const [auto, skill, burst] = tlvl
  return {
    databaseVersion: dbv,
    characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel,
    talentLevelKeys: { auto, skill, burst }, artifacts
  }
}
