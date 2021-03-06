import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Blackcliff_Amulet.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  pa: {
    name: "Opponents Defeated",
    maxStack: 3,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Blackcliff Agate",
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: "Press the Advantage",
  passiveDescription: stats => `After defeating an opponent, ATK is increased by ${refinementVals[stats.weapon.refineIndex]}% for 30s. This effect has a maximum of 3 stacks, and the duration of each stack is independent of the others.`,
  description: "A mysterious catalyst made of a material known as \"blackcliff.\" It has an ominous crimson glow that seems to pulse in synchronization with the tremors from deep within the earth.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "critDMG_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  conditionals
}
export default weapon