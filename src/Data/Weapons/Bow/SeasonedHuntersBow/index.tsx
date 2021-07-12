import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Seasoned_Hunter\'s_Bow.png'

const weapon: IWeaponSheet = {
  name: "Seasoned Hunter’s Bow",
  weaponType: "bow",
  img,
  rarity: 2,
  passiveName: "",
  passiveDescription: () => ``,
  description: "A bow that has been well-polished by time and meticulously cared for by its owner. It feels almost like an extension of the archer's arm.",
  baseStats: {
    main: [33, 43, 55, 68, 80, 91, 103, 115, 127, 139, 151, 162, 174, 186, 197, 209, 220, 232, 243],
    substatKey: "",
  }
}
export default weapon