import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TwinNephrite"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const refineInc = [0.12, 0.14, 0.16, 0.18, 0.2]

const [condPassivePath, condPassive] = cond(key, "GuerillaTactics")
const atk_ = equal("on", condPassive, subscript(input.weapon.refineIndex, refineInc))
const moveSPD_ = equal("on", condPassive, subscript(input.weapon.refineIndex, refineInc))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    moveSPD_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: st("afterDefeatEnemy"),
      header: conditionalHeader(tr, icon, iconAwaken, st("conditional")),
      description: conditionaldesc(tr),
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
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
