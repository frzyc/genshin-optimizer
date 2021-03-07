import SnowTombedStarsilver from './Weapon_Snow-Tombed_Starsilver.png'
import Character from "../../../Character/Character"
import DisplayPercent from "../../../Components/DisplayPercent"

const refinementVals = [60, 70, 80, 90, 100]
const refinementDmgVals = [80, 95, 110, 125, 140]
const refinementDmgBonusVals = [200, 240, 280, 320, 360]
const weapon = {
  name: "Snow-Tombed Starsilver",
  weaponType: "claymore",
  img: SnowTombedStarsilver,
  rarity: 4,
  passiveName: "Frost Burial",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>Hitting an opponent with Normal and Charged Attacks has a {refinementVals[refineIndex]}% chance of forming and dropping an Everfrost Icicle above them, dealing {refinementDmgVals[refineIndex]}% AoE ATK DMG{DisplayPercent(refinementDmgVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))}. Opponents affected by <span className="text-cryo">Cryo</span> are dealt {refinementDmgBonusVals[refineIndex]}% ATK DMG{DisplayPercent(refinementDmgBonusVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))}. Can only occur once every 10s.</span>,
  description: "An ancient greatsword that was stored between frescoes. Forged from Starsilver, it has the power to cleave through ice and snow.",
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    subStatKey: "physical_dmg_",
    sub: [7.5, 8.7, 10.2, 11.7, 13.3, 13.3, 14.8, 16.3, 17.8, 19.3, 19.3, 20.8, 22.4, 22.4, 23.9, 25.4, 25.4, 26.9, 28.4, 28.4, 29.9, 31.5, 31.5, 33, 34.5],
  }
}
export default weapon