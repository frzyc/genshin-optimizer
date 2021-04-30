import DisplayPercent from "../../../Components/DisplayPercent"
import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_The_Bell.png'

const refinementVals = [12, 15, 18, 21, 24]
const refinementShieldVals = [20, 23, 26, 29, 32]
const conditionals: IConditionals = {
  rg: {
    name: "Taking DMG",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "The Bell",
  weaponType: "claymore",
  img,
  rarity: 4,
  passiveName: "Rebellious Guardian",
  passiveDescription: stats => <span>Taking DMG generates a shield which absorbs DMG up to {refinementShieldVals[stats.weapon.refineIndex]}% of Max HP{DisplayPercent(refinementShieldVals[stats.weapon.refineIndex], stats, "finalHP")}. This shield lasts for 10s or until broken, and can only be triggered once every 45s. While protected by the shield, the character gains {refinementVals[stats.weapon.refineIndex]}% increased DMG.</span>,
  description: "A heavy greatsword. A clock is embedded within it, though its internal mechanisms have long been damaged.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "hp_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditionals,
}
export default weapon