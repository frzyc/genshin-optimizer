import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'SeasonedHuntersBow'
export const data = dataObjForWeaponSheet(key)
const sheet: IWeaponSheet = {
  document: [],
}
export default new WeaponSheet(sheet, data)
