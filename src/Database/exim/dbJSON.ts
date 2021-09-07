import { IArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { CharacterKey } from "../../Types/consts";
import { IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { getDBVersion, setDBVersion } from "../utils";

export function importDB(_data: any): { storage: DBStorage, charCount: number, artCount: number, migrated: boolean } | undefined {
  const storage = new SandboxStorage()
  const data = _data as Partial<DatabaseObj>
  const { version, artifactDisplay, characterDisplay, buildsDisplay } = data
  const characters = data.characters ?? (data.characterDatabase && Object.values(data.characterDatabase))
  const artifacts = data.artifacts ?? (data.artifactDatabase && Object.values(data.artifactDatabase))
  const weapons = data.weapons ?? []
  if (!version || !characters || !artifacts)
    return

  version && setDBVersion(storage, version)
  characters.forEach((char) => storage.set(`char_${char.characterKey}`, char))
  artifacts.forEach((art, id) => storage.set(`artifact_${id}`, art))
  weapons.forEach((weapon, id) => storage.set(`weapon_${id}`, weapon))

  artifactDisplay && storage.set("ArtifactDisplay.state", artifactDisplay)
  characterDisplay && storage.set("CharacterDisplay.state", characterDisplay)
  buildsDisplay && storage.set("BuildsDisplay.state", buildsDisplay)

  const database = new ArtCharDatabase(storage) // validate storage entries
  const migrated = version !== getDBVersion(storage) || !data.characters
  //TODO: figure out the # of dups/upgrades/new/foddered, not just total char/art count below.
  return { storage, charCount: database.chars.keys.length, artCount: database.arts.keys.length, migrated }
}

export function exportDB(storage: DBStorage): IGOOD {
  return {
    format: "GOOD",
    source: "GO",
    version: getDBVersion(storage),
    characters: storage.entries
      .filter(([key]) => key.startsWith("char_"))
      .map(([_, value]) => JSON.parse(value)),
    artifacts: storage.entries
      .filter(([key]) => key.startsWith("artifact_"))
      .map(([_, value]) => JSON.parse(value)),
    weapons: storage.entries
      .filter(([key]) => key.startsWith("weapon_"))
      .map(([_, value]) => JSON.parse(value)),

    artifactDisplay: storage.get("ArtifactDisplay.state") ?? {},
    characterDisplay: storage.get("CharacterDisplay.state") ?? {},
    buildsDisplay: storage.get("BuildsDisplay.state") ?? {},
  }
}

type OldDatabaseObj = {
  version: number,
  characterDatabase: Dict<CharacterKey, ICharacter>
  artifactDatabase: Dict<string, IArtifact>
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any

  characters?: never, artifacts?: never, weapons?: never
}

type IGOOD = {
  format: "GOOD"
  source: "GO"
  version: number
  characters: ICharacter[]
  artifacts: IArtifact[]
  weapons: IWeapon[]

  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any

  characterDatabase?: never, artifactDatabase?: never
}

type DatabaseObj = OldDatabaseObj | IGOOD
