import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Beginner\'s_Protector.png'

const weapon: IWeaponSheet = {
  name: "Beginner’s Protector",
  weaponType: "polearm",
  img,
  rarity: 1,
  passiveName: "",
  passiveDescription: () => ``,
  description: "A polearm as straight as a flag pole. Well suited to most combat situations, it has an imposing presence when swung.",
  baseStats: {
    main: [23, 30, 39, 48, 56, 68, 76, 85, 93, 102, 113, 121, 130, 141, 149, 158, 169, 177, 185],
    substatKey: "",
  },
}
export default weapon