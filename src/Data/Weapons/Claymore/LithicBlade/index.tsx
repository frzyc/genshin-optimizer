import type { WeaponData } from 'pipeline'
import { input, tally } from '../../../../Formula'
import { prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "LithicBlade"
const data_gen = data_gen_json as WeaponData

const atkInc = [0.07, 0.08, 0.09, 0.1, 0.11]
const critInc = [0.03, 0.04, 0.05, 0.06, 0.07]
const atk_ = prod(subscript(input.weapon.refineIndex, atkInc, { unit: "%" }), tally.liyue)
const critRate_ = prod(subscript(input.weapon.refineIndex, critInc, { unit: "%" }), tally.liyue)
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    critRate_
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    fields: [{ node: atk_ }, { node: critRate_ }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
