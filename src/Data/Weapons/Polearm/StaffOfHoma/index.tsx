import { WeaponData } from 'pipeline'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import { KeyPath } from '../../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../../formula'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import formula, { data } from './data'
import { st } from '../../../Characters/SheetUtil'
const path = KeyPath<FormulaPathBase>().weapon.StaffOfHoma
const refinementVals_hp = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    hp_: refinementVals_hp[stats.weapon.refineIndex],
    modifiers: { atk: [path.esj()] }
  }),
  document: [{
    fields: [{
      text: st("increase.atk"),
      formulaText: stats => <span>{data.hp_atk[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats, true)}</span>,
      formula: formula.esj,
    }],
    conditional: {
      key: "hp",
      name: "HP < 50%",
      maxStack: 1,
      stats: {
        modifiers: { atk: [path.esjadd()] }
      },
      fields: [{
        text: st("increase.atk"),
        formulaText: stats => <span>{data.hp_atk_add[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats, true)}</span>,
        formula: formula.esjadd,
      }],
    }
  }],
}
export default weapon