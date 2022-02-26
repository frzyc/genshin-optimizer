import { IArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character_WR";
import { CharacterKey } from "../../Types/consts";
import { IWeapon } from "../../Types/weapon_WR";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { setDBVersion } from "../utils";

export function importGO(data: any): ImportResult | undefined {
  const storage = new SandboxStorage()
  const { version, characterDatabase, artifactDatabase, weaponDatabase, stateDatabase } = data as Partial<DatabaseObj>
  if (!version)
    return

  characterDatabase && Object.entries(characterDatabase).forEach(([charKey, char]) => storage.set(`char_${charKey}`, char))
  artifactDatabase && Object.entries(artifactDatabase).forEach(([id, art]) => storage.set(id, art))
  weaponDatabase && Object.entries(weaponDatabase).forEach(([id, weapon]) => storage.set(id, weapon))
  stateDatabase && Object.entries(stateDatabase).forEach(([id, state]) => storage.set(id, state))
  //override version
  version && setDBVersion(storage, version)

  const database = new ArtCharDatabase(storage) // validate storage entries
  //TODO: figure out the # of dups/upgrades/new/foddered, not just total char/art count below.
  return { type: "GO", storage, charCount: database.chars.keys.length, artCount: database.arts.keys.length, weaponCount: database.weapons.keys.length }
}

type DatabaseObj = {
  version: number,
  characterDatabase: Dict<CharacterKey, ICharacter>
  artifactDatabase: Dict<string, IArtifact>
  weaponDatabase: Dict<string, IWeapon>
  stateDatabase: Dict<string, object>
}
export type ImportResult = { type: "GO", storage: DBStorage, charCount: number, artCount: number, weaponCount: number }
