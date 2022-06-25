import { reduceFormula, statsUpperLower } from '../../../../Formula/addedUtils';
import { precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import type { InterimResult, Setup, SubProblem } from './BackgroundWorker';
import { ArtifactsBySlot, Build, countBuilds, DynStat, filterArts, mergePlot, PlotData, pruneAll, reaffine } from './common';

export class ComputeWorker {
  builds: Build[] = []
  buildValues: number[] = []
  plotData: PlotData | undefined
  plotBase: NumNode | undefined
  threshold: number = -Infinity
  maxBuilds: number
  min: number[]

  arts: ArtifactsBySlot
  nodes: NumNode[]

  callback: (interim: InterimResult) => void

  constructor({ arts, optimizationTarget, filters, plotBase, maxBuilds }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.min = filters.map(x => x.min)
    this.maxBuilds = maxBuilds
    this.callback = callback
    this.nodes = filters.map(x => x.value)
    this.nodes.push(optimizationTarget)
    if (plotBase) {
      this.plotData = {}
      this.plotBase = plotBase
      this.nodes.push(plotBase)
    }
  }

  compute(newThreshold: number, subproblem: SubProblem, dbg = false) {
    if (this.threshold < newThreshold) this.threshold = newThreshold
    const { optimizationTarget, constraints, filter, artSetExclusion, depth } = subproblem

    const { interimReport } = this, self = this // `this` in nested functions means different things
    let preArts = filterArts(this.arts, filter)
    const totalCount = countBuilds(preArts)

    if (subproblem.cache) {
      if (subproblem.cachedCompute.maxEst[subproblem.cachedCompute.maxEst.length - 1] < this.threshold) {
        this.interimReport({ tested: 0, failed: 0, skipped: totalCount })
        return
      }
    }

    let nodes = [...this.nodes]
    let min = [...this.min]
    if (this.plotBase !== undefined) nodes.push(this.plotBase);
    let { statsMin, statsMax } = statsUpperLower(preArts)
    nodes = reduceFormula(nodes, statsMin, statsMax)
    const reaff = reaffine(nodes, preArts)
    nodes = reaff.nodes
    preArts = reaff.arts

    const [compute, mapping, buffer] = precompute(nodes, f => f.path[1])
    const arts = Object.values(preArts.values)
      .sort((a, b) => a.length - b.length)
      .map(arts => arts.map(art => ({
        id: art.id, set: art.set, values: Object.entries(art.values)
          .map(([key, value]) => ({ key: mapping[key]!, value, cache: 0 }))
          .filter(({ key, value }) => key !== undefined && value !== 0)
      })))

    const ids: string[] = Array(arts.length).fill("")
    let count = { tested: 0, failed: 0, skipped: totalCount - countBuilds(preArts) }

    let maxFound = -Infinity

    function permute(i: number, setKeyCounts: DynStat) {
      if (i < 0) {
        const result = compute()
        maxFound = Math.max(result[constraints.length], maxFound)
        let passArtExcl = Object.entries(artSetExclusion).every(([setKey, vals]) => !vals.includes(setKeyCounts[setKey]))

        // Check rainbows
        if (passArtExcl && artSetExclusion['uniqueKey'] !== undefined) {
          const nRainbow = Object.values(setKeyCounts).reduce((a, b) => a + (b % 2), 0)
          passArtExcl = !artSetExclusion['uniqueKey'].includes(nRainbow)
        }

        if (passArtExcl && min.every((m, i) => (m <= result[i]))) {
          const value = result[min.length], { builds, plotData, threshold } = self
          let build: Build | undefined
          if (value >= threshold) {
            build = { value, artifactIds: [...ids] }
            builds.push(build)
            self.buildValues.push(value)
          }
          if (plotData) {
            const x = result[min.length + 1]
            if (!plotData[x] || plotData[x]!.value < value) {
              if (!build) build = { value, artifactIds: [...ids] }
              build.plot = x
              plotData[x] = build
            }
          }
        }
        else count.failed += 1
        return
      }
      arts[i].forEach(art => {
        ids[i] = art.id

        for (const current of art.values) {
          const { key, value } = current
          current.cache = buffer[key]
          buffer[key] += value
        }

        setKeyCounts[art.set ?? ''] = 1 + (setKeyCounts[art.set ?? ''] ?? 0)
        permute(i - 1, setKeyCounts)
        setKeyCounts[art.set ?? ''] -= 1
        if (setKeyCounts[art.set ?? ''] === 0) delete setKeyCounts[art.set ?? '']

        for (const { key, cache } of art.values) buffer[key] = cache
      })
      if (i === 0) {
        count.tested += arts[0].length
        if (count.tested > 8192)
          interimReport(count)
      }
    }

    for (const [key, value] of Object.entries(preArts.base)) {
      const i = mapping[key]
      if (i !== undefined)
        buffer[i] = value
    }

    permute(arts.length - 1, {})
    this.interimReport(count)
    return this.threshold
  }

  refresh(force: boolean): void {
    const { maxBuilds } = this
    if (Object.keys(this.plotData ?? {}).length >= 100000)
      this.plotData = mergePlot([this.plotData!])

    // I need frequent updating of threshold
    if (true || this.builds.length >= 100000 || force) {
      this.builds = this.builds
        .sort((a, b) => b.value - a.value)
        .slice(0, maxBuilds)
    }
  }
  interimReport = (count: { tested: number, failed: number, skipped: number }) => {
    this.refresh(false)
    this.callback({ command: "interim", buildValues: this.buildValues, ...count })
    this.buildValues = []
    count.tested = 0
    count.failed = 0
    count.skipped = 0
  }
}
