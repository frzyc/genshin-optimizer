import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import { KeyPath } from '../../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../../formula'
import data_gen from './data_gen.json'
import img from './Weapon_Primordial_Jade_Cutter.png'
import formula, { data } from './data'
import Stat from '../../../../Stat'

const path = KeyPath<FormulaPathBase>().weapon.PrimordialJadeCutter
const refinementVals_hp = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    hp_: refinementVals_hp[stats.weapon.refineIndex],
    modifiers: { finalATK: [path.bonus()] }
  }),
  document: [{
    fields: [{
      text: "ATK Increase",
      formulaText: stats => <span>{data.hp_atk[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats, true)}</span>,
      formula: formula.bonus,
    }]
  }]
}
export default weapon