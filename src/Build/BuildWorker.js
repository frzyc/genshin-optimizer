import '../WorkerHack'
import ArtifactBase from "../Artifact/ArtifactBase";
import { AttachLazyFormulas } from "../StatData";

onmessage = async (e) => {
  let { splitArtifacts, artifactSetPerms, setFilters, initialStats, artifactSetEffects, maxBuildsToShow, buildFilterKey, asending, depdendencyStatKeys } = e.data;
  if (process.env.NODE_ENV === "development") console.log(JSON.stringify(depdendencyStatKeys))
  let t1 = performance.now()
  let artifactPerms = generateAllPossibleArtifactPerm(splitArtifacts, artifactSetPerms, setFilters)
  let builds = artifactPerms.map(artifacts =>
    ({ builFilterVal: calculateFinalStat(buildFilterKey, initialStats, artifacts, artifactSetEffects, depdendencyStatKeys), artifacts }));
  let t2 = performance.now()
  builds.sort((a, b) => asending ? (a.builFilterVal - b.builFilterVal) : (b.builFilterVal - a.builFilterVal))
  builds.splice(maxBuildsToShow)
  if (process.env.NODE_ENV === "development") console.log(builds.map(b => b.builFilterVal))
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
  let slotKeys = ["flower", "plume", "sands", "goblet", "circlet"];
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

function calculateFinalStat(key, charAndWeapon, artifacts, artifactSetEffects, depdendencyStatKeys) {
  let stats = JSON.parse(JSON.stringify(charAndWeapon))
  let setToSlots = ArtifactBase.setToSlots(artifacts)

  //addArtifact stats
  Object.values(artifacts).forEach(art => {
    if (!art) return
    stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + art.mainStatVal
    art.substats.forEach((substat) =>
      substat?.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))
  })

  //add setEffects
  Object.entries(setToSlots).forEach(([setKey, arr]) =>
    artifactSetEffects[setKey] && Object.entries(artifactSetEffects[setKey]).forEach(([num, value]) =>
      parseInt(num) <= arr.length && Object.entries(value).forEach(([statKey, val]) =>
        stats[statKey] = (stats[statKey] || 0) + val)))

  //attach the formulas
  AttachLazyFormulas(stats, depdendencyStatKeys)
  return stats[key]
}