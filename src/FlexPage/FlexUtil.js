import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { CurrentDatabaseVersion } from "../Database/DatabaseUtil";
import { decode, encode } from "./CodingUtil";
import { schemas } from "./Schemas";

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
    return "v=2&d=" + encode({ character, artifacts }, schemas.flexV2)
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
      case 2: return parseFlexObjFromSchema(parameters.d, schemas.flexV2)
      case 1: return parseFlexObjFromSchema(parameters.d, schemas.flexV1)
      default: return null
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return null
  }
}

function parseFlexObjFromSchema(string, schema) {
  const { character, artifacts } = decode(string, schema)
  artifacts.forEach(artifact => {
    artifact.location = character.characterKey
  })
  return {
    databaseVersion: CurrentDatabaseVersion,
    artifacts, ...character
  }
}
