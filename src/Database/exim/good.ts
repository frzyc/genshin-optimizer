import { IArtifact, ICachedArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { DBStorage, SandboxStorage } from "../DBStorage";
import { currentDBVersion, migrate } from "../migration";
import { setDBVersion } from "../utils";
import { parseArtifact, parseCharacter, parseWeapon } from "../validation";

const GOSource = "Genshin Optimizer" as const

export function importGOOD(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  switch (data.version) {
    case 1: return importGOOD1(data, oldDatabase)
  }
}

function importGOOD1(data: IGOOD, oldDatabase: ArtCharDatabase): ImportResult | undefined {
  const source = data.source, storage = new SandboxStorage()
  const result: ImportResult = { type: "GOOD", storage, source }

  if (data.artifacts) {
    const counter = newCounter()
    counter.total = data.artifacts.length
    result.artifacts = counter

    data.artifacts.forEach((a, i) => {
      const parsed = parseArtifact(a)
      if (!parsed) counter.invalid.push(a)
      else storage.set(`artifact_${i}`, a)
    })
  }
  if (data.weapons) {
    const counter = newCounter()
    counter.total = data.weapons!.length
    result.weapons = counter

    data.weapons.forEach((w, i) => {
      const parsed = parseWeapon(w)
      if (!parsed) counter.invalid.push(w)
      else storage.set(`weapon_${i}`, w)
      return parsed ? [parsed] : []
    })

    result.weapons = counter
  }
  if (data.characters) {
    const counter = newCounter()
    counter.total = data.characters.length
    result.characters = counter

    data.characters.forEach(c => {
      const parsed = parseCharacter(c)
      if (!parsed) counter.invalid.push(c)

      // We invalidate build results here because we need to do
      // it regardless of whether the file has character/art data.
      if (c.buildSettings) {
        c.buildSettings.builds = []
        c.buildSettings.buildDate = 0
      }

      storage.set(`char_${c.key}`, c);
    })
  }
  if (source === GOSource) {
    const { dbVersion, states } = data as unknown as IGO
    if (dbVersion < 8) return // Something doesn't look right here
    setDBVersion(storage, dbVersion)
    states && states.forEach(s => {
      const { key, ...state } = s as any
      if (!key) return
      storage.set(`state_${key}`, state)
    });
  } else {
    // DO NOT CHANGE THE DB VERSION
    // Update this ONLY when it has been verified that base GOODv1 is a valid GO
    // of that particular version. Any missing/extra keys could crash the system.
    setDBVersion(storage, 8)
  }

  migrate(storage)
  mergeImport(result, oldDatabase)
  return result
}

function mergeImport(result: ImportResult, base: ArtCharDatabase) {
  const { artifacts: artCounter, weapons: weaponCounter, characters: charCounter, storage } = result

  // Match artifacts for counter, metadata, and locations
  if (artCounter) {
    const arts = storage.entries.filter(([k]) => k.startsWith("artifact_")).map(([key, v]) => [key, JSON.parse(v) as IArtifact] as const)
    const idsToRemove = new Set(base._getArts().map(a => a.id))
    const hasLocations = arts.some(a => a[1].location)

    for (const [key, art] of arts) {
      let { duplicated, upgraded } = base.findDuplicates(art)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      // Prefer dups over upgrades
      const match: ICachedArtifact | undefined = duplicated[0] ?? upgraded[0]
      if (match) {
        idsToRemove.delete(match.id)
        for (const key in match) {
          if (!(key in art) && key !== "location")
            art[key] = match[key]
        }
        if (!hasLocations)
          art.location = match.location
      }

      if (duplicated.length) artCounter.unchanged.push(art)
      else if (upgraded.length) artCounter.updated.push(art)
      else artCounter.new.push(art)
      storage.set(key, art)
    }
    artCounter.removed = [...idsToRemove].map(id => base._getArt(id))
  } else
    base._getArts().forEach((x, i) => storage.set(`artifact_${i}`, x))

  // Match weapons for counter, metadata, and locations
  if (weaponCounter) {
    const weapons = storage.entries.filter(([k]) => k.startsWith("weapon_")).map(([key, v]) => [key, JSON.parse(v) as IWeapon] as const)
    const idsToRemove = new Set(base._getWeapons().map(w => w.id))
    const hasLocations = weapons.some(weapon => weapon[1].location)

    for (const [key, weapon] of weapons) {
      let { duplicated, upgraded } = base.findDuplicateWeapons(weapon)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(w => idsToRemove.has(w.id))
      upgraded = upgraded.filter(w => idsToRemove.has(w.id))

      // Prefer dups over upgrades
      const match = (duplicated[0] ?? upgraded[0]) as ICachedWeapon | undefined
      if (match) {
        idsToRemove.delete(match.id)
        for (const key in match) {
          if (!(key in weapon) && key !== "location")
            weapon[key] = match[key]
        }
        if (!hasLocations)
          weapon.location = match.location
      }

      if (duplicated.length) weaponCounter.unchanged.push(weapon)
      else if (upgraded.length) weaponCounter.updated.push(weapon)
      else weaponCounter.new.push(weapon)
      storage.set(key, weapon)
    }
    weaponCounter.removed = [...idsToRemove].map(id => base._getWeapon(id))
  } else
    base._getWeapons().forEach((x, i) => storage.set(`weapon_${i}`, x))

  if (charCounter) {
    const newChars = storage.entries.filter(([k]) => k.startsWith("character_")).map(([key, value]) => [key.slice(5), JSON.parse(value) as ICharacter] as const)
    const newCharKeys = new Set(newChars.map(([k]) => k))
    const oldCharKeys = new Set(base._getCharKeys() as string[])

    charCounter.updated = [...newChars].filter(([k]) => oldCharKeys.has(k))
    charCounter.removed = [...oldCharKeys].filter(([k]) => newCharKeys.has(k)).map(k => base._getChar(k as any))
    charCounter.new = [...newChars].filter(([k]) => !oldCharKeys.has(k))
    charCounter.unchanged = []
  } else
    base._getCharKeys().forEach(k => storage.set(`char_${k}`, base._getChar(k)))
}

export function exportGOOD(storage: DBStorage): IGOOD & IGO {
  return {
    format: "GOOD",
    dbVersion: currentDBVersion,
    source: GOSource,
    version: 1,
    characters: storage.entries
      .filter(([key]) => key.startsWith("char_"))
      .map(([_, value]) => {
        // Invalidate build results since we won't use it on imports either
        const result = JSON.parse(value)
        if (result.buildSettings) {
          result.buildSettings.builds = []
          result.buildSettings.buildDate = 0
        }
        return result
      }),
    artifacts: storage.entries
      .filter(([key]) => key.startsWith("artifact_"))
      .map(([_, value]) => JSON.parse(value)),
    weapons: storage.entries
      .filter(([key]) => key.startsWith("weapon_"))
      .map(([_, value]) => JSON.parse(value)),

    states: storage.entries
      .filter(([key]) => key.startsWith("state_"))
      .map(([key, value]) => ({ ...JSON.parse(value), key: key.split("state_")[1] })),
  }
}

export type IGOOD = {
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
  states?: object[]
}

export type ImportResultCounter = {
  total: number, // total # in file
  new: any[],
  updated: any[], // Use new object
  unchanged: any[], // Use new object
  removed: any[],
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
  return { total: 0, invalid: [], new: [], updated: [], unchanged: [], removed: [], }
}
