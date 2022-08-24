import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, percent, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "FruitOfFulfillment"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const eleMasArr = [24, 27, 30, 33, 36]
const [condStacksPath, condStacks] = cond(key, "stacks")
const stacksArr = range(1, 5)
const eleMas = lookup(condStacks, Object.fromEntries(stacksArr.map(stacks => [
  stacks,
  prod(
    subscript(input.weapon.refineIndex, eleMasArr),
    stacks
  )
])), naught)

const atk_ = lookup(condStacks, Object.fromEntries(stacksArr.map(stacks => [
  stacks,
  prod(
    percent(-0.05),
    stacks
  )
])), naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
    atk_,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    path: condStacksPath,
    value: condStacks,
    name: trm("stackName"),
    states: Object.fromEntries(stacksArr.map(stack => [
      stack,
      {
        name: st("stack", { count: stack }),
        fields: [{
          node: eleMas,
        }, {
          node: atk_
        }]
      }
    ]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
