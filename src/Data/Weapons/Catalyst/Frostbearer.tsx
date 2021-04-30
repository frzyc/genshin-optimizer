import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Frostbearer.png'

const refinementChanceVals = [60, 70, 80, 90, 100]
const refinementDmgVals = [80, 95, 110, 125, 140]
const refinementDmgCryoVals = [200, 240, 280, 320, 360]
const weapon: IWeaponSheet = {
  name: "Frostbearer",
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: "Frost Burial",
  passiveDescription: stats => <span>Hitting an opponent with Normal and Charged Attacks has a {refinementChanceVals[stats.weapon.refineIndex]}% chance of forming and dropping an Everfrost Icicle above them, dealing {refinementDmgVals[stats.weapon.refineIndex]}% AoE ATK DMG{DisplayPercent(refinementDmgVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))}. Opponents affected by <span className="text-cryo">Cryo</span> are dealt {refinementDmgCryoVals[stats.weapon.refineIndex]}% ATK DMG{DisplayPercent(refinementDmgCryoVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))}. Can only occur once every 10s.</span>,
  description: "A fruit that possesses a strange frosty will. A faint sense of agony emanates from it.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  }
}
export default weapon