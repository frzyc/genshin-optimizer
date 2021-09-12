import { ICachedArtifact, IArtifact } from "../Types/artifact";
import { ICachedCharacter, ICharacter } from "../Types/character";
import { allSlotKeys, CharacterKey, SlotKey } from "../Types/consts";
import { deepClone, getRandomInt } from "../Util/Util";
import { DataManager } from "./DataManager";
import { migrate } from "./migration";
import { validateArtifact, parseCharacter, parseArtifact, removeArtifactCache, validateCharacter, removeCharacterCache, parseWeapon, validateWeapon, removeWeaponCache } from "./validation";
import { DBStorage, dbStorage } from "./DBStorage";
import { ICachedWeapon, IWeapon } from "../Types/weapon";
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
    const cause = "reload"
    this.arts.removeAll(cause)
    this.chars.removeAll(cause)
    this.weapons.removeAll(cause)
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

        this.chars.set(flex.key, character, cause)
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

        this.arts.set(artifact.id, artifact, cause)
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

        this.weapons.set(key, weapon, cause)
        // Save migrated version back to db
        if (migrated) this.storage.set(key, flex)
      }
    }
    for (const [charKey, char] of Object.entries(this.chars.data)) {
      if (!char.equippedWeapon)
        this.removeChar(charKey, cause) // Remove characters w/o weapons
    }
  }

  private saveArt(key: string, art: ICachedArtifact, cause: string) {
    this.storage.set(key, removeArtifactCache(art))
    this.arts.set(key, art, cause)
  }
  private saveChar(key: CharacterKey, char: ICachedCharacter, cause: string) {
    this.storage.set(`char_${key}`, removeCharacterCache(char))
    this.chars.set(key, char, cause)
  }
  private saveWeapon(key: string, weapon: ICachedWeapon, cause: string) {
    this.storage.set(key, removeWeaponCache(weapon))
    this.weapons.set(key, weapon, cause)
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
    cb(undefined, "n/a")
  }
  followWeapon(key: string, cb: Callback<ICachedWeapon>): (() => void) | undefined {
    if (this.weapons.get(key) !== undefined)
      return this.weapons.follow(key, cb)
    cb(undefined, "n/a")
  }

  followAnyChar(cb: (key: CharacterKey | {}, cause: string) => void): (() => void) | undefined { return this.chars.followAny(cb) }
  followAnyArt(cb: (key: string | {}, cause: string) => void): (() => void) | undefined { return this.arts.followAny(cb) }
  followAnyWeapon(cb: (key: string | {}, cause: string) => void): (() => void) | undefined { return this.weapons.followAny(cb) }

  /**
   * **Caution**: This does not update `equippedArtifacts`, use `equipArtifacts` instead
   * **Caution**: This does not update `equipedWeapon`, use `setWeaponLocation` instead
   */
  updateChar(value: Partial<ICharacter>, cause: string = "update char"): void {
    const key = value.key!
    const oldChar = this._getChar(key)
    const parsedChar = parseCharacter({ ...oldChar, ...(value as ICharacter) }, `char_${key}`)
    if (!parsedChar) return

    const newChar = validateCharacter({ ...oldChar, ...parsedChar })
    this.saveChar(key, newChar, cause)
  }

  /**
   * **Caution** This does not update `location`, use `setLocation` instead
   */
  updateArt(value: Partial<IArtifact>, id: string, cause: string = "update art") {
    const oldArt = this.arts.get(id)
    const parsedArt = parseArtifact({ ...oldArt, ...(value as IArtifact) })
    if (!parsedArt) return

    const newArt = validateArtifact({ ...oldArt, ...parsedArt }, id).artifact
    this.saveArt(id, newArt, cause)
    if (newArt.location)
      this.chars.set(newArt.location, deepClone(this.chars.get(newArt.location)!), cause)
  }
  /**
   * **Caution** This does not update `location` use `setWeaponLocation` instead
   */
  updateWeapon(value: Partial<IWeapon>, id: string, cause: string = "update weapon") {
    const oldWeapon = this.weapons.get(id)
    const parsedWeapon = parseWeapon({ ...oldWeapon, ...(value as IWeapon) })
    if (!parsedWeapon) return

    const newWeapon = validateWeapon({ ...oldWeapon, ...parsedWeapon }, id)
    this.saveWeapon(id, newWeapon, cause)
    if (newWeapon.location)
      this.chars.set(newWeapon.location, deepClone(this.chars.get(newWeapon.location)!), cause)
  }

  createArt(value: IArtifact, cause: string = "create"): string {
    const id = generateRandomArtID(new Set(this.arts.keys))
    const newArt = validateArtifact(parseArtifact({ ...value, location: "" })!, id).artifact
    this.saveArt(id, newArt, cause)
    return id
  }
  createWeapon(value: IWeapon, cause: string = "create"): string {
    const id = generateRandomWeaponID(new Set(this.weapons.keys))
    const newWeapon = validateWeapon(parseWeapon({ ...value, location: "" })!, id)
    this.saveWeapon(id, newWeapon, cause)
    return id
  }

  removeChar(key: CharacterKey, cause: string = "remove") {
    const char = this.chars.get(key)
    if (!char) return

    for (const artKey of Object.values(char.equippedArtifacts)) {
      const art = this.arts.get(artKey)
      if (art && art.location === key) {
        art.location = ""
        this.saveArt(artKey, art, cause)
      }
    }
    const weapon = this.weapons.get(char.equippedWeapon)
    if (weapon && weapon.location === key) {
      weapon.location = ""
      this.saveWeapon(char.equippedWeapon, weapon, cause)
    }

    this.storage.remove(`char_${key}`)
    this.chars.remove(key, "remove")
  }
  removeArt(key: string, cause: string = "remove") {
    const art = this.arts.get(key)
    if (!art) return

    const char = art.location && this.chars.get(art.location)
    if (char && char.equippedArtifacts[art.slotKey] === key) {
      char.equippedArtifacts[art.slotKey] = ""
      this.saveChar(char.key, char, cause)
    }
    this.storage.remove(key)
    this.arts.remove(key, "remove")
  }
  removeWeapon(key: string, cause: string = "remove") {
    const weapon = this.weapons.get(key)
    if (!weapon || weapon.location)
      return // Can't delete equipped weapon here

    this.storage.remove(key)
    this.weapons.remove(key, cause)
  }
  setArtLocation(artKey: string, newCharKey: CharacterKey | "", cause: string = "relocate art") {
    const art1 = this.arts.get(artKey)
    if (!art1 || art1.location === newCharKey) return

    const slotKey = art1.slotKey
    const char1 = this.chars.get(newCharKey)
    const art2 = this.arts.get(char1?.equippedArtifacts[slotKey])
    const char2 = this.chars.get(art1.location)

    // Currently art1 <-> char2 & art2 <-> char1
    // Swap to art1 <-> char1 & art2 <-> char2

    this.saveArt(art1.id, { ...art1, location: char1?.key ?? "" }, cause)
    if (art2)
      this.saveArt(art2.id, { ...art2, location: char2?.key ?? "" }, cause)
    if (char1)
      this.saveChar(char1.key, { ...char1, equippedArtifacts: { ...char1.equippedArtifacts, [slotKey]: art1.id } }, cause)
    if (char2)
      this.saveChar(char2.key, { ...char2, equippedArtifacts: { ...char2.equippedArtifacts, [slotKey]: art2?.id ?? "" } }, cause)
  }
  setWeaponLocation(weaponId: string, newCharKey: CharacterKey, cause: string = "relocate weapon") {
    const weapon1 = this.weapons.get(weaponId)
    const char1 = this.chars.get(newCharKey)
    if (!weapon1 || !char1 || weapon1.location === newCharKey) return

    const weapon2 = this.weapons.get(char1.equippedWeapon)!
    const char2 = this.chars.get(weapon1.location)

    // Currently weapon1 <-> char2 & weapon2 <-> char1
    // Swap to weapon1 <-> char1 & weapon2 <-> char2

    this.saveWeapon(weapon1.id, { ...weapon1, location: char1.key }, cause)
    this.saveChar(char1.key, { ...char1, equippedWeapon: weapon1.id }, cause)

    if (weapon2)
      this.saveWeapon(weapon2.id, { ...weapon2, location: char2?.key ?? "" }, cause)
    if (char2)
      this.saveChar(char2.key, { ...char2, equippedWeapon: weapon2.id }, cause)
  }
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>, cause: string = "equip art") {
    const char = this.chars.get(charKey)
    if (!char) return

    const oldArts = char.equippedArtifacts
    for (const [slot, newArt] of Object.entries(newArts)) {
      if (newArt) this.setArtLocation(newArt, charKey, cause)
      else if (oldArts[slot]) this.setArtLocation(oldArts[slot], "", cause)
    }
  }

  findDuplicates(editorArt: IArtifact): { duplicated: string[], upgraded: string[] } {
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

type Callback<Arg> = (arg: Arg | undefined, cause: string) => void

export const database = new ArtCharDatabase(dbStorage)
export const DatabaseContext = createContext(database)
