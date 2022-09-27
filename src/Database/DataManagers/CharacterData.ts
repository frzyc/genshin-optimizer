import { validateLevelAsc } from "../../Data/LevelData";
import { validateCustomMultiTarget } from "../../PageCharacter/CustomMultiTarget";
import { initialCharacter } from "../../ReactHooks/useCharSelectionCallback";
import { ICachedCharacter, ICharacter } from "../../Types/character";
import { allAdditiveReactions, allAmpReactions, allCharacterKeys, allElements, allHitModes, allSlotKeys, CharacterKey, charKeyToLocCharKey, LocationCharacterKey, SlotKey, TravelerKey, travelerKeys } from "../../Types/consts";
import { deepClone, objectKeyMap } from "../../Util/Util";
import { defaultInitialWeapon } from "../../Util/WeaponUtil";
import { ArtCharDatabase } from "../Database";
import { DataManager, TriggerString } from "../DataManager";
import { GOSource, IGO, IGOOD, ImportResult } from "../exim";

export class CharacterDataManager extends DataManager<CharacterKey, string, "characters", ICachedCharacter, ICharacter>{
  constructor(database: ArtCharDatabase) {
    super(database, "characters")
    for (const key of this.database.storage.keys) {
      if (key.startsWith("char_")) {
        const [, charKey] = key.split("char_")
        if (!this.set(charKey as CharacterKey, this.database.storage.get(key)))
          this.database.storage.remove(key)
      }
    }
  }
  validate(obj: any): ICharacter | undefined {
    if (typeof obj !== "object") return

    let {
      key: characterKey, level: rawLevel, ascension: rawAscension, hitMode, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget
    } = obj

    if (!allCharacterKeys.includes(characterKey))
      return // non-recoverable

    if (!allHitModes.includes(hitMode)) hitMode = "avgHit"
    if (!allAmpReactions.includes(reaction) && !allAdditiveReactions.includes(reaction)) reaction = undefined
    if (!allElements.includes(infusionAura)) infusionAura = ""
    if (typeof constellation !== "number" && constellation < 0 && constellation > 6) constellation = 0

    const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)

    if (typeof talent !== "object") talent = { auto: 1, skill: 1, burst: 1 }
    else {
      let { auto, skill, burst } = talent
      if (typeof auto !== "number" || auto < 1 || auto > 15) auto = 1
      if (typeof skill !== "number" || skill < 1 || skill > 15) skill = 1
      if (typeof burst !== "number" || burst < 1 || burst > 15) burst = 1
      talent = { auto, skill, burst }
    }

    if (!conditional)
      conditional = {}
    if (!team)
      team = ["", "", ""]
    team = team.map(t => allCharacterKeys.includes(t) ? t : "") as ICharacter["team"]

    if (!teamConditional)
      teamConditional = {}

    if (typeof compareData !== "boolean") compareData = false

