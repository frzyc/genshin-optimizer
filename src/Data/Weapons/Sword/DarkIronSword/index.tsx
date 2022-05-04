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

const key: WeaponKey = "DarkIronSword"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const atkInc = [0.2, 0.25, 0.3, 0.35, 0.5]
const [condPassivePath, condPassive] = cond(key, "Overloaded")
const atk_ = equal("on", condPassive, subscript(input.weapon.refineIndex, atkInc, { key: "_" }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    name: trm("condName"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: atk_,
        }, {
          text: sgt("duration"),
          value: 12,
          unit: 's'
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
