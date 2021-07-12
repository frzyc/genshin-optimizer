import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Waster_Greatsword.png'

const weapon: IWeaponSheet = {
  name: "Waster Greatsword",
  weaponType: "claymore",
  img,
  rarity: 1,
  passiveName: "",
  passiveDescription: () => ``,
  description: "A sturdy sheet of iron that may be powerful enough to break apart mountains if wielded with enough willpower.",
  baseStats: {
    main: [23, 30, 39, 48, 56, 68, 76, 85, 93, 102, 113, 121, 130, 141, 149, 158, 169, 177, 185],
    substatKey: "",
  },
}
export default weapon