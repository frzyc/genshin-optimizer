import { WeaponData } from 'pipeline'
import { WeaponKey } from '../../../../Types/consts'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const data_gen = data_gen_json as WeaponData
const key: WeaponKey = "SeasonedHuntersBow"
export const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: []
}
export default new WeaponSheet(key, sheet, data_gen, data)
