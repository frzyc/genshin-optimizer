import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet from '../../WeaponSheet'

const key: WeaponKey = 'DullBlade'
const data_gen = allStats.weapon.data[key]
export const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  ...data_gen,
  document: [],
}
export default new WeaponSheet(key, sheet, data_gen, data)
