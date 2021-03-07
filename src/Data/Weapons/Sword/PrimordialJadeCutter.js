import DisplayPercent from '../../../Components/DisplayPercent'
import img from './Weapon_Primordial_Jade_Cutter.png'
const refinementVals_hp = [20, 25, 30, 35, 40]
const refinementVals_hp_Atk = [1.2, 1.5, 1.8, 2.1, 2.4]
const weapon = {
  name: "Primordial Jade Cutter",
  weaponType: "sword",
  img,
  rarity: 5,
  passiveName: "Protector's Virtue",
  passiveDescription: (refineIndex, charFinalStats) => <span>HP increased by {refinementVals_hp[refineIndex]}%. Additionally, provides an ATK Bonus based on {refinementVals_hp_Atk[refineIndex]}% of the wielder's Max HP{DisplayPercent(refinementVals_hp_Atk[refineIndex], charFinalStats, "finalHP")}.</span>,
  description: "A ceremonial sword masterfully carved from pure jade. There almost seems to be an audible sigh in the wind as it is swung.",
  baseStats: {
    main: [44, 58, 76, 93, 110, 141, 158, 176, 193, 210, 241, 258, 275, 307, 324, 341, 373, 390, 408, 439, 457, 475, 506, 524, 542],
    subStatKey: "critRate_",
    sub: [9.6, 11.2, 13.1, 15, 17, 17, 18.9, 20.8, 22.8, 24.7, 24.7, 26.7, 28.6, 28.6, 30.5, 32.5, 32.5, 34.4, 36.3, 36.3, 38.3, 40.2, 40.2, 42.2, 44.1],
  },
  stats: (refineIndex) => ({
    hp_: refinementVals_hp[refineIndex],
    modifiers: { finalATK: { finalHP: refinementVals_hp_Atk[refineIndex] / 100 } }
  })
}
export default weapon