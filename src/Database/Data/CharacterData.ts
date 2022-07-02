import { CharacterKey } from "pipeline";
import { ICachedCharacter, ICharacter } from "../../Types/character";
import { allSlotKeys, SlotKey } from "../../Types/consts";
import { deepClone, objectKeyMap } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { parseCharacter } from "../imports/parse";
import { validateCharacter } from "../imports/validate";

export class CharacterDataManager extends DataManager<CharacterKey, string, ICachedCharacter, ICharacter>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("char_")) {
        const flex = parseCharacter(this.database.storage.get(key))
        if (!flex || key !== `char_${flex.key}`) {
          // Non-recoverable
          this.database.storage.remove(key)
          continue
        }
        const character = validateCharacter(flex)
        // Use relations from artifact
        character.equippedArtifacts = objectKeyMap(allSlotKeys, () => "")

        this.set(flex.key, character)
      }
    }
    // Briefly verify that each teammate is pointing to a valid character. does not check double linking.
    Object.entries(this.data).forEach(([charKey, char]) => {
      let updateTeam = false
      const team = char.team.map(t => {
        if (this.get(t))
          return t
        else {
          updateTeam = true
          return ""
        }
      }) as ["" | CharacterKey, "" | CharacterKey, "" | CharacterKey]
      if (updateTeam) {
        this.set(charKey, { ...char, team })
      }
    })
  }
  deCache(char: ICachedCharacter): ICharacter {
    const {
      key: characterKey, level, ascension, hitMode, elementKey, reactionMode, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team,
      compareData, favorite
    } = char
    const result: ICharacter = {
      key: characterKey, level, ascension, hitMode, reactionMode, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team,
      compareData, favorite
    }
    if (elementKey) result.elementKey = elementKey
    return result
  }
  toStorageKey(key: CharacterKey): string {
    return `char_${key}`
  }
  remove(key: CharacterKey) {
    const char = this.get(key)
    if (!char) return

    for (const artKey of Object.values(char.equippedArtifacts)) {
      const art = this.database.arts.get(artKey)
      if (art && art.location === key)
        this.database.arts.setLocation(artKey, "")
    }
    const weapon = this.database.weapons.get(char.equippedWeapon)
    if (weapon && weapon.location === key)
      this.database.weapons.set(char.equippedWeapon, { ...weapon, location: "" })
    super.remove(key)
  }

  /**
   * **Caution**: This does not update `equippedArtifacts`, use `setEquippedArtifacts` instead
   * **Caution**: This does not update `equippedWeapon`, use `setEquippedWeapon` instead
   */
  set(key: CharacterKey, value: Partial<ICharacter>): void {
    const oldChar = super.get(key)
    const parsedChar = parseCharacter({ ...oldChar, ...value })
    if (!parsedChar) return console.error("Unable to update Character database with invalid character", value)

    const newChar = validateCharacter({ ...oldChar, ...parsedChar })

    if (oldChar) {
      newChar.equippedArtifacts = oldChar.equippedArtifacts
      newChar.equippedWeapon = oldChar.equippedWeapon
    }
    super.set(key, newChar)
  }

  /**
   * This does not update the `location` on artifacts. Use `CharacterDataManager.equipArtifacts` or `ArtifactDataManager.setlocation`
   */
  setEquippedArtifacts(key: CharacterKey, equippedArtifacts: ICachedCharacter["equippedArtifacts"]) {
    const char = super.get(key)
    if (!char) return
    super.set(key, { ...char, equippedArtifacts })
  }
  /**
   * This does not update the `location` on artifacts. Use `CharacterDataManager.equipArtifacts` or `ArtifactDataManager.setlocation`
   */
  setEquippedArtifact(key: CharacterKey, slotKey: SlotKey, artid: string) {
    const char = super.get(key)
    if (!char) return
    const equippedArtifacts = deepClone(char.equippedArtifacts)
    equippedArtifacts[slotKey] = artid
    super.set(key, { ...char, equippedArtifacts })
  }
  /**
   * This does not update the `location` on weapon. Use `WeaponDataManager.setLocation`
   */
  setEquippedWeapon(key: CharacterKey, equippedWeapon: ICachedCharacter["equippedWeapon"]) {
    const char = super.get(key)
    if (!char) return
    super.set(key, { ...char, equippedWeapon })
  }
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>) {
    const char = super.get(charKey)
    if (!char) return

    const oldArts = char.equippedArtifacts
    for (const [slot, newArt] of Object.entries(newArts)) {
      if (newArt) this.database.arts.setLocation(newArt, charKey)
      else if (oldArts[slot]) this.database.arts.setLocation(oldArts[slot], "")
    }
  }
}
