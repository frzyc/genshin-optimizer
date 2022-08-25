import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SapwoodBlade"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "passive")
const eleMasArr = [60, 75, 90, 105, 120]
const eleMas = equal(condPassive, 'on', subscript(input.weapon.refineIndex, eleMasArr))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: eleMas
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
