import { clampPercent, closeEnoughFloat, closeEnoughInt } from '../Util';
import { ArtifactStatsData, ArtifactStarsData, ArtifactMainStatsData, ArtifactSetsData, ArtifactSubStatsData, ArtifactSlotSData, ElementalData } from './ArtifactData'

export default class Artifact {
  static isInvalidArtifact = (art) =>
    !art || !art.setKey || !art.numStars || !art.slotKey || !art.mainStatKey
  static getArtifactSetName = (key, defVal = "") =>
    key ? ArtifactSetsData[key].name : defVal;

  static getArtifactSetsByMaxStarEntries = (star) =>
    Object.entries(ArtifactSetsData).filter(([key, setobj]) => setobj.rarity[(setobj.rarity.length) - 1] === star)

  static getArtifactSlotName = (slotKey, defVal = "") =>
    ArtifactSlotSData[slotKey] ? ArtifactSlotSData[slotKey].name : defVal

  static getArtifactPieceName = (state) =>
    (state.setKey && state.slotKey && ArtifactSetsData[state.setKey].pieces) ?
      ArtifactSetsData[state.setKey].pieces[state.slotKey] : "Piece Name";
  static getStatName = (key, defVal = "") => {
    if (key && ArtifactStatsData[key])
      return ArtifactStatsData[key].name;
    else if (key && key.includes("_ele_dmg")) {
      let element = key.split("_ele_dmg")[0]
      if (ElementalData[element])
        return ElementalData[element].name + " DMG Bonus"
    }
    return defVal
  }
  static getStatNameWithPercent = (key, defVal = "") => {
    let name = this.getStatName(key, defVal)
    if (name !== defVal && (key === "hp_" || key === "atk_" || key === "def_"))
      name += "%"
    return name;
  }

  static getStatUnit = (key, defVal = "") => {
    if (key && ArtifactStatsData[key] && ArtifactStatsData[key].unit)
      return ArtifactStatsData[key].unit
    else if (key && key.includes("_ele_dmg"))
      return this.getStatUnit("ele_dmg")
    else
      return defVal
  }

  static getMainStatValue = (key, numStars, level, defVal = 0) => {
    if (key && numStars && ArtifactMainStatsData[numStars] && ArtifactMainStatsData[numStars][key] && ArtifactMainStatsData[numStars][key][level])
      return ArtifactMainStatsData[numStars][key][level]
    else {
      if (key.includes("_ele_dmg")) {
        let elementKey = "ele_dmg"
        return this.getMainStatValue(elementKey, numStars, level, defVal)
      }
      return defVal
    }
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
          if (sum - val > 0.1) return
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
      rollData.forEach(roll => {
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
    let isFloat = this.getStatUnit(substat.key) === "%"
    let rollData = this.getSubstatRollData(substat.key, numStars);
    let rolls = this.getRolls(value, rollData, isFloat)

    if (!rolls || rolls.length === 0) return { valid: false, msg: `Substat cannot be rolled 0 times.` };
    let totalAllowableRolls = ArtifactStarsData[numStars].numUpgradesOrUnlocks - (4 - ArtifactStarsData[numStars].subBaseHigh) + 1;//+1 for its base roll
    if (rolls.length > totalAllowableRolls) return { valid: false, msg: `Substat cannot be rolled more than ${totalAllowableRolls} times.` };

    let min = rollData[0] * rolls.length;
    let max = rollData[rollData.length - 1] * rolls.length;
    return { valid: true, efficiency: clampPercent(((value - min) / (max - min)) * 100), msg: `This substat was rolled ${rolls.length} time(s). Values: [${rolls.join(", ")}]`, rolls }
  }
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
      return { substateValidation, valid: false, msg: `Current number of substat rolles(${currentNumOfRolls}) + Rolls remaining from level up (${rollsRemaining}) is greater than the total possibel roll of this artifact (${totalPossbleRolls}) `, currentEfficiency, maximumEfficiency }

    let totalCurrentEfficiency = substateValidation.reduce((sum, cur) => sum + (cur.valid && cur.rolls && cur.efficiency ? (cur.efficiency * cur.rolls.length) : 0), 0);
    currentEfficiency = clampPercent(totalCurrentEfficiency / totalPossbleRolls);
    maximumEfficiency = clampPercent((totalCurrentEfficiency + rollsRemaining * 100) / totalPossbleRolls);
    return { valid: true, substateValidation, currentNumOfRolls, rollsRemaining, totalPossbleUpgrade: totalPossbleRolls, currentEfficiency, maximumEfficiency }
  }
}