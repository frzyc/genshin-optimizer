import { IArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { CharacterKey } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { getDBVersion, setDBVersion } from "../utils";

export function importDB(data: any): { storage: DBStorage, charCount: number, artCount: number, migrated: boolean } | undefined {
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
  return { storage, charCount: database.chars.keys.length, artCount: database.arts.keys.length, migrated: version !== getDBVersion(storage) }
}

export function exportDB(storage: DBStorage): DatabaseObj {
  return {
    version: getDBVersion(storage),
    characterDatabase: Object.fromEntries(storage.entries
      .filter(([key, _]) => key.startsWith("char_"))
      .map(([key, value]) => [key.slice(5), JSON.parse(value)])),
    artifactDatabase: Object.fromEntries(storage.entries
      .filter(([key, _]) => key.startsWith("artifact_"))
      .map(([key, value]) => [key, JSON.parse(value)])),
    artifactDisplay: storage.get("ArtifactDisplay.state") ?? {},
    characterDisplay: storage.get("CharacterDisplay.state") ?? {},
    buildsDisplay: storage.get("BuildsDisplay.state") ?? {},
  }
}

type DatabaseObj = {
  version: number,
  characterDatabase: Dict<CharacterKey, ICharacter>
  artifactDatabase: Dict<string, IArtifact>
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any
}
