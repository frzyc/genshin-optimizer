import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CharacterDatabase from '../Character/CharacterDatabase';
import SlotIcon from '../Components/SlotIcon';
import { ArtifactMainSlotKeys, ArtifactMainStatsData, ArtifactData, ArtifactSlotsData, ArtifactStarsData, ArtifactSubStatsData, ArtifactDataImport } from '../Data/ArtifactData';
import Stat from '../Stat';
import ConditionalsUtil from '../Util/ConditionalsUtil';
import { clampPercent, closeEnoughFloat, closeEnoughInt, deepClone } from '../Util/Util';
import ArtifactBase from './ArtifactBase';
import ArtifactDatabase from './ArtifactDatabase';

export default class Artifact {
  //do not instantiate.
  constructor() { if (this instanceof Artifact) throw Error('A static class cannot be instantiated.'); }

  //SETS
  static getDataImport = () => ArtifactDataImport
  static getSetKeys = () => Object.keys(ArtifactData || {})
  static getSetName = (key, defVal = "") => ArtifactData?.[key]?.name || defVal;
  static getSetsByMaxStarEntries = (star) =>
    Object.entries(ArtifactData || {}).filter(([, setobj]) => setobj.rarity[(setobj.rarity.length) - 1] === star)
  static getPieces = (setKey, defVal = {}) => ArtifactData?.[setKey]?.pieces || defVal
  static getPieceName = (setKey, slotKey, defVal = "") => this.getPieces(setKey)[slotKey] || defVal;
  static getPieceIcon = (setKey, slotKey, defVal = null) => ArtifactData?.[setKey]?.icons?.[slotKey] || defVal;

  //SETEFFECT
  static getSetEffectsObj = (setKey, defVal = {}) => ArtifactData?.[setKey]?.setEffects || defVal
  static getArtifactSetNumStats = (setKey, setNumKey, defVal = {}) =>
    deepClone(this.getSetEffectsObj(setKey)?.[setNumKey]?.stats || defVal)
  static getArtifactSetEffectsStats = (setToSlots) => {
    let artifactSetEffect = []
    Object.entries(setToSlots).forEach(([setKey, artArr]) =>
      Object.entries(Artifact.getSetEffectsObj(setKey)).forEach(([setNumKey, value]) =>
        parseInt(setNumKey) <= artArr.length && value.stats && Object.keys(value.stats).length &&
        Object.entries(value.stats).forEach(([key, statVal]) =>
          artifactSetEffect.push({ key, statVal }))))
    return artifactSetEffect
  }
  static getSetEffects = (setToSlots) => {
    let artifactSetEffect = {}
    Object.entries(setToSlots).forEach(([setKey, artArr]) => {
      let setNumKeys = Object.keys(this.getSetEffectsObj(setKey)).filter(setNumKey => parseInt(setNumKey) <= artArr.length)
      if (setNumKeys.length)
        artifactSetEffect[setKey] = setNumKeys
    })
    return artifactSetEffect
  }

  static getSetEffectText = (setKey, setNumKey, charFinalStats, defVal = "") => {
    let setEffectText = this.getSetEffectsObj(setKey)?.[setNumKey]?.text
    if (!setEffectText) return defVal
    if (typeof setEffectText === "function")
      return setEffectText(charFinalStats)
    else if (setEffectText)
      return setEffectText
    return defVal
  }
  static getSetEffectConditional = (setKey, setNumKey, defVal = null) =>
    this.getSetEffectsObj(setKey)?.[setNumKey]?.conditional || defVal

  //SLOT
  static getSlotKeys = () => Object.keys(ArtifactSlotsData || {})
  static getSlotName = (slotKey, defVal = "") => ArtifactSlotsData?.[slotKey]?.name || defVal
  static getSlotIcon = (slotKey, defVal = "") =>
    (slotKey && SlotIcon[slotKey]) ? <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" /> : defVal
  static getSlotMainStatKeys = (slotKey, defVal = []) => ArtifactSlotsData?.[slotKey]?.stats || defVal

