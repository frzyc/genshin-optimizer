import type { Interim, Setup } from '..'
import type { OptNode } from '../../Formula/optimization'
import { optimize, precompute } from '../../Formula/optimization'
import type {
  ArtifactBuildData,
  ArtifactsBySlot,
  Build,
  PlotData,
  RequestFilter,
} from '../common'
import { countBuilds, filterArts, mergePlot, pruneAll } from '../common'

export class ComputeWorker {
  builds: Build[] = []
  buildValues: number[] | undefined = undefined
  plotData: PlotData | undefined
  threshold = -Infinity
  topN: number
  min: number[]

  arts: ArtifactsBySlot
  nodes: OptNode[]

  callback: (interim: Interim) => void

  constructor(
    { arts, optTarget, constraints, plotBase, topN }: Setup,
    callback: (interim: Interim) => void
  ) {
    this.arts = arts
    this.min = constraints.map((x) => x.min)
    this.topN = topN
    this.callback = callback
    this.nodes = constraints.map((x) => x.value)
    this.nodes.push(optTarget)
    if (plotBase) {
      this.plotData = {}
      this.nodes.push(plotBase)
    }
    this.nodes = optimize(this.nodes, {}, (_) => false)
  }

  setThreshold(newThreshold: number) {
    if (this.threshold > newThreshold) this.threshold = newThreshold
  }
  compute(filter: RequestFilter) {
    const { min } = this
    let preArts = filterArts(this.arts, filter)
    const totalCount = countBuilds(preArts),
      oldMaxBuildCount = this.builds.length

    let nodes = this.nodes
    ;({ nodes, arts: preArts } = pruneAll(
      nodes,
      min,
      preArts,
      this.topN,
      {},
      {
        pruneArtRange: true,
        pruneNodeRange: true,
      }
    ))
    const arts = Object.values(preArts.values).sort(
      (a, b) => a.length - b.length
    )
    const compute = precompute(
      nodes,
      preArts.base,
      (f) => f.path[1],
      arts.length
    )

    const buffer = Array<ArtifactBuildData>(arts.length)
    const count = {
      tested: 0,
      failed: 0,
      skipped: totalCount - countBuilds(preArts),
    }

    const permute = (i: number) => {
      if (i < 0) {
        const result = compute(buffer)
        if (min.every((m, i) => m <= result[i])) {
          const value = result[min.length],
            { builds, plotData } = this
          let build: Build | undefined
          if (value >= this.threshold) {
            build = {
              value,
              artifactIds: buffer.map((x) => x.id).filter((id) => id),
            }
            builds.push(build)
          }
          if (plotData) {
            const x = result[min.length + 1]
            if (!plotData[x] || plotData[x]!.value < value) {
              if (!build)
                build = {
                  value,
                  artifactIds: buffer.map((x) => x.id).filter((id) => id),
                }
              build.plot = x
              plotData[x] = build
            }
          }
        } else count.failed += 1
        return
      }
      arts[i].forEach((art) => {
        buffer[i] = art
        permute(i - 1)
      })
      if (i === 0) {
        count.tested += arts[0].length
        if (count.tested > 1 << 16) this.interimReport(count)
      }
    }

    permute(arts.length - 1)
    this.interimReport(count, this.builds.length > oldMaxBuildCount)
  }

  refresh(force: boolean): void {
    const { topN } = this
    if (Object.keys(this.plotData ?? {}).length >= 100000)
      this.plotData = mergePlot([this.plotData!])

    if (this.builds.length >= 1000 || force) {
      this.builds = this.builds.sort((a, b) => b.value - a.value).slice(0, topN)
      this.buildValues = this.builds.map((x) => x.value)
      this.threshold = Math.max(
        this.threshold,
        this.buildValues[topN - 1] ?? -Infinity
      )
    }
  }
  interimReport(
    count: { tested: number; failed: number; skipped: number },
    forced = false
  ) {
    this.refresh(forced)
    this.callback({
      resultType: 'interim',
      buildValues: this.buildValues,
      ...count,
    })
    this.buildValues = undefined
    count.tested = 0
    count.failed = 0
    count.skipped = 0
  }
}
