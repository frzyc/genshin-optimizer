import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Halberd"
const data_gen = data_gen_json as WeaponData

const dmgPerc = [1.6, 2, 2.4, 2.8, 3.2]
// TODO: Should it be input.total.atk or input.premod.atk?
const dmg = customDmgNode(prod(subscript(input.weapon.refineIndex, dmgPerc, { key: "_" }), input.total.atk), "elemental")
const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{
      node: infoMut(dmg, { key: "sheet:dmg" }),
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
