import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { customStringRead, match, prod, subscript } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CalamityQueller"
const data_gen = data_gen_json as WeaponData

const condStackPath = [key, "stack"]
const condStack = customStringRead(["conditional", ...condStackPath])

const condActivePath = [key, "active"]
const condActive = customStringRead(["conditional", ...condActivePath])


const dmg_ = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = [0.032, 0.04, 0.048, 0.056, 0.064]

const dmg_Nodes = Object.fromEntries(allElements.map(e => [`${e}_dmg_`, subscript(input.weapon.refineIndex, dmg_, { key: `${e}_dmg_` })]))
const atkNodes = range(1, 6).map(i => [i, prod(
  match(condStack, i.toString(), subscript(input.weapon.refineIndex, atk_, { key: 'atk_' })),
  // matchStr(condActive, "off", 2, 1) // TODO: set *2 when off field
)])
export const data = dataObjForWeaponSheet(key, data_gen, "heal_", undefined, {
  premod: {
    ...dmg_Nodes,
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [
      ...Object.values(dmg_Nodes).map(n => ({
        node: n
      })),
    ],
    conditional: {
      value: condStack,
      path: condStackPath,
      name: "Extinguishing Precepty",// TODO: translation
      states: Object.fromEntries(range(1, 6).map(i => [i, {
        name: `Stack ${i}`,
        fields: [{ node: atkNodes[i] }]
      }]))
    }
  }, {
    conditional: {
      value: condActive,
      path: condActivePath,
      name: "Not on Field", //TODO: translation
      states: {
        off: {
          fields: [{
            text: "Double Consummation's ATK" //TODO: translation
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
