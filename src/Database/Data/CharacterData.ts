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
        const obj = this.database.storage.get(key)
        const flex = parseCharacter(obj)
        if (!flex || key !== `char_${flex.key}`) {
          console.error("CharacterData", key, "is unrecoverable.", obj)
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
      key: characterKey, level, ascension, hitMode, elementKey, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget
    } = char
    const result: ICharacter = {
      key: characterKey, level, ascension, hitMode, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget
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
        this.database.arts.set(artKey, { location: "" })
    }
    const weapon = this.database.weapons.get(char.equippedWeapon)
    if (weapon && weapon.location === key)
      this.database.weapons.set(char.equippedWeapon, { ...weapon, location: "" })
    super.remove(key)
  }

  /**
   * **Caution**: This does not propagate triggers on changes to `equippedArtifacts`
   * **Caution**: This does not propagate triggers on changes to `equippedWeapon`
   */
  set(key: CharacterKey, value: Partial<ICharacter>): void {
    const oldChar = super.get(key)
    const parsedChar = parseCharacter({ ...oldChar, ...value })
    if (!parsedChar) return console.error("Unable to update Character database with invalid character", value)

    const newChar = validateCharacter({ ...oldChar, ...parsedChar })

    super.set(key, newChar)
  }

  /**
   * **Caution**:
   * This does not update the `location` on artifact, nor trigger callback.
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedArtifact(key: CharacterKey, slotKey: SlotKey, artid: string) {
    const char = super.get(key)
    if (!char) return
    const equippedArtifacts = deepClone(char.equippedArtifacts)
    equippedArtifacts[slotKey] = artid
    super.set(key, { ...char, equippedArtifacts })
  }
  /**
   * **Caution**:
   * This does not update the `location` on weapon, nor trigger callback.
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedWeapon(key: CharacterKey, equippedWeapon: ICachedCharacter["equippedWeapon"]) {
    const char = super.get(key)
    if (!char) return
    super.set(key, { ...char, equippedWeapon })
  }
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>) {
    const char = super.get(charKey)
    if (!char) return
    for (const newArt of Object.values(newArts)) {
      if (newArt) this.database.arts.set(newArt, { location: charKey })
    }
  }
}
