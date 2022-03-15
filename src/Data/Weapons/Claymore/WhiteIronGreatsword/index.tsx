import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, naught, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { healNode } from '../../../Characters/dataUtil'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "WhiteIronGreatsword"
const [tr, trm] = trans("weapon", key)
const data_gen = data_gen_json as WeaponData
const hpRegen = [0.08, 0.1, 0.12, 0.14, 0.16]
const [condPath, condNode] = cond(key, "CullTheWeak")

// TODO: Is this correct?
const heal = equal(condNode, 'on', healNode("hp", subscript(input.weapon.refineIndex, hpRegen, { key: "_" }), naught))

export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condNode,
      path: condPath,
      name: st('afterDefeatEnemy'),
      header: conditionalHeader(tr, icon, iconAwaken, sgt("healing")),
      states: {
        on: {
          fields: [{
            node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" })
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
