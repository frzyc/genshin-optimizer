import { optimize, precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import type { MainStatKey, SubstatKey } from '../../../../Types/artifact';
import { ArtifactSetKey, SlotKey } from '../../../../Types/consts';
import { countBuilds, filterArts, mergePlot, pruneAll } from './common';

let id: string
let builds: Build[]
let buildValues: number[] | undefined
let plotData: PlotData | undefined
let threshold: number

type WorkerStat = {
  arts: ArtifactsBySlot
  nodes: NumNode[]

  maxBuilds: number
  min: number[]

  callback: (interim: InterimResult) => void
}
let shared: WorkerStat = undefined as any

export function setup(msg: Setup, callback: WorkerStat["callback"]): RequestResult {
  shared = { ...msg } as any
  shared.nodes = msg.filters.map(x => x.value)
  shared.min = msg.filters.map(x => x.min)
  shared.callback = callback
  shared.nodes.push(msg.optimizationTarget)
  if (msg.plotBase) {
    plotData = {}
    shared.nodes.push(msg.plotBase)
  }
  id = msg.id
  builds = []
  buildValues = undefined
  threshold = -Infinity

  return { command: "request", id }
}

export function request({ threshold: newThreshold, filter: filters }: Request): RequestResult & { total: number } {
  if (threshold > newThreshold) threshold = newThreshold
  let preArts = filterArts(shared.arts, filters)
  const totalCount = countBuilds(preArts)

  let nodes = optimize(shared.nodes, {}, _ => false);
  ({ nodes, arts: preArts } = pruneAll(nodes, shared.min, preArts, shared.maxBuilds, new Set(), {
    pruneArtRange: true, pruneNodeRange: true,
  }))
  const compute = precompute(nodes, f => f.path[1])
  const arts = Object.values(preArts.values).sort((a, b) => a.length - b.length)

  const ids: string[] = Array(arts.length).fill("")
  let count = { build: 0, failed: 0, skipped: totalCount - countBuilds(preArts) }

  function permute(i: number, stats: Stats) {
    if (i < 0) {
      const result = compute(stats)
      if (shared.min.every((m, i) => (m <= result[i]))) {
        const value = result[shared.min.length]
        let build: Build | undefined
        if (value >= threshold) {
          build = { value, artifactIds: [...ids] }
          builds.push(build)
        }
        if (plotData) {
          const x = result[shared.min.length + 1]
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

      const newStats = { ...stats }
      Object.entries(art.values).forEach(([key, value]) =>
        newStats[key] = (newStats[key] ?? 0) + value)

      permute(i - 1, newStats)
    })
    if (i === 0) {
      count.build += arts[0].length
      if (count.build > 8192)
        interimReport(count)
    }
  }

  permute(arts.length - 1, preArts.base)
  interimReport(count)
  return { command: "request", id, total: totalCount }
}
export function finalize(): FinalizeResult {
  refresh(true)
  return { command: "finalize", id, builds, plotData }
}

export let interimReport = (count: { build: number, failed: number, skipped: number }): void => {
  refresh(false)
  shared.callback({
    command: "interim", id, buildValues,
    buildCount: count.build, failedCount: count.failed, skippedCount: count.skipped
  })
  buildValues = undefined
  count.build = 0
  count.failed = 0
  count.skipped = 0
}
function refresh(force: boolean): void {
  if (plotData && Object.keys(plotData).length >= 100000)
    plotData = mergePlot([plotData])

  if (builds.length >= 100000 || force) {
    builds = builds
      .sort((a, b) => b.value - a.value)
      .slice(0, shared.maxBuilds)
    buildValues = builds.map(x => x.value)
    threshold = Math.max(threshold, buildValues[shared.maxBuilds - 1] ?? -Infinity)
  }
}

type Stats = { [key in MainStatKey | SubstatKey]?: number }
export type ArtifactBuildData = {
  id: string
  set?: ArtifactSetKey
  values: DynStat
}

export type Command = Setup | Request | Finalize
export type ArtifactsBySlot = { base: DynStat, values: StrictDict<SlotKey, ArtifactBuildData[]> }
export type DynStat = { [key in string]: number }
export interface Setup {
  command: "setup"

  id: string
  arts: ArtifactsBySlot

  optimizationTarget: NumNode
  filters: { value: NumNode, min: number }[]
  plotBase: NumNode | undefined,
  maxBuilds: number
}
export interface Request {
  command: "request"
  threshold: number
  filter: RequestFilter
}
export type RequestFilter = StrictDict<SlotKey,
  { kind: "required", sets: Set<ArtifactSetKey> } |
  { kind: "exclude", sets: Set<ArtifactSetKey> } |
  { kind: "id", ids: Set<string> }
>
export type PlotData = Dict<number, Build>

export type ChartData = {
  valueNode: NumNode,
  plotNode: NumNode,
  data: Build[]
}
export interface Finalize {
  command: "finalize"
}

export type WorkerResult = InterimResult | RequestResult | FinalizeResult | DebugMsg
export interface InterimResult {
  command: "interim"
  id: string
  buildValues: number[] | undefined
  /** The number of builds since last report, including failed builds */
  buildCount: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failedCount: number
  skippedCount: number
}
export interface FinalizeResult {
  command: "finalize"
  id: string
  builds: Build[]
  plotData?: PlotData
}
export interface RequestResult {
  command: "request"
  id: string
}
export interface Build {
  value: number
  plot?: number
  artifactIds: string[]
}
export interface DebugMsg {
  command: "debug"
  id: string
  value: any
}
