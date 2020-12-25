import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Character from '../Character/Character';
import CharacterDatabase from '../Character/CharacterDatabase';
import SlotIcon from '../Components/SlotIcon';
import { ArtifactMainSlotKeys, ArtifactMainStatsData, ArtifactSetsData, ArtifactSlotsData, ArtifactStarsData, ArtifactSubStatsData } from '../Data/ArtifactData';
import Stat from '../Stat';
import { clampPercent, closeEnoughFloat, closeEnoughInt, deepClone } from '../Util';
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
  static getMainStatKeys = () => [...ArtifactMainSlotKeys, ...Character.getElementalKeys().map((ele) => `${ele}_ele_dmg`)]
  static getMainStatValue = (key, numStars, level, defVal = 0) => {
    if (key && numStars && ArtifactMainStatsData[numStars] && ArtifactMainStatsData[numStars][key] && ArtifactMainStatsData[numStars][key][level])
      return ArtifactMainStatsData[numStars][key][level]
    else {
      if (key && key.includes("_ele_dmg")) {
        let elementKey = "ele_dmg"
        return this.getMainStatValue(elementKey, numStars, level, defVal)
      }
      return defVal
    }
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
  static artifactValidation(state, substateValidation) {
    let currentEfficiency = 0, maximumEfficiency = 0;
    if (!substateValidation) substateValidation = state.substats.map(substat => Artifact.validateSubStat(state, substat));
    for (const substat of substateValidation)
      if (!substat.valid)
        return { substateValidation, valid: false, msg: "One of the substat is invalid.", currentEfficiency, maximumEfficiency }

    //if a substat has >=2 rolls, when not all of them have been unlocked//if a substat has >=2 rolls, when not all of them have been unlocked
    if (substateValidation.some((substat) => substat.rolls && substat.rolls.length > 1) && substateValidation.some((substat) => !substat.rolls))
      return { substateValidation, valid: false, msg: "One of the substat have >1 rolls, but not all substats are unlocked.", currentEfficiency, maximumEfficiency }
    let currentNumOfRolls = substateValidation.reduce((sum, cur) => sum + (cur.valid && cur.rolls ? cur.rolls.length : 0), 0);
    let rollsRemaining = Artifact.rollsRemaining(state.level, state.numStars);
    let totalPossbleRolls = Artifact.totalPossibleRolls(state.numStars);

    if ((currentNumOfRolls + rollsRemaining) > totalPossbleRolls)
      return { substateValidation, valid: false, msg: `Current number of substat rolles(${currentNumOfRolls}) + Rolls remaining from level up (${rollsRemaining}) is greater than the total possible roll of this artifact (${totalPossbleRolls}) `, currentEfficiency, maximumEfficiency }

    let totalCurrentEfficiency = substateValidation.reduce((sum, cur) => sum + (cur.valid && cur.rolls && cur.efficiency ? (cur.efficiency * cur.rolls.length) : 0), 0);
    currentEfficiency = clampPercent(totalCurrentEfficiency / totalPossbleRolls);
    maximumEfficiency = clampPercent((totalCurrentEfficiency + rollsRemaining * 100) / totalPossbleRolls);
    return { valid: true, substateValidation, currentNumOfRolls, rollsRemaining, totalPossbleUpgrade: totalPossbleRolls, currentEfficiency, maximumEfficiency }
  }

  static setToSlots = ArtifactBase.setToSlots;
  static getArtifactSetEffects = (setToSlots) => {
    let artifactSetEffect = {}
    Object.entries(setToSlots).forEach(([setKey, arr]) => {
      let numArts = arr.length;
      if (ArtifactSetsData[setKey] && ArtifactSetsData[setKey].sets) {
        Object.entries(ArtifactSetsData[setKey].sets).forEach(([num, value]) => {
          if (parseInt(num) <= numArts) {
            !artifactSetEffect[setKey] && (artifactSetEffect[setKey] = {})
            artifactSetEffect[setKey][num] = deepClone(value);
          }
        })
      }
    })
    return artifactSetEffect
  }
  static getAllArtifactSetEffectsObj = (conditionals) => {
    let ArtifactSetEffectsObj = {};
    Object.entries(ArtifactSetsData).forEach(([key, setObj]) => {
      let setEffect = {}
      let hasSetEffect = false
      if (setObj.sets)
        Object.entries(setObj.sets).forEach(([setNumKey, setEffectObj]) => {
          //TODO conditionals
          if (setEffectObj.stats && Object.keys(setEffectObj.stats).length > 0) {
            setEffect[setNumKey] = deepClone(setEffectObj.stats)
            hasSetEffect = true
          }
        })
      if (hasSetEffect)
        ArtifactSetEffectsObj[key] = setEffect;
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