import { getTalentStatKey } from '../../../Build/Build'
import DisplayPercent from "../../../Components/DisplayPercent"
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_The_Flute.png'

const refinementVals = [100, 125, 150, 175, 200]
const weapon: IWeaponSheet = {
  name: "The Flute",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Chord",
  passiveDescription: stats => <span>Normal or Charged Attacks grant a Harmonic on hits. Gaining 5 Harmonics triggers the power of music and deals {refinementVals[stats.weapon.refineIndex]}% ATK DMG{DisplayPercent(refinementVals[stats.weapon.refineIndex], stats, getTalentStatKey("physical", stats))} to surrounding opponents. Harmonics last up to 30s, and a maximum of 1 can be gained every 0.5s.</span>,
  description: "Beneath its rusty exterior is a lavishly decorated thin blade. It swings as swiftly as the wind.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  }
}
export default weapon