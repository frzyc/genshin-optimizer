import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'FavoniusGreatsword'
const data_gen = allStats.weapon.data[key]
const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  document: [{ header: headerTemplate(key), fields: [] }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
