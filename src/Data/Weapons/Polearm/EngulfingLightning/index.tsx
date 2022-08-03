import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, min, percent, prod, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "EngulfingLightning"
const data_gen = data_gen_json as WeaponData

const atk = [0.28, 0.35, 0.42, 0.49, 0.56]
const atkMax = [0.8, 0.9, 1, 1.1, 1.2]
const atk_ = equal(input.weapon.key, key,
  min(prod(subscript(input.weapon.refineIndex, atk), sum(input.premod.enerRech_, percent(-1))), subscript(input.weapon.refineIndex, atkMax)))

const enerRech = [0.3, 0.35, 0.40, 0.45, 0.5, 0.55]
const [condPassivePath, condPassive] = cond(key, "TimelessDream")
const enerRech_ = equal("on", condPassive, subscript(input.weapon.refineIndex, enerRech))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    enerRech_
  },
}, {
  atk_
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: atk_,
    }],
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("afterUse.burst"),
    states: {
      on: {
        fields: [{
          node: enerRech_
        }, {
          text: sgt("duration"),
          value: 12,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
