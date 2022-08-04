import { ICachedWeapon, IWeapon } from "../../Types/weapon";
import { getRandomInt } from "../../Util/Util";
import { defaultInitialWeapon } from "../../Util/WeaponUtil";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";
import { parseWeapon } from "../imports/parse";
import { validateWeapon } from "../imports/validate";

export class WeaponDataManager extends DataManager<string, string, ICachedWeapon, IWeapon>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("weapon_")) {
        const flex = parseWeapon(this.database.storage.get(key))
        if (!flex) {
          console.error("WeaponData", key, "is unrecoverable.")
          this.database.storage.remove(key)
          continue
        }

        // Update relations
        const { location } = flex
        const char = this.database.chars.get(location)
        if (location && char && !char.equippedWeapon)
          this.database.chars.setEquippedWeapon(location, key)
        else flex.location = ""

        const weapon = validateWeapon(flex, key)

        this.set(key, weapon)
      }
    }

    const weaponIds = new Set(this.keys)
    for (const [charKey, char] of Object.entries(this.database.chars.data)) {
      if (!char.equippedWeapon) {
        // A default "sword" should work well enough for this case.
        // We'd have to pull the hefty character sheet otherwise.
        const weapon = defaultInitialWeapon("sword")
        const weaponId = generateRandomWeaponID(weaponIds)

        weaponIds.add(weaponId)
        this.set(weaponId, weapon)
        // No need to set anything on character side.
        this.set(weaponId, { location: charKey })
      }
    }
  }
  deCache(weapon: ICachedWeapon): IWeapon {
    const { key, level, ascension, refinement, location, lock } = weapon
    return { key, level, ascension, refinement, location, lock }
  }

  new(value: IWeapon): string {
    const id = generateRandomWeaponID(new Set(this.keys))
    const newWeapon = validateWeapon(parseWeapon({ ...value, location: "" })!, id)
    this.set(id, newWeapon)
    return id
  }
  remove(key: string) {
    const weapon = this.get(key)
    if (!weapon || weapon.location)
      return // Can't delete equipped weapon here
    super.remove(key)
  }

  set(id: string, value: Partial<IWeapon>) {
    const oldWeapon = super.get(id)
    const parsedWeapon = parseWeapon({ ...oldWeapon, ...value })
    if (!parsedWeapon) return

    const newWeapon = validateWeapon({ ...oldWeapon, ...parsedWeapon }, id)

    if (oldWeapon && newWeapon.location !== oldWeapon.location) {
      const prevChar = this.database.chars.get(oldWeapon.location)
      const newChar = this.database.chars.get(newWeapon.location)

      // previously equipped art at new location
      const prevWeapon = super.get(newChar?.equippedWeapon)

      //current prevWeapon <-> newChar  && newWeapon <-> prevChar
      //swap to prevWeapon <-> prevChar && newWeapon <-> newChar(outside of this if)

      if (prevWeapon)
        super.set(prevWeapon.id, { ...prevWeapon, location: prevChar?.key ?? "" })
      if (newChar)
        this.database.chars.setEquippedWeapon(newChar.key, newWeapon.id)
      if (prevChar)
        this.database.chars.setEquippedWeapon(prevChar.key, prevWeapon?.id ?? "")
    } else if (newWeapon.location) // Trigger a update to character as well
      this.database.chars.trigger(newWeapon.location)

    super.set(id, newWeapon)
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
  let candidate = ""
  do {
    candidate = `weapon_${getRandomInt(1, 2 * (keys.size + 1))}`
  } while (keys.has(candidate))
  return candidate
}
