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
  static totalPossibleRolls = (numStars) => ArtifactStarsData[numStars] ?
    (ArtifactStarsData[numStars].subBaseHigh + ArtifactStarsData[numStars].numUpgradesOrUnlocks) : 0;
  static rollsRemaining = (level, numStars) =>
    Math.ceil((numStars * 4 - level) / 4);
  static numberOfSubstatUnlocked = (state) =>
    state.substats.reduce((sum, cur) =>
      sum + (cur && cur.value ? 1 : 0), 0);
  static getSubstatRollData = (subStatKey, numStars) => (subStatKey && numStars) ?
    ArtifactSubStatsData[subStatKey][numStars] : []
  static getRolls(value, rollData, float = false) {
    let roll = null;
    let maxNumRoll = Math.round(value / rollData[0])
    if (!maxNumRoll) return null;
    let rollOption = (val, arr) => {
      if (roll) return;
      if (arr.length) {
        if (arr.length > maxNumRoll) return;
        let sum = arr.reduce((accu, v) => accu + v, 0)
        if (float) {
          if (sum - val >= 0.101) return
          if (closeEnoughFloat(sum, val)) {
            roll = arr;
            return;
          }
        } else {
          if (sum - val > 1) return
          if (closeEnoughInt(sum, val)) {
            roll = arr;
            return
          }
        }
      }
      rollData.slice().reverse().forEach(roll => {
        rollOption(value, [...arr, roll])
      })
    }
    rollOption(value, [])
    return roll;
  }
  static validateSubStat(state, substat) {
    if (!substat || !substat.value) return { valid: true }
    let value = parseFloat(substat.value);
    if (isNaN(value)) return { valid: false, msg: `Invalid Input` }
    let numStars = state.numStars
    if (!numStars) return { valid: false, msg: `Artifact Stars not set.` }
    let isFloat = Stat.getStatUnit(substat.key) === "%"
    let rollData = this.getSubstatRollData(substat.key, numStars);
    let rolls = this.getRolls(value, rollData, isFloat)

    if (!rolls || rolls.length === 0) return { valid: false, msg: `Substat cannot be rolled 0 times.` };
    let totalAllowableRolls = ArtifactStarsData[numStars]?.numUpgradesOrUnlocks - (4 - ArtifactStarsData[numStars]?.subBaseHigh) + 1;//+1 for its base roll
    if (rolls.length > totalAllowableRolls) return { valid: false, msg: `Substat cannot be rolled more than ${totalAllowableRolls} times.` };

    let min = rollData[0] * rolls.length;
    let max = rollData[rollData.length - 1] * rolls.length;
    return { valid: true, efficiency: clampPercent(((value - min) / (max - min)) * 100), msg: `This substat was rolled ${rolls.length} time(s). Values: [${rolls.join(", ")}]`, rolls }
  }

  //ARTIFACT IN GENERAL
  static artifactValidation(state) {
    let currentEfficiency = 0, maximumEfficiency = 0;
    let subStatValidations = state.substats.map(substat => Artifact.validateSubStat(state, substat));
    for (const substat of subStatValidations)
      if (!substat.valid)
        return { subStatValidations, valid: false, msg: "One of the substat is invalid.", currentEfficiency, maximumEfficiency }

    //if a substat has >=2 rolls, when not all of them have been unlocked//if a substat has >=2 rolls, when not all of them have been unlocked
    if (subStatValidations.some(substat => substat?.rolls?.length > 1) && subStatValidations.some((substat) => !substat.rolls))
      return { subStatValidations, valid: false, msg: "One of the substat have >1 rolls, but not all substats are unlocked.", currentEfficiency, maximumEfficiency }
    let currentNumOfRolls = subStatValidations.reduce((sum, cur) => sum + (cur.valid && cur.rolls ? cur.rolls.length : 0), 0);
    let rollsRemaining = Artifact.rollsRemaining(state.level, state.numStars);
    let totalPossbleRolls = Artifact.totalPossibleRolls(state.numStars);

    if ((currentNumOfRolls + rollsRemaining) > totalPossbleRolls)
      return { subStatValidations, valid: false, msg: `Current number of substat rolles(${currentNumOfRolls}) + Rolls remaining from level up (${rollsRemaining}) is greater than the total possible roll of this artifact (${totalPossbleRolls}) `, currentEfficiency, maximumEfficiency }

    let totalCurrentEfficiency = subStatValidations.reduce((sum, cur) => sum + (cur.valid && cur.rolls && cur.efficiency ? (cur.efficiency * cur.rolls.length) : 0), 0);
    currentEfficiency = clampPercent(totalCurrentEfficiency / totalPossbleRolls);
    maximumEfficiency = clampPercent((totalCurrentEfficiency + rollsRemaining * 100) / totalPossbleRolls);
    return { valid: true, subStatValidations, currentNumOfRolls, rollsRemaining, totalPossbleUpgrade: totalPossbleRolls, currentEfficiency, maximumEfficiency }
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