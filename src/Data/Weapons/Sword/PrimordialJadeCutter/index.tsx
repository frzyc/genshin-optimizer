import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "PrimordialJadeCutter"
const data_gen = data_gen_json as WeaponData

const hpSrc = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkSrc = [0.012, 0.015, 0.018, 0.021, 0.024]
const hp_ = subscript(input.weapon.refineIndex, hpSrc)
const atk = equal(input.weapon.key, key,
  prod(subscript(input.weapon.refineIndex, atkSrc, { key: "_" }), input.premod.hp))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
  },
  total: {
    atk
  }
}, {
  atk
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: hp_ }, { node: atk }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
