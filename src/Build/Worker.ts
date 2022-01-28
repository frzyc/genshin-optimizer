import { allSlotKeys, ArtifactSetKey, SlotKey } from '../Types/consts';
import { optimize, precompute } from '../Formula/optimization';
import type { NumNode } from '../Formula/type'
import type { MainStatKey, SubstatKey } from '../Types/artifact';

let id: string
let affineBase: number[]
let artifactsBySlot: StrictDict<SlotKey, ArtifactBuildData[]>
let nodes: NumNode[]

let maxNumBuilds: number
let threshold = -Infinity
let minThresholds: number[]
let builds: Build[] = []

let plotData: PlotData | undefined
let callback: (interim: InterimResult) => void

export function setup({ id: _id, optimizationTarget, filters, plotBase, maxBuildsToShow, affineBase: _affineBase, artifactsBySlot: _artifactsBySlot }: Setup, _callback: (interim: InterimResult) => void): RequestResult {
  id = _id
  callback = _callback
  builds = []

  minThresholds = filters.map(x => x.min)
  nodes = filters.map(x => x.value)
  nodes.push(optimizationTarget)
  if (plotBase) {
    plotData = {}
    nodes.push(plotBase)
  }
  nodes = optimize(nodes, {}, ({ path: [p] }) => p !== "aff")
  maxNumBuilds = maxBuildsToShow
  affineBase = _affineBase
  artifactsBySlot = _artifactsBySlot
  Object.values(artifactsBySlot).forEach(arts =>
    arts.forEach(art => art.values[art.set] = 1))

  return { command: "request", id }
}

export function request({ threshold: newThreshold, filter: filters }: Request): RequestResult {
  if (threshold > newThreshold) threshold = newThreshold
  const arts = allSlotKeys.map(slot => {
    const filter = filters[slot]
    switch (filter.kind) {
      case "required": return artifactsBySlot[slot].filter(art => filter.sets.has(art.set))
      case "exclude": return artifactsBySlot[slot].filter(art => !filter.sets.has(art.set))
      case "id": return artifactsBySlot[slot].filter(art => filter.ids.has(art.id))
    }
  }).sort((a, b) => a.length - b.length)

  const optimized = optimize(nodes, {}, f => f.path[0] !== "aff")
  const compute = precompute(optimized,
    f => f.path[1])

  const ids: string[] = Array(arts.length).fill("")
  let count = { build: 0, failed: 0 }

  function permute(i: number, stats: Stats) {
    if (i < 0) {
      const result = compute(stats)
      if (minThresholds.every((min, i) => (min <= result[i]))) {
        const value = result[minThresholds.length]
        if (value >= threshold)
          builds.push({ value, plot: result[minThresholds.length + 1], artifactIds: [...ids] })
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
      if (count.build >= 100_000) {
        interimReport(count)
      }
    }
  }

  // TODO: Update to array-based
  const base = {}
  affineBase.forEach((v, i) => base[i] = v)
  permute(arts.length - 1, base)
  return { command: "request", id }
}
export function finalize(): FinalizeResult {
  return { command: "finalize", id, builds, plotData }
}

export let interimReport = (count: { build: number, failed: number }): void => {
  // TODO: Update plot

  const newBuilds = builds
    .sort((a, b) => b.value - a.value)
    .slice(0, maxNumBuilds)

  const newThreshold = newBuilds[newBuilds.length - 1]?.value ?? -Infinity
  threshold = newThreshold
  callback({ command: "interim", id, threshold, buildCount: count.build, failedCount: count.failed, skippedCount: 0 })
  count.build = 0
  count.failed = 0
}

type Stats = { [key in MainStatKey | SubstatKey]?: number }
export type ArtifactBuildData = {
  id: string
  set: ArtifactSetKey
  values: number[]
}

export type Command = Setup | Request | Finalize
export type ArtifactsBySlot = StrictDict<SlotKey, ArtifactBuildData[]>
export interface Setup {
  command: "setup"
  id: string
  affineBase: number[]
  artifactsBySlot: ArtifactsBySlot
  optimizationTarget: NumNode
  filters: { value: NumNode, min: number }[]
  plotBase: NumNode | undefined,
  maxBuildsToShow: number
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
