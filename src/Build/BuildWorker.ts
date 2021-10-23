import '../WorkerHack'
import { PreprocessFormulas } from "../StatData";
import { artifactSetPermutations, artifactPermutations, pruneArtifacts, calculateTotalBuildNumber } from "./Build"
import { GetDependencies } from '../StatDependency';
import Formula from '../Formula';
import { ICachedArtifact, StatKey } from '../Types/artifact';
import { ArtifactSetKey, SetNum, SlotKey } from '../Types/consts';
import { Build, BuildRequest, SetFilter } from '../Types/Build';
import { BonusStats, ICalculatedStats } from '../Types/stats';
import { mergeStats } from '../Util/StatUtil';

onmessage = async (e: { data: BuildRequest & { plotBase?: StatKey } }) => {
  const t1 = performance.now()
  const { splitArtifacts, setFilters, minFilters = {}, initialStats: stats, artifactSetEffects, maxBuildsToShow, optimizationTarget, plotBase } = e.data

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
    if (targetKeys.length === 1) {
      // CAUTION: This optimization works only with monotonic dependencies
      const key = targetKeys[0]
      target = (stats) => stats[key]
    }
  }

  const artifactSetBySlot = Object.fromEntries(Object.entries(splitArtifacts).map(([key, artifacts]) =>
    [key, new Set(artifacts.map(artifact => artifact.setKey))]
  ))
  // modifierStats contains all modifiers that are applicable to the current build
  const modifierStats: BonusStats = {}
  Object.entries(artifactSetEffects).forEach(([set, effects]) =>
    Object.entries(effects).filter(([setNum, stats]) =>
      ("modifiers" in stats) && canApply(set, parseInt(setNum) as SetNum, artifactSetBySlot, setFilters)
    ).forEach(bonus => mergeStats(modifierStats, bonus[1]))
  )
  mergeStats(modifierStats, { modifiers: stats.modifiers ?? {} })

  const dependencies = GetDependencies(stats, modifierStats.modifiers, [...targetKeys, ...Object.keys(minFilters), ...(plotBase ? [plotBase] : [])]) as StatKey[]
  const oldCount = calculateTotalBuildNumber(splitArtifacts, setFilters)

  let prunedArtifacts = splitArtifacts, newCount = oldCount

  { // Prune artifact with strictly inferior (relevant) stats.
    // Don't prune artifact sets that are filtered
    const alwaysAccepted = setFilters.map(set => set.key) as any

    prunedArtifacts = Object.fromEntries(Object.entries(splitArtifacts).map(([key, values]) =>
      [key, pruneArtifacts(values, artifactSetEffects, new Set(dependencies), maxBuildsToShow, new Set(alwaysAccepted))]))
    newCount = calculateTotalBuildNumber(prunedArtifacts, setFilters)
  }

  let { initialStats, formula } = PreprocessFormulas(dependencies, stats)
  let buildCount = 0, skipped = oldCount - newCount
  let builds: Build[] = [], threshold = -Infinity
  const plotDataMap: Dict<string, number> = {}, decimalPoint = 2

  const cleanupBuilds = () => {
    builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    builds.splice(maxBuildsToShow)
  }

  const callback = (accu: StrictDict<SlotKey, ICachedArtifact>, stats: ICalculatedStats) => {
    if (!(++buildCount % 10000)) postMessage({ progress: buildCount, timing: performance.now() - t1, skipped }, undefined as any)
    formula(stats)
    if (Object.entries(minFilters).some(([key, minimum]) => stats[key] < minimum)) return
    let buildFilterVal = target(stats)

    if (plotBase) {
      const key = stats[plotBase].toFixed(decimalPoint)
      plotDataMap[key] = Math.max(plotDataMap[key] ?? -Infinity, buildFilterVal)
    }

    if (buildFilterVal >= threshold) {
      builds.push({ buildFilterVal, artifacts: { ...accu } })
      if (builds.length >= 1000) {
        cleanupBuilds()
        threshold = builds[builds.length - 1].buildFilterVal
      }
    }
  }

  for (const artifactsBySlot of artifactSetPermutations(prunedArtifacts, setFilters))
    artifactPermutations(initialStats, artifactsBySlot, artifactSetEffects, callback)


  cleanupBuilds()
  const t2 = performance.now()
  postMessage({ progress: buildCount, timing: t2 - t1, skipped }, undefined as any)

  const plotData = plotBase ? Object.entries(plotDataMap)
    .map(([key, value]) => ({ plotBase: parseFloat(key), optimizationTarget: value }))
    .sort((a, b) => a.plotBase - b.plotBase) : undefined
  console.log("PLOTBASE", plotBase, { builds, plotData, timing: t2 - t1, skipped })
  postMessage({ builds, plotData, timing: t2 - t1, skipped }, undefined as any)
}

function canApply(set: ArtifactSetKey, num: SetNum, setBySlot: Dict<SlotKey, Set<ArtifactSetKey>>, filters: SetFilter): boolean {
  const otherNum = filters.reduce((accu, { key, num }) => key === set ? accu : accu + num, 0)
  const artNum = Object.values(setBySlot).filter(sets => sets.has(set)).length
  return otherNum + num <= 5 && num <= artNum
}