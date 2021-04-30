import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Halberd.png'

const refinementVals = [160, 200, 240, 280, 320]
const weapon: IWeaponSheet = {
  name: "Halberd",
  weaponType: "polearm",
  img,
  rarity: 3,
  passiveName: "Heavy",
  passiveDescription: stats => <span>Normal Attacks deal an additional {refinementVals[stats.weapon.refineIndex]}% ATK{DisplayPercent(refinementVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))} as DMG. Can only occur once every 10s.</span>,
  description: "A polearm with an axe blade mounted on top that can deal quite a lot of damage. It's favored by the Millelith officers.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    substatKey: "atk_",
    sub: [5.1, 5.9, 7, 8, 9, 9, 10.1, 11.1, 12.1, 13.1, 13.1, 14.2, 15.2, 15.2, 16.2, 17.3, 17.3, 18.3, 19.3, 19.3, 20.4, 21.4, 21.4, 22.4, 23.5],
  }
}
export default weapon