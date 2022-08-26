import { WeaponData } from 'pipeline'
import { input, target } from '../../../../Formula'
import { equal, infoMut, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Moonpiercer"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "passive")
const atk_arr = [0.16, 0.2, 0.24, 0.28, 0.32]
const atk_disp = equal(condPassive, 'on', subscript(input.weapon.refineIndex, atk_arr, { key: "_" }))
const atk_ = equal(input.activeCharKey, target.charKey, atk_disp)
const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      atk_
    }
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: infoMut(atk_disp, { key: "atk_" }),
        }, {
          text: sgt("duration"),
          value: 12,
          unit: "s"
        }, {
          text: sgt("cd"),
          value: 20,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
