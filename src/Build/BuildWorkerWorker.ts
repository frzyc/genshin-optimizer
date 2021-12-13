import '../WorkerHack';
import Formula from '../Formula';
import { PreprocessFormulas } from '../ProcessFormula';
import { ICachedArtifact } from '../Types/artifact';
import { Build, BuildWorkerWorkerRequest } from '../Types/Build';
import { SlotKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { artifactPermutations, artifactSetPermutations } from "./Build";

onmessage = async (e: { data: BuildWorkerWorkerRequest }) => {
  let t1 = performance.now()
  const { dependencies, initialStats: stats, maxBuildsToShow, minFilters, optimizationTarget, plotBase, prunedArtifacts, setFilters, artifactSetEffects } = e.data


  let target: (stats) => number, targetKeys: string[]
  if (typeof optimizationTarget === "string") {
    target = (stats) => stats[optimizationTarget]
    targetKeys = [optimizationTarget]
  } else {
    const targetFormula = await Formula.get(optimizationTarget)
    if (typeof targetFormula === "function")
      [target, targetKeys] = targetFormula(stats)
    else {
      postMessage({ progress: 0, timing: 0 }, undefined as any)
      postMessage({ builds: [], timing: 0 }, undefined as any)
      return
    }
    if (targetKeys.length === 1 && !plotBase) {
      // CAUTION: This optimization works only with monotonic dependencies
      const key = targetKeys[0]
      target = (stats) => stats[key]
    }
  }

  let { initialStats, formula } = PreprocessFormulas(dependencies, stats, false)
  let buildCount = 0
  let builds: Build[] = [], threshold = -Infinity
  let plotDataMap: Dict<string, number> = {}
  let bucketSize = 0.01

  function sendUpdate() {
    builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    builds.splice(maxBuildsToShow)
    if (builds.length)
      threshold = builds[builds.length - 1].buildFilterVal
    const t2 = performance.now()
    postMessage({ buildCount, builds, timing: t2 - t1 }, undefined as any)
    builds = []
    buildCount = 0
    t1 = t2
  }
  const callback = (accu: StrictDict<SlotKey, ICachedArtifact>, stats: ICalculatedStats) => {
    buildCount++
    if (buildCount && !(buildCount % 10000))
      sendUpdate()

    formula(stats)
    if (Object.entries(minFilters).some(([key, minimum]) => stats[key] < minimum)) return
    const buildFilterVal = target(stats)

    if (plotBase) {
      const index = Math.round(stats[plotBase] / bucketSize)
      plotDataMap[index] = Math.max(buildFilterVal, plotDataMap[index] ?? -Infinity)
    }

    if (buildFilterVal >= threshold)
      builds.push({ buildFilterVal, artifacts: { ...accu } })
  }
  for (const artifactsBySlot of artifactSetPermutations(prunedArtifacts, setFilters))
    artifactPermutations(initialStats, artifactsBySlot, artifactSetEffects, callback)

  sendUpdate()
  const t2 = performance.now()

  postMessage({ timing: t2 - t1, finished: true, plotDataMap }, undefined as any)
}
