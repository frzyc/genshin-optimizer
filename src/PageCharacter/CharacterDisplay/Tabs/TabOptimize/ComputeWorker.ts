import { optimize, precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import type { InterimResult, Setup } from './BackgroundWorker';
import { ArtifactBuildData, ArtifactsBySlot, Build, countBuilds, DynStat, filterArts, mergePlot, PlotData, pruneAll, RequestFilter } from './common';

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
    this.nodes = optimize(this.nodes, {}, _ => false)
  }

  compute(newThreshold: number, filter: RequestFilter) {
    if (this.threshold > newThreshold) this.threshold = newThreshold
    const { min, interimReport } = this, self = this // `this` in nested functions means different things
    let preArts = filterArts(this.arts, filter)
    const totalCount = countBuilds(preArts)

    let nodes = this.nodes;
    ({ nodes, arts: preArts } = pruneAll(nodes, min, preArts, this.maxBuilds, {}, {
      pruneArtRange: true, pruneNodeRange: true,
    }))

    const toCompiledString = (b: DynStat) => {
      const g = (f: NumNode) => {
        const { operation } = f
        switch (operation) {
          case "const": return "" + f.value
          case "read":
            const bs = b[f.path[1]] !== 0 ? `${b[f.path[1]]} + ` : ""
            return `(${bs}s.reduce((a, b)=> a + b.values["${f.path[1]}"], 0) )`
          case "min": case "max":
            return `Math.${f.operation}( ${f.operands.map(g).join(", ")} )`
          case "add": return `( ${f.operands.map(g).join(" + ")} )`
          case "mul": return `( ${f.operands.map(g).join(" * ")} )`
          case "sum_frac":
            const [x, c] = f.operands.map(g)
            return `( ${x} / ( ${x} + ${c} ) )`
          case "threshold":
            const [value, threshold, pass, fail] = f.operands.map(g)
            return `( ${value} >= ${threshold} ? ${pass} : ${fail} )`
          case "res":
            const res = g(f.operands[0])
            return `res(${res})`
          default: throw new Error(`Unsupported ${operation} node`)
        }
      };
      return g
    }

    const compiledNodes: { (s: ArtifactBuildData[]): number; }[] = nodes.map((n) => new (Function as any)('s', `"use strict";\nconst res = (res) => ( (res < 0) ? (1 - res / 2) : (res >= 0.75) ? (1 / (res * 4 + 1)) : (1 - res) )\nreturn ${toCompiledString(preArts.base)(n)}`))

    const arts = Object.values(preArts.values)
    let count = { tested: 0, failed: 0, skipped: totalCount - countBuilds(preArts) }

    const buffer: ArtifactBuildData[] = Array(arts.length)
    let lastInterimReport = performance.now();
    function permute(i: number) {
      if (i < 0) {
        if (min.every((m, i) => (m <= compiledNodes[i](buffer)))) {
          const value = compiledNodes[min.length](buffer), { builds, plotData, threshold } = self
          let build: Build | undefined
          if (value >= threshold) {
            build = { value, artifactIds: buffer.map(x => x.id) }
            builds.push(build)
          }
          if (plotData) {
            const x = compiledNodes[min.length + 1](buffer)
            if (!plotData[x] || plotData[x]!.value < value) {
              if (!build) build = { value, artifactIds: buffer.map(x => x.id) }
              build.plot = x
              plotData[x] = build
            }
          }
        }
        else count.failed += 1
        return
      }
      arts[i].forEach(art => {
        buffer[i] = art
        permute(i - 1)
      })
      if (i === 0) {
        count.tested += arts[0].length
        if (count.tested > 32768) {
          const now = performance.now()
          if (now - lastInterimReport > 500) {
            lastInterimReport = now
            interimReport(count)
          }
        }
      }
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
  interimReport = (count: { tested: number, failed: number, skipped: number }) => {
    this.refresh(false)
    this.callback({ command: "interim", buildValues: this.buildValues, ...count })
    this.buildValues = undefined
    count.tested = 0
    count.failed = 0
    count.skipped = 0
  }
}
