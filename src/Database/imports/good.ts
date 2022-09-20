import { allCharacterKeys, CharacterKey } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { SandboxStorage } from "../DBStorage";
import { GOSource, IGO, IGOOD, ImportResult, newImportResult } from "../exim";
import { exportGOOD } from "../exports/good";
import { migrate } from "./migrate";

// MIGRATION STEP: Always keep parsing in sync with GOODv1 format

export function importGOOD(good: IGOOD, base: ArtCharDatabase, keepNotInImport: boolean, ignoreDups: boolean): ImportResult | undefined {
  switch (good.version) {
    case 1: return importGOOD1(good, base, keepNotInImport, ignoreDups)
  }
}

export function importAndMigrateGOOD(good: IGOOD & IGO): IGOOD & IGO {
  const storage = new SandboxStorage()
  const source = good.source

  good.dbVersion ? storage.setDBVersion(good.dbVersion) : storage.setDBVersion(8)
  if (good.characters) good.characters.forEach(c => c.key && storage.set(`char_${c.key}`, c));
  if (good.artifacts) good.artifacts.forEach((a, i) => storage.set(`artifact_${i}`, a))
  if (good.weapons) good.weapons.forEach((a, i) => storage.set(`weapon_${i}`, a))
  if (good.states) good.states.forEach(a => a.key && storage.set(`state_${a.key}`, a))
  if (good.buildSettings) good.buildSettings.forEach(a => a.key && storage.set(`buildSetting_${a.key}`, a))

  migrate(storage)
  good = exportGOOD(storage)
  good.source = source
  return good
}

/**
 * Parse GOODv1 data format into a parsed data of the version specified in `data`.
 * If the DB version is not specified, the default version is used.
 */
function importGOOD1(good: IGOOD, base: ArtCharDatabase, keepNotInImport: boolean, ignoreDups: boolean): ImportResult | undefined {
  good = importAndMigrateGOOD(good as IGOOD & IGO)
  const source = good.source ?? "Unknown"
  const result: ImportResult = newImportResult(source)

  result.characters.beforeMerge = base.chars.values.length
  result.weapons.beforeMerge = base.weapons.values.length
  result.artifacts.beforeMerge = base.arts.values.length

  const callback = (rkey: "artifacts" | "weapons" | "characters") => (key, reason, value) => result[rkey][reason].push(value)

  const charUnfollow = base.chars.followAny((key, reason, value) => {
    const arr = result.characters[reason]
    const ind = arr.findIndex(c => c?.key === key)
    if (ind < 0) arr.push(value)
    else arr[ind] = value
  })
  const artUnfollow = base.arts.followAny(callback("artifacts"))
  const weaponUnfollow = base.weapons.followAny(callback("weapons"))

  /* IMPORTANT: import data in characters, weapons, artifacts order. */
  // import characters
  const characters = good.characters
  if (characters?.length) {
    result.characters.import = characters.length
    const idsToRemove = new Set(base.chars.keys)
    characters.forEach(c => {
      if (!c.key) result.characters.invalid.push(c)
      idsToRemove.delete(c.key)
      if (base.chars.hasDup(c, source === GOSource))
        result.characters.unchanged.push(c)
      else base.chars.set(c.key, c)
    })

    const idtoRemoveArr = Array.from(idsToRemove)
    if (keepNotInImport || ignoreDups) result.characters.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => base.chars.remove(k))
    result.characters.unchanged = []
  } else result.characters.notInImport = base.chars.values.length

  // Match weapons for counter, metadata, and locations.
  const weapons = good.weapons
  if (weapons?.length) {
    result.weapons.import = weapons.length
    const idsToRemove = new Set(base.weapons.values.map(w => w.id))
    const hasEquipment = weapons.some(w => w.location)
    weapons.forEach(w => {
      const weapon = base.weapons.validate(w)
      if (!weapon) return result.weapons.invalid.push(w)
      let { duplicated, upgraded } = ignoreDups ? { duplicated: [], upgraded: [] } : base.weapons.findDup(weapon)
      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      if (duplicated[0] || upgraded[0]) {
        const match = duplicated[0] || upgraded[0]
        idsToRemove.delete(match.id)
        if (duplicated[0]) result.weapons.unchanged.push(weapon)
        else if (upgraded[0]) result.weapons.upgraded.push(weapon)
        base.weapons.set(match.id, { ...weapon, location: hasEquipment ? weapon.location : match.location })
      } else
        base.weapons.new(weapon)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (keepNotInImport || ignoreDups) result.weapons.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => base.weapons.remove(k))
  } else result.weapons.notInImport = base.weapons.values.length

  // Match artifacts for counter, metadata, and locations
  const artifacts = good.artifacts
  const importArtIds = new Map<string, string>()
  if (artifacts?.length) {
    result.artifacts.import = artifacts.length
    const idsToRemove = new Set(base.arts.values.map(a => a.id))
    const hasEquipment = artifacts.some(a => a.location)
    artifacts.forEach((a, i) => {
      const art = base.arts.validate(a)
      if (!art) return result.artifacts.invalid.push(a)
      let { duplicated, upgraded } = ignoreDups ? { duplicated: [], upgraded: [] } : base.arts.findDups(art)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      if (duplicated[0] || upgraded[0]) {
        const match = duplicated[0] || upgraded[0]
        idsToRemove.delete(match.id)
        if (duplicated[0]) result.artifacts.unchanged.push(art)
        else if (upgraded[0]) result.artifacts.upgraded.push(art)
        base.arts.set(match.id, { ...art, location: hasEquipment ? art.location : match.location })
        importArtIds.set(`artifact_${i}`, match.id)
      } else
        importArtIds.set(`artifact_${i}`, base.arts.new(art))
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (keepNotInImport || ignoreDups) result.artifacts.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => base.arts.remove(k))
  } else result.artifacts.notInImport = base.arts.values.length

  base.weapons.ensureEquipment()

  // stop listening to callbacks
  charUnfollow()
  artUnfollow()
  weaponUnfollow()

  // import extras
  const states = (good as unknown as IGO).states
  if (states) states.forEach(s => {
    const { key, ...rest } = s as any
    if (!key) return
    base.states.set(key, rest)
  })

  const buildSettings = (good as unknown as IGO).buildSettings
  if (buildSettings) buildSettings.forEach(b => {
    const { key, ...rest } = b
    if (!key || !allCharacterKeys.includes(key as CharacterKey)) return
    if (rest.builds) //preserve the old build ids
      rest.builds = rest.builds.map(build => build.map(i => importArtIds.get(i) ?? ""))

    base.buildSettings.set(key as CharacterKey, { ...rest })
  })
  return result
}
