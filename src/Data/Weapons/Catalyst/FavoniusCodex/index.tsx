import { WeaponData } from 'pipeline'
import { WeaponKey } from '../../../../Types/consts'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "FavoniusCodex"
const data_gen = data_gen_json as WeaponData
const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{ header: headerTemplate(key, icon, iconAwaken), fields: [] }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
