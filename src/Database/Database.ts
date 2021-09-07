import { ICachedArtifact, IArtifact } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allSlotKeys, CharacterKey, SlotKey } from "../Types/consts";
import { deepClone, getRandomInt } from "../Util/Util";
import { DataManager } from "./DataManager";
import { migrate } from "./migration";
import { validateArtifact, parseCharacter, parseArtifact, removeArtifactCache, validateCharacter, removeCharacterCache, parseWeapon, validateWeapon, removeWeaponCache } from "./validation";
import { DBStorage, dbStorage } from "./DBStorage";
import { ICachedWeapon } from "../Types/weapon";
import { createContext } from "react";

export class ArtCharDatabase {
  storage: DBStorage
  arts = new DataManager<string, ICachedArtifact>()
  chars = new DataManager<CharacterKey, ICachedCharacter>()
  weapons = new DataManager<string, ICachedWeapon>()

  constructor(storage: DBStorage) {
    this.storage = storage
    this.reloadStorage()
  }

  /// Call this function when the underlying data changes without this instance's knowledge
  reloadStorage() {
    this.arts.removeAll()
    this.chars.removeAll()
    this.weapons.removeAll()
    const storage = this.storage
    const { migrated } = migrate(storage)

    // Load into memory and verify database integrity
    for (const key of storage.keys) {
      if (key.startsWith("char_")) {
        const flex = parseCharacter(storage.get(key), key)
        if (!flex) {
          // Non-recoverable
          storage.remove(key)
          continue
        }
        const character = validateCharacter(flex)
        // Use relations from artifact
        character.equippedArtifacts = Object.fromEntries(allSlotKeys.map(slot => [slot, ""])) as any

        this.chars.set(flex.characterKey, character)
        // Save migrated version back to db
        if (migrated) this.storage.set(`char_${flex.characterKey}`, flex)
      }
    }

    for (const key of storage.keys) {
      if (key.startsWith("artifact_")) {
        const flex = parseArtifact(storage.get(key))
        if (!flex) {
          // Non-recoverable
          storage.remove(key)
          continue
        }

        // Update relations
        const { location, slotKey } = flex
        if (location && this.chars.data[location]?.equippedArtifacts[slotKey] === "") {
          this.chars.data[location]!.equippedArtifacts[slotKey] = key // equiped on `location`
        } else flex.location = ""

        const { artifact } = validateArtifact(flex, key)

        this.arts.set(artifact.id, artifact)
        // Save migrated version back to db
        if (migrated) this.storage.set(key, flex)
      }
    }
    for (const key of storage.keys) {
      if (key.startsWith("weapon_")) {
        const flex = parseWeapon(storage.get(key))
        if (!flex) {
          // Non-recoverable
          storage.remove(key)
          continue
        }

        // Update relations
        const { location } = flex
        if (location && this.chars.data[location]?.equippedWeapon === "") {
          this.chars.data[location]!.equippedWeapon = key // equiped on `location`
        } else flex.location = ""

        const weapon = validateWeapon(flex, key)

        this.weapons.set(key, weapon)
        // Save migrated version back to db
        if (migrated) this.storage.set(key, flex)
      }
    }
  }

  private saveArt(key: string, art: ICachedArtifact) {
    this.storage.set(key, removeArtifactCache(art))
    this.arts.set(key, art)
  }
  private saveChar(key: CharacterKey, char: ICachedCharacter) {
    this.storage.set(`char_${key}`, removeCharacterCache(char))
    this.chars.set(key, char)
  }
  private saveWeapon(key: string, weapon: ICachedWeapon) {
    this.storage.set(key, removeWeaponCache(weapon))
    this.weapons.set(key, weapon)
  }
  // TODO: Make theses `_` functions private once we migrate to use `followXXX`,
  // or de-underscored it if we decide that these are to stay
  _getArt(key: string) { return this.arts.get(key) }
  _getChar(key: CharacterKey | "") { return key ? this.chars.get(key) : undefined }
  _getArts() { return this.arts.values }
  _getCharKeys(): CharacterKey[] { return this.chars.keys }
  _getWeapon(key: string) { return this.weapons.get(key) }

  followChar(key: CharacterKey, cb: Callback<ICachedCharacter>): (() => void) | undefined { return this.chars.follow(key, cb) }
  followArt(key: string, cb: Callback<ICachedArtifact>): (() => void) | undefined {
    if (this.arts.get(key) !== undefined)
      return this.arts.follow(key, cb)
    cb(undefined)
  }
  followWeapon(key: string, cb: Callback<ICachedWeapon>): (() => void) | undefined {
    if (this.weapons.get(key) !== undefined)
      return this.weapons.follow(key, cb)
    cb(undefined)
  }

