import claymore from './Claymore'
import sword from './Sword'
import polearm from './Polearm'
import bow from './Bow'
import { WeaponKey } from '../../Types/consts'
import catalyst from './Catalyst'
import WeaponSheet from './WeaponSheet'
import { allWeaponTypeKeys, WeaponTypeKey } from '@genshin-optimizer/consts'
import { mergeData } from '../../Formula/api'
import { Data } from '../../Formula/type'

const WeaponData: Record<WeaponKey, WeaponSheet> = {
  ...sword,
  ...claymore,
  ...polearm,
  ...bow,
  ...catalyst
} as const

// This is the weapon Data.displays merged together for each weapons.
export const displayDataMap = Object.fromEntries(allWeaponTypeKeys.map(k =>
  [k, mergeData(Object.values(WeaponData).filter(sheet => sheet.weaponType === k).map(sheet => ({ display: sheet.data.display })))]
)) as Record<WeaponTypeKey, Data>

export function getWeaponSheet(wKey: WeaponKey) {
  return WeaponData[wKey]
}

export default WeaponData
