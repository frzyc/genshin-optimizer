import { IArtifact, ICachedArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { setDBVersion } from "../utils";
import { parseArtifact, parseCharacter, parseWeapon } from "../validation";

const GOSource = "Genshin Optimizer" as const

export function importGOOD(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  switch (data.version) {
    case 1: return importGOOD1(data, oldDatabase)
  }
}

function importGOOD1(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  const source = data.source, storage = new SandboxStorage(oldDatabase.storage)
  const result: ImportResult = { type: "GOOD", storage, source }

  // Match artifacts for counter, metadata, and locations
  if (data.artifacts) {
    const counter = newCounter()
    const artifacts = data.artifacts.flatMap(a => {
      const parsed = parseArtifact(a)
      if (!parsed) counter.invalid.push(a)
      return parsed ? [parsed] : []
    })
    const hasLocations = artifacts.some(art => art.location)
    const idsToRemove = new Set(oldDatabase._getArts().map(a => a.id))
    for (const artifact of artifacts) {
      let { duplicated, upgraded } = oldDatabase.findDuplicates(artifact)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      // Prefer dups over upgrades
      const match = (duplicated[0] ?? upgraded[0]) as ICachedArtifact | undefined
      if (match) {
        idsToRemove.delete(match.id)
        if (!hasLocations)
          artifact.location = match.location
      }

      if (duplicated.length) counter.unchanged++
      else if (upgraded.length) counter.updated++
      else counter.new++
    }

    counter.total = data.artifacts.length
    counter.removed = idsToRemove.size
    result.artifacts = counter

    storage.removeForKeys(k => k.startsWith("artifact_"))
    artifacts.forEach((a, i) => storage.set(`artifact_${i}`, a))
  }

  // Match weapons for counter, metadata, and locations
  if (data.weapons) {
    const counter = newCounter()
    const weapons = data.weapons.flatMap(w => {
      const parsed = parseWeapon(w)
      if (!parsed) counter.invalid.push(w)
      return parsed ? [parsed] : []
    })
    const hasLocations = weapons.some(weapon => weapon.location)
    const idsToRemove = new Set(oldDatabase._getWeapons().map(w => w.id))
    for (const weapon of weapons) {
      let { duplicated, upgraded } = oldDatabase.findDuplicateWeapons(weapon)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(w => idsToRemove.has(w.id))
      upgraded = upgraded.filter(w => idsToRemove.has(w.id))

      // Prefer dups over upgrades
      const match = (duplicated[0] ?? upgraded[0]) as ICachedWeapon | undefined
      if (match) {
        idsToRemove.delete(match.id)
        if (!hasLocations)
          weapon.location = match.location
      }

      if (duplicated.length) counter.unchanged++
      else if (upgraded.length) counter.updated++
      else counter.new++
    }

    counter.total = data.weapons!.length
    counter.removed = idsToRemove.size
    result.weapons = counter

    storage.removeForKeys(k => k.startsWith("weapon_"))
    weapons.forEach((w, i) => storage.set(`weapon_${i}`, w))
  }

  if (data.characters) {
    const invalid: any[] = []
    const characters = data.characters.flatMap(c => {
      const parsed = parseCharacter(c)
      if (!parsed) invalid.push(c)
      return parsed ? [parsed] : []
    })
    const newCharKeys = new Set(characters.map(x => x.key))
    const oldCharKeys = new Set(oldDatabase._getCharKeys())

    result.characters = {
      total: data.characters!.length,
      new: [...newCharKeys].filter(x => !oldCharKeys.has(x)).length,
      updated: [...newCharKeys].filter(x => oldCharKeys.has(x)).length,
      removed: [...oldCharKeys].filter(x => !newCharKeys.has(x)).length,
      unchanged: 0,
      invalid
    }

    storage.removeForKeys(k => k.startsWith("char_"))
    characters.forEach((c => storage.set(`char_${c.key}`, c)))
  }

  if (source === GOSource) {
    const { dbVersion, artifactDisplay, characterDisplay, buildsDisplay } = data as unknown as IGO
    if (dbVersion < 8) return // Something doesn't look right here
    setDBVersion(storage, dbVersion)
    artifactDisplay && storage.set("ArtifactDisplay.state", artifactDisplay)
    characterDisplay && storage.set("CharacterDisplay.state", characterDisplay)
    buildsDisplay && storage.set("BuildsDisplay.state", buildsDisplay)
  } else {
    // DO NOT CHANGE THE DB VERSION
    // Standard GOODv1 matches dbv8.
    setDBVersion(storage, 8)
  }

  new ArtCharDatabase(storage) // validate storage entries
  return result
}

export function exportGOOD(storage: DBStorage): IGOOD & IGO {
  return {
    format: "GOOD",
    dbVersion: 8,
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
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}
type IGO = {
  dbVersion: number
  source: typeof GOSource
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any
}

export type ImportResultCounter = {
  total: number, // total # in file
  new: number,
  updated: number,
  unchanged: number,
  removed: number,
  invalid: any[],
}
export type ImportResult = {
  type: "GOOD",
  storage: DBStorage,
  source: string,
  artifacts?: ImportResultCounter,
  weapons?: ImportResultCounter,
  characters?: ImportResultCounter,
}
function newCounter(): ImportResultCounter {
  return { total: 0, invalid: [], new: 0, updated: 0, unchanged: 0, removed: 0, }
}