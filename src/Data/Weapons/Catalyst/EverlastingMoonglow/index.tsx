import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "EverlastingMoonglow"
const data_gen = data_gen_json as WeaponData

const hp_conv = [0.01, 0.015, 0.02, 0.025, 0.03]
const [, trm] = trans("weapon", key)
const normal_dmgInc = equal(input.weapon.key, key,
  prod(subscript(input.weapon.refineIndex, hp_conv, { key: '_' }), input.premod.hp))
const heal_ = subscript(input.weapon.refineIndex, data_gen.addProps.map(x => x.heal_ ?? NaN))
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmgInc, // TODO: technically should be in "total", but should be fine as premod
    heal_
  }
}, {
  normal_dmgInc
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: heal_
    }, {
      text: trm("name"),
      node: normal_dmgInc,
    }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
