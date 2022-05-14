import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "DodocoTales"
const data_gen = data_gen_json as WeaponData

const chargedDmgInc = [0.16, 0.2, 0.24, 0.28, 0.32]
const atkInc = [0.8, 0.10, 0.12, 0.14, 0.16]

const [condNormalPath, condNormal] = cond(key, "DodoventureNormal")
const [condChargedPath, condCharged] = cond(key, "DodoventureCharged")
const charged_dmg_ = equal("on", condNormal, subscript(input.weapon.refineIndex, chargedDmgInc))
const atk_ = equal("on", condCharged, subscript(input.weapon.refineIndex, atkInc))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    charged_dmg_,
    atk_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condNormal,
    path: condNormalPath,
    name: st("hitOp.normal"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: charged_dmg_
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }, {
    value: condCharged,
    path: condChargedPath,
    name: st("hitOp.charged"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: atk_
        }, {
          text: sgt("duration"),
          value: 6,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
