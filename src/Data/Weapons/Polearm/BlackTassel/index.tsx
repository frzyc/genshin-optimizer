import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Black_Tassel.png'

const refinementVals = [40, 50, 60, 70, 80]
const weapon: IWeaponSheet = {
  name: "Black Tassel",
  weaponType: "polearm",
  img,
  rarity: 3,
  passiveName: "Bane of the Soft",
  passiveDescription: stats => `Increases DMG against slimes by ${refinementVals[stats.weapon.refineIndex]}%.`,
  description: "An exceptionally powerful polearm that also offers a simple but elegant solution to the issue of the easily stained white tassel.",
  baseStats: {
    main: [38, 48, 61, 73, 86, 105, 117, 129, 140, 151, 171, 182, 193, 212, 223, 234, 253, 264, 274, 294, 304, 314, 334, 344, 354],
    substatKey: "hp_",
    sub: [10.2, 11.9, 13.9, 16, 18, 18, 20.1, 22.2, 24.2, 26.3, 26.3, 28.4, 30.4, 30.4, 32.5, 34.6, 34.6, 36.6, 38.7, 38.7, 40.7, 42.8, 42.8, 44.9, 46.9],
  }
}
export default weapon