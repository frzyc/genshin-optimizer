import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TravelersHandySword"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)

const hpRegenSrc = [0.01, 0.0125, 0.015, 0.0175, 0.02]
const heal = customHealNode(prod(subscript(input.weapon.refineIndex, hpRegenSrc, { key: "_" }), input.total.hp))
const data = dataObjForWeaponSheet(key, data_gen, undefined, { heal })

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fieldsHeader: conditionalHeader(tr, icon, iconAwaken, st("base")),
    fields: [
      { node: infoMut(heal, { key: "sheet_gen:healing", variant: "success" }) }
    ]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
