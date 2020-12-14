import { ArtifactSetsData, ArtifactSlotsData } from "../Artifact/ArtifactData";

export default class Build {
  static test = (input) =>
    input * 2

  //works with id indexed object for database.
  static splitArtifactsBySlot(databaseObj) {
    let ret = {}
    for (let slot in ArtifactSlotsData)
      ret[slot] = Object.values(databaseObj).filter(art => art.slotKey === slot)
    return ret;

  }
  /**
   * Calculate all the possible set configuration based on the filters.
   * [{Key:X,num:2},{key:Y,num:2},{key:"",num:0}]
   * generates XXYYO,XYXYO,XXOYY..... combinations, where O means other. 
   * @param {Object} setFilters From BuildDisplay
   */
  static generateAllPossibleArtifactSetPerm(setFilters) {
    let sets = setFilters.filter(filter => filter.key).map(filter => filter.key);
    let useOther = setFilters.reduce((accu, filter) => filter.key ? accu + filter.num : accu, 0) < 5;
    if (useOther) sets.push("Other");

    let perm = [];
    let slotKeys = Object.keys(ArtifactSlotsData);
    //recursion function to loop through everything.
    let slotPerm = (index, accu) => {
      if (index >= slotKeys.length) {
        //todo validate accu against filter
        let numArtsPerSet = {}
        Object.values(accu).forEach(setKey => {
          if (numArtsPerSet[setKey]) numArtsPerSet[setKey] += 1
          else numArtsPerSet[setKey] = 1
        })
        let valid = true
        for (const setFilter of setFilters) {
          if (setFilter.key && (!numArtsPerSet[setFilter.key] || numArtsPerSet[setFilter.key] < setFilter.num)) {
            valid = false;
            break;
          }
        }
        if (valid) perm.push(accu)
        return;
      }
      let slotKey = slotKeys[index];
      sets.forEach(setKey => {
        //see if this set is valid at this piece slot. some artifacts dont have artifacts at specific slots.
        if (setKey === "Other" || (ArtifactSetsData[setKey] && (ArtifactSetsData[setKey].pieces) && Object.keys(ArtifactSetsData[setKey].pieces).includes(slotKey))) {
          accu[slotKey] = setKey;
          slotPerm(index + 1, { ...accu })
        }
      });
    }
    slotPerm(0, {});
    return perm
  }
  static calculateTotalBuildNumber(splitArtifacts, setPerms, setFilters) {
    let setsInFilter = setFilters.filter(filter => filter.key).map(filter => filter.key)
    let splitNumArtsPerSet = {}
    //count the number of arts in setfilter for each slot
    Object.entries(splitArtifacts).forEach(([key, artArr]) => {
      let numArtsPerSet = {}
      artArr.forEach(art => {
        if (setsInFilter.includes(art.setKey))
          numArtsPerSet[art.setKey] = (numArtsPerSet[art.setKey] || 0) + 1
        else
          numArtsPerSet["Other"] = (numArtsPerSet["Other"] || 0) + 1
      })
      splitNumArtsPerSet[key] = numArtsPerSet
    })
    //calculate!
    return setPerms.reduce((accu, setPerm) =>
      accu + Object.entries(setPerm).reduce((permaccu, [key, setKey]) =>
        (splitNumArtsPerSet[key] && splitNumArtsPerSet[key][setKey]) ? permaccu * splitNumArtsPerSet[key][setKey] : 0
        , 1)
      , 0)
  }
}