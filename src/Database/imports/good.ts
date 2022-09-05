import { ArtCharDatabase } from "../Database";
import { IGOOD, ImportResult, newImportResult } from "../exim";

// MIGRATION STEP: Always keep parsing in sync with GOODv1 format

export function importGOOD(good: IGOOD, base: ArtCharDatabase, partial: boolean, disjoint: boolean): ImportResult | undefined {
  switch (good.version) {
    case 1: return importGOOD1(good, base, partial, disjoint)
  }
}

/**
 * Parse GOODv1 data format into a parsed data of the version specified in `data`.
 * If the DB version is not specified, the default version is used.
 */
function importGOOD1(good: IGOOD, base: ArtCharDatabase, partial: boolean, disjoint: boolean): ImportResult | undefined {
  const source = good.source ?? "Unknown"
  const result: ImportResult = newImportResult(source)
  const callback = (rkey: "artifacts" | "weapons" | "characters") => (key, reason, value) => result[rkey][reason].push(value)

  const charUnfollow = base.chars.followAny(callback("characters"))
  const artUnfollow = base.arts.followAny(callback("artifacts"))
  const weaponUnfollow = base.weapons.followAny(callback("weapons"))

  /* IMPORTANT: import data in characters, weapons, artifacts order. */
  // import characters
  const characters = good.characters
  if (characters) {
    result.characters.import = characters.length
    const idsToRemove = new Set(base.chars.keys)
    characters.forEach(c => {
      if (!c.key) result.characters.invalid.push(c)
      idsToRemove.delete(c.key)
      base.chars.set(c.key, c)
    })

    const idtoRemoveArr = Array.from(idsToRemove)
    if (partial || disjoint) result.characters.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => base.chars.remove(k))
    result.characters.unchanged = []
  } else result.characters.notInImport = base.chars.values.length

  // Match weapons for counter, metadata, and locations.
  const weapons = good.weapons
  if (weapons) {
    result.weapons.import = weapons.length
    const idsToRemove = new Set(base.weapons.values.map(w => w.id))
    weapons.forEach(w => {
      const weapon = base.weapons.validate(w)
      if (!weapon) return result.weapons.invalid.push(w)
      let { duplicated, upgraded } = disjoint ? { duplicated: [], upgraded: [] } : base.weapons.findDup(weapon)
      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      if (duplicated[0]) {
        const match = duplicated[0] || upgraded[0]
        idsToRemove.delete(match.id)
        if (duplicated[0] && duplicated[0].location === weapon.location)
          result.weapons.unchanged.push(weapon)
        else base.weapons.set(match.id, weapon)
      } else
        base.weapons.new(weapon)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (partial || disjoint) result.weapons.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => base.weapons.remove(k))
  } else result.weapons.notInImport = base.weapons.values.length

  // Match artifacts for counter, metadata, and locations
  const artifacts = good.artifacts
  if (artifacts) {
    result.artifacts.import = artifacts.length
    const idsToRemove = new Set(base.arts.values.map(a => a.id))
    artifacts.forEach(a => {
      const art = base.arts.validate(a)
      if (!art) return result.artifacts.invalid.push(a)
      let { duplicated, upgraded } = disjoint ? { duplicated: [], upgraded: [] } : base.arts.findDups(art)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      if (duplicated[0]) {
        const match = duplicated[0] || upgraded[0]
        idsToRemove.delete(match.id)
        if (duplicated[0] && duplicated[0].location === art.location)
          result.artifacts.unchanged.push(art)
        else base.arts.set(match.id, art)
      } else
        base.arts.new(art)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (partial || disjoint) result.artifacts.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => base.arts.remove(k))
  } else result.artifacts.notInImport = base.arts.values.length

  // stop listening to callbacks
  charUnfollow()
  artUnfollow()
  weaponUnfollow()

  // import extras
  const states = (result as any).states
  if (states) states.forEach(s => {
    const { key, ...rest } = s as any
    if (!key) return
    base.states.set(key, rest)
  })

  const buildSettings = (result as any).buildSettings
  if (buildSettings) buildSettings.forEach(b => {
    const { key, ...rest } = b as any
    if (!key) return
    // Do not import builds
    base.states.set(key, { ...rest, builds: [], buildDate: 0, })
  })
  return result
}
