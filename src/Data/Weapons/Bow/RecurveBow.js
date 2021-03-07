import DisplayPercent from "../../../Components/DisplayPercent"
import RecurveBow from './Weapon_Recurve_Bow.png'
const refinementVals = [8, 10, 12, 14, 16]
const weapon = {
  name: "Recurve Bow",
  weaponType: "bow",
  img: RecurveBow,
  rarity: 3,
  passiveName: "Cull the Weak",
  passiveDescription: (refineIndex, charFinalStats) => <span>Defeating an opponent restores {refinementVals[refineIndex]}% HP{DisplayPercent(refinementVals[refineIndex], charFinalStats, "finalHP")}.</span>,
  description: "It is said that this bow can shoot down eagles in flight, but ultimately how true that is depends on the skill of the archer.",
  baseStats: {
    main: [38, 48, 61, 73, 86, 105, 117, 129, 140, 151, 171, 182, 193, 212, 223, 234, 253, 264, 274, 294, 304, 314, 334, 344, 354],
    subStatKey: "hp_",
    sub: [10.2, 11.9, 13.9, 16, 18, 18, 20.1, 22.2, 24.2, 26.3, 26.3, 28.4, 30.4, 30.4, 32.5, 34.6, 34.6, 36.6, 38.7, 38.7, 40.7, 42.8, 42.8, 44.9, 46.9],
  }
}
export default weapon