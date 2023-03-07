import { allWeaponKeys, CharacterKey, weaponMaxLevel } from "@genshin-optimizer/consts";
import { getCharSheet } from "../../Data/Characters";
import { validateLevelAsc } from "../../Data/LevelData";
import { getWeaponSheet } from "../../Data/Weapons";
import { ICachedCharacter } from "../../Types/character";
import { charKeyToLocCharKey, LocationCharacterKey, allLocationCharacterKeys } from "@genshin-optimizer/consts";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { defaultInitialWeapon } from "../../Util/WeaponUtil";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { IGO, IGOOD, ImportResult } from "../exim";
import { initialCharacter } from "./CharacterData";

export class WeaponDataManager extends DataManager<string, "weapons", ICachedWeapon, IWeapon>{
  constructor(database: ArtCharDatabase) {
    super(database, "weapons")
    for (const key of this.database.storage.keys)
      if (key.startsWith("weapon_") && !this.set(key, {}))
        this.database.storage.remove(key)
  }
  ensureEquipments() {
    const weaponIds = new Set(this.keys)
    const newWeapons: IWeapon[] = []

    for (const charKey of this.database.chars.keys) {
      const newWeapon = this.ensureEquipment(charKey, weaponIds)
      if (newWeapon) newWeapons.push(newWeapon)
    }
    return newWeapons
  }
  ensureEquipment(charKey: CharacterKey, weaponIds: Set<string> = new Set(this.keys)) {
    const char = this.database.chars.get(charKey)
    if (char?.equippedWeapon) return
    const weapon = defaultInitialWeapon(getCharSheet(charKey, "F").weaponTypeKey)
    const weaponId = this.generateKey(weaponIds)
    weaponIds.add(weaponId)
    this.set(weaponId, { ...weapon, location: charKeyToLocCharKey(charKey) })
    return weapon
  }
  validate(obj: unknown): IWeapon | undefined {
    if (typeof obj !== "object") return
    const { key, level: rawLevel, ascension: rawAscension, } = obj as IWeapon
    let { refinement, location, lock } = obj as IWeapon

    if (!allWeaponKeys.includes(key)) return
    const sheet = getWeaponSheet(key)
    if (rawLevel > weaponMaxLevel[sheet.rarity]) return
    const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)
    if (typeof refinement !== "number" || refinement < 1 || refinement > 5) refinement = 1
    if (location && !allLocationCharacterKeys.includes(location)) location = ""
    if (location && (getCharSheet(this.database.chars.LocationToCharacterKey(location)).weaponTypeKey !== sheet.weaponType)) return
    lock = !!lock
    return { key, level, ascension, refinement, location, lock }
  }
  toCache(storageObj: IWeapon, id: string): ICachedWeapon | undefined {
    const newWeapon = { ...storageObj, id }
    const oldWeapon = super.get(id)
    // Disallow unequipping of weapons
    if (!newWeapon.location && oldWeapon?.location) return

    // During initialization of the database, if you import weapons with location without a corresponding character, the char will be generated here.
    const getWithInit = (lk: LocationCharacterKey): ICachedCharacter => {
      const cKey = this.database.chars.LocationToCharacterKey(lk)
      if (!this.database.chars.keys.includes(cKey))
        this.database.chars.set(cKey, initialCharacter(cKey))
      return this.database.chars.get(cKey) as ICachedCharacter
    }
    if (newWeapon.location !== oldWeapon?.location) {
      const prevChar = oldWeapon?.location ? getWithInit(oldWeapon.location) : undefined
      const newChar = newWeapon.location ? getWithInit(newWeapon.location) : undefined

      // previously equipped art at new location
      const prevWeapon = super.get(newChar?.equippedWeapon)

      //current prevWeapon <-> newChar  && newWeapon <-> prevChar
      //swap to prevWeapon <-> prevChar && newWeapon <-> newChar(outside of this if)

      if (prevWeapon)
        super.setCached(prevWeapon.id, { ...prevWeapon, location: prevChar?.key ? charKeyToLocCharKey(prevChar.key) : "" })
      if (newChar)
        this.database.chars.setEquippedWeapon(charKeyToLocCharKey(newChar.key), newWeapon.id)
      if (prevChar)
        this.database.chars.setEquippedWeapon(charKeyToLocCharKey(prevChar.key), prevWeapon?.id ?? "")
    } else
      newWeapon.location && this.database.chars.triggerCharacter(newWeapon.location, "update")
    return newWeapon
  }
  deCache(weapon: ICachedWeapon): IWeapon {
    const { key, level, ascension, refinement, location, lock } = weapon
    return { key, level, ascension, refinement, location, lock }
  }

  new(value: IWeapon): string {
    const id = this.generateKey()
    this.set(id, value)
    return id
  }
  remove(key: string, notify = true) {
    const weapon = this.get(key)
    if (!weapon || weapon.location)
      return // Can't delete equipped weapon here
    super.remove(key, notify)
  }
  importGOOD(good: IGOOD & IGO, result: ImportResult) {
    result.weapons.beforeMerge = this.values.length

    // Match weapons for counter, metadata, and locations.
    const weapons = good.weapons

    if (!Array.isArray(weapons) || !weapons.length) {
      result.weapons.notInImport = this.values.length
      return
    }

    const takenIds = new Set(this.keys)
    weapons.forEach(a => {
      const id = (a as ICachedWeapon).id
      if (!id) return
      takenIds.add(id)
    })

    result.weapons.import = weapons.length
    const idsToRemove = new Set(this.values.map(w => w.id))
    const hasEquipment = weapons.some(w => w.location)
    weapons.forEach(w => {
      const weapon = this.validate(w)
      if (!weapon) return result.weapons.invalid.push(w)

      let importWeapon = weapon
      let importId: string | undefined = (w as ICachedWeapon).id
      let foundDupOrUpgrade = false
      if (!result.ignoreDups) {
        const { duplicated, upgraded } = this.findDups(weapon, Array.from(idsToRemove))
        if (duplicated[0] || upgraded[0]) {
          foundDupOrUpgrade = true
          // Favor upgrades with the same location, else use 1st dupe
          let [match, isUpgrade] = (hasEquipment && weapon.location && upgraded[0]?.location === weapon.location) ?
            [upgraded[0], true] : (duplicated[0] ? [duplicated[0], false] : [upgraded[0], true])
          if (importId) {
            // favor exact id matches
            const up = upgraded.find(w => w.id === importId)
            if (up) [match, isUpgrade] = [up, true]
            const dup = duplicated.find(w => w.id === importId)
            if (dup) [match, isUpgrade] = [dup, false]
          }
          isUpgrade ? result.weapons.upgraded.push(weapon) : result.weapons.unchanged.push(weapon)
          idsToRemove.delete(match.id)

          //Imported weapon will be set to `importId` later, so remove the dup/upgrade now to avoid a duplicate
          super.remove(match.id, false)// Do not notify, since this is a "replacement". Also use super to bypass the equipment check
          if (!importId) importId = match.id // always resolve some id
          importWeapon = { ...weapon, location: hasEquipment ? weapon.location : match.location }
        }
      }
      if (importId) {
        if (this.get(importId)) { // `importid` already in use, get a new id
          const newId = this.generateKey(takenIds)
          takenIds.add(newId)
          if (this.changeId(importId, newId)) {
            // Sync the id in `idsToRemove` due to the `changeId`
            if (idsToRemove.has(importId)) {
              idsToRemove.delete(importId)
              idsToRemove.add(newId)
            }
          }
        }
        this.set(importId, importWeapon, !foundDupOrUpgrade)
      } else {
        importId = this.generateKey(takenIds)
        takenIds.add(importId)
      }
      this.set(importId, importWeapon, !foundDupOrUpgrade)
    })
    const idtoRemoveArr = Array.from(idsToRemove)
    if (result.keepNotInImport || result.ignoreDups) result.weapons.notInImport = idtoRemoveArr.length
    else idtoRemoveArr.forEach(k => this.remove(k))

    this.database.weapons.ensureEquipments()
  }

  findDups(weapon: IWeapon, idList = this.keys): { duplicated: ICachedWeapon[], upgraded: ICachedWeapon[] } {
    const { key, level, ascension, refinement } = weapon

    const weapons = idList.map(id => this.get(id)).filter(a => a) as ICachedWeapon[]
    const candidates = weapons.filter(candidate =>
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
    ).sort(candidates => candidates.location === weapon.location ? -1 : 1)
    // Strictly duplicated weapons
    const duplicated = candidates.filter(candidate =>
      level === candidate.level &&
      ascension === candidate.ascension &&
      refinement === candidate.refinement
    ).sort(candidates => candidates.location === weapon.location ? -1 : 1)
    return { duplicated, upgraded }
  }
}
