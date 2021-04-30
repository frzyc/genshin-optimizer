import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Thrilling_Tales_of_Dragon_Slayers.png'

const refinementVals = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  name: "Thrilling Tales of Dragon Slayers",
  weaponType: "catalyst",
  img,
  rarity: 3,
  passiveName: "Heritage",
  passiveDescription: stats => `When switching characters, the new character taking the field has their ATK increased by ${refinementVals[stats.weapon.refineIndex]}% for 10s. This effect can only occur once every 20s.`,
  description: "A fictional story of a band of five heroes who go off on a dragon hunt. It is poorly written and structurally incoherent. Its value lies in the many lessons that can be learned from failure.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    substatKey: "hp_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  },
  //TODO: show this up as a conditional when in the party
  // conditional: {
  //   type: "weapon",
  //   sourceKey: "ThrillingTalesOfDragonSlayers",
  //   maxStack: 1,
  //   stats: stats => ({
  //     atk_: refinementVals[stats.weapon.refineIndex]
  //   })
  // }
}
export default weapon