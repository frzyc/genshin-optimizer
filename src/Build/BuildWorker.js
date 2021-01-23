import '../WorkerHack'
import ArtifactBase from "../Artifact/ArtifactBase";
import { PreprocessFormulas } from "../StatData";

onmessage = async (e) => {
  let { splitArtifacts, artifactSetPerms, setFilters, initialStats, artifactSetEffects, maxBuildsToShow, ascending, dependencies } = e.data;
  if (process.env.NODE_ENV === "development") console.log(dependencies)
  let t1 = performance.now()
  let preprocessedFormulas = PreprocessFormulas(dependencies, initialStats.modifiers)
  let builds = generateBuilds(splitArtifacts, artifactSetPerms, setFilters, artifactSetEffects, initialStats, preprocessedFormulas)
  let t2 = performance.now()
  builds.sort((a, b) => ascending ? (a.buildFilterVal - b.buildFilterVal) : (b.buildFilterVal - a.buildFilterVal))
  builds.splice(maxBuildsToShow)
  if (process.env.NODE_ENV === "development") console.log(builds.map(b => b.buildFilterVal))
  postMessage({ builds, timing: t2 - t1 })
};
const generateBuilds = (splitArtifacts, setPerms, setFilters, artifactSetEffects, initialStats, preprocessedFormulas) => {
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
  let slotPerm = (index, setPerm, setCount, accu, stats) => {
    if (index >= slotKeys.length) {
      perm.push({ buildFilterVal: preprocessedFormulas(stats), artifacts: { ...accu } })
      return;
    }
    let slotKey = slotKeys[index];
    let setKey = setPerm[slotKey];
    if (splitArtsPerSet[slotKey][setKey]) {
      splitArtsPerSet[slotKey][setKey].forEach(artifact => {
        let newStats = { ...stats }
        accumulate(slotKey, setKey, artifact, setCount, accu, newStats, artifactSetEffects)
        slotPerm(index + 1, setPerm, setCount, accu, newStats)
        setCount[setKey] -= 1
      });
    }

  }
  setPerms.forEach(setPerm => slotPerm(0, setPerm, {}, {}, initialStats))
  return perm
}

function accumulate(slotKey, setKey, art, setCount, accu, stats, artifactSetEffects) {
  // Add artifact stats
  stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + art.mainStatVal
  art.substats.forEach((substat) =>
    substat?.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))

  // Add set effects
  let setEffect = artifactSetEffects[setKey]?.[setCount[setKey]]
  setEffect && Object.entries(setEffect).forEach(([statKey, val]) =>
    stats[statKey] = (stats[statKey] || 0) + val)

  accu[slotKey] = art
  setCount[setKey] = (setCount[setKey] ?? 0) + 1
}
