import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "ThunderingPulse"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)
const atkSrc = [0.20, 0.25, 0.30, 0.35, 0.40]
const ele_dmg_ss = [
  [0.12, 0.24, 0.40],
  [0.15, 0.30, 0.50],
  [0.18, 0.36, 0.60],
  [0.21, 0.42, 0.70],
  [0.24, 0.48, 0.80]
]

const naStack1 = [0.12, 0.15, 0.18, 0.21, 0.24]
const naStack2 = [0.24, 0.3, 0.36, 0.42, 0.48]
const naStack3 = [0.4, 0.5, 0.6, 0.7, 0.8]

const [condPassivePath, condPassive] = cond(key, "RuleByThunder")
const atk_ = subscript(input.weapon.refineIndex, atkSrc)
const normal_dmg_ = lookup(condPassive, {
  "1": subscript(input.weapon.refineIndex, naStack1), "2": subscript(input.weapon.refineIndex, naStack2), "3": subscript(input.weapon.refineIndex, naStack3)
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    normal_dmg_
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: atk_,
    }],
    conditional: {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: trm("condName"),
      states: {
        1: {
          name: `1 Stack`,
          fields: [{
            node: normal_dmg_
          }]
        },
        ...objectKeyMap(range(2, 3), i => ({
          name: `${i} Stacks`,
          fields: [{
            node: normal_dmg_
          }]
        })),
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
