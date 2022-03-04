import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "AquilaFavonia"
const data_gen = data_gen_json as WeaponData
const atkDealt = [2, 2.3, 2.6, 2.9, 3.2]
const hpRegen = [1, 1.15, 1.3, 1.45, 1.6]
const [condPath, condNode] = cond(key, "FalconOfTheWest")

const atk_ = subscript(input.weapon.refineIndex, data_gen.addProps.map(x => x.atk_ ?? NaN))
const heal = equal(condNode, 'on', prod(subscript(input.weapon.refineIndex, hpRegen, { key: "_" }), input.premod.atk))
const dmg = equal(condNode, 'on', customDmgNode(prod(subscript(input.weapon.refineIndex, atkDealt, { key: "_" }), input.premod.atk), "elemental", {
  hit: { ele: constant("physical") }
}))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
  },
}, {
  heal, dmg
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: atk_,
    }],
    conditional: {
      value: condNode,
      path: condPath,
      name: st('takeDmg'),
      states: {
        on: {
          fields: [{
            node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" })
          }, {
            node: infoMut(dmg, { key: "sheet:dmg" })
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
