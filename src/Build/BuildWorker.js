import '../WorkerHack'
import { PreprocessFormulas } from "../StatData";
import { artifactSetPermutations, artifactPermutations } from "./Build"

onmessage = async (e) => {
  let { splitArtifacts, setFilters, minFilters = {}, maxFilters = {}, initialStats: stats, artifactSetEffects, maxBuildsToShow, optimizationTarget, ascending, dependencies } = e.data;
  if (process.env.NODE_ENV === "development") console.log(dependencies)
  let t1 = performance.now()

  let {initialStats, formula} = PreprocessFormulas(dependencies, stats)
  let builds = [], threshold = -Infinity

  let prune = () => {
    builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    builds.splice(maxBuildsToShow)
  }

  const target = typeof optimizationTarget === "string" ?
    (stats) => stats[optimizationTarget] :
    (stats) => calculateOptimizationTarget(optimizationTarget, stats)

  let buildCount = 0;
  const callback = (accu, stats) => {
    if (!(buildCount++ % 10000)) postMessage({ progress: buildCount, timing: performance.now() - t1 })
    formula(stats)
    if (Object.entries(minFilters).some(([key, minimum]) => stats[key] < minimum)) return
    if (Object.entries(maxFilters).some(([key, maximum]) => stats[key] > maximum)) return
    let buildFilterVal = ascending ? -target(stats) : target(stats)
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
  postMessage({ builds, timing: t2 - t1 })
}

const calculateOptimizationTarget = (target, stats) => typeof target !== "object" ? target :
  Object.entries(target).reduce((accu, [key, value]) => accu + stats[key] * calculateOptimizationTarget(value, stats), 0)