  static getSlotNameWithIcon = (slotKey, defVal = "") => {
    if (!slotKey) return defVal;
    let name = this.getSlotName(slotKey)
    if (!name) return defVal;
    let slotIcon = this.getSlotIcon(slotKey)
    if (!slotIcon) return defVal;
    return (<span>{slotIcon} {name}</span>)
  }
  static splitArtifactsBySlot = (databaseObj) =>
    Object.fromEntries(this.getSlotKeys().map(slotKey =>
      [slotKey, Object.values(databaseObj).filter(art => art.slotKey === slotKey)]))

  //STARS
  static getStars = () => Object.keys(ArtifactStarsData || {})
  static getRarityArr = (setKey, defVal = []) => ArtifactData?.[setKey]?.rarity || defVal

  //MAIN STATS
  static getMainStatKeys = () => deepClone(ArtifactMainSlotKeys)
  static getMainStatValues = (numStar, statKey, defVal = []) =>
    ArtifactMainStatsData?.[numStar]?.[statKey] || defVal

  static getMainStatValue = (key, numStars, level, defVal = 0) => {
    let main = this.getMainStatValues(numStars, key)[level]
    if (main) return main
    else if (key?.includes("_ele_dmg_bonus")) //because in the database its still stored as ele_dmg_bonus
      return this.getMainStatValue("ele_dmg_bonus", numStars, level, defVal)
    return defVal
  }

  //SUBSTATS
  static getBaseSubRollNumLow = (numStars, defVal = 0) => ArtifactStarsData?.[numStars]?.subsBaselow || defVal
  static getBaseSubRollNumHigh = (numStars, defVal = 0) => ArtifactStarsData?.[numStars]?.subBaseHigh || defVal
  static getNumUpgradesOrUnlocks = (numStars, defVal = 0) => ArtifactStarsData?.[numStars]?.numUpgradesOrUnlocks || defVal
  static getSubStatKeys = () => Object.keys(ArtifactSubStatsData || {})
  static subStatCloseEnough = (key, value1, value2) => {
    if (Stat.getStatUnit(key) === "%")
      return closeEnoughFloat(value1, value2)
    else
      return closeEnoughInt(value1, value2)
  }
  static totalPossibleRolls = (numStars) => ArtifactStarsData[numStars] ?
    (ArtifactStarsData[numStars].subBaseHigh + ArtifactStarsData[numStars].numUpgradesOrUnlocks) : 0;
  static rollsRemaining = (level, numStars) =>
    Math.ceil((numStars * 4 - level) / 4);
  static numberOfSubstatUnlocked = (state) =>
    state.substats.reduce((sum, cur) =>
      sum + (cur && cur.value ? 1 : 0), 0);
  static getSubstatRollData = (subStatKey, numStars) => (subStatKey && numStars) ?
    ArtifactSubStatsData[subStatKey][numStars] : []
  static getSubstatRolls = (subStatKey, subStatValue, numStars, defVal = []) => {
    if (!numStars || !subStatKey || typeof subStatValue !== "number" || !subStatValue) return defVal
    let rollData = this.getSubstatRollData(subStatKey, numStars)
    if (!rollData.length) return defVal
    if (rollData.includes(subStatValue)) return [[subStatValue]]
    if (subStatValue > (rollData[rollData.length - 1] * (this.getNumUpgradesOrUnlocks(numStars) + 2)))//+2 instead of +1 to go over rounding
      return defVal
    let isFloat = Stat.getStatUnit(subStatKey) === "%"
    //calculation is more expensive now, since its calculating all the combinations to test to get to the value.
    let rolls = [];
    let maxNumRoll = Math.round(subStatValue / rollData[0])
    if (!maxNumRoll) return defVal;
    const rollOption = (val, arr) => {
      if (arr.length) {
        if (arr.length > maxNumRoll) return;
        let sum = arr.reduce((accu, v) => accu + v, 0)
        if (isFloat) {
          if (sum - val >= 0.101) return
          if (closeEnoughFloat(sum, val))
            return rolls.push(arr);
        } else {
          if (sum - val > 1) return
          if (closeEnoughInt(sum, val))
            return rolls.push(arr);
        }
      }
      rollData.slice().reverse().forEach(roll => {
        if (!arr.length || arr[arr.length - 1] >= roll)
          rollOption(subStatValue, [...arr, roll])
      })
    }
    rollOption(subStatValue, [])
    return rolls;
  }
  static getSubstatEfficiency = (subStatKey, numStars, rolls) => {
    let rollData = this.getSubstatRollData(subStatKey, numStars);
    let len = rolls.length
    let sum = rolls.reduce((a, c) => a + c, 0)
    let min = rollData[0] * len;
    let max = rollData[rollData.length - 1] * len;
    return clampPercent(((sum - min) / (max - min)) * 100)
  }

