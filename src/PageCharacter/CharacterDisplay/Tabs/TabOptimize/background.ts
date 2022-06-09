import { optimize, precompute } from '../../../../Formula/optimization';
import type { NumNode } from '../../../../Formula/type';
import type { MainStatKey, SubstatKey } from '../../../../Types/artifact';
import { allSlotKeys, ArtifactSetKey, SlotKey } from '../../../../Types/consts';
import { countBuilds, filterArts, mergePlot, pruneAll } from './common';

let id: number
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

let splitFilters: Iterator<RequestFilter> | undefined
let splittingFilters: RequestFilter[] = []

export function breakdown({ threshold: newThreshold, minCount, filter }: Breakdown): BreakdownResult {
  if (threshold > newThreshold) threshold = newThreshold
  if (filter) splittingFilters.push(filter)

  while (splittingFilters.length || splitFilters) {
    const { done, value } = splitFilters?.next() ?? { done: true }
    if (done) {
      splitFilters = undefined
      if (splittingFilters.length) {
        splitFilters = splitFiltersBySet(shared.arts, splittingFilters, minCount)[Symbol.iterator]()
        splittingFilters = []
      }
    } else {
      return { command: "breakdown", id, buildCount: -1, filter: value as RequestFilter }
    }
  }
  return { command: "breakdown", id, buildCount: 0, filter: undefined }
}
export function request({ threshold: newThreshold, filter: filters }: Request): RequestResult & { total: number } {
  if (threshold > newThreshold) threshold = newThreshold
  let preArts = filterArts(shared.arts, filters)
  const totalCount = countBuilds(preArts)

  let nodes = optimize(shared.nodes, {}, _ => false);
  ({ nodes, arts: preArts } = pruneAll(nodes, shared.min, preArts, shared.maxBuilds, new Set(), {
    pruneArtRange: true, pruneNodeRange: true,
  }))
  const [compute, mapping, buffer] = precompute(nodes, f => f.path[1])
  const arts = Object.values(preArts.values).sort((a, b) => a.length - b.length).map(arts => arts.map(art => {
    return {
      id: art.id,
      values: Object.entries(art.values)
        .map(([key, value]) => ({ key: mapping[key]!, value, cache: 0 }))
        .filter(({ key, value }) => key !== undefined && value !== 0)
    }
  }))

  const ids: string[] = Array(arts.length).fill("")
  let count = { build: 0, failed: 0, skipped: totalCount - countBuilds(preArts) }

  function permute(i: number) {
    if (i < 0) {
      const result = compute()
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

export type Command = Setup | Breakdown | Request | Finalize
export type ArtifactsBySlot = { base: DynStat, values: StrictDict<SlotKey, ArtifactBuildData[]> }
export type DynStat = { [key in string]: number }
export interface Setup {
  command: "setup"

  id: number
  arts: ArtifactsBySlot

  optimizationTarget: NumNode
  filters: { value: NumNode, min: number }[]
  plotBase: NumNode | undefined,
  maxBuilds: number
}
export interface Breakdown {
  command: "breakdown"
  threshold: number
  minCount: number
  filter?: RequestFilter
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

export type WorkerResult = InterimResult | BreakdownResult | RequestResult | FinalizeResult | DebugMsg
export interface BreakdownResult {
  command: "breakdown"
  id: number
  buildCount: number
  filter: RequestFilter | undefined
}
export interface InterimResult {
  command: "interim"
  id: number
  buildValues: number[] | undefined
  /** The number of builds since last report, including failed builds */
  buildCount: number
  /** The number of builds that does not meet the min-filter requirement since last report */
  failedCount: number
  skippedCount: number
}
export interface FinalizeResult {
  command: "finalize"
  id: number
  builds: Build[]
  plotData?: PlotData
}
export interface RequestResult {
  command: "request"
  id: number
}
export interface Build {
  value: number
  plot?: number
  artifactIds: string[]
}
export interface DebugMsg {
  command: "debug"
  id: number
  value: any
}

export function* splitFiltersBySet(_arts: ArtifactsBySlot, filters: Iterable<RequestFilter>, limit: number): Iterable<RequestFilter> {
  if (limit < 10000) limit = 10000

  for (const filter of filters) {
    const filters = [filter]

    while (filters.length) {
      const filter = filters.pop()!
      const arts = filterArts(_arts, filter)
      const count = countBuilds(arts)
      if (count <= limit) {
        if (count) yield filter
        continue
      }

      const candidates = allSlotKeys
        // TODO: Cache this loop
        .map(slot => ({ slot, sets: new Set(arts.values[slot].map(x => x.set)) }))
        .filter(({ sets }) => sets.size > 1)
      if (!candidates.length) {
        yield* splitFilterByIds(arts, filter, limit)
        continue
      }
      const { sets, slot } = candidates.reduce((a, b) => a.sets.size < b.sets.size ? a : b)
      sets.forEach(set => filters.push({ ...filter, [slot]: { kind: "required", sets: new Set([set]) } }))
    }
  }
}
function* splitFilterByIds(_arts: ArtifactsBySlot, filter: RequestFilter, limit: number): Iterable<RequestFilter> {
  const filters = [filter]

  while (filters.length) {
    const filter = filters.pop()!
    const arts = filterArts(_arts, filter)
    const count = countBuilds(arts)
    if (count <= limit) {
      if (count) yield filter
      continue
    }

    const candidates = allSlotKeys
      .map(slot => ({ slot, length: arts.values[slot].length }))
      .filter(x => x.length > 1)
    const { slot, length } = candidates.reduce((a, b) => a.length < b.length ? a : b)

    const numChunks = Math.ceil(count / limit)
    const boundedNumChunks = Math.min(numChunks, length)
    const chunk = Array(boundedNumChunks).fill(0).map(_ => new Set<string>())
    arts.values[slot].forEach(({ id }, i) => chunk[i % boundedNumChunks].add(id))
    if (numChunks > length) {
      chunk.forEach(ids => filters.push({ ...filter, [slot]: { kind: "id", ids } }))
    } else {
      for (const ids of chunk)
        yield { ...filter, [slot]: { kind: "id", ids } }
    }
  }
}
