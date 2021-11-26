import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import formula, { data } from './data'
import Stat from '../../../../Stat'
import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import { st } from '../../../Characters/SheetUtil'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    fields: [{
      text: st("dmg"),
      formulaText: stats => <span>{data.vals[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon