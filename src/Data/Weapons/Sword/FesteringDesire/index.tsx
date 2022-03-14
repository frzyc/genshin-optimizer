import type { WeaponData } from 'pipeline'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { subscript } from "../../../../Formula/utils"
import { dataObjForWeaponSheet } from '../../util'
import { input } from '../../../../Formula'
import data_gen_json from './data_gen.json'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import { WeaponKey } from '../../../../Types/consts'

const key: WeaponKey = "FesteringDesire"
const data_gen = data_gen_json as WeaponData
const skill_dmgInc = [0.16, 0.2, 0.24, 0.28, 0.32]
const skill_critInc = [0.06, 0.075, 0.09, 0.105, 0.12]
const skill_dmg_ = subscript(input.weapon.refineIndex, skill_dmgInc, { key: '_' })
const skill_critRate_ = subscript(input.weapon.refineIndex, skill_critInc, { key: '_' })

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    skill_critRate_
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: skill_dmg_
    }, {
      node: skill_critRate_
    }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
