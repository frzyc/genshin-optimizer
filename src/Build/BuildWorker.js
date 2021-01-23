import '../WorkerHack'
import { PreprocessFormulas } from "../StatData";

onmessage = async (e) => {
  let { splitArtifacts, artifactSetPerms, setFilters, initialStats, artifactSetEffects, maxBuildsToShow, buildFilterKey, ascending, dependencies } = e.data;
  if (process.env.NODE_ENV === "development") console.log(dependencies)
  let t1 = performance.now()

  let preprocessedFormulas = PreprocessFormulas(dependencies, initialStats.modifiers)

  let builds = [], threshold = -Infinity, splitArtsPerSet = {}
  let setsInFilter = setFilters.filter(filter => filter.key).map(filter => filter.key)

  let prune = () => {
    builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    builds.splice(maxBuildsToShow)
  }

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

  let slotKeys = ["flower", "plume", "sands", "goblet", "circlet"]
  //recursion function to loop through everything.
  let slotPerm = (index, setPerm, setCount, accu, stats) => {
    if (index >= slotKeys.length) {
      preprocessedFormulas(stats)
      let buildFilterVal = ascending ? -stats[buildFilterKey] : stats[buildFilterKey]
      if (buildFilterVal >= threshold) {
        builds.push({buildFilterVal, artifacts: { ...accu } })
        if (builds.count >= 100000) {
          prune()
          threshold = builds[maxBuildsToShow - 1]
        }
      }
      return;
    }
    let slotKey = slotKeys[index]
    let setKey = setPerm[slotKey]
    splitArtsPerSet[slotKey][setKey]?.forEach(artifact => {
      let newStats = { ...stats }
      accumulate(slotKey, artifact, setCount, accu, newStats, artifactSetEffects)
      slotPerm(index + 1, setPerm, setCount, accu, newStats)
      setCount[artifact.setKey] -= 1
    });
  }
  artifactSetPerms.forEach(setPerm => slotPerm(0, setPerm, {}, {}, initialStats))
  prune()

  let t2 = performance.now()
  if (process.env.NODE_ENV === "development") console.log(builds.map(b => b.buildFilterVal))
  postMessage({ builds, timing: t2 - t1 })
}

function accumulate(slotKey, art, setCount, accu, stats, artifactSetEffects) {
  let setKey = art.setKey
  accu[slotKey] = art
  setCount[setKey] = (setCount[setKey] ?? 0) + 1

  // Add artifact stats
  stats[art.mainStatKey] = (stats[art.mainStatKey] || 0) + art.mainStatVal
  art.substats.forEach((substat) =>
    substat?.key && (stats[substat.key] = (stats[substat.key] || 0) + substat.value))

  // Add set effects
  let setEffect = artifactSetEffects[setKey]?.[setCount[setKey]]
  setEffect && Object.entries(setEffect).forEach(([statKey, val]) =>
    stats[statKey] = (stats[statKey] || 0) + val)
}
