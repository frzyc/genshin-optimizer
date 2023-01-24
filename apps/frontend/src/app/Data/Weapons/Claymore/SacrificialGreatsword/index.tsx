import { WeaponData } from '@genshin-optimizer/pipeline'
import { WeaponKey } from '@genshin-optimizer/consts'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = "SacrificialGreatsword"
const data_gen = data_gen_json as WeaponData

const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  document: [{ header: headerTemplate(key), fields: [] }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
