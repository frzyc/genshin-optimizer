import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "IronSting"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

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
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: trm("condName"),
    states: Object.fromEntries(eleDmgDealtStack.map(c => [c, {
      name: st("stack", { count: c }),
      fields: [{
        node: all_dmg_,
      }, {
        text: sgt("duration"),
        value: 6,
        unit: "s"
      }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
