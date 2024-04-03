import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FavoniusGreatsword'
const data = dataObjForWeaponSheet(key)

const sheet: IWeaponSheet = {
  document: [{ header: headerTemplate(key), fields: [] }],
}
export default new WeaponSheet(sheet, data)
