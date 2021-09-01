import { WeaponKey, WeaponTypeKey } from "../Types/consts"
import { IWeapon } from "../Types/weapon"

function defaultInitialWeaponKey(type: WeaponTypeKey): WeaponKey {
  switch (type) {
    case "sword": return "DullBlade"
    case "bow": return "HuntersBow"
    case "claymore": return "WasterGreatsword"
    case "polearm": return "BeginnersProtector"
    case "catalyst": return "ApprenticesNotes"
    default: return "DullBlade"
  }
}

export const initialWeapon = (type: WeaponTypeKey): IWeapon => ({
  id: "",
  key: defaultInitialWeaponKey(type),
  level: 1,
  ascension: 0,
  refineIndex: 0,
  location: ""
})