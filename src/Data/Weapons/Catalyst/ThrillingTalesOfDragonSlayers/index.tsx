import { WeaponData } from 'pipeline'
import { input, target } from '../../../../Formula'
import { equal, infoMut, subscript, unequal } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "ThrillingTalesOfDragonSlayers"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const atkSrc = [0.24, 0.3, 0.36, 0.42, 0.48]

const [condPassivePath, condPassive] = cond(key, "Heritage")
const atk_Disp = equal("on", condPassive, subscript(input.weapon.refineIndex, atkSrc))
const atk_ = unequal(input.activeCharKey, input.charKey, // Don't apply to wielding char
  equal(input.activeCharKey, target.charKey, atk_Disp) // Only apply to active char
)

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
    name: trm('condName'),
    canShow: unequal(input.activeCharKey, input.charKey, 1),
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: infoMut(atk_Disp, { key: "atk_" })
        }, {
          text: sgt("duration"),
          value: 10,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
