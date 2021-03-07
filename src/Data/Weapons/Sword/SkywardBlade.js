import Character from '../../../Character/Character'
import DisplayPercent from '../../../Components/DisplayPercent'
import SkywardBlade from './Weapon_Skyward_Blade.png'
const refinementVals = [4, 5, 6, 7, 8]
const refinementMoveSpdVals = [10, 10, 10, 10, 10]
const refinementatkSpdVals = [10, 10, 10, 10, 10]
const refinementautoVals = [20, 25, 30, 35, 40]
const weapon = {
  name: "Skyward Blade",
  weaponType: "sword",
  img: SkywardBlade,
  rarity: 5,
  passiveName: "Sky-Piercing Fang",
  passiveDescription: (refineIndex, charFinalStats, c) => <span>CRIT Rate increased by {refinementVals[refineIndex]}%. Gains <b>Skypiercing Might</b> upon using an Elemental Burst: Increases Movement SPD by {refinementMoveSpdVals[refineIndex]}%, increases ATK SPD by {refinementatkSpdVals[refineIndex]}%, and Normal and Charged hits deal additional DMG equal to {refinementautoVals[refineIndex]}% of ATK{DisplayPercent(refinementautoVals[refineIndex], charFinalStats, Character.getTalentStatKey("phy", c))}. Skypiercing Might lasts for 12s.</span>,
  description: "The sword of a knight that symbolizes the restored honor of Dvalin. The blessings of the Anemo Archon rest on the fuller of the blade, imbuing the sword with the powers of the sky and the wind.",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "enerRech_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  stats: (refineIndex) => ({
    critRate_: refinementVals[refineIndex]
  }),
  conditional: {
    type: "weapon",
    sourceKey: "SkywardBlade",
    maxStack: 1,
    stats: (refineIndex) => ({
      moveSPD_: refinementMoveSpdVals[refineIndex],
      atkSPD_: refinementatkSpdVals[refineIndex],
    })
  }
}
export default weapon