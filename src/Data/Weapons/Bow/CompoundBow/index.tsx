import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CompoundBow"
const data_gen = data_gen_json as WeaponData

const atk_s = [.04, .05, .06, .07, .08]
const atkSPD_s = [0.012, 0.015, 0.018, 0.021, 0.024]
const [condPassivePath, condPassive] = cond(key, "InfusionArrow")
const atk_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 4), i => prod(subscript(input.weapon.refineIndex, atk_s), i))
}, naught)
const atkSPD_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 4), i => prod(subscript(input.weapon.refineIndex, atkSPD_s), i))
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    atkSPD_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("hitOp.normalOrCharged"),
    states: Object.fromEntries(range(1, 4).map(i => [i, {
      name: st("hits", { count: i }),
      fields: [{
        node: atk_
      }, {
        node: atkSPD_
      }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
