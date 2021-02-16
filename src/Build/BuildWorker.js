import '../WorkerHack'
import { PreprocessFormulas } from "../StatData";
import { artifactSetPermutations, artifactPermutations } from "./Build"

onmessage = async (e) => {
  let { splitArtifacts, setFilters, minFilters = {}, maxFilters = {}, initialStats, artifactSetEffects, maxBuildsToShow, buildFilterKey, ascending, dependencies } = e.data;
  if (process.env.NODE_ENV === "development") console.log(dependencies)
  let t1 = performance.now()

  let finalizeStats = PreprocessFormulas(dependencies, initialStats.modifiers)
  let builds = [], threshold = -Infinity

  let prune = () => {
    builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    builds.splice(maxBuildsToShow)
  }

  let buildCount = 0;
  const callback = (accu, stats) => {
    if (!(buildCount++ % 10000)) postMessage({ progress: buildCount, timing: performance.now() - t1 })
    finalizeStats(stats)
    if (Object.entries(minFilters).some(([key, minimum]) => stats[key] < minimum)) return
    if (Object.entries(maxFilters).some(([key, maximum]) => stats[key] > maximum)) return
    let buildFilterVal = ascending ? -stats[buildFilterKey] : stats[buildFilterKey]
    if (buildFilterVal >= threshold) {
      builds.push({ buildFilterVal, artifacts: { ...accu } })
      if (builds.length >= 1000) {
        prune()
        threshold = builds[builds.length - 1].buildFilterVal
      }
    }
  }
  for (const artifactsBySlot of artifactSetPermutations(splitArtifacts, setFilters))
    artifactPermutations(initialStats, artifactsBySlot, artifactSetEffects, callback)

  prune()

  let t2 = performance.now()
  postMessage({ progress: buildCount, timing: t2 - t1 })
  if (process.env.NODE_ENV === "development") console.log(builds.map(b => b.buildFilterVal))
  postMessage({ builds, timing: t2 - t1 })
}
