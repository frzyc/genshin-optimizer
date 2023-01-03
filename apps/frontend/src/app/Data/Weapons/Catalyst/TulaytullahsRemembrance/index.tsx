import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, min, naught, prod, subscript, sum } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, st, stg } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TulaytullahsRemembrance"
const data_gen = data_gen_json as WeaponData
const atkSPD_arr = [0.1, 0.125, 0.15, 0.175, 0.2]
const time_normal_dmg_arr = [0.048, 0.06, 0.072, 0.084, 0.096]
const time_normal_dmg_stacksArr = range(1, 12)
const hit_normal_dmg_arr = [0.096, 0.12, 0.144, 0.168,  0.192]
const hit_normal_dmg_stacksArr = range(1, 5) // Max stacks before we hit the normal dmg max
const max_normal_dmg_arr = [0.48, 0.6, 0.72, 0.84, 0.96]

const atkSPD_ = equal(input.weapon.key, key, subscript(input.weapon.refineIndex, atkSPD_arr))

const [condTimePassivePath, condTimePassive] = cond(key, "timePassive")
const time_normal_dmg_ = equal(input.weapon.key, key, lookup(condTimePassive, Object.fromEntries(time_normal_dmg_stacksArr.map(time => [
  time,
  prod(time, subscript(input.weapon.refineIndex, time_normal_dmg_arr, { unit: "%" }))
])), naught, KeyMap.info("normal_dmg_")))

const [condHitPassivePath, condHitPassive] = cond(key, "hitPassive")
const hit_normal_dmg_ = equal(input.weapon.key, key, lookup(condHitPassive, Object.fromEntries(hit_normal_dmg_stacksArr.map(hit => [
  hit,
  prod(hit, subscript(input.weapon.refineIndex, hit_normal_dmg_arr, { unit: "%" }))
])), naught, KeyMap.info("normal_dmg_")))

const finalNormal_dmg_ = min(
  subscript(input.weapon.refineIndex, max_normal_dmg_arr, { unit: "%" }),
  sum(time_normal_dmg_, hit_normal_dmg_)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atkSPD_,
    normal_dmg_: finalNormal_dmg_
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: atkSPD_
    }],
  }, {
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    fields: [{
      node: finalNormal_dmg_
    }],
  }, {
    value: condTimePassive,
    path: condTimePassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("afterUse.skill"),
    states: Object.fromEntries(time_normal_dmg_stacksArr.map(i =>
      [i, {
        name: st("seconds", { count: i }),
        fields: [{
        //   node: time_normal_dmg_
        // }, {
          text: stg("duration"),
          value: 14,
          unit: "s"
        }]
      }]
    )),
  }, {
    value: condHitPassive,
    path: condHitPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("hitOp.normal"),
    states: Object.fromEntries(hit_normal_dmg_stacksArr.map(i =>
      [i, {
        name: st("stack", { count: i }),
        fields: [{
        //   node: hit_normal_dmg_,
        // }, {
          text: stg("cd"),
          value: 0.3,
          unit: "s",
          fixed: 1
        }]
      }]
    ))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
