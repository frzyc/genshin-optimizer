import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript, unequal } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "ThrillingTalesOfDragonSlayers"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)

const atkSrc = [0.24, 0.3, 0.36, 0.42, 0.48]

const [condPassivePath, condPassive] = cond(key, "Heritage")
const atk_ = unequal(input.activeCharKey, input.charKey, equal("on", condPassive, subscript(input.weapon.refineIndex, atkSrc)))

// This should be in teambuff: premod right?
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
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: trm('condName'),
      canShow: unequal(input.activeCharKey, input.charKey, 1),
      teamBuff: true,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      states: {
        on: {
          fields: [{
            node: atk_
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)