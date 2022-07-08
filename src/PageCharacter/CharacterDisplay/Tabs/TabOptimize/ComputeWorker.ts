import { reduceFormula, statsUpperLower } from '../../../../Formula/addedUtils';
import { optimize, precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import type { InterimResult, Setup } from './BackgroundWorker';
import { ArtifactsBySlot, ArtifactsBySlotVec, Build, countBuilds, DynStat, filterArts, filterArts2, mergePlot, PlotData, reaffine, RequestFilter } from './common';
import { ArtSetExclusionFull, countBuildsU, SubProblem, unionFilterUpperLower } from './subproblemUtil';

function checkArtSetExclusion(setKeyCounts: DynStat, excl: ArtSetExclusionFull) {
  let pass = Object.entries(setKeyCounts).every(([setKey, num]) => {
    if (!excl[setKey]) return true
    return !excl[setKey].includes(num)
  })
  if (!pass) return false

  if (!excl['uniqueKey']) return true

  const nRainbow = Object.values(setKeyCounts).reduce((a, b) => a + (b % 2), 0)
  return !excl['uniqueKey'].includes(nRainbow)
}

export class ComputeWorker {
  builds: Build[] = []
  buildValues: number[] = []
  plotData: PlotData | undefined
  plotBase: NumNode | undefined
  threshold: number = -Infinity
  maxBuilds: number
  min: number[]

  arts: ArtifactsBySlot
  artsVec: ArtifactsBySlotVec
  nodes: NumNode[]

  callback: (interim: InterimResult) => void

  constructor({ arts, artsVec, optimizationTarget, filters, plotBase, maxBuilds }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.artsVec = artsVec
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
    this.nodes = optimize(this.nodes, {}, _ => false)
  }

  computeU(newThreshold: number, subproblem: SubProblem) {
    if (this.threshold < newThreshold) this.threshold = newThreshold
    const { filters, artSetExclusion, depth } = subproblem
    const self = this // `this` in nested functions means different things

    const totalCount = countBuildsU(filters)
    const { lower, upper, maxw } = unionFilterUpperLower(filters)
    if (maxw[maxw.length - 1] < this.threshold) {
      this.interimReport({ tested: 0, failed: 0, skipped: totalCount })
      return
    }

    let nodes = [...this.nodes]
    let min = [...this.min]
    if (this.plotBase !== undefined) nodes.push(this.plotBase);
    // let { statsMin, statsMax } = unionFilterUpperLower(this.arts, filter)
    const statsMin: DynStat = Object.fromEntries(this.artsVec.keys.map((k, i) => ([k, lower[i]])))
    const statsMax: DynStat = Object.fromEntries(this.artsVec.keys.map((k, i) => ([k, upper[i]])))
    nodes = reduceFormula(nodes, statsMin, statsMax)
    const reaff = reaffine(nodes, this.arts)
    nodes = reaff.nodes
    const preArts = reaff.arts

    const [compute, mapping, buffer] = precompute(nodes, f => f.path[1])
    const unionArts = filters.map(filter => {
      const a = filterArts2(reaff.arts, filter)
      return Object.values(a.values)
        .sort((a, b) => a.length - b.length)
        .map(arts => arts.map(art => ({
          id: art.id, set: art.set,
          values: Object.entries(art.values)
            .map(([key, value]) => ({ key: mapping[key]!, value, cache: 0 }))
            .filter(({ key, value }) => key !== undefined && value !== 0)
        })))
    })

    let count = { tested: 0, failed: 0, skipped: 0 }

    let ids: string[] = []
    function permute(i: number, j: number, setKeyCounts: DynStat) {
      if (j < 0) {
        const result = compute()
        if (min.some((m, i) => m > result[i]) || !checkArtSetExclusion(setKeyCounts, artSetExclusion)) {
          count.failed++
          return
        }

        const value = result[min.length], { builds, buildValues, plotData, threshold } = self
        let build: Build | undefined
        if (value >= threshold) {
          build = { value, artifactIds: [...ids] }
          builds.push(build)
          buildValues.push(value)
        }
        if (plotData) {
          const x = result[min.length + 1]
          if (!plotData[x] || plotData[x]!.value < value) {
            if (!build) build = { value, artifactIds: [...ids] }
            build.plot = x
            plotData[x] = build
          }
        }
        return
      }

      unionArts[i][j].forEach(art => {
        ids[j] = art.id

        for (const curr of art.values) {
          const { key, value } = curr
          curr.cache = buffer[key]
          buffer[key] += value
        }

        setKeyCounts[art.set ?? ''] = 1 + (setKeyCounts[art.set ?? ''] ?? 0)
        permute(i, j - 1, setKeyCounts)
        setKeyCounts[art.set ?? ''] -= 1
        if (setKeyCounts[art.set ?? ''] === 0) delete setKeyCounts[art.set ?? '']

        for (const { key, cache } of art.values) buffer[key] = cache
      })

      if (j === 0) count.tested += unionArts[i][j].length
    }

    // 4. Set up buffer with `preArts.base`
    for (const [key, value] of Object.entries(preArts.base)) {
      const i = mapping[key]
      if (i !== undefined) buffer[i] = value
    }

    // 5. permute all combinations
    for (let i = 0; i < unionArts.length; i++) {
      ids = Array(unionArts[0].length).fill("")  // isnt this just Array(5)?
      permute(i, unionArts[i].length - 1, {})
    }

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
