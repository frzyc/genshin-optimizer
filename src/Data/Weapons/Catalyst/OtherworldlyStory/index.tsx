import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "OtherworldlyStory"
const data_gen = data_gen_json as WeaponData

const healPerc = [0.01, 0.0125, 0.015, 0.0175, 0.02]
// TODO: Is the customHealNode correct?
const heal = customHealNode(prod(subscript(input.weapon.refineIndex, healPerc), input.total.hp))
export const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" })
    }]
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
