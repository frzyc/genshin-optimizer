import claymore from './Claymore'
import sword from './Sword'
import polearm from './Polearm'
import bow from './Bow'
import catalyst from './Catalyst'
import { IWeaponSheets } from '../../Types/weapon'

const WeaponData: IWeaponSheets = {
  ...sword,
  ...claymore,
  ...polearm,
  ...bow,
  ...catalyst
}

export default WeaponData