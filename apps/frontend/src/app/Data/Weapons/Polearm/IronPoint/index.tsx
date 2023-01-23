import { WeaponData } from '@genshin-optimizer/pipeline'
import { WeaponKey } from '../../../../Types/consts'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'


const key: WeaponKey = "IronPoint"
const data_gen = data_gen_json as WeaponData

export const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  ...data_gen as WeaponData,
  document: [],
}
export default new WeaponSheet(key, sheet, data_gen, data)
