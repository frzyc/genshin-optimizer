import { database } from "../Database/Database";
import { validateFlexArtifact, validateFlexCharacter } from "../Database/validation";
import { IArtifact, IFlexArtifact } from "../Types/artifact";
import { ICharacter, IFlexCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { decode, encode } from "./CodingUtil";
import { schemas } from "./Schemas";

export function createFlexObj(characterKey: CharacterKey) {
  const character = database._getChar(characterKey)
  if (!character) return null

  const artifacts = Object.values(character.equippedArtifacts)
    .filter(art => art)
    .map(id => database._getArt(id)!)

  return _createFlexObj(character, artifacts)
}

// TODO: Remove this when all test URLs are converted to new format
export function _createFlexObj(character: ICharacter, artifacts: IArtifact[]) {
  try {
    return "v=2&d=" + encode({ character, artifacts }, schemas.flexV2)
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return null
  }
}

export function parseFlexObj(string: string): [FlexObj, number] | undefined {
  const parameters = Object.fromEntries(string.split('&').map(s => s.split('=')))

  try {
    switch (parseInt(parameters.v)) {
      case 2: return [parseFlexObjFromSchema(parameters.d, schemas.flexV2), 2]
      default: return
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${error.path ?? []}: ${error}`)
    return
  }
}

function parseFlexObjFromSchema(string: string, schema: any) {
  const decoded = decode(string, schema) as { character: IFlexCharacter, artifacts: IFlexArtifact[] }
  const character = validateFlexCharacter(decoded.character)
  const artifacts = decoded.artifacts.map((art, i) => validateFlexArtifact(art, ``).artifact)

  artifacts.forEach(artifact => {
    artifact.location = character.characterKey
  })
  return {
    artifacts, character
  }
}

type FlexObj = { character: ICharacter, artifacts: IArtifact[] }