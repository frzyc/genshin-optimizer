import { WeaponKey } from '@genshin-optimizer/consts'
import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { constant, lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, stg } from '../../../SheetUtil'
import { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "IronSting"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "InfusionStinger")
const eleDmgDealtStack = range(1, 2)
const allDmgInc = [0.06, 0.075, 0.09, 0.105, 0.12]
const all_dmg_ = prod(lookup(condPassive, objectKeyMap(eleDmgDealtStack, i => constant(i)), naught),
  subscript(input.weapon.refineIndex, allDmgInc))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_
  }
})
const sheet: IWeaponSheet = {
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, st("stacks")),
    name: st("hitOp.ele"),
    states: Object.fromEntries(eleDmgDealtStack.map(c => [c, {
      name: st("stack", { count: c }),
      fields: [{
        node: all_dmg_,
      }, {
        text: stg("duration"),
        value: 6,
        unit: "s"
      }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
