import { CharacterKey } from "pipeline";
import { initialCharacter } from "../../ReactHooks/useCharSelectionCallback";
import { ArtCharDatabase } from "../Database";
import { GOSource, ImportResult } from "../exim";

/**
 * Merge the parsed storage (`result`) of the current DB version with existing
 * database (`base`) to create a new (parsed) storage. If the data for art/char/weapon
 * exists in `result`, it will be merged with `base` on best-effort basis. The
 * information in `result` takes precedence when the data exists in both locations.
 *
 * `result` must be using the latest DB format, i.e., it must already be `migrate`d.
 *
 * TODO:
 * This can be easily extended to include options whether to merge
 * each category (art/char/weapon) or to force the `result` data or `base` data.
 */
export function merge(result: ImportResult, base: ArtCharDatabase, partial: boolean, disjoint: boolean) {
  const { source, artifacts: artCounter, weapons: weaponCounter, characters: charCounter, extra } = result

  if (charCounter.import.length) {
    const idsToRemove = new Set(base.chars.keys)
    charCounter.import.forEach(char => {
      const match = base.chars.get(char.key)
      if (match) {
        idsToRemove.delete(match.key)
        charCounter.updated.push(char)
        if (source === GOSource) {
          base.chars.set(char.key, char)
        } else {//doenst have valid GO-specific metadata
          const { key, level, constellation, ascension, talent, ...matchRest } = match
          base.chars.set(key, { ...char, ...matchRest })
        }
      } else {
        charCounter.new.push(char)
        base.chars.set(char.key, char)
      }
    })

    const idtoRemoveArr = Array.from(idsToRemove)
    if (partial || disjoint) charCounter.notInImport = idtoRemoveArr.length
    else charCounter.removed = idtoRemoveArr.map(k => {
      const char = base.chars.get(k)!
      base.chars.remove(k)
      return char
    })
    charCounter.unchanged = []
  } else charCounter.notInImport = base.chars.values.length
  const migrateLocation = (matchId: string, location: CharacterKey) => {
    if (!base.chars.get(location)) {
      const char = initialCharacter(location)
      base.chars.set(location, char)
      charCounter.new.push(char)
    }
  }
  // Match artifacts for counter, metadata, and locations
  if (artCounter.import.length) {
    const idsToRemove = new Set(base.arts.values.map(a => a.id))
    const hasLocations = artCounter.import.some(a => a.location)
    artCounter.import.forEach(art => {
      let { duplicated, upgraded } = disjoint ? { duplicated: [], upgraded: [] } : base.arts.findDups(art)

      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      if (duplicated[0] || upgraded[0]) {
        const match = duplicated[0] || upgraded[0]
        idsToRemove.delete(match.id)
        hasLocations && art.location && migrateLocation(match.id, art.location)
        art.location && base.arts.set(match.id, { location: art.location })
        duplicated[0] ? artCounter.unchanged.push(art) : artCounter.updated.push(art)
      } else {
        const id = base.arts.new({ ...art, location: "" })
        art.location && migrateLocation(id, art.location)
        art.location && base.arts.set(id, { location: art.location })
        artCounter.new.push(art)
      }
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (partial || disjoint) artCounter.notInImport = idtoRemoveArr.length
    else artCounter.removed = idtoRemoveArr.map(k => {
      const a = base.arts.get(k)!
      base.arts.remove(k)
      return a
    })
  } else artCounter.notInImport = base.arts.values.length

  // Match weapons for counter, metadata, and locations
  if (weaponCounter.import.length) {
    const idsToRemove = new Set(base.weapons.values.map(w => w.id))
    const hasLocations = weaponCounter.import.some(weapon => weapon.location)
    weaponCounter.import.forEach(weapon => {
      let { duplicated, upgraded } = disjoint ? { duplicated: [], upgraded: [] } : base.weapons.findDup(weapon)
      // Don't reuse dups/upgrades
      duplicated = duplicated.filter(a => idsToRemove.has(a.id))
      upgraded = upgraded.filter(a => idsToRemove.has(a.id))

      if (duplicated[0] || upgraded[0]) {
        const match = duplicated[0] || upgraded[0]
        idsToRemove.delete(match.id)
        hasLocations && weapon.location && migrateLocation(match.id, weapon.location)
        weapon.location && base.weapons.set(match.id, { location: weapon.location })
        duplicated[0] ? weaponCounter.unchanged.push(weapon) : weaponCounter.updated.push(weapon)
      } else {
        const id = base.weapons.new({ ...weapon, location: "" })
        weapon.location && migrateLocation(id, weapon.location)
        weapon.location && base.weapons.set(id, { location: weapon.location })
        weaponCounter.new.push(weapon)
      }
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (partial || disjoint) weaponCounter.notInImport = idtoRemoveArr.length
    else weaponCounter.removed = idtoRemoveArr.map(k => {
      const a = base.weapons.get(k)!
      base.weapons.remove(k)
      return a
    })
  } else weaponCounter.notInImport = base.weapons.values.length

  //ensure equipment is still good
  weaponCounter.new.push(...base.weapons.ensureEquipment())

  artCounter.dbTotal = base.arts.values.length
  weaponCounter.dbTotal = base.weapons.values.length
  charCounter.dbTotal = base.chars.values.length

  // import extras
  if (extra) {
    const { states, buildSettings } = extra
    states.forEach(s => {
      const { key, ...rest } = s as any
      if (!key) return
      base.states.set(key, rest)
    })
    buildSettings.forEach(b => {
      const { key, ...rest } = b as any
      if (!key) return
      // Do not import builds
      base.states.set(key, { ...rest, builds: [], buildDate: 0, })
    })
  }
  return base
}
