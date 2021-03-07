import DragonspineSpear from './Weapon_Dragonspine_Spear.png'
import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"

const refinementVals = [60, 70, 80, 90, 100]
const refinementRawDmgVals = [80, 95, 110, 125, 140]
const refinementRawDmgCryoVals = [200, 240, 280, 320, 360]
const weapon = {
  name: "Dragonspine Spear",
  weaponType: "polearm",
  img: DragonspineSpear,
  rarity: 4,
  passiveName: "Frost Burial",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Hitting an opponent with Normal and Charged Attacks has a {refinementVals[refineIndex]}% chance of forming and dropping an Everfrost Icicle above them, dealing {refinementRawDmgVals[refineIndex]}% AoE ATK DMG{DisplayPercent(refinementRawDmgVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))}. Opponents affected by <span className="text-cryo">Cryo</span> are dealt {refinementRawDmgCryoVals[refineIndex]}% ATK DMG{DisplayPercent(refinementRawDmgCryoVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))}. Can only occur once every 10s.</span>,
  description: "A spear created from the fang of a dragon. It is oddly warm to the touch.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    subStatKey: "physical_dmg_",
    sub: [15, 17.4, 20.5, 23.5, 26.5, 26.5, 29.6, 32.6, 35.6, 38.7, 38.7, 41.7, 44.7, 44.7, 47.8, 50.8, 50.8, 53.8, 56.8, 56.8, 59.9, 62.9, 62.9, 65.9, 69],
  },
}
export default weapon