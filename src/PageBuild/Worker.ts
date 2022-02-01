import { allSlotKeys, ArtifactSetKey, SlotKey } from '../Types/consts';
import { optimize, precompute } from '../Formula/optimization';
import type { NumNode } from '../Formula/type'
import type { MainStatKey, SubstatKey } from '../Types/artifact';
import { objectFromKeyMap } from '../Util/Util';

let id: string
let builds: Build[]
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
  threshold = -Infinity

  return { command: "request", id }
}

export function request({ threshold: newThreshold, filter: filters }: Request): RequestResult & { total: number } {
  if (shared.min[0] > newThreshold) shared.min[0] = newThreshold
  const arts = Object.values(objectFromKeyMap(allSlotKeys, slot => {
    const filter = filters[slot]
    switch (filter.kind) {
      case "id": return shared.arts.values[slot].filter(art => filter.ids.has(art.id))
      case "exclude": return shared.arts.values[slot].filter(art => !filter.sets.has(art.set))
      case "required": return shared.arts.values[slot].filter(art => filter.sets.has(art.set))
    }
  })).sort((a, b) => a.length - b.length)
  const optimized = optimize(shared.nodes, {}, _ => false)
  const compute = precompute(optimized, f => f.path[1])

  const ids: string[] = Array(arts.length).fill("")
  let count = { build: 0, failed: 0 }

  function permute(i: number, stats: Stats) {
    if (i < 0) {
      const result = compute(stats)
      if (shared.min.every((m, i) => (m <= result[i]))) {
        const value = result[shared.min.length]
        if (value >= threshold)
          builds.push({ value, plot: result[shared.min.length + 1], artifactIds: [...ids] })
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
      count.build += arts.length
      if (count.build > 4096)
        interimReport(count)
    }
  }

  // TODO: Update to array-based
  permute(arts.length - 1, shared.arts.base)
  interimReport(count)
  return { command: "request", id, total: arts.reduce((count, a) => a.length * count, 1) }
}
export function finalize(): FinalizeResult {
  refresh()
  return { command: "finalize", id, builds, plotData }
}

export let interimReport = (count: { build: number, failed: number }): void => {
  refresh()
  shared.callback({
    command: "interim", id, threshold,
    buildCount: count.build, failedCount: count.failed, skippedCount: 0
  })
  count.build = 0
  count.failed = 0
}
function refresh(): void {
  // TODO: Update plot

  builds = builds
    .sort((a, b) => b.value - a.value)
    .slice(0, shared.maxBuilds)

  const newThreshold = builds[shared.maxBuilds - 1]?.value ?? -Infinity
  threshold = newThreshold
}

type Stats = { [key in MainStatKey | SubstatKey]?: number }
export type ArtifactBuildData = {
  id: string
  set: ArtifactSetKey
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
export interface Finalize {
  command: "finalize"
}

export type WorkerResult = InterimResult | RequestResult | FinalizeResult | DebugMsg
export interface InterimResult {
  command: "interim"
  id: string
  threshold: number
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
