import claymore from './Claymore'
import sword from './Sword'
import polearm from './Polearm'
import bow from './Bow'
import { WeaponKey } from '../../Types/consts'
import catalyst from './Catalyst'
import WeaponSheet from './WeaponSheet'

const WeaponData: Record<WeaponKey, WeaponSheet> = {
  ...sword,
  ...claymore,
  ...polearm,
  ...bow,
  ...catalyst
} as const
export default WeaponData
