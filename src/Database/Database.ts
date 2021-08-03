import { IArtifact, IFlexArtifact } from "../Types/artifact";
import { ICharacter, IFlexCharacter } from "../Types/character";
import { allSlotKeys, CharacterKey, SlotKey } from "../Types/consts";
import { deepClone, getRandomInt } from "../Util/Util";
import { load, save, remove, getDBVersion, setDBVersion } from "./utils";
import { DataManager } from "./DataManager";
import { migrate } from "./migration";
import { validateFlexArtifact, validateDBCharacter, validateDBArtifact, extractFlexArtifact, validateFlexCharacter, extractFlexCharacter } from "./validation";

export class Database {
  storage: Storage
  arts = new DataManager<string, IArtifact>()
  chars = new DataManager<CharacterKey, ICharacter>()

  private constructor(storage: Storage) {
    this.storage = storage

    const { migrated } = migrate(storage)

    // Load into memory and verify database integrity
    for (const key in storage) {
      if (key.startsWith("char_")) {
        const flex = validateDBCharacter(load(storage, key), key)
        if (!flex) {
          // Non-recoverable
          remove(storage, key)
          continue
        }
        const character = validateFlexCharacter(flex)
        // Use relations from artifact
        character.equippedArtifacts = Object.fromEntries(allSlotKeys.map(slot => [slot, ""])) as any

        this.chars.set(flex.characterKey, character)
        // Save migrated version back to db
        if (migrated) save(this.storage, `char_${flex.characterKey}`, flex)
      }
    }

    for (const key in storage) {
      if (key.startsWith("artifact_")) {
        const flex = validateDBArtifact(load(storage, key), key)
        if (!flex) {
          // Non-recoverable
          remove(storage, key)
          continue
        }

        // Update relations
        const { location, slotKey } = flex
        if (location && this.chars.data[location]?.equippedArtifacts[slotKey] === "") {
          this.chars.data[location]!.equippedArtifacts[slotKey] = key // equiped on `location`
        } else flex.location = ""

        const { artifact } = validateFlexArtifact(flex)

        this.arts.set(artifact.id, artifact)
        // Save migrated version back to db
        if (migrated) save(this.storage, key, flex)
      }
    }
  }

  private saveArt(key: string, art: IArtifact) {
    save(this.storage, key, extractFlexArtifact(art))
    this.arts.set(key, art)
  }
  private saveChar(key: CharacterKey, char: ICharacter) {
    save(this.storage, `char_${key}`, char)
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
    remove(this.storage, `char_${key}`)
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
    remove(this.storage, key)
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

  exportStorage() {
    const characterDatabase = Object.fromEntries(Object.entries(this.chars.data).map(([key, value]) =>
      [key, extractFlexCharacter(value)]))
    const artifactDatabase = Object.fromEntries(Object.entries(this.arts.data).map(([key, value]) =>
      [key, extractFlexArtifact(value)]))
    const version = getDBVersion(this.storage)
    const artifactDisplay = load(this.storage, "ArtifactDisplay.state") ?? {}
    const characterDisplay = load(this.storage, "CharacterDisplay.state") ?? {}
    const buildsDisplay = load(this.storage, "BuildsDisplay.state") ?? {}

    return {
      version,
      characterDatabase,
      artifactDatabase,
      artifactDisplay,
      characterDisplay,
      buildsDisplay,
    }
  }

  importStorage({ version, characterDatabase, artifactDatabase, artifactDisplay, characterDisplay, buildsDisplay }: DatabaseObj) {
    this.clear()
    const storage = this.storage

    Object.entries(characterDatabase).forEach(([charKey, char]) => save(storage, `char_${charKey}`, char))
    Object.entries(artifactDatabase).forEach(([id, art]) => save(storage, id, art))
    //override version
    setDBVersion(storage, version)
    save(storage, "ArtifactDisplay.state", artifactDisplay)
    save(storage, "CharacterDisplay.state", characterDisplay)
    save(storage, "BuildsDisplay.state", buildsDisplay)

    const newDatabase = new Database(storage)
    this.arts = newDatabase.arts
    this.chars = newDatabase.chars
  }

  clear() {
    const storage = this.storage
    Object.keys(storage)
      .filter(key => key.startsWith("char_") || key.startsWith("artifact_"))
      .forEach(id => remove(storage, id))
    remove(storage, "db_ver")
    remove(storage, "ArtifactDisplay.state")
    remove(storage, "CharacterDisplay.state")
    remove(storage, "BuildsDisplay.state")

    this.arts.removeAll()
    this.chars.removeAll()
  }

  static shared = new Database(localStorage)
}

type DatabaseObj = {
  version: number,
  characterDatabase: Dict<CharacterKey, IFlexCharacter>
  artifactDatabase: Dict<string, IFlexArtifact>
  artifactDisplay: any
  characterDisplay: any
  buildsDisplay: any
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

export const database = Database.shared
