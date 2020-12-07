import { artifactStats, stars, mainStats, star5ArtifactsSets, artifactSubStats, artifactSlots } from './ArtifactData'

export default class Artifact {

  getArtifactSetName = () =>
    Artifact.getArtifactSetName(this.state);

  static getArtifactSetName = (state) =>
    state.selectedArtifactSetKey ? star5ArtifactsSets[state.selectedArtifactSetKey].name : "Artifact Set";
  static getArtifactSlotName = (slotKey) =>
    artifactSlots[slotKey] ? artifactSlots[slotKey].name : ""

  static getArtifactPieceName = (state) =>
    (state.selectedArtifactSetKey && state.slotKey && star5ArtifactsSets[state.selectedArtifactSetKey].pieces) ?
      star5ArtifactsSets[state.selectedArtifactSetKey].pieces[state.slotKey] : "Piece Name";
  static getStatName = (key) => artifactStats[key].name;

  static getStatUnit = (key) => (key && artifactStats[key] && artifactStats[key].unit) ? artifactStats[key].unit : "";

  static getMainStatValue = (state) =>
    (state.mainStatKey && state.numStars) ? `${mainStats[state.numStars][state.mainStatKey][state.level]}` : 0

  static totalPossibleRolls = (state) => stars[state.numStars] ?
    (stars[state.numStars].subBaseHigh + stars[state.numStars].numUpgradesOrUnlocks) : 0;

  static rollsRemaining = (state) =>
    Math.floor((state.numStars * 4 - state.level) / 4);

  static numberOfSubstatUnlocked = (state) =>
    state.substats.reduce((sum, cur) =>
      sum + (cur && cur.value ? 1 : 0), 0);

  static getRemainingSubstats = (state) =>
    (state.slotKey ? Object.keys(artifactSubStats).filter((key) => {
      //if mainstat has key, not valid
      if (state.mainStatKey === key) return false;
      //if any one of the substat has, not valid.
      return !state.substats.some((substat, i) =>
        (substat && substat.key ? (substat.key === key) : false)
      )
    }) : []);

  static getCurrentNumOfRolls = (substateValidation) =>
    substateValidation.reduce((sum, cur) => sum + (cur.valid ? cur.rolls : 0), 0);

  static getCurrentTotalEfficiency = (substateValidation) =>
    substateValidation.reduce((sum, cur) => sum + (cur.valid && cur.efficiency ? (cur.efficiency * cur.rolls) : 0), 0)

  static getStatHighRollVal = (subStatKey, numStars) => (subStatKey ?? numStars) ?
    artifactSubStats[subStatKey][numStars].high : 0
  static getStatLowRollVal = (subStatKey, numStars) => (subStatKey ?? numStars) ?
    artifactSubStats[subStatKey][numStars].low : 0
  static validateSubStat = (state, substat) => {
    if (!substat || !substat.value) return { valid: true }
    let value = parseFloat(substat.value);
    if (isNaN(value)) return { valid: false, msg: `Invalid Input` }
    let statHighRollVal = this.getStatHighRollVal(substat.key, state.numStars);
    let statLowRollVal = this.getStatLowRollVal(substat.key, state.numStars);
    const validateRolls = (rolls) => {
      if (rolls === 0) return { valid: false, msg: `Substat cannot be rolled 0 times.` };
      let totalAllowableRolls = stars[state.numStars].numUpgradesOrUnlocks - (4 - stars[state.numStars].subBaseHigh) + 1;//+1 for its base roll
      if (rolls > totalAllowableRolls) return { valid: false, msg: `Substat cannot be rolled more than ${totalAllowableRolls} times.` };
      let min = statLowRollVal * rolls;
      let max = statHighRollVal * rolls;
      if (value < min || value > max)
        return { valid: false, msg: `Invalid value(${value}) for ${rolls} rolls, should be between [${min.toFixed(2)},${max.toFixed(2)}].` }
      return { valid: true, efficiency: ((value - min) / (max - min)) * 100, msg: `This substat was rolled ${rolls} time(s). Min/Max value: ${min.toFixed(2)}/${max.toFixed(2)}.` }
    }
    let rolls = Math.ceil(value / statHighRollVal);
    let validation = validateRolls(rolls);
    let errormsg = validation.msg;//store error msg
    if (!validation.valid) {
      let rolls2 = Math.floor(value / statLowRollVal);
      if (rolls2 !== rolls)
        validation = validateRolls(rolls2);
      if (!validation.valid) {
        rolls = 0;
        if (validation.msg !== errormsg)
          validation.msg = errormsg + " " + validation.msg;//combine both error tooltips
      } else {
        rolls = rolls2
      }
    }
    validation.rolls = rolls;
    return validation;
  }
  static artifactValidation(state, substateValidation) {
    let currentEfficiency = 0, maximumEfficiency = 0;
    if (!substateValidation) substateValidation = state.substats.map(substat => Artifact.validateSubStat(state, substat));
    for (const substat of substateValidation)
      if (!substat.valid)
        return { substateValidation, valid: false, msg: "One of the substat is invalid.", currentEfficiency, maximumEfficiency }

    //if a substat has >=2 rolls, when not all of them have been unlocked//if a substat has >=2 rolls, when not all of them have been unlocked
    if (substateValidation.some((substat) => substat.rolls > 1) && substateValidation.some((substat) => !substat.rolls))
      return { substateValidation, valid: false, msg: "One of the substat have >1 rolls, but not all substats are unlocked.", currentEfficiency, maximumEfficiency }
    let currentNumOfRolls = Artifact.getCurrentNumOfRolls(substateValidation);
    let rollsRemaining = Artifact.rollsRemaining(state);
    let totalPossbleRolls = Artifact.totalPossibleRolls(state);

    if ((currentNumOfRolls + rollsRemaining) > totalPossbleRolls)
      return { substateValidation, valid: false, msg: `Current number of substat rolles(${currentNumOfRolls}) + Rolls remaining from level up (${rollsRemaining}) is greater than the total possibel roll of this artifact (${totalPossbleRolls}) `, currentEfficiency, maximumEfficiency }

    let totalCurrentEfficiency = Artifact.getCurrentTotalEfficiency(substateValidation);
    currentEfficiency = totalCurrentEfficiency / totalPossbleRolls;
    maximumEfficiency = (totalCurrentEfficiency + rollsRemaining * 100) / totalPossbleRolls;
    return { valid: true, substateValidation, currentNumOfRolls, rollsRemaining, totalPossbleUpgrade: totalPossbleRolls, currentEfficiency, maximumEfficiency }

  }
}