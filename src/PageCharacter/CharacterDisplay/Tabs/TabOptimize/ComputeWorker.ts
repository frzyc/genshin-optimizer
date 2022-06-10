import { optimize, precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import type { InterimResult } from './BackgroundWorker';
import { ArtifactsBySlot, Build, countBuilds, filterArts, mergePlot, PlotData, pruneAll, RequestFilter } from './common';

export class ComputeWorker {
  builds: Build[] = []
  buildValues: number[] | undefined = undefined
  plotData: PlotData | undefined
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
      this.nodes.push(plotBase)
    }
  }

  compute(newThreshold: number, filter: RequestFilter) {
    if (this.threshold > newThreshold) this.threshold = newThreshold
    const { min, threshold, builds, plotData, interimReport } = this
    let preArts = filterArts(this.arts, filter)
    const totalCount = countBuilds(preArts)

    let nodes = optimize(this.nodes, {}, _ => false);
    ({ nodes, arts: preArts } = pruneAll(nodes, min, preArts, this.maxBuilds, new Set(), {
      pruneArtRange: true, pruneNodeRange: true,
    }))
    const [compute, mapping, buffer] = precompute(nodes, f => f.path[1])
    const arts = Object.values(preArts.values).sort((a, b) => a.length - b.length).map(arts => arts.map(art => ({
      id: art.id, values: Object.entries(art.values)
        .map(([key, value]) => ({ key: mapping[key]!, value, cache: 0 }))
        .filter(({ key, value }) => key !== undefined && value !== 0)
    })))

    const ids: string[] = Array(arts.length).fill("")
    let count = { build: 0, failed: 0, skipped: totalCount - countBuilds(preArts) }

    function permute(i: number) {
      if (i < 0) {
        const result = compute()
        if (min.every((m, i) => (m <= result[i]))) {
          const value = result[min.length]
          let build: Build | undefined
          if (value >= threshold) {
            build = { value, artifactIds: [...ids] }
            builds.push(build)
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

        permute(i - 1)

        for (const { key, cache } of art.values)
          buffer[key] = cache
      })
      if (i === 0) {
        count.build += arts[0].length
        if (count.build > 8192)
          interimReport(count)
      }
    }

    for (const [key, value] of Object.entries(preArts.base)) {
      const i = mapping[key]
      if (i !== undefined)
        buffer[i] = value
    }

    permute(arts.length - 1)
    this.interimReport(count)
  }

  refresh(force: boolean): void {
    const { maxBuilds } = this
    if (Object.keys(this.plotData ?? {}).length >= 100000)
      this.plotData = mergePlot([this.plotData!])

    if (this.builds.length >= 100000 || force) {
      this.builds = this.builds
        .sort((a, b) => b.value - a.value)
        .slice(0, maxBuilds)
      this.buildValues = this.builds.map(x => x.value)
      this.threshold = Math.max(this.threshold, this.buildValues[maxBuilds - 1] ?? -Infinity)
    }
  }
  interimReport = (count: { build: number, failed: number, skipped: number }) => {
    this.refresh(false)
    this.callback({
      command: "interim", buildValues: this.buildValues,
      buildCount: count.build, failedCount: count.failed, skippedCount: count.skipped
    })
    this.buildValues = undefined
    count.build = 0
    count.failed = 0
    count.skipped = 0
  }
}


export interface Setup {
  command: "setup"

  id: number
  arts: ArtifactsBySlot

  optimizationTarget: NumNode
  filters: { value: NumNode, min: number }[]
  plotBase: NumNode | undefined,
  maxBuilds: number
}
