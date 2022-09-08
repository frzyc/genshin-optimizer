import { validateLevelAsc } from "../../Data/LevelData";
import { allCharacterKeys, allWeaponKeys } from "../../Types/consts";
import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { ImportResult } from "../exim";

export class WeaponDataManager extends DataManager<string, string, ICachedWeapon, IWeapon>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("weapon_"))
        this.set(key, this.database.storage.get(key) as any)
    }
  }
  validate(obj: any): IWeapon | undefined {
    if (typeof obj !== "object") return

    let { key, level: rawLevel, ascension: rawAscension, refinement, location, lock } = obj
    if (!allWeaponKeys.includes(key)) return
    let { level, ascension } = validateLevelAsc(rawLevel, rawAscension)
    if (typeof refinement !== "number" || refinement < 1 || refinement > 5) refinement = 1
    if (!allCharacterKeys.includes(location)) location = ""

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
        super.setCached(prevWeapon.id, { ...prevWeapon, location: prevChar?.key ?? "" })
      if (newChar)
        this.database.chars.setEquippedWeapon(newChar.key, newWeapon.id)
      if (prevChar)
        this.database.chars.setEquippedWeapon(prevChar.key, prevWeapon?.id ?? "")
    }
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
