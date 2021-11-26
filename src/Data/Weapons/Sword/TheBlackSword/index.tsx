import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import Stat from '../../../../Stat'
import { sgt } from '../../../Characters/SheetUtil'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    normal_dmg_: data.dmg_[stats.weapon.refineIndex],
    charged_dmg_: data.dmg_[stats.weapon.refineIndex]
  }),
  document: [{
    fields: [{
      text: sgt("healing"),
      formulaText: stats => <span>{data.heal[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.regen,
      variant: "success"
    }]
  }]
}
export default weapon