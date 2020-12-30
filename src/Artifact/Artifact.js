import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CharacterDatabase from '../Character/CharacterDatabase';
import SlotIcon from '../Components/SlotIcon';
import { ArtifactMainSlotKeys, ArtifactMainStatsData, ArtifactSetsData, ArtifactSlotsData, ArtifactStarsData, ArtifactSubStatsData } from '../Data/ArtifactData';
import Stat from '../Stat';
import ArtifactConditionals from '../Util/ArtifactConditionals';
import { clamp, clampPercent, closeEnoughFloat, closeEnoughInt, deepClone } from '../Util/Util';
import ArtifactBase from './ArtifactBase';
import ArtifactDatabase from './ArtifactDatabase';

export default class Artifact {
  //do not instantiate.
  constructor() {
    if (this instanceof Artifact) {
      throw Error('A static class cannot be instantiated.');
    }
  }

  //SETS
  static getArtifactSetName = (key, defVal = "") => ArtifactSetsData?.[key]?.name || defVal;
  static getArtifactSetsByMaxStarEntries = (star) =>
    Object.entries(ArtifactSetsData).filter(([key, setobj]) => setobj.rarity[(setobj.rarity.length) - 1] === star)
  static getArtifactPieceName = (setKey, slotKey, defVal = "") => ArtifactSetsData?.[setKey]?.pieces?.[slotKey] || defVal;
  static getArtifactPieceIcon = (setKey, slotKey, defVal = null) => ArtifactSetsData?.[setKey]?.icons?.[slotKey] || defVal;
  static getArtifactSetEffectsObj = (setKey, defVal = null) => ArtifactSetsData?.[setKey]?.sets || defVal
  //SLOT
  static getArtifactSlotKeys = () => Object.keys(ArtifactSlotsData)
  static getArtifactSlotName = (slotKey, defVal = "") =>
    ArtifactSlotsData[slotKey] ? ArtifactSlotsData[slotKey].name : defVal
  static getArtifactSlotIcon = (slotKey, defVal = "") =>
    (slotKey && SlotIcon[slotKey]) ? <FontAwesomeIcon icon={SlotIcon[slotKey]} key={slotKey} className="fa-fw" /> : defVal

  static getArtifactSlotNameWithIcon = (slotKey, defVal = "") => {
    if (!slotKey) return defVal;
    let name = this.getArtifactSlotName(slotKey)
    if (!name) return defVal;
    let slotIcon = this.getArtifactSlotIcon(slotKey)
    if (!slotIcon) return defVal;
    return (<span>{slotIcon} {name}</span>)
  }

  //STARS
  static getRarityArr = (setKey) => ArtifactSetsData[setKey] ? ArtifactSetsData[setKey].rarity : []

  //MAIN STATS
  static getMainStatKeys = () => ArtifactMainSlotKeys
  static getMainStatValue = (key, numStars, level, defVal = 0) => {
    let main = ArtifactMainStatsData[numStars]?.[key]?.[level]
    if (main) return main
    else if (key?.includes("_ele_dmg")) //because in the database its still stored as ele_dmg
      return this.getMainStatValue("ele_dmg", numStars, level, defVal)
    return defVal
  }

