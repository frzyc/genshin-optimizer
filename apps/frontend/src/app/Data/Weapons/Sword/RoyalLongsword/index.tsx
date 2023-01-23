import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "RoyalLongsword"
const data_gen = data_gen_json as WeaponData

const [condStackPath, condStack] = cond(key, "stack")
const crit_ = [0.08, 0.1, 0.12, 0.14, 0.16]
const critRate_ = lookup(condStack, objectKeyMap(range(1, 5), i => prod(subscript(input.weapon.refineIndex, crit_, { unit: "%" }), i)), naught)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_
  },
})
const sheet: IWeaponSheet = {
  document: [{
    value: condStack,
    path: condStackPath,
    header: headerTemplate(key, st("stacks")),
    name: st("opponentsDamaged"),
    states: Object.fromEntries(range(1, 5).map(i => [i, {
      name: st("stack", { count: i }),
      fields: [{ node: critRate_ }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
