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

const key: WeaponKey = "WineAndSong"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const atkInc = [0.2, 0.25, 0.3, 0.35, 0.4]

const [condPassivePath, condPassive] = cond(key, "EverChanging")
const atk_ = equal("on", condPassive, subscript(input.weapon.refineIndex, atkInc))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: st("afterSprint"),
      header: conditionalHeader(tr, icon, iconAwaken, st("conditional")),
      description: conditionaldesc(tr),
      states: {
        on: {
          fields: [{
            node: atk_
          }, {
            text: sgt("duration"),
            value: 5,
            unit: "s"
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
