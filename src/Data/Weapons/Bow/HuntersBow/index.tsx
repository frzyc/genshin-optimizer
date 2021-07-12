import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Hunter\'s_Bow.png'

const weapon: IWeaponSheet = {
  name: "Hunter’s Bow",
  weaponType: "bow",
  img,
  rarity: 1,
  passiveName: "",
  passiveDescription: () => ``,
  description: "A hunter's music consists of but two sounds: the twang of the bowstring and the whoosh of soaring arrows.",
  baseStats: {
    main: [23, 30, 39, 48, 56, 68, 76, 85, 93, 102, 113, 121, 130, 141, 149, 158, 169, 177, 185],
    substatKey: "",
  }
}
export default weapon