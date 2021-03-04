import { LevelNameData, WeaponData, WeaponDataImport, WeaponLevelKeys, WeaponTypeData } from '../Data/WeaponData.js';
import ConditionalsUtil from '../Util/ConditionalsUtil.js';
import { objMultiplication } from '../Util/Util.js';
export default class Weapon {
  //do not instantiate.
  constructor() { if (this instanceof Weapon) throw Error('A static class cannot be instantiated.'); }

  static getWeaponDataImport = () => WeaponDataImport
  static getLevelName = (levelKey, defVal = "") => (LevelNameData[levelKey] || defVal)
  static getLevelIndex = (levelKey) => WeaponLevelKeys.indexOf(levelKey)

  static getWeaponName = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.name || defVal)
  static getWeaponRarity = (weaponKey, defVal = 0) => (WeaponData[weaponKey]?.rarity || defVal)
  static getWeaponPassiveName = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.passiveName || defVal)
  static getWeaponPassiveDescription = (weaponKey, refineIndex, charFinalStats, character, defVal = "") => (WeaponData[weaponKey]?.passiveDescription?.(refineIndex, charFinalStats, character) || defVal)
  static getWeaponDescription = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.description || defVal)
  static getWeaponConditional = (weaponKey, defVal = null) => (WeaponData[weaponKey]?.conditional || defVal)
  static getWeaponImg = (weaponKey, defVal = null) => WeaponData[weaponKey]?.img || defVal

  //base Stat
  static getWeaponMainStatVal = (weaponKey, levelKey, defVal = 0) => (WeaponData[weaponKey]?.baseStats?.main?.[this.getLevelIndex(levelKey)] || defVal)
  static getWeaponSubStatVal = (weaponKey, levelKey, defVal = 0) => (WeaponData[weaponKey]?.baseStats?.sub?.[this.getLevelIndex(levelKey)] || defVal)
  static getWeaponSubStatKey = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.baseStats?.subStatKey || defVal)
  static getWeaponBonusStat = (weaponKey, refineIndex, defVal = {}) => WeaponData[weaponKey]?.stats?.(refineIndex) ?? defVal

  static getWeaponsOfType = (weaponType) => Object.fromEntries(Object.entries(WeaponData).filter(([key, weaponObj]) => weaponObj.weaponType === weaponType))
  static getWeaponTypeName = (weaponType, defVal = "") => (WeaponTypeData[weaponType] || defVal)

  static getWeaponMainStatValWithOverride = (weaponObj, defVal = 0) =>
    weaponObj?.overrideMainVal || this.getWeaponMainStatVal(weaponObj?.key, weaponObj?.levelKey, defVal);
  static getWeaponSubStatValWithOverride = (weaponObj, defVal = 0) =>
    weaponObj?.overrideSubVal || this.getWeaponSubStatVal(weaponObj?.key, weaponObj?.levelKey, defVal);

  static getWeaponConditionalStat = (weaponKey, refineIndex, conditionalNum, defVal = null) => {
    let conditional = this.getWeaponConditional(weaponKey)
    if (!conditional || !conditionalNum) return defVal
    let [stats, stacks] = ConditionalsUtil.getConditionalProp(conditional, "stats", conditionalNum)
    if (!stacks) return defVal
    stats = stats(refineIndex)
    if (stacks !== 1) objMultiplication(stats, stacks)
    return stats
  }
}