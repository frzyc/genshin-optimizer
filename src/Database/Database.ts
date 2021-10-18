import { ICachedArtifact, IArtifact } from "../Types/artifact";
import { ICachedCharacter, ICharacter } from "../Types/character";
import { allSlotKeys, CharacterKey, SlotKey } from "../Types/consts";
import { getRandomInt, objectFromKeyMap } from "../Util/Util";
import { DataManager } from "./DataManager";
import { migrate } from "./migration";
import { validateArtifact, parseCharacter, parseArtifact, removeArtifactCache, validateCharacter, removeCharacterCache, parseWeapon, validateWeapon, removeWeaponCache } from "./validation";
import { DBStorage, dbStorage } from "./DBStorage";
import { ICachedWeapon, IWeapon } from "../Types/weapon";
import { createContext } from "react";
import { defaultInitialWeapon } from "../Weapon/WeaponUtil";

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
        const flex = parseCharacter(storage.get(key))
        if (!flex || key !== `char_${flex.key}`) {
          // Non-recoverable
          storage.remove(key)
          continue
        }
        const character = validateCharacter(flex)
        // Use relations from artifact
        character.equippedArtifacts = objectFromKeyMap(allSlotKeys, () => "")

        this.chars.set(flex.key, character)
        // Save migrated version back to db
        if (migrated) this.storage.set(`char_${flex.key}`, flex)
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
        if (this.chars.data[location] && this.chars.data[location]?.equippedArtifacts[slotKey] === "") {
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
        if (this.chars.data[location] && this.chars.data[location]?.equippedWeapon === "") {
          this.chars.data[location]!.equippedWeapon = key // equiped on `location`
        } else flex.location = ""

        const weapon = validateWeapon(flex, key)

        this.weapons.set(key, weapon)
        // Save migrated version back to db
        if (migrated) this.storage.set(key, flex)
      }
    }
    const weaponIds = new Set(this.weapons.keys)
    for (const [charKey, char] of Object.entries(this.chars.data)) {
      if (!char.equippedWeapon) {
        // A default "sword" should work well enough for this case.
        // We'd have to pull the hefty character sheet otherwise.
        const weapon = defaultInitialWeapon("sword")
        const weaponId = generateRandomWeaponID(weaponIds)
        weapon.location = charKey
        char.equippedWeapon = weaponId

        weaponIds.add(weaponId)
        this.weapons.set(weaponId, weapon)
        this.storage.set(weaponId, removeWeaponCache(weapon))
        // No need to set anything on character side.
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
  // or de-underscore it if we decide that these are to stay
  _getArt(key: string) { return this.arts.get(key) }
  _getChar(key: CharacterKey | "") { return key ? this.chars.get(key) : undefined }
  _getArts() { return this.arts.values }
  _getCharKeys(): CharacterKey[] { return this.chars.keys }
  _getWeapon(key: string) { return this.weapons.get(key) }
  _getWeapons() { return this.weapons.values }

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
  updateChar(value: Partial<ICharacter>): void {
    const key = value.key!
    const oldChar = this._getChar(key)
    const parsedChar = parseCharacter({ ...oldChar, ...value })
    if (!parsedChar) return

    const newChar = validateCharacter({ ...oldChar, ...parsedChar })
    if (oldChar) {
      newChar.equippedArtifacts = oldChar.equippedArtifacts
      newChar.equippedWeapon = oldChar.equippedWeapon
    }
    this.saveChar(key, newChar)
  }

  /**
   * **Caution** This does not update `location`, use `setLocation` instead
   */
  updateArt(value: Partial<IArtifact>, id: string) {
    const oldArt = this.arts.get(id)
    const parsedArt = parseArtifact({ ...oldArt, ...value })
    if (!parsedArt) return

    const newArt = validateArtifact({ ...oldArt, ...parsedArt }, id).artifact
    if (oldArt) {
      newArt.location = oldArt.location
    }
    this.saveArt(id, newArt)
    if (newArt.location)
      this.arts.trigger(newArt.location)
  }
  /**
   * **Caution** This does not update `location` use `setWeaponLocation` instead
   */
  updateWeapon(value: Partial<IWeapon>, id: string) {
    const oldWeapon = this.weapons.get(id)
    const parsedWeapon = parseWeapon({ ...oldWeapon, ...value })
    if (!parsedWeapon) return

    const newWeapon = validateWeapon({ ...oldWeapon, ...parsedWeapon }, id)
    this.saveWeapon(id, newWeapon)
    if (newWeapon.location)
      this.chars.trigger(newWeapon.location)
  }

  createArt(value: IArtifact): string {
    const id = generateRandomArtID(new Set(this.arts.keys))
    const newArt = validateArtifact(parseArtifact({ ...value, location: "" })!, id).artifact
    this.saveArt(id, newArt)
    return id
  }
  createWeapon(value: IWeapon): string {
    const id = generateRandomWeaponID(new Set(this.weapons.keys))
    const newWeapon = validateWeapon(parseWeapon({ ...value, location: "" })!, id)
    this.saveWeapon(id, newWeapon)
    return id
  }

  removeChar(key: CharacterKey) {
    const char = this.chars.get(key)
    if (!char) return

    for (const artKey of Object.values(char.equippedArtifacts)) {
      const art = this.arts.get(artKey)
      if (art && art.location === key) {
        art.location = ""
        this.saveArt(artKey, art)
      }
    }
    const weapon = this.weapons.get(char.equippedWeapon)
    if (weapon && weapon.location === key) {
      weapon.location = ""
      this.saveWeapon(char.equippedWeapon, weapon)
    }

    this.storage.remove(`char_${key}`)
    this.chars.remove(key)
  }
  removeArt(key: string) {
    const art = this.arts.get(key)
    if (!art) return

    const char = art.location && this.chars.get(art.location)
    if (char && char.equippedArtifacts[art.slotKey] === key) {
      char.equippedArtifacts[art.slotKey] = ""
      this.saveChar(char.key, char)
    }
    this.storage.remove(key)
    this.arts.remove(key)
  }
  removeWeapon(key: string) {
    const weapon = this.weapons.get(key)
    if (!weapon || weapon.location)
      return // Can't delete equipped weapon here

    this.storage.remove(key)
    this.weapons.remove(key)
  }
  setArtLocation(artKey: string, newCharKey: CharacterKey | "") {
    const art1 = this.arts.get(artKey)
    if (!art1 || art1.location === newCharKey) return

    const slotKey = art1.slotKey
    const char1 = this.chars.get(newCharKey)
    const art2 = this.arts.get(char1?.equippedArtifacts[slotKey])
    const char2 = this.chars.get(art1.location)

    // Currently art1 <-> char2 & art2 <-> char1
    // Swap to art1 <-> char1 & art2 <-> char2

    this.saveArt(art1.id, { ...art1, location: char1?.key ?? "" })
    if (art2)
      this.saveArt(art2.id, { ...art2, location: char2?.key ?? "" })
    if (char1)
      this.saveChar(char1.key, { ...char1, equippedArtifacts: { ...char1.equippedArtifacts, [slotKey]: art1.id } })
    if (char2)
      this.saveChar(char2.key, { ...char2, equippedArtifacts: { ...char2.equippedArtifacts, [slotKey]: art2?.id ?? "" } })
  }
  setWeaponLocation(weaponId: string, newCharKey: CharacterKey | "") {
    const weapon1 = this.weapons.get(weaponId)
    const char1 = this.chars.get(newCharKey)
    if (!weapon1 || !char1 || weapon1.location === newCharKey) return

    const weapon2 = this.weapons.get(char1.equippedWeapon)!
    const char2 = this.chars.get(weapon1.location)

    // Currently weapon1 <-> char2 & weapon2 <-> char1
    // Swap to weapon1 <-> char1 & weapon2 <-> char2

    this.saveWeapon(weapon1.id, { ...weapon1, location: char1.key })
    this.saveChar(char1.key, { ...char1, equippedWeapon: weapon1.id })

    if (weapon2)
      this.saveWeapon(weapon2.id, { ...weapon2, location: char2?.key ?? "" })
    if (char2)
      this.saveChar(char2.key, { ...char2, equippedWeapon: weapon2.id })
  }
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>) {
    const char = this.chars.get(charKey)
    if (!char) return

    const oldArts = char.equippedArtifacts
    for (const [slot, newArt] of Object.entries(newArts)) {
      if (newArt) this.setArtLocation(newArt, charKey)
      else if (oldArts[slot]) this.setArtLocation(oldArts[slot], "")
    }
  }

  findDuplicates(editorArt: IArtifact): { duplicated: ICachedArtifact[], upgraded: ICachedArtifact[] } {
    const { setKey, rarity, level, slotKey, mainStatKey, substats } = editorArt

    const candidates = this._getArts().filter(candidate =>
      setKey === candidate.setKey &&
      rarity === candidate.rarity &&
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
    return { duplicated, upgraded }
  }

  findDuplicateWeapons(weapon: IWeapon): { duplicated: ICachedWeapon[], upgraded: ICachedWeapon[] } {
    const { key, level, ascension, refinement } = weapon

    const candidates = this._getWeapons().filter(candidate =>
      key === candidate.key &&
      level >= candidate.level &&
      ascension >= candidate.ascension &&
      refinement >= candidate.refinement
    )

    // Strictly upgraded weapons
    const upgraded = candidates.filter(candidate =>
      level > candidate.level ||
      ascension > candidate.ascension ||
      refinement > candidate.refinement
    )
    // Strictly duplicated weapons
    const duplicated = candidates.filter(candidate =>
      level === candidate.level &&
      ascension === candidate.ascension &&
      refinement === candidate.refinement
    )
    return { duplicated, upgraded }
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
