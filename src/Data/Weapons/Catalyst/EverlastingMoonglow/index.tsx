import type { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { infoMut, match, prod, subscript } from "../../../../Formula/utils"
import { dataObjForWeaponSheet } from '../../util'
import { input } from '../../../../Formula'
import data_gen_json from './data_gen.json'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'

const key = "EverlastingMoonglow"
const data_gen = data_gen_json as WeaponData
const hp_conv = [0.01, 0.015, 0.02, 0.025, 0.03]
const normalDmgInc = infoMut(prod(subscript(input.weapon.refineIndex, hp_conv, { key: '_' }), input.premod.hp), { key: "normal_dmg_inc" })
export const data = dataObjForWeaponSheet(key, data_gen, "heal_", { normalDmgInc }, {
  hit: {
    base: match(input.hit.move, "normal", normalDmgInc)
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      text: <Translate ns={`"weapon_${key}"`} key18="name" />,
      node: normalDmgInc,
    }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
