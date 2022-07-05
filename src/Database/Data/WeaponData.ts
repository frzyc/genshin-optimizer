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
        if (location) {
          const char = this.database.chars.get(location)
          if (char && !char.equippedWeapon) {
            this.database.chars.setEquippedWeapon(location, key)
          }
        } else {
          flex.location = ""
        }

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
        this.setLocation(weaponId, charKey)
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

  /**
  * **Caution** This does not update `location` use `setLocation` instead
  */
  set(id: string, value: Partial<IWeapon>) {
    const oldWeapon = super.get(id)
    const parsedWeapon = parseWeapon({ ...oldWeapon, ...value })
    if (!parsedWeapon) return

    const newWeapon = validateWeapon({ ...oldWeapon, ...parsedWeapon }, id)
    super.set(id, newWeapon)
    if (newWeapon.location)
      this.database.chars.trigger(newWeapon.location)
  }

  setLocation(weaponId: string, newCharKey: IWeapon["location"]) {
    const weapon1 = super.get(weaponId)
    const char1 = this.database.chars.get(newCharKey)
    if (!weapon1 || !char1 || weapon1.location === newCharKey) return

    const weapon2 = this.get(char1.equippedWeapon)!
    const char2 = this.database.chars.get(weapon1.location)

    // Currently weapon1 <-> char2 & weapon2 <-> char1
    // Swap to weapon1 <-> char1 & weapon2 <-> char2

    super.set(weapon1.id, { ...weapon1, location: char1.key })
    this.database.chars.setEquippedWeapon(char1.key, weapon1.id)

    if (weapon2)
      super.set(weapon2.id, { ...weapon2, location: char2?.key ?? "" })
    if (char2)
      this.database.chars.setEquippedWeapon(char2.key, weapon2.id)
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
