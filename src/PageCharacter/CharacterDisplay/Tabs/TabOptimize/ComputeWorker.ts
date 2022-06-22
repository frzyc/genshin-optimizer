import { optimize, precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import { ArtifactSetKey } from '../../../../Types/consts';
import type { InterimResult, Setup, SubProblem } from './BackgroundWorker';
import { ArtifactsBySlot, Build, countBuilds, DynStat, filterArts, mergePlot, PlotData, pruneAll, RequestFilter } from './common';

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

  compute(newThreshold: number, subproblem: SubProblem) {
    if (this.threshold > newThreshold) this.threshold = newThreshold
    const { optimizationTarget, constraints, filter, artSetExclusion } = subproblem
    // TODO: check artSetExclusion stuff

    const { min, interimReport } = this, self = this // `this` in nested functions means different things
    let preArts = filterArts(this.arts, filter)
    const totalCount = countBuilds(preArts)

    let nodesReduced = optimize([...constraints.map(({ value }) => value), optimizationTarget], {}, _ => false);
    // const min = [...constraints.map(({ min }) => min), -Infinity];

    // console.log(this.arts)

    let nodes = optimize(this.nodes, {}, _ => false);
    // ({ nodes, arts: preArts } = pruneAll(nodes, min, preArts, this.maxBuilds, {}, {
    //   pruneArtRange: true, pruneNodeRange: true,
    // }))
    const [compute, mapping, buffer] = precompute(nodes, f => f.path[1])
    const [compute2, mapping2, buffer2] = precompute(nodesReduced, f => f.path[1])
    const arts = Object.values(preArts.values).sort((a, b) => a.length - b.length).map(arts => arts.map(art => ({
      id: art.id, set: art.set, values: Object.entries(art.values)
        // .map(([key, value]) => ({ key: mapping[key]!, value, cache: 0 }))
        .map(([key, value]) => ({ key: mapping[key]!, key2: mapping2[key] ?? 0, value, cache: 0 }))
        .filter(({ key, value }) => key !== undefined && value !== 0)
    })))
    // console.log(mapping)
    console.log('enumerating', { artSetExclusion, preArts }, { depth: subproblem.depth })
    // console.log(this.arts)
    // throw Error('stop here')

    const ids: string[] = Array(arts.length).fill("")
    let count = { tested: 0, failed: 0, skipped: totalCount - countBuilds(preArts) }

    function permute(i: number, setKeyCounts: DynStat) {
      if (i < 0) {
        const result = compute()
        const result2 = compute2()
        if (Math.abs(result[min.length] - result2[constraints.length]) > 1e-4) {
          console.log('OOF COMPUTE NO MATCH')
          console.log(preArts)
          console.log(nodes)
          console.log(nodesReduced)
          console.log(buffer)
          console.log(buffer2)
          throw Error('what?')
        }
        let passArtExcl = !Object.entries(artSetExclusion).some(([setKey, vals]) => {
          if (setKey === 'uniqueKey') return false
          return vals.includes(setKeyCounts[setKey])
          // let bufloc = mapping[setKey]
          // if (!bufloc) return false
          // return vals.includes(buffer[bufloc])
        })
        // This checks rainbows
        if (passArtExcl && artSetExclusion['uniqueKey'] !== undefined) {
          const nRainbow = Object.values(setKeyCounts).reduce((a, b) => a + (b % 2))
          passArtExcl = artSetExclusion['uniqueKey'].every(v => v !== nRainbow)
        }

        if (passArtExcl && min.every((m, i) => (m <= result[i]))) {
          const value = result[min.length], { builds, plotData, threshold } = self
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
          buffer2[current.key2] += value
        }

        setKeyCounts[art.set ?? ''] = 1 + (setKeyCounts[art.set ?? ''] ?? 0)
        permute(i - 1, setKeyCounts)
        setKeyCounts[art.set ?? ''] -= 1
        if (setKeyCounts[art.set ?? ''] === 0) delete setKeyCounts[art.set ?? '']

        for (const { key, key2, cache } of art.values) {
          buffer[key] = cache
          buffer2[key2] = cache
        }
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

      const i2 = mapping2[key]
      if (i2 !== undefined)
        buffer2[i2] = value
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
      this.buildValues = this.builds.map(x => x.value)
      this.threshold = Math.max(this.threshold, this.buildValues[maxBuilds - 1] ?? -Infinity)
    }
  }
  interimReport = (count: { tested: number, failed: number, skipped: number }) => {
    this.refresh(false)
    this.callback({ command: "interim", buildValues: this.buildValues, ...count })
    this.buildValues = undefined
    count.tested = 0
    count.failed = 0
    count.skipped = 0
  }
}
