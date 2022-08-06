import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "AquilaFavonia"
const data_gen = data_gen_json as WeaponData

const atkDealt = [2, 2.3, 2.6, 2.9, 3.2]
const hpRegen = [1, 1.15, 1.3, 1.45, 1.6]
const [condPath, condNode] = cond(key, "FalconOfTheWest")
const atk_ = subscript(input.weapon.refineIndex, data_gen.addProps.map(x => x.atk_ ?? NaN))
const heal = equal(input.weapon.key, key, equal(condNode, 'on', prod(subscript(input.weapon.refineIndex, hpRegen, { key: "_" }), input.premod.atk)))
const dmg = equal(input.weapon.key, key,
  equal(condNode, 'on', customDmgNode(prod(subscript(input.weapon.refineIndex, atkDealt, { key: "_" }), input.premod.atk), "elemental", {
    hit: { ele: constant("physical") }
  })))

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
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: atk_,
    }],
  }, {
    value: condNode,
    path: condPath,
    name: st('takeDmg'),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: infoMut(heal, { key: "sheet_gen:healing", variant: "heal" })
        }, {
          node: infoMut(dmg, { key: "sheet:dmg" })
        }, {
          text: sgt("cd"),
          value: 15,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
