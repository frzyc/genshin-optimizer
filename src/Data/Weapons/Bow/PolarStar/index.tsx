import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "PolarStar"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)
const eleSrc = [0.12, 0.15, 0.18, 0.21, 0.24]
const ashenStack1 = [0.1, 0.125, 0.15, 0.175, 0.2]
const ashenStack2 = [0.2, 0.25, 0.3, 0.35, 0.4]
const ashenStack3 = [0.3, 0.375, 0.45, 0.528, 0.6]
const ashenStack4 = [0.48, 0.6, 0.72, 0.84, 0.96]

const [condPassivePath, condPassive] = cond(key, "GoldenMajesty")

const skill_dmg_ = subscript(input.weapon.refineIndex, eleSrc)
const burst_dmg_ = subscript(input.weapon.refineIndex, eleSrc)
const atk_ = lookup(condPassive, {
  "1": subscript(input.weapon.refineIndex, ashenStack1), "2": subscript(input.weapon.refineIndex, ashenStack2),
  "3": subscript(input.weapon.refineIndex, ashenStack3), "4": subscript(input.weapon.refineIndex, ashenStack4),
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    burst_dmg_,
    atk_
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: skill_dmg_,
    }, {
      node: burst_dmg_,
    }]
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: trm("condName"),
    states: objectKeyMap(range(1, 4), i => ({
      name: st("stack", { count: i }),
      fields: [{
        node: atk_
      }]
    }))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
