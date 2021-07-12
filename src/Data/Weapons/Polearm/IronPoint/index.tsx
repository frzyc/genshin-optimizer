import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Iron_Point.png'

const weapon: IWeaponSheet = {
  name: "Iron Point",
  weaponType: "polearm",
  img,
  rarity: 2,
  passiveName: "",
  passiveDescription: () => ``,
  description: "Sharp and pointy at one end, it is a balanced weapon that is quite popular among travelers.",
  baseStats: {
    main: [33, 43, 55, 68, 80, 91, 103, 115, 127, 139, 151, 162, 174, 186, 197, 209, 220, 232, 243],
    substatKey: ""
  }
}
export default weapon