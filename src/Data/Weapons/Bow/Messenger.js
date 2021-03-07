import DisplayPercent from "../../../Components/DisplayPercent"
import Messenger from './Weapon_Messenger.png'
const refinementVals = [100, 125, 150, 175, 200]
const weapon = {
  name: "Messenger",
  weaponType: "bow",
  img: Messenger,
  rarity: 3,
  passiveName: "Archer's Message",
  passiveDescription: (refineIndex, charFinalStats) => <span>Charged Attack hits on weak points deal an additional {refinementVals[refineIndex]}% ATK DMG as CRIT DMG{DisplayPercent(refinementVals[refineIndex], charFinalStats, "physical_critHit")}. Can only occur once every 10s.</span>,
  description: "A basic wooden bow. It is said to have once been used as a tool for long-distance communication.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    subStatKey: "critDMG_",
    sub: [6.8, 7.9, 9.3, 10.6, 12, 12, 13.4, 14.8, 16.1, 17.5, 17.5, 18.9, 20.3, 20.3, 21.6, 23, 23, 24.4, 25.7, 25.7, 27.1, 28.5, 28.5, 29.9, 31.2],
  }
}
export default weapon