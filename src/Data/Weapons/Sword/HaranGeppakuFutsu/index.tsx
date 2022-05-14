import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "HaranGeppakuFutsu"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const passiveRefine = [0.12, 0.15, 0.18, 0.21, 0.24]
const stack_normal_dmg_ = [0.2, 0.25, 0.3, 0.35, 0.4]

const [condPath, condNode] = cond(key, "HonedFlow")
const passive_dmg_ = Object.fromEntries(allElements.map(ele =>
  [`${ele}_dmg_`,
  subscript(input.weapon.refineIndex, passiveRefine, { key: `${ele}_dmg_`, variant: ele })]
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
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [ // Passive
      ...allElements.map((ele) => {
        return { node: passive_dmg_[`${ele}_dmg_`] }
      })
    ],
  }, {
    value: condNode,
    path: condPath,
    name: trm("consumed"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: objectKeyMap(range(1, 2), i => ({
      name: st("stack", { count: i }),
      fields: [{ node: normal_dmg_ }]
    }))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
