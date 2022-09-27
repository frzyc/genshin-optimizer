import { validateLevelAsc } from "../../Data/LevelData";
import { allWeaponKeys, charKeyToLocCharKey, locationCharacterKeys } from "../../Types/consts";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { defaultInitialWeapon } from "../../Util/WeaponUtil";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { IGO, IGOOD, ImportResult } from "../exim";

export class WeaponDataManager extends DataManager<string, string, "weapons", ICachedWeapon, IWeapon>{
  constructor(database: ArtCharDatabase) {
    super(database, "weapons")
    for (const key of this.database.storage.keys) {
      if (key.startsWith("weapon_"))
        if (!this.set(key, this.database.storage.get(key) as any))
          this.database.storage.remove(key)
    }
  }
  ensureEquipment() {
    const weaponIds = new Set(this.keys)
    const newWeapons: IWeapon[] = []

    for (const [charKey, char] of Object.entries(this.database.chars.data)) {
      if (!char.equippedWeapon) {
        // A default "sword" should work well enough for this case.
        // We'd have to pull the hefty character sheet otherwise.
        const weapon = defaultInitialWeapon("sword")
        const weaponId = generateRandomWeaponID(weaponIds)

        weaponIds.add(weaponId)
        this.set(weaponId, { ...weapon, location: charKeyToLocCharKey(charKey) })
        newWeapons.push(weapon)
      }
    }
    return newWeapons
  }
  validate(obj: any): IWeapon | undefined {
    if (typeof obj !== "object") return

    let { key, level: rawLevel, ascension: rawAscension, refinement, location, lock } = obj
    if (!allWeaponKeys.includes(key)) return
    let { level, ascension } = validateLevelAsc(rawLevel, rawAscension)
    if (typeof refinement !== "number" || refinement < 1 || refinement > 5) refinement = 1
    if (!locationCharacterKeys.includes(location)) location = ""

    return { key, level, ascension, refinement, location, lock }
  }
  toCache(storageObj: IWeapon, id: string): ICachedWeapon | undefined {
    const newWeapon = { ...storageObj, id }
    const oldWeapon = super.get(id)

    if (newWeapon.location !== oldWeapon?.location) {
      const prevChar = oldWeapon?.location ? this.database.chars.getWithInit(oldWeapon.location) : undefined
      const newChar = newWeapon.location ? this.database.chars.getWithInit(newWeapon.location) : undefined

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
    const id = generateRandomWeaponID(new Set(this.keys))
    this.set(id, value)
    return id
  }
  remove(key: string) {
    const weapon = this.get(key)
    if (!weapon || weapon.location)
      return // Can't delete equipped weapon here
    super.remove(key)
  }
  importGOOD(good: IGOOD & IGO, result: ImportResult) {
    result.weapons.beforeMerge = this.values.length

    // Match weapons for counter, metadata, and locations.
    const weapons = good.weapons
    if (Array.isArray(weapons) && weapons?.length) {
      result.weapons.import = weapons.length
      const idsToRemove = new Set(this.values.map(w => w.id))
      const hasEquipment = weapons.some(w => w.location)
      weapons.forEach(w => {
        const weapon = this.validate(w)
        if (!weapon) return result.weapons.invalid.push(w)
        let { duplicated, upgraded } = result.ignoreDups ? { duplicated: [], upgraded: [] } : this.findDup(weapon)
        // Don't reuse dups/upgrades
        duplicated = duplicated.filter(a => idsToRemove.has(a.id))
        upgraded = upgraded.filter(a => idsToRemove.has(a.id))

        if (duplicated[0] || upgraded[0]) {
          const match = duplicated[0] || upgraded[0]
          idsToRemove.delete(match.id)
          if (duplicated[0]) result.weapons.unchanged.push(weapon)
          else if (upgraded[0]) result.weapons.upgraded.push(weapon)
          this.set(match.id, { ...weapon, location: hasEquipment ? weapon.location : match.location })
        } else
          this.new(weapon)
      })
      const idtoRemoveArr = Array.from(idsToRemove)
      if (result.keepNotInImport || result.ignoreDups) result.weapons.notInImport = idtoRemoveArr.length
      else idtoRemoveArr.forEach(k => this.remove(k))
    } else result.weapons.notInImport = this.values.length
  }

  findDup(weapon: IWeapon): { duplicated: ICachedWeapon[], upgraded: ICachedWeapon[] } {
    const { key, level, ascension, refinement } = weapon

    const candidates = this.values.filter(candidate =>
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
function generateRandomWeaponID(keys: Set<string>): string {
  let ind = keys.size
  let candidate = ""
  do {
    candidate = `weapon_${ind++}`
  } while (keys.has(candidate))
  return candidate
}
