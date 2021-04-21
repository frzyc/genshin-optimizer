import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Aquila_Favonia.png'

const refinementVals = [20, 25, 30, 35, 40]
const refinementRegenVals = [100, 115, 130, 145, 160]
const refinementDmgVals = [200, 230, 260, 290, 320]
const weapon : WeaponSheet = {
  name: "Aquila Favonia",
  weaponType: "sword",
  img,
  rarity: 5,
  passiveName: "Falcon's Defiance",
  passiveDescription: stats => <span>ATK is increased by {refinementVals[stats.weapon.refineIndex]}%. Triggers on taking DMG: the soul of the Falcon of the West awakens, holding the banner of resistance aloft, regenerating HP equal to {refinementRegenVals[stats.weapon.refineIndex]}% of ATK{DisplayPercent(refinementRegenVals[stats.weapon.refineIndex], stats, "finalATK")} and dealing {refinementDmgVals[stats.weapon.refineIndex]}% of ATK{DisplayPercent(refinementDmgVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))} as DMG to surrounding opponents. This effect can only occur once every 15s.</span>,
  description: "The soul of the Knights of Favonius. Millennia later, it still calls on the winds of swift justice to vanquish all evil— just like the last heroine who wielded it.",
  baseStats: {
    main: [48, 65, 87, 110, 133, 164, 188, 212, 236, 261, 292, 316, 341, 373, 398, 423, 455, 480, 506, 537, 563, 590, 621, 648, 674],
    subStatKey: "physical_dmg_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  stats: stats => ({
    atk_: refinementVals[stats.weapon.refineIndex]
  })
}
export default weapon