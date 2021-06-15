import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Lost_Prayer_to_the_Sacred_Winds.png'

const refinementVals = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  bb: {
    name: "Duration on Field (4s / stack)",
    maxStack: 4,
    stats: stats => ({
      anemo_dmg_: refinementVals[stats.weapon.refineIndex],
      geo_dmg_: refinementVals[stats.weapon.refineIndex],
      electro_dmg_: refinementVals[stats.weapon.refineIndex],
      hydro_dmg_: refinementVals[stats.weapon.refineIndex],
      pyro_dmg_: refinementVals[stats.weapon.refineIndex],
      cryo_dmg_: refinementVals[stats.weapon.refineIndex],
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Lost Prayer to the Sacred Winds",
  weaponType: "catalyst",
  img,
  rarity: 5,
  passiveName: "Boundless Blessing",
  passiveDescription: stats => `Increases Movement SPD by 10%. When in battle, gain an ${refinementVals[stats.weapon.refineIndex]}% Elemental DMG Bonus every 4s. Max 4 stacks. Lasts until the character falls or leaves combat.`,
  description: "An educational tome written by anonymous early inhabitants who worshiped the wind. It has been blessed by the wind for its faithfulness and influence over the millennia.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    substatKey: "critRate_",
    sub: [7.2, 8.4, 9.8, 11.3, 12.7, 12.7, 14.2, 15.6, 17.1, 18.5, 18.5, 20, 21.4, 21.4, 22.9, 24.4, 24.4, 25.8, 27.3, 27.3, 28.7, 30.2, 30.2, 31.6, 33.1],
  },
  stats: () => ({
    moveSPD_: 10
  }),
  conditionals,
}
export default weapon