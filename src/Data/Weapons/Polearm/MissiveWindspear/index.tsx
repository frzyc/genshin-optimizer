import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MissiveWindspear"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "passive")
const atk_arr = [0.12, 0.15, 0.18, 0.21, 0.24]
const emArr = [48, 60, 72, 84, 96]
const atk_ = equal(condPassive, "on", subscript(input.weapon.refineIndex, atk_arr, { unit: "%" }))
const eleMas = equal(condPassive, "on", subscript(input.weapon.refineIndex, emArr))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    eleMas,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("afterReaction"),
    states: {
      on: {
        fields: [{
          node: atk_,
        }, {
          node: eleMas,
        }, {
          text: stg("duration"),
          value: 10,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
