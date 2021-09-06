import { ArtCharDatabase } from "../Database/Database";
import { SandboxStorage } from "../Database/DBStorage";
import { IFlexArtifact } from "../Types/artifact";
import { IFlexCharacter } from "../Types/character";
import { CharacterKey } from "../Types/consts";
import { IFlexWeapon } from "../Types/weapon";
import { decode, encode } from "./CodingUtil";
import { schemas } from "./Schemas";

export function createFlexObj(characterKey: CharacterKey, database: ArtCharDatabase): string | null {
  const character = database._getChar(characterKey)
  if (!character) return null

  character.weapon = database._getWeapon(character.equippedWeapon)

  const artifacts = Object.values(character.equippedArtifacts)
    .filter(art => art)
    .map(id => database._getArt(id)!)

  try {
    return "v=2&d=" + encode({ character, artifacts }, schemas.flexV2)
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${(error as any).path?.reverse() ?? []}: ${error}`)
    return null
  }
}

export function parseFlexObj(string: string): [ArtCharDatabase, CharacterKey, number] | undefined {
  const parameters = Object.fromEntries(string.split('&').map(s => s.split('=')))

  try {
    switch (parseInt(parameters.v)) {
      case 2: return [...parseFlexObjFromSchema(parameters.d, schemas.flexV2), 2]
      default: return
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development")
      console.error(`Fail to encode data on path ${(error as any).path?.reverse() ?? []}: ${error}`)
    return
  }
}

function parseFlexObjFromSchema(string: string, schema: any): [ArtCharDatabase, CharacterKey] {
  const decoded = decode(string, schema) as { character: IFlexCharacter & { weapon: IFlexWeapon }, artifacts: IFlexArtifact[] }
  const { character: { weapon, characterKey }, character, artifacts } = decoded

  const storage = new SandboxStorage()
  // DON'T CHANGE THIS.
  // Flex v2 (decoding) scheme won't be updated even when newer
  // db versions come along. So the object created from the url
  // will remain a valid dbv8. The actual migration happens
  // together with the validation down below.
  storage.setString("db_ver", "8")

  weapon.location = characterKey
  storage.set("weapon_1", weapon)
  storage.set(`char_${characterKey}`, character)
  artifacts.forEach((artifact, i) => {
    artifact.location = characterKey
    storage.set(`artifact_${i + 1}`, artifact)
  })

  const database = new ArtCharDatabase(storage) // Validate storage

  if (!database._getChar(characterKey))
    throw new Error(`Invalid flex object`)
  return [database, characterKey]
}
