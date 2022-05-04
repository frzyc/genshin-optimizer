import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, prod, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TheUnforged"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const shieldSrc = [0.2, 0.25, 0.3, 0.35, 0.40]
const atkSrc = [0.04, 0.05, 0.06, 0.07, 0.08]
const [condPassivePath, condPassive] = cond(key, "GoldenMajesty")
const shield_ = subscript(input.weapon.refineIndex, shieldSrc)
const [condWithShieldPath, condWithShield] = cond(key, "WithShield")
const atkInc = subscript(input.weapon.refineIndex, atkSrc)
const atkStacks = prod(
  sum(1, equal(condWithShield, "protected", 1)),
  lookup(condPassive, Object.fromEntries(range(1, 5).map(i =>
    [i, prod(atkInc, i)])), naught)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    shield_,
    atk_: atkStacks
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: shield_
    }],
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("hits"),
    states: Object.fromEntries(range(1, 5).map(i =>
      [i, {
        name: st("stack", { count: i }),
        fields: [{
          node: atkStacks
        }, {
          text: sgt("duration"),
          value: 8,
          unit: "s"
        }]
      }]
    )),
  }, {
    value: condWithShield,
    path: condWithShieldPath,
    header: headerTemplate(key, icon, iconAwaken, trm("shield")),
    name: st("protectedByShield"),
    states: {
      protected: {
        fields: [{
          text: trm("atkEffInc"),
          value: 100,
          unit: "%"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
