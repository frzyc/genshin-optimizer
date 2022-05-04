import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "RecurveBow"
const data_gen = data_gen_json as WeaponData

const healing_s = [.08, .10, .12, .14, .16]
const healing = customHealNode(prod(input.total.hp, subscript(input.weapon.refineIndex, healing_s)))

const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(healing, { key: "sheet_gen:healing", variant: "success" })
    }]
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
