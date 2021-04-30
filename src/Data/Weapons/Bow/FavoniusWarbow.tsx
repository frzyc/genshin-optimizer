import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Favonius_Warbow.png'

const refinementVals = [60, 70, 80, 90, 100]
const refinementCdVals = [12, 10.5, 9, 7.5, 6]
const weapon: IWeaponSheet = {
  name: "Favonius Warbow",
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: "Windfall",
  passiveDescription: stats => `CRIT hits have a ${refinementVals[stats.weapon.refineIndex]}% chance to generate 1 Elemental Orb, which will regenerate 6 Energy for the character. Can only occur once every ${refinementCdVals[stats.weapon.refineIndex]}.`,
  description: "A standard-issue recurve bow of the Knights of Favonius. Only the best archers can unleash its full potential.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    substatKey: "enerRech_",
    sub: [13.3, 15.5, 18.2, 20.9, 23.6, 23.6, 26.3, 28.9, 31.6, 34.3, 34.3, 37, 39.7, 39.7, 42.4, 45.1, 45.1, 47.8, 50.5, 50.5, 53.2, 55.9, 55.9, 58.6, 61.3],
  },
}
export default weapon