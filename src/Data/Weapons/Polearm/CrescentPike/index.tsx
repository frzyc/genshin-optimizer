import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Crescent_Pike.png'
import formula, { data } from './CrescentPikeData'
import { Translate, TransWrapper } from '../../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="weapon_CrescentPike_gen" key18={strKey} />
const weapon: IWeaponSheet = {
  name: tr("name"),
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: tr("passiveName"),
  passiveDescription: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
  description: tr("description"),
  baseStats: {
    main: [44, 59, 79, 99, 119, 144, 165, 185, 205, 226, 252, 273, 293, 319, 340, 361, 387, 408, 429, 455, 476, 497, 523, 544, 565],
    substatKey: "physical_dmg_",
    sub: [7.5, 8.7, 10.2, 11.7, 13.3, 13.3, 14.8, 16.3, 17.8, 19.3, 19.3, 20.8, 22.4, 22.4, 23.9, 25.4, 25.4, 26.9, 28.4, 28.4, 29.9, 31.5, 31.5, 33, 34.5],
  },
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.vals[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon