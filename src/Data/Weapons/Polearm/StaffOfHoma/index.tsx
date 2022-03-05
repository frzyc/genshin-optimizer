import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "StaffOfHoma"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const hpInc = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkInc = [0.008, 0.01, 0.012, 0.014, 0.016]
const lowHpAtkInc = [0.01, 0.012, 0.014, 0.016, 0.018]
const hp_ = subscript(input.weapon.refineIndex, hpInc, { key: "_" })
const [condPassivePath, condPassive] = cond(key, "RecklessCinnabar")
// TODO: Should these be input.total or input.premod?
const atk1_ = prod(subscript(input.weapon.refineIndex, atkInc, { key: "_" }), input.total.hp)
const atk2_ = equal("on", condPassive, prod(subscript(input.weapon.refineIndex, lowHpAtkInc, { key: "_" }), input.total.hp), { key: "atk" })
// TODO: Should atk be in premod or total?
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
  },
  total: {
    atk: sum(atk1_, atk2_)
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: hp_
    }, {
      node: infoMut(atk1_, { key: "atk" })
    }],
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: trm("condName"),
      states: {
        on: {
          fields: [{
            node: atk2_,
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