  //ARTIFACT IN GENERAL
  static substatsValidation(state) {
    let { numStars = 0, level = 0, substats = [] } = state
    //calculate rolls for substats
    for (const substat of substats) {
      let { key, value } = substat
      let rollArr = Artifact.getSubstatRolls(key, value, numStars) || []
      substat.rolls = rollArr[0] || []
      if (rollArr.length > 1) substat.rollArr = rollArr
      substat.efficiency = Artifact.getSubstatEfficiency(key, numStars, substat.rolls)
    }
    let { currentEfficiency, maximumEfficiency } = Artifact.getArtifactEfficiency(substats, numStars, level)
    state.currentEfficiency = currentEfficiency
    state.maximumEfficiency = maximumEfficiency
    //artifact validation logic
    let errMsgs = []
    for (const substat of substats)
      if (!substat.rolls?.length && substat.key && substat.value)
        errMsgs.push("One of the substat is invalid.")

    //only show this error when all substats are "valid"
    if (!errMsgs.length && substats.some(substat => substat.rolls?.length > 1) && substats.some((substat) => !substat.rolls?.length))
      errMsgs.push("One of the substat have >1 rolls, but not all substats are unlocked.")

    if (numStars) {
      let currentNumOfRolls = substats.reduce((sum, cur) => sum + (cur.rolls?.length || 0), 0);
      let leastNumRolls = Artifact.getBaseSubRollNumLow(numStars) + Math.floor(level / 4)
      if (currentNumOfRolls < leastNumRolls) {//there might be substats with more rolls
        for (const substat of substats) {
          let rollslen = substat.rolls?.length
          if (!rollslen || !substat.rollArr) continue
          let moreRolls = substat.rollArr.filter(rolls => rolls.length > rollslen)
          if (moreRolls.length) {
            substat.rolls = moreRolls[0]
            moreRolls.length > 1 ? (substat.rollArr = moreRolls) : (delete substat.rollArr)
            substat.efficiency = Artifact.getSubstatEfficiency(substat.key, numStars, substat.rolls)
            let { currentEfficiency, maximumEfficiency } = Artifact.getArtifactEfficiency(substats, numStars, level)
            state.currentEfficiency = currentEfficiency
            state.maximumEfficiency = maximumEfficiency
          }
          currentNumOfRolls = substats.reduce((sum, cur) => sum + (cur.rolls?.length || 0), 0);
          if (currentNumOfRolls >= leastNumRolls) break;
        }
      }
      if (currentNumOfRolls < leastNumRolls)
        errMsgs.push(`Artifact should have at least ${leastNumRolls} Rolls, it currently only have ${currentNumOfRolls} Rolls.`)
      else {
        let rollsRemaining = Artifact.rollsRemaining(level, numStars);
        let totalPossbleRolls = Artifact.totalPossibleRolls(numStars);
        if ((currentNumOfRolls + rollsRemaining) > totalPossbleRolls)
          errMsgs.push(`Current number of substat rolles(${currentNumOfRolls}) + Rolls remaining from level up (${rollsRemaining}) is greater than the total possible roll of this artifact (${totalPossbleRolls}) `)
      }
    }
    return errMsgs
  }
  static getArtifactEfficiency(substats, numStars, level) {
    if (!numStars) return { currentEfficiency: 0, maximumEfficiency: 0 }
    let totalPossbleRolls = Artifact.totalPossibleRolls(numStars);
    let rollsRemaining = Artifact.rollsRemaining(level, numStars);
    let totalCurrentEfficiency = substats.reduce((sum, cur) => sum + (cur?.efficiency * cur?.rolls?.length || 0), 0);
    let currentEfficiency = clampPercent(totalCurrentEfficiency / totalPossbleRolls);
    let maximumEfficiency = clampPercent((totalCurrentEfficiency + rollsRemaining * 100) / totalPossbleRolls);
    return { currentEfficiency, maximumEfficiency }
  }

