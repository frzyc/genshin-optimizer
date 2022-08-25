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

const key: WeaponKey = "ForestRegalia"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "passive")
const eleMasArr = [60, 75, 90, 105, 120]
const eleMas_disp = equal(condPassive, 'on', subscript(input.weapon.refineIndex, eleMasArr))
const eleMas = equal(input.activeCharKey, target.charKey, eleMas_disp)

const data = dataObjForWeaponSheet(key, data_gen, {
  teamBuff: {
    premod: {
      eleMas
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
          node: infoMut(eleMas_disp, { key: "ele_mas" }),
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
