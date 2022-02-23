import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, percent, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SkywardBlade"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
const atkSrc_ = [0.2, 0.25, 0.3, 0.35, 0.40]

const [condPassivePath, condPassive] = cond(key, "SkyPiercingMight")
const moveSPD_ = equal("on", condPassive, percent(0.1))
const atkSPD_ = equal("on", condPassive, percent(0.1))
// TODO: Is this the correct calculation for the passive DMG?
const dmg = equal("on", condPassive, customDmgNode(prod(subscript(input.weapon.refineIndex, atkSrc_), input.premod.atk), 'normal'))

const critRate_ = subscript(input.weapon.refineIndex, data_gen.addProps.map(x => x.critRate_ ?? NaN))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_,
    moveSPD_,
    atkSPD_,
  }
}, { dmg })

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{ node: critRate_ }],
    conditional: {
      value: condPassive,
      path: condPassivePath,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [{
            node: moveSPD_
          }, {
            node: atkSPD_
          }, {
            node: infoMut(dmg, { key: "sheet:dmg" })
          }, {
            text: sgt("duration"),
            value: 12,
            unit: "s"
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
