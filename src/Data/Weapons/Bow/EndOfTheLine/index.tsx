import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "EndOfTheLine"
const data_gen = data_gen_json as WeaponData

const dmgArr = [0.8, 1, 1.2, 1.4, 1.6]
const dmg = equal(input.weapon.key, key, customDmgNode(
  prod(
    subscript(input.weapon.refineIndex, dmgArr, { key: "_" }),
    input.total.atk
  ),
  "elemental"
))

const data = dataObjForWeaponSheet(key, data_gen, undefined, { dmg })

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: infoMut(dmg, { key: "sheet:dmg" })
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
