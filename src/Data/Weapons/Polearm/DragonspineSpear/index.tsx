import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "DragonspineSpear"
const data_gen = data_gen_json as WeaponData

const dmgAoePerc = [0.8, 0.95, 1.1, 1.25, 1.4]
const dmgCryoPerc = [2, 2.4, 2.8, 3.2, 3.6]
const dmgAoe = customDmgNode(prod(subscript(input.weapon.refineIndex, dmgAoePerc, { key: "_" }), input.total.atk), "elemental", {
  hit: { ele: constant("physical") }
})
const dmgOnCryoOp = customDmgNode(prod(subscript(input.weapon.refineIndex, dmgCryoPerc, { key: "_" }), input.total.atk), "elemental", {
  hit: { ele: constant("physical") }
})
const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(dmgAoe, { key: `weapon_${key}:aoeDmg` }),
    }, {
      node: infoMut(dmgOnCryoOp, { key: `weapon_${key}:cryoAffectedDmg` }),
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
