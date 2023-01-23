import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "SkyriderGreatsword"
const data_gen = data_gen_json as WeaponData

const [condStackPath, condStack] = cond(key, "stack")
const bonusInc = [0.06, 0.07, 0.08, 0.09, 0.1]
const atk_ = lookup(condStack, objectKeyMap(range(1, 4), i => prod(subscript(input.weapon.refineIndex, bonusInc, { unit: "%" }), i)), naught)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  },
})
const sheet: IWeaponSheet = {
  document: [{
    value: condStack,
    path: condStackPath,
    name: st("hitOp.normalOrCharged"),
    header: headerTemplate(key, st("stacks")),
    states: Object.fromEntries(range(1, 4).map(i => [i, {
      name: st("stack", { count: i }),
      fields: [{
        node: atk_
      }, {
        text: stg("duration"),
        value: 6,
        unit: "s"
      }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
