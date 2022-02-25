import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SacrificialSword"
const data_gen = data_gen_json as WeaponData

const def_Src = [0.28, 0.35, 0.42, 0.49, 0.56]
const normal_dmg_Src = [0.28, 0.35, 0.42, 0.49, 0.56]
const charged_dmg_Src = [0.28, 0.35, 0.42, 0.49, 0.56]
const def_ = subscript(input.weapon.refineIndex, def_Src)
// TODO: Should these be premod or total
const normal_dmg_ = prod(subscript(input.weapon.refineIndex, normal_dmg_Src), input.premod.def)
const charged_dmg_ = prod(subscript(input.weapon.refineIndex, charged_dmg_Src), input.premod.def)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    def_,
    // TODO: Should these be premod or total
    normal_dmg_,
    charged_dmg_
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: def_
    }, {
      node: normal_dmg_
    }, {
      node: charged_dmg_
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
