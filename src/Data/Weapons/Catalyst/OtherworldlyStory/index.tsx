import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "OtherworldlyStory"
const data_gen = data_gen_json as WeaponData

const healPerc = [0.01, 0.0125, 0.015, 0.0175, 0.02]
const heal = equal(input.weapon.key, key,
  customHealNode(prod(subscript(input.weapon.refineIndex, healPerc, { key: "_" }), input.total.hp)))
export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(heal, { key: "sheet_gen:healing" })
    }]
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
