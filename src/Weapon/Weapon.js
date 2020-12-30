import { WeaponData, LevelNameData, WeaponLevelKeys, WeaponTypeData } from '../Data/WeaponData.js'
import { clamp } from '../Util/Util.js';
export default class Weapon {
  //do not instantiate.
  constructor() { if (this instanceof Weapon) throw Error('A static class cannot be instantiated.'); }

  static getLevelName = (levelKey, defVal = "") => (LevelNameData[levelKey] || defVal)
  static getLevelIndex = (levelKey) => WeaponLevelKeys.indexOf(levelKey)

  static getWeaponName = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.name || defVal)
  static getWeaponRarity = (weaponKey, defVal = 0) => (WeaponData[weaponKey]?.rarity || defVal)
  static getWeaponPassiveName = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.passiveName || defVal)
  static getWeaponPassiveDescription = (weaponKey, refineIndex, charFinalStats, defVal = "") => (WeaponData[weaponKey]?.passiveDescription?.(refineIndex, charFinalStats) || defVal)
  static getWeaponDescription = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.description || defVal)
  static getWeaponConditional = (weaponKey, defVal = null) => (WeaponData[weaponKey]?.conditional || defVal)

  //base Stat
  static getWeaponMainStatVal = (weaponKey, levelKey, defVal = 0) => (WeaponData[weaponKey]?.baseStats?.main?.[this.getLevelIndex(levelKey)] || defVal)
  static getWeaponSubStatVal = (weaponKey, levelKey, defVal = 0) => (WeaponData[weaponKey]?.baseStats?.sub?.[this.getLevelIndex(levelKey)] || defVal)
  static getWeaponSubStatKey = (weaponKey, defVal = "") => (WeaponData[weaponKey]?.baseStats?.subStatKey || defVal)
  static getWeaponBonusStat = (weaponKey, refineIndex) => WeaponData[weaponKey]?.stats?.(refineIndex)

  static getWeaponsOfType = (weaponType) => Object.fromEntries(Object.entries(WeaponData).filter(([key, weaponObj]) => weaponObj.weaponType === weaponType))
  static getWeaponTypeName = (weaponType, defVal = "") => (WeaponTypeData[weaponType] || defVal)

  static getWeaponMainStatValWithOverride = (weaponObj, defVal = 0) =>
    weaponObj?.overrideMainVal || this.getWeaponMainStatVal(weaponObj?.key, weaponObj?.levelKey, defVal);
  static getWeaponSubStatValWithOverride = (weaponObj, defVal = 0) =>
    weaponObj?.overrideSubVal || this.getWeaponSubStatVal(weaponObj?.key, weaponObj?.levelKey, defVal);

  static getWeaponConditionalStat = (weaponKey, refineIndex, conditionalNum, defVal = null) => {
    let conditional = this.getWeaponConditional(weaponKey)
    if (!conditional || !conditionalNum) return defVal
    if (Array.isArray(conditional)) {
      //multiple conditionals
      let selectedConditionalNum = conditionalNum
      let selectedConditional = null
      for (const curConditional of conditional) {
        if (selectedConditionalNum > curConditional.maxStack) selectedConditionalNum -= curConditional.maxStack
        else {
          selectedConditional = curConditional;
          break;
        }
      }
      if (!selectedConditional) return defVal
      let stacks = clamp(selectedConditionalNum, 1, selectedConditional.maxStack)
      return Object.fromEntries(Object.entries(selectedConditional.stats(refineIndex)).map(([key, val]) => [key, val * stacks]))
    } else if (conditional.maxStack > 1) {
      //condtional with stacks
      let stacks = clamp(conditionalNum, 1, conditional.maxStack)
      return Object.fromEntries(Object.entries(conditional.stats(refineIndex)).map(([key, val]) => [key, val * stacks]))
    } else if (conditional.maxStack === 1)
      //boolean conditional
      return conditional.stats(refineIndex)
    return defVal
  }
  static createWeaponBundle = (character) => ({
    subKey: this.getWeaponSubStatKey(character?.weapon?.key),
    subVal: this.getWeaponSubStatValWithOverride(character?.weapon),
    bonusStats: this.getWeaponBonusStat(character?.weapon?.key, character?.weapon?.refineIndex),
    conditionalStats: this.getWeaponConditionalStat(character?.weapon?.key, character?.weapon?.refineIndex, character?.weapon?.conditionalNum)
  })

}