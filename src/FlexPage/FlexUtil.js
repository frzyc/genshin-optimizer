import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { CurrentDatabaseVersion } from "../Database/DatabaseUtil";
import { decode, encode } from "./CodingUtil";
import { schemas } from "./Schemas";
import urlon from 'urlon'

export function createFlexObj(characterKey) {
  const character = CharacterDatabase.get(characterKey)
  if (!character) return null

  const artifacts = Object.values(character.equippedArtifacts)
    .filter(art => art)
    .map(id => ArtifactDatabase.get(id))

  return _createFlexObj(character, artifacts)
}

// TODO: Remove this when all test URLs are converted to new format
export function _createFlexObj(character, artifacts) {
  try {
    return "v=1&d=" + encode({ character, artifacts }, schemas.flex)
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return null
  }
}

export function parseFlexObj(string) {
  const parameters = Object.fromEntries(string.split('&').map(s => s.split('=')))

  try {
    switch (parseInt(parameters.v)) {
      case 1: return parseFlexObj1(parameters.d)
      default: return parseFlexObj0(urlon.parse(string))
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return null
  }
}

function parseFlexObj1(string) {
  const { character, artifacts } = decode(string, schemas.flex)
  artifacts.forEach(artifact => {
    artifact.location = character.characterKey
  })
  return {
    databaseVersion: CurrentDatabaseVersion,
    artifacts, ...character
  }
}
function parseFlexObj0(character) {
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
