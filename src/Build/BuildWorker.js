import '../WorkerHack'
import { PreprocessFormulas } from "../StatData";
import { artifactSetPermutations, artifactPermutations } from "./Build"
import charFormulas from "../Data/Characters/formula"

onmessage = async (e) => {
  const t1 = performance.now()
  const { splitArtifacts, setFilters, minFilters = {}, maxFilters = {}, initialStats: stats, initialStats: { characterKey, talentLevelKeys }, artifactSetEffects, maxBuildsToShow, optimizationTarget, ascending } = e.data;

  let target, dependencies = [];
  if (typeof optimizationTarget === "string")
    target = stats[optimizationTarget]
  else {
    const { talentKey, formulaKey } = optimizationTarget
    const targetFormula = charFormulas?.[characterKey]?.[talentKey]?.[formulaKey]
    if (typeof targetFormula === "function")
      [target, dependencies] = targetFormula(stats.talentLevelKeys[talentKey], stats)
    //TODO cannot find target formula
  }

  //TODO get dependency if tyepof optimizationTarget==="string"?
  let { initialStats, formula } = PreprocessFormulas(dependencies, stats)
  let builds = [], threshold = -Infinity

  const prune = () => {
    builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    builds.splice(maxBuildsToShow)
  }

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
