import '../WorkerHack'
import { PreprocessFormulas } from "../StatData";

onmessage = async (e) => {
  let { splitArtifacts, artifactSetPerms, setFilters, initialStats, artifactSetEffects, maxBuildsToShow, buildFilterKey, ascending, dependencies } = e.data;
  if (process.env.NODE_ENV === "development") console.log(dependencies)
  let t1 = performance.now()

  let finalizeStats = PreprocessFormulas(dependencies, initialStats.modifiers)
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

  let buildCount = 0;
  artifactSetPerms.forEach(setPerm =>
    generateBuilds(setPerm, initialStats, splitArtsPerSet, artifactSetEffects, (accu, stats) => {
      finalizeStats(stats)
      let buildFilterVal = ascending ? -stats[buildFilterKey] : stats[buildFilterKey]
      if (buildFilterVal >= threshold) {
        builds.push({ buildFilterVal, artifacts: { ...accu } })
        if (builds.length >= 1000) {
          prune()
          threshold = builds[builds.length - 1].buildFilterVal
        }
      }
      buildCount++;
      if (!(buildCount % 10000))
        postMessage({ progress: buildCount, timing: performance.now() - t1 })
    })
  )
  prune()
  
  let t2 = performance.now()
  postMessage({ progress: buildCount, timing: t2 - t1 })
  if (process.env.NODE_ENV === "development") console.log(builds.map(b => b.buildFilterVal))
  postMessage({ builds, timing: t2 - t1 })
}

function generateBuilds(setPerm, initialStats, splitArtsPerSet, artifactSetEffects, callback) {
  let slotKeys = ["flower", "plume", "sands", "goblet", "circlet"]

  function slotPerm(index, setCount, accu, stats) {
    if (index >= slotKeys.length) {
      callback(accu, stats)
      return
    }

    let slotKey = slotKeys[index], setKey = setPerm[slotKey]
    if (splitArtsPerSet[slotKey][setKey])
      for (const artifact of splitArtsPerSet[slotKey][setKey]) {
        let newStats = { ...stats }
        accumulate(slotKey, artifact, setCount, accu, newStats, artifactSetEffects)
        slotPerm(index + 1, setCount, accu, newStats)
        setCount[artifact.setKey] -= 1
      }
  }

  slotPerm(0, {}, {}, initialStats)
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
