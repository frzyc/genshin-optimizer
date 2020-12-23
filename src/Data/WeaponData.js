import claymore from './Weapons/Claymore'
import sword from './Weapons/Sword'
import polearm from './Weapons/Polearm'
import bow from './Weapons/Bow'
import catalyst from './Weapons/Catalyst'

const WeaponLevelKeys = ["L1", "L5", "L10", "L15", "L20", "L20A", "L25", "L30", "L35", "L40", "L40A", "L45", "L50", "L50A", "L55", "L60", "L60A", "L65", "L70", "L70A", "L75", "L80", "L80A", "L85", "L90",]
const LevelNameData = { "L1": "Lvl. 1", "L5": "Lvl. 5", "L10": "Lvl. 10", "L15": "Lvl. 15", "L20": "Lvl. 20", "L20A": "Lvl. 20A", "L25": "Lvl. 25", "L30": "Lvl. 30", "L35": "Lvl. 35", "L40": "Lvl. 40", "L40A": "Lvl. 40A", "L45": "Lvl. 45", "L50": "Lvl. 50", "L50A": "Lvl. 50A", "L55": "Lvl. 55", "L60": "Lvl. 60", "L60A": "Lvl. 60A", "L65": "Lvl. 65", "L70": "Lvl. 70", "L70A": "Lvl. 70A", "L75": "Lvl. 75", "L80": "Lvl. 80", "L80A": "Lvl. 80A", "L85": "Lvl. 85", "L90": "Lvl. 90", }

const WeaponData = {
  ...sword,
  ...claymore,
  ...polearm,
  ...bow,
  ...catalyst
}
const WeaponTypeData = {
  sword: "Sword",
  claymore: "Claymore",
  catalyst: "Catalyst",
  bow: "Bow",
  polearm: "Polearm"
}

export {
  WeaponData,
  WeaponLevelKeys,
  LevelNameData,
  WeaponTypeData
}