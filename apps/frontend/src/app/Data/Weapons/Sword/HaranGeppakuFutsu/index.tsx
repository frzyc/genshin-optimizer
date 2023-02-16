import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from "../../../../Formula/utils"
import KeyMap from '../../../../KeyMap'
import { allElementKeys, WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "HaranGeppakuFutsu"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const passiveRefine = [0.12, 0.15, 0.18, 0.21, 0.24]
const stack_normal_dmg_ = [0.2, 0.25, 0.3, 0.35, 0.4]

const [condPath, condNode] = cond(key, "HonedFlow")
const passive_dmg_ = Object.fromEntries(allElementKeys.map(ele =>
  [`${ele}_dmg_`,
  subscript(input.weapon.refineIndex, passiveRefine, KeyMap.info(`${ele}_dmg_`))]
))
const normal_dmg_ = lookup(condNode,
  objectKeyMap(range(1, 2), i => prod(i, subscript(input.weapon.refineIndex, stack_normal_dmg_)))
  , naught)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...passive_dmg_,
    normal_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [ // Passive
      ...allElementKeys.map((ele) => {
        return { node: passive_dmg_[`${ele}_dmg_`] }
      })
    ],
  }, {
    value: condNode,
    path: condPath,
    name: trm("consumed"),
    header: headerTemplate(key, st("conditional")),
    states: objectKeyMap(range(1, 2), i => ({
      name: st("stack", { count: i }),
      fields: [{ node: normal_dmg_ }]
    }))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
