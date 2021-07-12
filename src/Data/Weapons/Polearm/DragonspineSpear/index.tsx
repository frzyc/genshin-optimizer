import { getTalentStatKey } from '../../../../Build/Build'
import DisplayPercent from "../../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Dragonspine_Spear.png'

const refinementVals = [60, 70, 80, 90, 100]
const refinementRawDmgVals = [80, 95, 110, 125, 140]
const refinementRawDmgCryoVals = [200, 240, 280, 320, 360]
const weapon: IWeaponSheet = {
  name: "Dragonspine Spear",
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: "Frost Burial",
  passiveDescription: stats => <span>Hitting an opponent with Normal and Charged Attacks has a {refinementVals[stats.weapon.refineIndex]}% chance of forming and dropping an Everfrost Icicle above them, dealing {refinementRawDmgVals[stats.weapon.refineIndex]}% AoE ATK DMG{DisplayPercent(refinementRawDmgVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))}. Opponents affected by <span className="text-cryo">Cryo</span> are dealt {refinementRawDmgCryoVals[stats.weapon.refineIndex]}% ATK DMG{DisplayPercent(refinementRawDmgCryoVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))}. Can only occur once every 10s.</span>,
  description: "A spear created from the fang of a dragon. It is oddly warm to the touch.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    substatKey: "physical_dmg_",
    sub: [15, 17.4, 20.5, 23.5, 26.5, 26.5, 29.6, 32.6, 35.6, 38.7, 38.7, 41.7, 44.7, 44.7, 47.8, 50.8, 50.8, 53.8, 56.8, 56.8, 59.9, 62.9, 62.9, 65.9, 69],
  },
}
export default weapon