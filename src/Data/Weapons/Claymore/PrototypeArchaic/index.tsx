import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "PrototypeArchaic"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const dmg_Src = [2.4, 3, 3.6, 4.2, 4.8]
const dmg_ = customDmgNode(prod(subscript(input.weapon.refineIndex, dmg_Src, { key: "_" }), input.premod.atk), "elemental", {
  hit: { ele: constant("physical") }
})

const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fieldsHeader: conditionalHeader(tr, icon, iconAwaken, st("base")),
    fields: [{ node: infoMut(dmg_, { key: "sheet:dmg" }) }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