  //SUBSTATS
  static getSubStatKeys = () => Object.keys(ArtifactSubStatsData)
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
    let closeEnoughRoll = null;
    let maxNumRoll = parseInt((value / rollData[0]).toFixed(0))
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
          if (sum === val) {
            roll = arr;
            return
          } else if (closeEnoughInt(sum, val)) {
            closeEnoughRoll = arr;
          }
        }
      }
      rollData.slice().reverse().forEach(roll => {
        rollOption(value, [...arr, roll])
      })
    }
    rollOption(value, [])
    if (!roll && closeEnoughRoll) roll = closeEnoughRoll;
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
    let totalAllowableRolls = ArtifactStarsData[numStars].numUpgradesOrUnlocks - (4 - ArtifactStarsData[numStars].subBaseHigh) + 1;//+1 for its base roll
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

  static getArtifactSets = (setKey, defVal = null) =>
    ArtifactSetsData?.[setKey]?.sets || defVal
  static getArtifactSetNumStats = (setKey, setNumKey, defVal = null) =>
    deepClone(this.getArtifactSets(setKey)?.[setNumKey]?.stats || defVal)

  static getArtifactConditionalStats = (setKey, setNumKey, conditionalNum, defVal = null) => {
    if (!conditionalNum) return defVal
    let conditional = ArtifactSetsData[setKey].sets[setNumKey].conditional
    if (!conditional) return defVal
    if (Array.isArray(conditional)) {
      //multiconditional
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
      return Object.fromEntries(Object.entries(selectedConditional.stats).map(([key, val]) => [key, val * stacks]))
    } else if (conditional.maxStack > 1) {
      //condtional with stacks
      let stacks = clamp(conditionalNum, 1, conditional.maxStack)
      return Object.fromEntries(Object.entries(conditional.stats).map(([key, val]) => [key, val * stacks]))
    } else if (conditional.maxStack === 1)
      //boolean conditional
      return deepClone(conditional.stats)
    return defVal
  }
  static getArtifactSetEffectsStats = (setToSlots) => {
    let artifactSetEffect = []
    Object.entries(setToSlots).forEach(([setKey, artArr]) =>
      ArtifactSetsData?.[setKey]?.sets && Object.entries(ArtifactSetsData[setKey].sets).forEach(([setNumKey, value]) =>
        parseInt(setNumKey) <= artArr.length && value.stats && Object.keys(value.stats).length &&
        Object.entries(value.stats).forEach(([key, statVal]) =>
          artifactSetEffect.push({ key, statVal }))))
    return artifactSetEffect
  }
  static getArtifactSetEffects = (setToSlots) => {
    let artifactSetEffect = {}
    Object.entries(setToSlots).forEach(([setKey, artArr]) => {
      if (ArtifactSetsData?.[setKey]?.sets) {
        let setNumKeys = Object.keys(ArtifactSetsData[setKey].sets).filter(setNumKey => parseInt(setNumKey) <= artArr.length)
        if (setNumKeys.length)
          artifactSetEffect[setKey] = setNumKeys
      }
    })
    return artifactSetEffect
  }

  static getArtifactSetEffectText = (setKey, setNumKey, charFinalStats, defVal = "") => {
    let setEffectText = ArtifactSetsData?.[setKey]?.sets?.[setNumKey]?.text
    if (!setEffectText) return defVal
    if (typeof setEffectText === "string")
      return setEffectText
    else if (typeof setEffectText === "function")
      return setEffectText(charFinalStats || {})
    return defVal
  }
  static getArtifactSetEffectConditional = (setKey, setNumKey, defVal = null) =>
    ArtifactSetsData?.[setKey]?.sets?.[setNumKey]?.conditional || defVal

  static getAllArtifactSetEffectsObj = (artifactConditionals) => {
    let ArtifactSetEffectsObj = {};
    Object.entries(ArtifactSetsData).forEach(([setKey, setObj]) => {
      let setEffect = {}
      let hasSetEffect = false
      if (setObj.sets)
        Object.entries(setObj.sets).forEach(([setNumKey, setEffectObj]) => {
          if (setEffectObj.stats && Object.keys(setEffectObj.stats).length > 0) {
            setEffect[setNumKey] = deepClone(setEffectObj.stats)
            hasSetEffect = true
          }
          if (setEffectObj.conditional) {
            let conditionalNum = ArtifactConditionals.getConditionalNum(artifactConditionals, setKey, setNumKey)
            if (conditionalNum) {
              let condStats = this.getArtifactConditionalStats(setKey, setNumKey, conditionalNum)
              if (condStats) {
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