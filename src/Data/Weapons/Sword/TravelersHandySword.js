import DisplayPercent from "../../../Components/DisplayPercent"
import TravelersHandySword from './Weapon_Traveler\'s_Handy_Sword.png'
const refinementVals = [1, 1.25, 1.5, 1.75, 2]
const weapon = {
  name: "Traveler’s Handy Sword",
  weaponType: "sword",
  img: TravelersHandySword,
  rarity: 3,
  passiveName: "Journey",
  passiveDescription: (refineIndex, charFinalStats) => <span>Each Elemental Orb or Particle collected restores {refinementVals[refineIndex]}% HP{DisplayPercent(refinementVals[refineIndex], charFinalStats, "finalHP")}.</span>,
  description: "A handy steel sword which contains scissors, a magnifying glass, tinder, and other useful items in its sheath.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    subStatKey: "def_",
    sub: [6.4, 7.4, 8.7, 10, 11.3, 11.3, 12.5, 13.8, 15.1, 16.4, 16.4, 17.7, 19, 19, 20.3, 21.6, 21.6, 22.8, 24.1, 24.1, 25.4, 26.7, 26.7, 28, 29.3],
  },
}
export default weapon