  followAnyChar(cb: (key: CharacterKey | {}) => void): (() => void) | undefined { return this.chars.followAny(cb) }
  followAnyArt(cb: (key: string | {}) => void): (() => void) | undefined { return this.arts.followAny(cb) }
  followAnyWeapon(cb: (key: string | {}) => void): (() => void) | undefined { return this.weapons.followAny(cb) }

  /**
   * **Caution**: This does not update `equippedArtifacts`, use `equipArtifacts` instead
   * **Caution**: This does not update `equipedWeapon`, use `setWeaponLocation` instead
   */
  updateChar(value: ICachedCharacter): void {
    const newChar = deepClone(value), key = newChar.characterKey, oldChar = this.chars.get(key)

    if (oldChar) {
      newChar.equippedArtifacts = oldChar.equippedArtifacts
      newChar.equippedWeapon = oldChar.equippedWeapon
    } else {
      newChar.equippedArtifacts = Object.fromEntries(allSlotKeys.map(slot => ([slot, ""]))) as any
      newChar.equippedWeapon = ""
    }

    this.saveChar(key, newChar)
  }
  /**
   * **Caution** This does not update `location`, `exclude` and `lock`, use `setLocation` or `excludeArtifact` instead
   */
  updateArt(value: ICachedArtifact): string {
    const newArt = deepClone(value)
    const key = newArt.id || generateRandomArtID(new Set(Object.keys(this.arts.data)))
    const oldArt = this.arts.get(key)

    if (!newArt.id)
      newArt.id = key

    if (oldArt) {
      newArt.location = oldArt.location
      newArt.exclude = oldArt.exclude
      newArt.lock = oldArt.lock
    } else {
      newArt.location = ""
      newArt.exclude = false
      newArt.lock = false
    }

    this.saveArt(key, newArt)
    if (newArt.location)
      this.chars.set(newArt.location, deepClone(this.chars.get(newArt.location)!))
    return key
  }
  /**
   * **Caution** This does not update `location` use `setWeaponLocation` instead
   */
  updateWeapon(value: ICachedWeapon): string {
    const newWeapon = deepClone(value)
    const key = newWeapon.id || generateRandomWeaponID(new Set(Object.keys(this.weapons.data)))
    const oldWeapon = this.weapons.get(key)

    if (!newWeapon.id)
      newWeapon.id = key

    if (oldWeapon) {
      newWeapon.location = oldWeapon.location
    } else {
      newWeapon.location = ""
    }

    this.saveWeapon(key, newWeapon)
    if (newWeapon.location)
      this.chars.set(newWeapon.location, deepClone(this.chars.get(newWeapon.location)!))
    return key
  }
  removeChar(key: CharacterKey) {
    const char = this.chars.get(key)
    if (!char) return

    for (const artKey of Object.values(char.equippedArtifacts)) {
      if (!artKey) continue
      const art = this.arts.get(artKey)!
      art.location = ""
      this.saveArt(artKey, art)
    }
    this.storage.remove(`char_${key}`)
    this.chars.remove(key)
  }
  removeArt(key: string) {
    const art = this.arts.get(key)
    if (!art) return

    const charKey = art.location
    if (charKey) {
      const char = this.chars.get(charKey)!
      char.equippedArtifacts[art.slotKey] = ""
      this.saveChar(charKey, char)
    }
    this.storage.remove(key)
    this.arts.remove(key)
  }
  removeWeapon(key: string) {
    const weapon = this.weapons.get(key)
    if (!weapon) return
    const charKey = weapon.location
    if (charKey) {
      const char = this.chars.get(charKey)!
      char.equippedWeapon = ""
      this.saveChar(charKey, char)
    }
    this.storage.remove(key)
    this.weapons.remove(key)
  }
  setLocation(artKey: string, newCharKey: CharacterKey | "") {
    const newArt = deepClone(this.arts.get(artKey))
    if (!newArt) return

    const slot = newArt.slotKey, oldCharKey = newArt.location
    const newChar = newCharKey ? deepClone(this.chars.get(newCharKey))! : undefined
    const oldChar = oldCharKey ? deepClone(this.chars.get(oldCharKey))! : undefined
    newArt.location = newCharKey
    if (oldChar) oldChar.equippedArtifacts[slot] = ""

    if (newChar) {
      const oldArtKey = newChar?.equippedArtifacts[slot] ?? ""
      const oldArt = oldArtKey ? deepClone(this.arts.get(oldArtKey))! : undefined
      newChar.equippedArtifacts[slot] = newArt.id!

      if (oldChar && oldArt) {
        oldChar.equippedArtifacts[slot] = oldArt.id!
        oldArt.location = oldChar.characterKey
      } else if (oldArt) oldArt.location = ""

      if (oldArt) this.saveArt(oldArtKey, oldArt)
    }

    this.saveArt(artKey, newArt)
    if (newCharKey) this.saveChar(newCharKey, newChar!)
    if (oldCharKey) this.saveChar(oldCharKey, oldChar!)
  }
  setWeaponLocation(weaponId: string, newCharKey: CharacterKey) {
    const newWeapon = deepClone(this.weapons.get(weaponId))
    if (!newWeapon) return

    const oldCharKey = newWeapon.location
    const newChar = newCharKey ? deepClone(this.chars.get(newCharKey))! : undefined
    const oldChar = oldCharKey ? deepClone(this.chars.get(oldCharKey))! : undefined
    newWeapon.location = newCharKey
    if (oldChar) oldChar.equippedWeapon = ""//TODO when "unequipping an weapon from character, create a 1* weapon so character always have a weapon"

    if (newChar) {
      const oldWeaponId = newChar?.equippedWeapon ?? ""
      const oldWeapon = oldWeaponId ? deepClone(this.weapons.get(oldWeaponId))! : undefined
      newChar.equippedWeapon = newWeapon.id!

      if (oldChar && oldWeapon) {
        oldChar.equippedWeapon = oldWeapon.id!
        oldWeapon.location = oldChar.characterKey
      } else if (oldWeapon) oldWeapon.location = ""

      if (oldWeapon) this.saveWeapon(oldWeaponId, oldWeapon)
    }

    this.saveWeapon(weaponId, newWeapon)
    if (newCharKey) this.saveChar(newCharKey, newChar!)
    if (oldCharKey) this.saveChar(oldCharKey, oldChar!)
  }
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>) {
    const char = this.chars.get(charKey)
    if (!char) return

    const oldArts = char.equippedArtifacts
    for (const [slot, newArt] of Object.entries(newArts)) {
      if (newArt) this.setLocation(newArt, charKey)
      else if (oldArts[slot]) this.setLocation(oldArts[slot], "")
    }
  }
  excludeArtifact(key: string, exclude = true) {
    const art = this.arts.get(key)
    if (!art || art.exclude === exclude) return

    art.exclude = exclude
    this.saveArt(key, art)
  }

  findDuplicates(editorArt: IArtifact): { duplicated: string[], upgraded: string[] } {
    const { setKey, numStars, level, slotKey, mainStatKey, substats } = editorArt

    const candidates = this._getArts().filter(candidate =>
      setKey === candidate.setKey &&
      numStars === candidate.numStars &&
      slotKey === candidate.slotKey &&
      mainStatKey === candidate.mainStatKey &&
      level >= candidate.level &&
      substats.every((substat, i) =>
        !candidate.substats[i].key || // Candidate doesn't have anything on this slot
        (substat.key === candidate.substats[i].key && // Or editor simply has better substat
          substat.value >= candidate.substats[i].value)
      )
    )

    // Strictly upgraded artifact
    const upgraded = candidates.filter(candidate =>
      level > candidate.level &&
      (Math.floor(level / 4) === Math.floor(candidate.level / 4) ? // Check for extra rolls
        substats.every((substat, i) => // Has no extra roll
          substat.key === candidate.substats[i].key && substat.value === candidate.substats[i].value) :
        substats.some((substat, i) => // Has extra rolls
          candidate.substats[i].key ?
            substat.value > candidate.substats[i].value : // Extra roll to existing substat
            substat.key // Extra roll to new substat
        )
      )
    )
    // Strictly duplicated artifact
    const duplicated = candidates.filter(candidate =>
      level === candidate.level &&
      substats.every(substat =>
        !substat.key ||  // Empty slot
        candidate.substats.some(candidateSubstat =>
          substat.key === candidateSubstat.key && // Or same slot
          substat.value === candidateSubstat.value
        )))

    return { duplicated: duplicated.map(({ id }) => id), upgraded: upgraded.map(({ id }) => id) }
  }
}

/// Get a random integer (converted to string) that is not in `keys`
function generateRandomArtID(keys: Set<string>): string {
  let candidate = ""
  do {
    candidate = `artifact_${getRandomInt(1, 2 * (keys.size + 1))}`
  } while (keys.has(candidate))
  return candidate
}

/// Get a random integer (converted to string) that is not in `keys`
function generateRandomWeaponID(keys: Set<string>): string {
  let candidate = ""
  do {
    candidate = `weapon_${getRandomInt(1, 2 * (keys.size + 1))}`
  } while (keys.has(candidate))
  return candidate
}

type Callback<Arg> = (arg: Arg | undefined) => void

export const database = new ArtCharDatabase(dbStorage)
export const DatabaseContext = createContext(database)
