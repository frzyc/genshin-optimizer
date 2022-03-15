import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "HarbingerOfDawn"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
const critRateSrc_ = [0.14, 0.175, 0.21, 0.245, 0.28]

const [condPassivePath, condPassive] = cond(key, "SkyPiercingMight")
const critRate_ = equal("on", condPassive, subscript(input.weapon.refineIndex, critRateSrc_))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      header: conditionalHeader(tr, icon, iconAwaken),
      name: st("greaterPercentHP", { percent: 90 }),
      states: {
        on: {
          fields: [{
            node: critRate_
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
