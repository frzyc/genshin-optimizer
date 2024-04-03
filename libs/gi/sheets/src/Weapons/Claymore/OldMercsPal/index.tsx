import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'OldMercsPal'
const data = dataObjForWeaponSheet(key)

const sheet: IWeaponSheet = {
  document: [],
}
export default new WeaponSheet(sheet, data)
