import DisplayPercent from "../../../Components/DisplayPercent"
import WhiteIronGreatsword from './Weapon_White_Iron_Greatsword.png'
const refinementVals = [8, 10, 12, 14, 16]
const weapon = {
  name: "White Iron Greatsword",
  weaponType: "claymore",
  img: WhiteIronGreatsword,
  rarity: 3,
  passiveName: "Cull the Weak",
  passiveDescription: (refineIndex, charFinalStats) => <span>Defeating an opponent restores {refinementVals[refineIndex]}% HP{DisplayPercent(refinementVals[refineIndex], charFinalStats, "finalHP")}.</span>,
  description: "A claymore made from white iron. Lightweight without compromising on power. Effective even when wielded by one of average strength, it is extremely deadly in the hands of a physically stronger wielder.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "def_",
    sub: [9.6, 11.1, 13, 15, 16.9, 16.9, 18.8, 20.8, 22.7, 24.6, 24.6, 26.5, 28.5, 28.5, 30.4, 32.3, 32.3, 34.3, 36.2, 36.2, 38.1, 40.1, 40.1, 42, 43.9],
  }
}
export default weapon