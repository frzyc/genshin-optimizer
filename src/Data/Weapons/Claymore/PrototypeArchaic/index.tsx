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

const key: WeaponKey = "PrototypeArchaic"
const data_gen = data_gen_json as WeaponData

const dmg_Src = [2.4, 3, 3.6, 4.2, 4.8]
const dmg = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmg_Src, { unit: "%" }), input.premod.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))

const data = dataObjForWeaponSheet(key, data_gen, undefined, { dmg })
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: infoMut(dmg, { name: st("dmg") }) }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
