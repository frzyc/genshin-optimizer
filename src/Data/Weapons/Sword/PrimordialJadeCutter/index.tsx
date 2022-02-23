import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "PrimordialJadeCutter"
const data_gen = data_gen_json as WeaponData
const hpSrc = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkSrc = [0.012, 0.015, 0.018, 0.021, 0.024]

const hp_ = subscript(input.weapon.refineIndex, hpSrc)
// Should this be total.hp or premod.hp
const atk = prod(subscript(input.weapon.refineIndex, atkSrc), input.total.hp)

// Is it atk or is it atk_? And should it be in premod or should it be in total?
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
    atk
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{ node: hp_ }, { node: atk }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
