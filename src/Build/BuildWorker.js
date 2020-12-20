
import Artifact from "../Artifact/Artifact";
import Character from "../Character/Character";

onmessage = async (e) => {
  let { split, artifactSetPerms, setFilters, character, maxBuildsToShow, buildFilterKey, asending } = e.data;
  let t1 = performance.now()
  let artifactPerms = generateAllPossibleArtifactPerm(split, artifactSetPerms, setFilters)
  let builds = artifactPerms.map(artifacts => Character.calculateBuildWithObjs(character, artifacts));
  let t2 = performance.now()
  builds.sort((a, b) =>
    asending ? (a.finalStats[buildFilterKey] - b.finalStats[buildFilterKey]) : (b.finalStats[buildFilterKey] - a.finalStats[buildFilterKey]))
  builds.splice(maxBuildsToShow)
  postMessage({ builds, timing: t2 - t1 })
};
const generateAllPossibleArtifactPerm = (splitArtifacts, setPerms, setFilters) => {
  let perm = [];

  let splitArtsPerSet = {}
  let setsInFilter = setFilters.filter(filter => filter.key).map(filter => filter.key)
  //count the number of arts in setfilter for each slot
  Object.entries(splitArtifacts).forEach(([key, artArr]) => {
    let artsPerSet = {}
    artArr.forEach(art => {
      if (setsInFilter.includes(art.setKey)) {
        if (artsPerSet[art.setKey]) artsPerSet[art.setKey].push(art)
        else artsPerSet[art.setKey] = [art]
      } else {
        let setKey = "Other"
        if (artsPerSet[setKey]) artsPerSet[setKey].push(art)
        else artsPerSet[setKey] = [art]
      }
    })
    splitArtsPerSet[key] = artsPerSet
  })
  let slotKeys = Artifact.getArtifactSlotKeys();
  //recursion function to loop through everything.
  let slotPerm = (index, setPerm, accu) => {
    if (index >= slotKeys.length) {
      perm.push(accu)
      return;
    }
    let slotKey = slotKeys[index];
    let setKey = setPerm[slotKey];
    if (splitArtsPerSet[slotKey][setKey]) {
      splitArtsPerSet[slotKey][setKey].forEach(element => {
        accu[slotKey] = element;
        slotPerm(index + 1, setPerm, { ...accu })
      });
    }

  }
  setPerms.forEach(setPerm => slotPerm(0, setPerm, {}))
  return perm
}

