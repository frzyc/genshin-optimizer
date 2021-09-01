import { WeaponKey, WeaponTypeKey } from "../Types/consts"
import { IWeapon } from "../Types/weapon"

export function defaultInitialWeaponKey(type: WeaponTypeKey): WeaponKey {
  switch (type) {
    case "sword":
      return "DullBlade"
    case "bow":
      return "HuntersBow"
    case "claymore":
      return "WasterGreatsword"
    case "polearm":
      return "BeginnersProtector"
    case "catalyst":
      return "ApprenticesNotes"

    default:
      return "DullBlade"
  }
}

export const initialWeapon = (weaponKey): IWeapon => ({
  id: "",
  key: weaponKey ?? "",
  level: 1,
  ascension: 0,
  refineIndex: 0,
  location: ""
})