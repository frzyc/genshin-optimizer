import type { WeaponData } from '@genshin-optimizer/pipeline'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const data_gen = data_gen_json as WeaponData
const key: WeaponKey = 'SeasonedHuntersBow'
export const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  ...(data_gen as WeaponData),
  document: [],
}
export default new WeaponSheet(key, sheet, data_gen, data)
