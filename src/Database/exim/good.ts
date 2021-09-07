import { IArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { setDBVersion } from "../utils";

const GOSource = "Genshin Optimizer" as const

export function importGOOD(data: IGOOD): ImportResult {
  switch (data.version) {
    case 1: return importGOOD1(data)
  }
}

function importGOOD1(data: IGOOD): ImportResult {
  const storage = new SandboxStorage()
  const { source, characters, artifacts, weapons } = data

  // DO NOT CHANGE THE DB VERSION
  // GOODv1 matches dbv8.
  setDBVersion(storage, 8)
  characters.forEach((char) => storage.set(`char_${char.characterKey}`, char))
  artifacts.forEach((art, id) => storage.set(`artifact_${id}`, art))
  weapons.forEach((weapon, id) => storage.set(`weapon_${id}`, weapon))

  if (source === GOSource) {
    const { artifactDisplay, characterDisplay, buildsDisplay } = data as unknown as IGO
    artifactDisplay && storage.set("ArtifactDisplay.state", artifactDisplay)
    characterDisplay && storage.set("CharacterDisplay.state", characterDisplay)
    buildsDisplay && storage.set("BuildsDisplay.state", buildsDisplay)
  }

  const database = new ArtCharDatabase(storage) // validate storage entries
  //TODO: figure out the # of dups/upgrades/new/foddered, not just total char/art count below.
  return { storage, source, charCount: database.chars.keys.length, artCount: database.arts.keys.length, weaponCount: database.weapons.keys.length, migrated: false }
}

export function exportGOOD(storage: DBStorage): IGOOD & IGO {
  return {
    format: "GOOD",
    source: GOSource,
    version: 1,
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

type IGOOD = {
  format: "GOOD"
  source: string
  version: 1
  characters: ICharacter[]
  artifacts: IArtifact[]
  weapons: IWeapon[]
}

type IGO = {
  source: typeof GOSource
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any
}

type ImportResult = { storage: DBStorage, source: string, charCount: number, artCount: number, weaponCount: number, migrated: boolean } | undefined