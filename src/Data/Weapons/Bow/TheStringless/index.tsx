import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TheStringless"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const refinementVals = [0.24, 0.30, 0.36, 0.42, 0.48]
const skill_dmg_ = subscript(input.weapon.refineIndex, refinementVals)
const burst_dmg_ = subscript(input.weapon.refineIndex, refinementVals)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    burst_dmg_
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fieldsHeader: conditionalHeader(tr, icon, iconAwaken, st("base")),
    fields: [{
      node: skill_dmg_,
    }, {
      node: burst_dmg_,
    }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
