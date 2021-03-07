import DisplayPercent from "../../../Components/DisplayPercent"
import PrototypeMalice from './Weapon_Prototype_Malice.png'
const refinementVals = [4, 4.5, 5, 5.5, 6]
const weapon = {
  name: "Prototype Amber",
  weaponType: "catalyst",
  img: PrototypeMalice,
  rarity: 4,
  passiveName: "Gilding",
  passiveDescription: (refineIndex, charFinalStats) => <span>Using an Elemental Burst regenerates {refinementVals[refineIndex]} Energy every 2s for 6s. All party members will regenerate {refinementVals[refineIndex]}% HP{DisplayPercent(refinementVals[refineIndex], charFinalStats, "finalHP")} every 2s for this duration.</span>,//${refinementVals[refineIndex]}
  description: "A dully gilded catalyst secretly guarded in the Blackcliff Forge. It seems to glow with the very light from the sky.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "hp_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditional: {
    type: "weapon",
    sourceKey: "PrototypeMalice",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon