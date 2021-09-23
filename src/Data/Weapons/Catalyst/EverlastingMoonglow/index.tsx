import { WeaponData } from 'pipeline'
// import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
// import { KeyPath } from '../../../../Util/KeyPathUtil'
// import { FormulaPathBase } from '../../../formula'
// import formula, { data } from './data'
import data_gen from './data_gen.json'
import img from './Weapon_Everlasting_Moonglow.png'

// const path = KeyPath<FormulaPathBase>().weapon.EverlastingMoonglow
const heal_ = [10, 12.5, 15, 17.5, 20]

const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    heal_: heal_[stats.weapon.refineIndex],
    // modifiers: { normal_dmg_: [path.norm()] }
  }),
  document: [{
    fields: [
      // {
      //   text: Stat.getStatName("normal_dmg_"),
      //   formulaText: stats => <span>{data.hp_conv[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats, true)}</span>,
      //   formula: formula.norm,
      //   unit: "%"
      // }
      {
        text: <span className="text-warning">The normal damage increase is not being calculated right now, pending system change.</span>
      }
    ],
  }],
}
export default weapon