import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import formula, { data } from './data'
import Stat from '../../../../Stat'
import { sgt } from '../../../Characters/SheetUtil'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    fields: [{
      text: sgt("healing"),
      formulaText: stats => <span>{data.heal[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.heal,
      variant: "success"
    }]
  }]
}
export default weapon