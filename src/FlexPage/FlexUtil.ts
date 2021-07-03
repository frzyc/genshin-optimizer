import ArtifactDatabase from "../Database/ArtifactDatabase";
import CharacterDatabase from "../Database/CharacterDatabase";
import { IArtifact, IMinimalArtifact } from "../Types/artifact";
import { ICharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { decode, encode } from "./CodingUtil";
import { schemas } from "./Schemas";

export function createFlexObj(characterKey: CharacterKey) {
  const character = CharacterDatabase.get(characterKey)
  if (!character) return null

  const artifacts = Object.values(character.equippedArtifacts)
    .filter(art => art)
    .map(id => ArtifactDatabase.get(id)!)

  return _createFlexObj(character, artifacts)
}

// TODO: Remove this when all test URLs are converted to new format
export function _createFlexObj(character: ICharacter, artifacts: IMinimalArtifact[]) {
  try {
    return "v=2&d=" + encode({ character, artifacts }, schemas.flexV2)
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return null
  }
}

export function parseFlexObj(string): [FlexObject | undefined, number] {
  const parameters = Object.fromEntries(string.split('&').map(s => s.split('=')))

  try {
    switch (parseInt(parameters.v)) {
      case 2: return [parseFlexObjFromSchema(parameters.d, schemas.flexV2), 2]
      case 1: return [parseFlexObjFromSchema(parameters.d, schemas.flexV1), 1]
      default: return [undefined, -1]
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return [undefined, -1]
  }
}

function parseFlexObjFromSchema(string, schema): FlexObject {
  const { character, artifacts } = decode(string, schema) as { character: ICharacter, artifacts: IArtifact[] }
  artifacts.forEach(artifact => {
    artifact.location = character.characterKey
  })
  return { artifacts, character }
}

type FlexObject = {
  artifacts: IMinimalArtifact[],
  character: ICharacter,
}