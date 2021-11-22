import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { sgt, st } from '../../../Characters/SheetUtil'
const atk_ = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    atk_: atk_[stats.weapon.refineIndex]
  }),
  document: [{
    fields: [{
      text: sgt("healing"),
      formulaText: stats => <span>{data.heal[stats.weapon.refineIndex]}% {Stat.printStat("finalATK", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.heal,
      variant: "success"
    }, {
      text: st("dmg"),
      formulaText: stats => <span>{data.dmg[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon