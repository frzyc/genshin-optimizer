import { IArtifact, IFlexArtifact } from "../Types/artifact";
import { ICharacter } from "../Types/character";
import { allSlotKeys, CharacterKey, SlotKey } from "../Types/consts";
import { deepClone, getRandomInt } from "../Util/Util";
import { DataManager } from "./DataManager";
import { migrate } from "./migration";
import { validateFlexArtifact, validateDBCharacter, validateDBArtifact, extractFlexArtifact, validateFlexCharacter, extractFlexCharacter } from "./validation";
import { DBStorage, dbStorage } from "./DBStorage";

export class ArtCharDatabase {
  storage: DBStorage
  arts = new DataManager<string, IArtifact>()
  chars = new DataManager<CharacterKey, ICharacter>()

  constructor(storage: DBStorage) {
    this.storage = storage
    this.reloadStorage()
  }

  /// Call this function when the underlying data changes without this instance's knowledge
  reloadStorage() {
    this.arts.removeAll()
    this.chars.removeAll()
    const storage = this.storage
    const { migrated } = migrate(storage)

    // Load into memory and verify database integrity
    for (const key of storage.keys) {
      if (key.startsWith("char_")) {
        const flex = validateDBCharacter(storage.get(key), key)
        if (!flex) {
          // Non-recoverable
          storage.remove(key)
          continue
        }
        const character = validateFlexCharacter(flex)
        // Use relations from artifact
        character.equippedArtifacts = Object.fromEntries(allSlotKeys.map(slot => [slot, ""])) as any

        this.chars.set(flex.characterKey, character)
        // Save migrated version back to db
        if (migrated) this.storage.set(`char_${flex.characterKey}`, flex)
      }
    }

    for (const key of storage.keys) {
      if (key.startsWith("artifact_")) {
        const flex = validateDBArtifact(storage.get(key))
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

        const { artifact } = validateFlexArtifact(flex, key)

        this.arts.set(artifact.id, artifact)
        // Save migrated version back to db
        if (migrated) this.storage.set(key, flex)
      }
    }
  }

  private saveArt(key: string, art: IArtifact) {
    this.storage.set(key, extractFlexArtifact(art))
    this.arts.set(key, art)
  }
  private saveChar(key: CharacterKey, char: ICharacter) {
    this.storage.set(`char_${key}`, extractFlexCharacter(char))
    this.chars.set(key, char)
  }
  // TODO: Make theses `_` functions private once we migrate to use `followXXX`,
  // or de-underscored it if we decide that these are to stay
  _getArt(key: string) { return this.arts.get(key) }
  _getChar(key: CharacterKey | "") { return key ? this.chars.get(key) : undefined }
  _getArts() { return this.arts.values }
  _getCharKeys(): CharacterKey[] { return this.chars.keys }

  followChar(key: CharacterKey, cb: Callback<ICharacter>): (() => void) | undefined { return this.chars.follow(key, cb) }
  followArt(key: string, cb: Callback<IArtifact>): (() => void) | undefined {
    if (this.arts.get(key) !== undefined)
      return this.arts.follow(key, cb)
    cb(undefined)
  }
  followAnyChar(cb: (key: string | {}) => void): (() => void) | undefined { return this.chars.followAny(cb) }
  followAnyArt(cb: (key: CharacterKey | {}) => void): (() => void) | undefined { return this.arts.followAny(cb) }

  /**
   * **Caution**: This does not update `equippedArtifacts`, use `equipArtifacts` instead
   */
  updateChar(value: ICharacter): void {
    const newChar = deepClone(value), key = newChar.characterKey, oldChar = this.chars.get(key)

    if (oldChar) {
      newChar.equippedArtifacts = oldChar.equippedArtifacts
    } else {
      newChar.equippedArtifacts = Object.fromEntries(allSlotKeys.map(slot => ([slot, ""]))) as any
    }

    this.saveChar(key, newChar)
  }
  /**
   * **Caution** This does not update `location` and `lock`, use `setLocation` or `lockArtifact` instead
   */
  updateArt(value: IArtifact): string {
    const newArt = deepClone(value)
    const key = newArt.id || generateRandomArtID(new Set(Object.keys(this.arts.data)))
    const oldArt = this.arts.get(key)

    if (!newArt.id)
      newArt.id = key

    if (oldArt) {
      newArt.location = oldArt.location
      newArt.lock = oldArt.lock
    } else {
      newArt.location = ""
      newArt.lock = false
    }

    this.saveArt(key, newArt)
    if (newArt.location)
      this.chars.set(newArt.location, deepClone(this.chars.get(newArt.location)!))
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
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>) {
    const char = this.chars.get(charKey)
    if (!char) return

    const oldArts = char.equippedArtifacts
    for (const [slot, newArt] of Object.entries(newArts)) {
      if (newArt) this.setLocation(newArt, charKey)
      else if (oldArts[slot]) this.setLocation(oldArts[slot], "")
    }
  }
  lockArtifact(key: string, lock = true) {
    const art = this.arts.get(key)
    if (!art || art.lock === lock) return

    art.lock = lock
    this.saveArt(key, art)
  }

  findDuplicates(editorArt: IFlexArtifact): { duplicated: string[], upgraded: string[] } {
    const { setKey, numStars, level, slotKey, mainStatKey, substats } = editorArt

    const candidates = database._getArts().filter(candidate =>
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

  static shared = new ArtCharDatabase(dbStorage)
}

/// Get a random integer (converted to string) that is not in `keys`
function generateRandomArtID(keys: Set<string>): string {
  let candidate = ""
  do {
    candidate = `artifact_${getRandomInt(1, 2 * (keys.size + 1))}`
  } while (keys.has(candidate))
  return candidate
}

type Callback<Arg> = (arg: Arg | undefined) => void

export const database = ArtCharDatabase.shared