    // TODO: validate bonusStats
    if (typeof bonusStats !== "object" || !Object.entries(bonusStats).map(([_, num]) => typeof num === "number")) bonusStats = {}
    if (typeof enemyOverride !== "object" || !Object.entries(enemyOverride).map(([_, num]) => typeof num === "number")) enemyOverride = {}
    if (!customMultiTarget) customMultiTarget = []
    customMultiTarget = customMultiTarget.map(cmt => validateCustomMultiTarget(cmt)).filter(t => t)
    const char: ICharacter = {
      key: characterKey, level, ascension, hitMode, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget
    }
    return char
  }
  toCache(storageObj: ICharacter, id: CharacterKey): ICachedCharacter {
    const oldChar = this.get(id)
    return {
      equippedArtifacts: oldChar ? oldChar.equippedArtifacts : objectKeyMap(allSlotKeys, sk => Object.values(this.database.arts?.data ?? {}).find(a => a.location === charKeyToLocCharKey(id) && a.slotKey === sk)?.id ?? ""),
      equippedWeapon: oldChar ? oldChar.equippedWeapon : (Object.values(this.database.weapons?.data ?? {}).find(w => w.location === charKeyToLocCharKey(id))?.id ?? ""),
      ...storageObj,
    }
  }
  deCache(char: ICachedCharacter): ICharacter {
    const {
      key, level, ascension, hitMode, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget
    } = char
    const result: ICharacter = {
      key, level, ascension, hitMode, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget
    }
    return result
  }
  toStorageKey(key: CharacterKey): string {
    return `char_${key}`
  }
  getTravelerCharacterKey(): CharacterKey {
    return travelerKeys.find(k => this.keys.includes(k)) ?? travelerKeys[0]
  }
  LocationToCharacterKey(key: LocationCharacterKey): CharacterKey {
    return key === "Traveler" ? this.getTravelerCharacterKey() : key
  }
  getWithInit(key: LocationCharacterKey): ICachedCharacter {
    const cKey = this.LocationToCharacterKey(key)

    if (!this.keys.includes(cKey))
      this.set(cKey, initialCharacter(cKey))
    return this.get(cKey)!
  }
  getWithInitWeapon(key: LocationCharacterKey): ICachedCharacter {
    const cKey = this.LocationToCharacterKey(key)
    if (!this.keys.includes(cKey)) {
      this.set(cKey, initialCharacter(cKey))
      this.database.weapons.new({ ...defaultInitialWeapon("sword"), location: key })
    }
    return this.get(cKey)!
  }

  remove(key: CharacterKey) {
    const char = this.get(key)
    if (!char) return
    for (const artKey of Object.values(char.equippedArtifacts)) {
      const art = this.database.arts.get(artKey)
      // Only unequip from artifact from traveler if there are no more "Travelers" in the database
      if (art && (art.location === key || (art.location === "Traveler" && travelerKeys.includes(key as TravelerKey) && !travelerKeys.find(t => t !== key && this.keys.includes(t)))))
        this.database.arts.set(artKey, { location: "" })
    }
    const weapon = this.database.weapons.get(char.equippedWeapon)
    // Only unequip from weapon from traveler if there are no more "Travelers" in the database
    if (weapon && (weapon.location === key || (weapon.location === "Traveler" && travelerKeys.includes(key as TravelerKey) && !travelerKeys.find(t => t !== key && this.keys.includes(t)))))
      this.database.weapons.set(char.equippedWeapon, { location: "" })
    super.remove(key)
  }


  /**
   * **Caution**:
   * This does not update the `location` on artifact
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedArtifact(key: LocationCharacterKey, slotKey: SlotKey, artid: string) {
    const setEq = (k: CharacterKey) => {
      const char = super.get(k)
      if (!char) return
      const equippedArtifacts = deepClone(char.equippedArtifacts)
      equippedArtifacts[slotKey] = artid
      super.setCached(k, { ...char, equippedArtifacts })
    }
    if (key === "Traveler") travelerKeys.forEach(k => setEq(k))
    else setEq(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on weapon
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedWeapon(key: LocationCharacterKey, equippedWeapon: ICachedCharacter["equippedWeapon"]) {
    const setEq = (k: CharacterKey) => {
      const char = super.get(k)
      if (!char) return
      super.setCached(k, { ...char, equippedWeapon })
    }
    if (key === "Traveler") travelerKeys.forEach(k => setEq(k))
    else setEq(key)
  }

  hasDup(char: ICharacter, isGO: boolean) {
    const db = this.getStorage(char.key)
    if (!db) return false
    if (isGO) {
      return JSON.stringify(db) === JSON.stringify(char)
    } else {
      let { key, level, constellation, ascension, talent } = db
      const dbGOOD = { key, level, constellation, ascension, talent };
      ({ key, level, constellation, ascension, talent } = char)
      const charGOOD = { key, level, constellation, ascension, talent }
      return JSON.stringify(dbGOOD) === JSON.stringify(charGOOD)
    }
  }
  triggerCharacter(key: LocationCharacterKey, reason: TriggerString) {
    if (key === "Traveler") travelerKeys.forEach(ck => this.trigger(ck, reason, this.get(ck)))
    else this.trigger(key, reason, this.get(key))
  }
  importGOOD(good: IGOOD & IGO, result: ImportResult) {
    result.characters.beforeMerge = this.values.length

    const source = good.source ?? "Unknown"
    const characters = good[this.goKey as any]
    if (Array.isArray(characters) && characters?.length) {
      result.characters.import = characters.length
      const idsToRemove = new Set(this.keys)
      characters.forEach(c => {
        if (!c.key) result.characters.invalid.push(c)
        idsToRemove.delete(c.key)
        if (this.hasDup(c, source === GOSource))
          result.characters.unchanged.push(c)
        else this.set(c.key, c)
      })

      const idtoRemoveArr = Array.from(idsToRemove)
      if (result.keepNotInImport || result.ignoreDups) result.characters.notInImport = idtoRemoveArr.length
      else idtoRemoveArr.forEach(k => this.remove(k))
      result.characters.unchanged = []
    } else result.characters.notInImport = this.values.length
  }
}
