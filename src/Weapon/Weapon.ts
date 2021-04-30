import { LevelNameData, WeaponLevelKeys, WeaponTypeData } from '../Data/WeaponData';
import WeaponSheet from './WeaponSheet';
export default class Weapon {
  //do not instantiate.
  constructor() { if (this instanceof Weapon) throw Error('A static class cannot be instantiated.'); }

  static getLevelName = (levelKey, defVal = "") => (LevelNameData[levelKey] || defVal)
  static getLevelIndex = (levelKey): number => WeaponLevelKeys.indexOf(levelKey)

  //base Stat
  static getWeaponMainStatVal = (weaponSheet: WeaponSheet, levelKey, defVal = 0) => (weaponSheet.baseStats.main[Weapon.getLevelIndex(levelKey)] || defVal)
  static getWeaponSubstatVal = (weaponSheet: WeaponSheet, levelKey, defVal = 0) => (weaponSheet.baseStats.sub?.[Weapon.getLevelIndex(levelKey)] || defVal)
  static getWeaponSubstatKey = (weaponSheet: WeaponSheet, defVal = "") => (weaponSheet.baseStats?.substatKey || defVal)

  static getWeaponTypeName = (weaponType, defVal = "") => (WeaponTypeData[weaponType] || defVal)
  static getWeaponTypeKeys = (): string[] => Object.keys(WeaponTypeData)

  static getWeaponMainStatValWithOverride = (weaponObj: any, weaponSheet: WeaponSheet, defVal = 0) =>
    weaponObj?.overrideMainVal || Weapon.getWeaponMainStatVal(weaponSheet, weaponObj?.levelKey, defVal);
  static getWeaponSubstatValWithOverride = (weaponObj: any, weaponSheet: WeaponSheet, defVal = 0) =>
    weaponObj?.overrideSubVal || Weapon.getWeaponSubstatVal(weaponSheet, weaponObj?.levelKey, defVal);
}