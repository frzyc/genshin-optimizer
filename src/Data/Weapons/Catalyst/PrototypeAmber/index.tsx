import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "PrototypeAmber"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "Gliding")
const healPerc = [0.04, 0.045, 0.05, 0.055, 0.06]

const heal = customHealNode(prod(subscript(input.weapon.refineIndex, healPerc, { key: "_" }), input.total.hp))
export const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: st("afterUse.burst"),
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      states: {
        on: {
          fields: [{ node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" }) }]
        }
      }
    }
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
