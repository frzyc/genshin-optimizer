import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Prototype_Rancour.png'

const refinementVals = [4, 5, 6, 7, 8]
const conditionals: IConditionals = {
  smashedStone: {
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
const weapon: IWeaponSheet = {
  name: "Prototype Rancour",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Smashed Stone",
  passiveDescription: stats => `On hit, Normal or Charged Attacks increase ATK and DEF by ${refinementVals[stats.weapon.refineIndex]}% for 6s. Max 4 stacks. This effect can only occur once every 0.3s.`,
  description: "An ancient longsword discovered in the Blackcliff Forge that cuts through rocks like a hot knife through butter.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    substatKey: "physical_dmg_",
    sub: [7.5, 8.7, 10.2, 11.7, 13.3, 13.3, 14.8, 16.3, 17.8, 19.3, 19.3, 20.8, 22.4, 22.4, 23.9, 25.4, 25.4, 26.9, 28.4, 28.4, 29.9, 31.5, 31.5, 33, 34.5],
  },
  conditionals,
}
export default weapon