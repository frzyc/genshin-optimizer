import { IArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { CharacterKey } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { setDBVersion } from "../utils";

export function importGO(data: any): ImportResult | undefined {
  const storage = new SandboxStorage()
  const { version, characterDatabase, artifactDatabase, artifactDisplay, characterDisplay, buildsDisplay } = data as Partial<DatabaseObj>
  if (!version || !characterDatabase || !artifactDatabase)
    return

  characterDatabase && Object.entries(characterDatabase).forEach(([charKey, char]) => storage.set(`char_${charKey}`, char))
  artifactDatabase && Object.entries(artifactDatabase).forEach(([id, art]) => storage.set(id, art))
  //override version
  version && setDBVersion(storage, version)
  artifactDisplay && storage.set("ArtifactDisplay.state", artifactDisplay)
  characterDisplay && storage.set("CharacterDisplay.state", characterDisplay)
  buildsDisplay && storage.set("BuildsDisplay.state", buildsDisplay)

  const database = new ArtCharDatabase(storage) // validate storage entries
  //TODO: figure out the # of dups/upgrades/new/foddered, not just total char/art count below.
  return { type: "GO", storage, charCount: database.chars.keys.length, artCount: database.arts.keys.length }
}

type DatabaseObj = {
  version: number,
  characterDatabase: Dict<CharacterKey, ICharacter>
  artifactDatabase: Dict<string, IArtifact>
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any
}
export type ImportResult = { type: "GO", storage: DBStorage, charCount: number, artCount: number }
