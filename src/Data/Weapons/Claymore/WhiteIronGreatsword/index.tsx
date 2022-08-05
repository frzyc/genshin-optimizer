import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "WhiteIronGreatsword"
const data_gen = data_gen_json as WeaponData

const hpRegen = [0.08, 0.1, 0.12, 0.14, 0.16]
const [condPath, condNode] = cond(key, "CullTheWeak")
const heal = equal(input.weapon.key, key,
  equal(condNode, 'on', customHealNode(prod(subscript(input.weapon.refineIndex, hpRegen, { key: "_" }), input.total.hp))))

export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condNode,
    path: condPath,
    name: st('afterDefeatEnemy'),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: infoMut(heal, { key: "sheet_gen:healing" })
        }]
      }
    }
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
