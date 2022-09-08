import { CharacterKey } from "pipeline";
import { validateLevelAsc } from "../../Data/LevelData";
import { validateCustomMultiTarget } from "../../PageCharacter/CustomMultiTarget";
import { initialCharacter } from "../../ReactHooks/useCharSelectionCallback";
import { ICachedCharacter, ICharacter } from "../../Types/character";
import { allAdditiveReactions, allAmpReactions, allCharacterKeys, allElements, allHitModes, allSlotKeys, SlotKey } from "../../Types/consts";
import { deepClone, objectKeyMap, objectMap } from "../../Util/Util";
import { defaultInitialWeapon } from "../../Util/WeaponUtil";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export class CharacterDataManager extends DataManager<CharacterKey, string, ICachedCharacter, ICharacter>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("char_")) {
        const [, charKey] = key.split("char_")
        this.set(charKey as CharacterKey, this.database.storage.get(key))
      }
    }
  }
  validate(obj: any): ICharacter | undefined {
    if (typeof obj !== "object") return

    let {
      key: characterKey, level: rawLevel, ascension: rawAscension, hitMode, elementKey, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget, customMultiTargets
    } = obj

    if (!allCharacterKeys.includes(characterKey))
      return // non-recoverable

    if (!allHitModes.includes(hitMode)) hitMode = "avgHit"
    if (characterKey !== "Traveler") elementKey = undefined
    else if (!allElements.includes(elementKey)) elementKey = "anemo"
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
    if (elementKey) {
      char.elementKey = elementKey
      char.customMultiTarget = []
      if (!customMultiTargets) char.customMultiTargets = objectKeyMap(allElements, () => []) as ICharacter["customMultiTargets"]
      else char.customMultiTargets = objectMap(customMultiTargets!, customMultiTarget => (customMultiTarget as any[]).map(cmt => validateCustomMultiTarget(cmt)).filter(t => t)) as ICharacter["customMultiTargets"]
    }
    return char
  }
  toCache(storageObj: ICharacter, id: CharacterKey): ICachedCharacter {
    const oldChar = this.get(id)
    return {
      equippedArtifacts: oldChar ? oldChar.equippedArtifacts : objectKeyMap(allSlotKeys, () => ""),
      equippedWeapon: oldChar ? oldChar.equippedWeapon : "",
      ...storageObj,
    }
  }
  deCache(char: ICachedCharacter): ICharacter {
    const {
      key: characterKey, level, ascension, hitMode, elementKey, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget, customMultiTargets
    } = char
    const result: ICharacter = {
      key: characterKey, level, ascension, hitMode, reaction, conditional,
      bonusStats, enemyOverride, talent, infusionAura, constellation, team, teamConditional,
      compareData, customMultiTarget, customMultiTargets
    }
    if (elementKey) result.elementKey = elementKey
    return result
  }
  toStorageKey(key: CharacterKey): string {
    return `char_${key}`
  }
  getWithInit(key: CharacterKey): ICachedCharacter {
    if (!this.keys.includes(key))
      this.set(key, initialCharacter(key))
    return this.get(key)!
  }
  getWithInitWeapon(key: CharacterKey): ICachedCharacter {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharacter(key))
      this.database.weapons.new({ ...defaultInitialWeapon("sword"), location: key })
    }
    return this.get(key)!
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
   * **Caution**:
   * This does not update the `location` on artifact
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedArtifact(key: CharacterKey, slotKey: SlotKey, artid: string) {
    const char = super.get(key)
    if (!char) return
    const equippedArtifacts = deepClone(char.equippedArtifacts)
    equippedArtifacts[slotKey] = artid
    super.setCached(key, { ...char, equippedArtifacts })
  }
  /**
   * **Caution**:
   * This does not update the `location` on weapon
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedWeapon(key: CharacterKey, equippedWeapon: ICachedCharacter["equippedWeapon"]) {
    const char = super.get(key)
    if (!char) return
    super.setCached(key, { ...char, equippedWeapon })
  }
  equipArtifacts(charKey: CharacterKey, newArts: StrictDict<SlotKey, string>) {
    const char = super.get(charKey)
    if (!char) return
    for (const newArt of Object.values(newArts)) {
      if (newArt) this.database.arts.set(newArt, { location: charKey })
    }
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
}
