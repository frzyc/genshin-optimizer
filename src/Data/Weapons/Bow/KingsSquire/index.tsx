import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "KingsSquire"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "passive")
const eleMasArr = [60, 80, 100, 120, 140]
const eleMas = equal(condPassive, "on", subscript(input.weapon.refineIndex, eleMasArr))
const dmg_arr = [1, 1.2, 1.4, 1.6, 1.8]
const dmg = equal(input.weapon.key, key, customDmgNode(
  prod(
    subscript(input.weapon.refineIndex, dmg_arr, { key: "_" }),
    input.total.atk
  ),
  "elemental",
))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas
  },
}, {
  dmg
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(dmg, { key: "sheet:dmg" }),
    }]
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("afterUse.skillOrBurst"),
    states: {
      on: {
        fields: [{
          node: eleMas,
        }, {
          text: sgt("duration"),
          value: 12,
          unit: "s"
        }, {
          text: sgt("cd"),
          value: 20,
          unit: "s",
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
