import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "WindblumeOde"
const data_gen = data_gen_json as WeaponData

const atk_s = [.16, .20, .24, .28, .32]
const [condPassivePath, condPassive] = cond(key, "WindblumeWish")
const atk_ = equal(condPassive, "on", subscript(input.weapon.refineIndex, atk_s))

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
    name: st("afterUse.skill"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: atk_
        }, {
          text: sgt("duration"),
          value: 6,
          unit: 's'
        }]
      }
    }
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
