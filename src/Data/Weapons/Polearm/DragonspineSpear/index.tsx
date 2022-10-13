import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from '../../../../Formula/utils'
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
const dmgAoe = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmgAoePerc, { unit: "%" }), input.total.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))
const dmgOnCryoOp = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmgCryoPerc, { unit: "%" }), input.total.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))
const data = dataObjForWeaponSheet(key, data_gen, undefined, { dmgAoe, dmgOnCryoOp })

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(dmgAoe, { name: WeaponSheet.trm(key)("aoeDmg") }),
    }, {
      node: infoMut(dmgOnCryoOp, { name: WeaponSheet.trm(key)("cryoAffectedDmg") }),
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
