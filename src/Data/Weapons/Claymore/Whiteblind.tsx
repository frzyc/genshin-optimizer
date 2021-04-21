import { Conditionals } from '../../../Conditional/Conditionalnterface'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Whiteblind.png'

const refinementVals = [6, 7.5, 9, 10.5, 12]
const conditionals: Conditionals = {
  infusionBlade: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      def_: refinementVals[stats.weapon.refineIndex]
    }),
    fields: [{
      text: "Duration",
      value: "6s"
    }]
  }
}
const weapon: WeaponSheet = {
  name: "Whiteblind",
  weaponType: "claymore",
  img,
  rarity: 4,
  passiveName: "Infusion Blade",
  passiveDescription: stats => `On hit, Normal or Charged Attacks increase ATK and DEF by ${refinementVals[stats.weapon.refineIndex]}% for 6s. Max 4 stacks. This effect can only occur once every 0.5s.`,
  description: "An exotic sword with one section of the blade left blunt. It made its way into Liyue via the hands of foreign traders. Incredibly powerful in the hands of someone who knows how to use it.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "def_",
    sub: [11.3, 13.1, 15.3, 17.6, 19.9, 19.9, 22.2, 24.4, 26.7, 29, 29, 31.3, 33.5, 33.5, 35.8, 38.1, 38.1, 40.4, 42.6, 42.6, 44.9, 47.2, 47.2, 49.5, 51.7],
  },
  conditionals,
}
export default weapon