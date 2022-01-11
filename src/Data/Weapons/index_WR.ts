// import claymore from './Claymore'
// import sword from './Sword'
// import polearm from './Polearm'
// import bow from './Bow'
import catalyst from './Catalyst/index_WR'

const WeaponData = {
  // ...sword,
  // ...claymore,
  // ...polearm,
  // ...bow,
  ...catalyst
} as const
export default WeaponData