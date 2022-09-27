import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, prod, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "StaffOfTheScarletSands"
const data_gen = data_gen_json as WeaponData

const [condStacksPath, condStacks] = cond(key, "stacks")

const baseAtkArr = [0.52, 0.65, 0.78, 0.91, 1.04]
const stacksAttArr = [0.28, 0.35, 0.42, 0.49, 0.56]
const stacksArr = range(1, 3)
const baseAtk = equal(input.weapon.key, key, prod(
  subscript(input.weapon.refineIndex, baseAtkArr, { key: "_" }),
  input.premod.eleMas
), { key: "atk" })
const stacksAtk = lookup(condStacks, Object.fromEntries(stacksArr.map(stack => [
  stack,
  prod(
    stack,
    subscript(input.weapon.refineIndex, stacksAttArr, { key: "_" }),
    input.premod.eleMas
  )
])), naught, { key: "atk" })
const atk = equal(input.weapon.key, key, sum(baseAtk, stacksAtk))

const data = dataObjForWeaponSheet(key, data_gen, {
  total: {
    atk
  },
}, {
  atk
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: baseAtk
    }],
  }, {
    value: condStacks,
    path: condStacksPath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("hitOp.skill"),
    states: Object.fromEntries(stacksArr.map(i =>
      [i, {
        name: st("hits", { count: i }),
        fields: [{
          node: stacksAtk
        }, {
          text: sgt("duration"),
          value: 10,
          unit: "s"
        }]
      }]
    )),
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
