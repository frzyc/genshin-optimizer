import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "LithicBlade"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condStackPath, condStack] = cond(key, "stack")
const atkInc = [0.07, 0.08, 0.09, 0.1, 0.11]
const critInc = [0.03, 0.04, 0.05, 0.06, 0.07]
const atk_ = lookup(condStack, objectKeyMap(range(1, 4), i => prod(subscript(input.weapon.refineIndex, atkInc, { key: "_" }), i)), naught)
const critRate_ = lookup(condStack, objectKeyMap(range(1, 4), i => prod(subscript(input.weapon.refineIndex, critInc, { key: "_" }), i)), naught)
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    critRate_
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condStack,
    path: condStackPath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: trm("condName"),
    states: Object.fromEntries(range(1, 4).map(i => [i, {
      name: st("member", { count: i }),
      fields: [{
        node: atk_
      }, {
        node: critRate_
      }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
