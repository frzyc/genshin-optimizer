import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'PocketGrimoire'
const data_gen = allStats.weapon.data[key]
const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  document: [],
}
export default new WeaponSheet(key, sheet, data_gen, data)
