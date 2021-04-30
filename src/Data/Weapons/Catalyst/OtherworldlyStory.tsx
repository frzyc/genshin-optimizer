import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Otherworldly_Story.png'

const refinementVals = [1, 1.25, 1.5, 1.75, 2]
const weapon: IWeaponSheet = {
  name: "Otherworldly Story",
  weaponType: "catalyst",
  img,
  rarity: 3,
  passiveName: "Energy Shower",
  passiveDescription: stats => <span>Each Elemental Orb or Particle collected restores {refinementVals[stats.weapon.refineIndex]}% HP{DisplayPercent(refinementVals[stats.weapon.refineIndex], stats, "finalHP")}</span>,
  description: "A cheap fantasy novel with no value whatsoever. Any claim that it possesses the power of catalysis is also pure fantasy.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    substatKey: "enerRech_",
    sub: [8.5, 9.9, 11.6, 13.3, 15, 15, 16.7, 18.5, 20.2, 21.9, 21.9, 23.6, 25.3, 25.3, 27, 28.8, 28.8, 30.5, 32.2, 32.2, 33.9, 35.6, 35.6, 37.3, 39],
  },
}
export default weapon