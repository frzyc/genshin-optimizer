import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SilverSword'
const data_gen = allStats.weapon.data[key]

export const data = dataObjForWeaponSheet(key, data_gen)
const sheet: IWeaponSheet = {
  ...data_gen,
  document: [],
}
export default new WeaponSheet(key, sheet, data_gen, data)
