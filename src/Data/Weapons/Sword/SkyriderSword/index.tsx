import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SkyriderSword"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "Determination")
const bonusInc = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = equal(condPassive, 'on', subscript(input.weapon.refineIndex, bonusInc, { key: "_" }))
const moveSPD_ = equal(condPassive, 'on', subscript(input.weapon.refineIndex, bonusInc, { key: "_" }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    moveSPD_
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("afterUse.burst"),
    states: {
      on: {
        fields: [{
          node: atk_
        }, {
          node: moveSPD_
        }, {
          text: sgt("duration"),
          value: 15,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
