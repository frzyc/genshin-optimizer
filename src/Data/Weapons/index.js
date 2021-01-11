import claymore from './Claymore'
import sword from './Sword'
import polearm from './Polearm'
import bow from './Bow'
import catalyst from './Catalyst'

const WeaponData = {
  ...sword,
  ...claymore,
  ...polearm,
  ...bow,
  ...catalyst
}

export default WeaponData