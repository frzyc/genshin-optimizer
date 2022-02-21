import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, percent, read, stringRead, subscript, sum } from "../../../../Formula/utils"
import { allElements, WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, condReadNode } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "MistsplitterReforged"
const data_gen = data_gen_json as WeaponData
const eleDmg = [0.12, 0.15, 0.18, 0.21, 0.24]
const eleDmg2 = [
  [0.08, 0.16, 0.28],
  [0.1, 0.2, 0.35],
  [0.12, 0.24, 0.42],
  [0.14, 0.28, 0.49],
  [0.16, 0.32, 0.56]
]

const [condPath, condNode] = cond(key, "MistsplittersEdge")
const ele_dmg_ = Object.fromEntries(allElements.map(ele => [ele, subscript(input.weapon.refineIndex, eleDmg, { key: `${ele}_dmg_` })]))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, ele_dmg_[ele]]))
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [
      ...allElements.map(ele => ({ node: ele_dmg_[ele] }))
    ],
    conditional: {
      value: condNode,
      path: condPath,
      name: "Misplitter's Emblem",
      states: {
        1: {
          name: "1",
          fields: [
          ]
        },
        2: {
          name: "2",
          fields: [
          ]
        },
        3: {
          name: "3",
          fields: [
          ]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)