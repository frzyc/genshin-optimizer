import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { CurrentDatabaseVersion } from "../Database/DatabaseUtil";
import { deepClone } from "./Util";

export function createFlexObj(characterKey) {
  const character = deepClone(CharacterDatabase.get(characterKey))
  if (!character) return null
  const { levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, talentLevelKeys, autoInfused, talentConditionals, constellation, overrideLevel } = character
  const artifacts = []
  const dbv = CurrentDatabaseVersion
  Object.values(character.equippedArtifacts).forEach(id => {
    const art = deepClone(ArtifactDatabase.get(id))
    if (!art) return
    const { level, numStars, mainStatKey, setKey, slotKey, substats } = art
    artifacts.push({ level, numStars, mainStatKey, setKey, slotKey, substats: Object.fromEntries(substats.map(({ key, value }) => [key, value])) })

  });
  const { auto, skill, burst } = talentLevelKeys

  return { dbv, characterKey, levelKey, hitMode, reactionMode, artifactConditionals, baseStatOverrides, weapon, autoInfused, talentConditionals, constellation, overrideLevel, artifacts, tlvl: [auto, skill, burst] }
}

export function parseFlexObj(character) {
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