  static setToSlots = ArtifactBase.setToSlots;

  static getConditionalStats = (setKey, setNumKey, conditionalNum, defVal = {}) => {
    if (!conditionalNum) return defVal
    let conditional = this.getSetEffectConditional(setKey, setNumKey)
    if (!conditional) return defVal
    let [stats, stacks] = ConditionalsUtil.getConditionalProp(conditional, "stats", conditionalNum)
    if (!stacks) return defVal
    return Object.fromEntries(Object.entries(stats).map(([key, val]) => [key, val * stacks]))
  }

  static getAllArtifactSetEffectsObj = (artifactConditionals) => {
    let ArtifactSetEffectsObj = {};
    Object.entries(ArtifactData).forEach(([setKey, setObj]) => {
      let setEffect = {}
      let hasSetEffect = false
      if (setObj.setEffects)
        Object.entries(setObj.setEffects).forEach(([setNumKey, setEffectObj]) => {
          if (setEffectObj.stats && Object.keys(setEffectObj.stats).length > 0) {
            setEffect[setNumKey] = deepClone(setEffectObj.stats)
            hasSetEffect = true
          }
          if (setEffectObj.conditional) {
            let conditionalNum = ConditionalsUtil.getConditionalNum(artifactConditionals, { srcKey: setKey, srcKey2: setNumKey })
            if (conditionalNum) {
              let condStats = this.getConditionalStats(setKey, setNumKey, conditionalNum)
              if (Object.keys(condStats) > 0) {
                setEffect[setNumKey] = deepClone(condStats)
                hasSetEffect = true
              }
            }
          }
        })
      if (hasSetEffect)
        ArtifactSetEffectsObj[setKey] = setEffect;
    })
    return ArtifactSetEffectsObj
  }

  //database manipulation
  static equipArtifactOnChar(artifactId, characterId) {
    let art = ArtifactDatabase.getArtifact(artifactId);
    if (!art) return;
    let currentLocation = art.location;
    let intendedLocation = (characterId || "")
    if (currentLocation === intendedLocation) return;
    let slotKey = art.slotKey
    let artifactToSwapWithid = CharacterDatabase.getArtifactIDFromSlot(intendedLocation, slotKey)
    let artifactToSwapWith = ArtifactDatabase.getArtifact(artifactToSwapWithid)

    //update artifact
    if (artifactToSwapWith) ArtifactDatabase.swapLocations(art, artifactToSwapWith)
    else ArtifactDatabase.moveToNewLocation(art.id, intendedLocation)

    //update Character
    if (intendedLocation)
      CharacterDatabase.equipArtifact(intendedLocation, art)

    if (currentLocation) {
      if (artifactToSwapWith)
        CharacterDatabase.equipArtifact(currentLocation, artifactToSwapWith)
      else
        CharacterDatabase.unequipArtifactOnSlot(currentLocation, slotKey)
    }
  }
}