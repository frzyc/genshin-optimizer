import { IArtifact, ICachedArtifact } from "../../Types/artifact";
import { ICharacter } from "../../Types/character";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { ImportResult } from "../exim";

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
export function merge(result: ImportResult, base: ArtCharDatabase) {
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
    artCounter.removed = [...idsToRemove].map(id => base._getArt(id)!)
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
    weaponCounter.removed = [...idsToRemove].map(id => base._getWeapon(id)!)
  } else
    base._getWeapons().forEach((x, i) => storage.set(`weapon_${i}`, x))

  if (charCounter) {
    const newCharEntries = storage.entries.filter(([k]) => k.startsWith("char_")).map(([key, value]) => [key.slice(5), JSON.parse(value) as ICharacter] as const)
    const newCharKeys = new Set(newCharEntries.map(([k]) => k))
    const oldCharKeys = new Set(base._getCharKeys() as string[])

    charCounter.updated = []
    charCounter.new = []

    const hasTeamData = newCharEntries.some(([_, char]) => char.team.some(x => x))

    for (const [key, char] of newCharEntries) {
      const match = base._getChar(key as any)
      if (match) {
        charCounter.updated.push(char)
      } else {
        charCounter.new.push(char)
        continue
      }

      for (const key in match)
        if (!(key in char))
          char[key] = match[key]
      if (!hasTeamData)
        char.team = match.team

      storage.set(`char_${key}`, char)
    }

    charCounter.removed = [...oldCharKeys].filter(([k]) => newCharKeys.has(k)).map(k => base._getChar(k as any)!)
    charCounter.unchanged = []
  } else
    base._getCharKeys().forEach(k => storage.set(`char_${k}`, base._getChar(k)))

  // Merge misc.
  const newKeys = new Set(storage.keys)
  for (const key of base.storage.keys)
    if (!newKeys.has(key) && !key.startsWith("artifact_") && !key.startsWith("weapon_") && !key.startsWith("char_"))
      storage.setString(key, base.storage.getString(key)!)
}
