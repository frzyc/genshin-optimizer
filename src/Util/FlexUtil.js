import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { CurrentDatabaseVersion } from "../Database/DatabaseUtil";
import { deepClone } from "./Util";
import { exportArtifact, importArtifact, importCharacter, exportCharacter } from "./EximUtil"

export function createFlexObj(characterKey) {
  const character = deepClone(CharacterDatabase.get(characterKey))
  if (!character) return null

  return {
    v: 1,
    ...exportCharacter(character),

    // Artifacts
    a: Object.values(character.equippedArtifacts)
      .filter(art => art)
      .map(id => exportArtifact(ArtifactDatabase.get(id)))
  }
}

export function parseFlexObj(character) {
  if (character.v === 1) return parseFlexObj3(character)
  return parseFlexObjOld(character)
}

function parseFlexObj3(character) {
  const imported = importCharacter(character)
  const artifacts = character.a.map(string => importArtifact(string))
  artifacts.forEach(art => {
    art.location = imported.characterKey
  })
  return {
    databaseVersion: CurrentDatabaseVersion,
    artifacts, ...imported
  }
}
function parseFlexObjOld(character) {
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
