import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_The_Viridescent_Hunt.png'
import formula, { data } from './TheViridescentHuntData'
import Stat from '../../../../Stat'
import { Translate } from '../../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="weapon_TheViridescentHunt_gen" key18={strKey} />
const weapon: IWeaponSheet = {
  name: tr("name"),
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: tr("passiveName"),
  passiveDescription: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
  description: tr("description"),
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "critRate_",
    sub: [6, 7, 8.2, 9.4, 10.6, 10.6, 11.8, 13, 14.2, 15.5, 15.5, 16.7, 17.9, 17.9, 19.1, 20.3, 20.3, 21.5, 22.7, 22.7, 23.9, 25.1, 25.1, 26.4, 27.6],
  },
  document: [{
    fields: [{
      text: <Translate ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.vals[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon