import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Old_Merc\'s_Pal.png'

const weapon: IWeaponSheet = {
  name: "Old Merc’s Pal",
  weaponType: "claymore",
  img,
  rarity: 2,
  passiveName: "",
  passiveDescription: () => ``,
  description: "A battle-tested greatsword that has seen better days and worse.",
  baseStats: {
    main: [33, 43, 55, 68, 80, 91, 103, 115, 127, 139, 151, 162, 174, 186, 197, 209, 220, 232, 243],
    substatKey: "",
  },
}
export default weapon