import type { NumNode } from '../../../../Formula/type';
import { allSlotKeys } from '../../../../Types/consts';
import { ArtifactsBySlot, countBuilds, filterArts, RequestFilter } from './common';

export class SplitWorker {
  threshold: number = -Infinity
  maxBuilds: number
  min: number[]

  arts: ArtifactsBySlot
  nodes: NumNode[]

  splitFilters: Iterator<RequestFilter> | undefined
  splittingFilters: RequestFilter[] = []

  constructor({ arts, optimizationTarget, filters, plotBase, maxBuilds }: Setup) {
    this.arts = arts
    this.min = filters.map(x => x.min)
    this.maxBuilds = maxBuilds
    this.nodes = filters.map(x => x.value)
    this.nodes.push(optimizationTarget)
  }
  breakdown(newThreshold: number, minCount: number, filter: RequestFilter | undefined): RequestFilter | undefined {
    if (this.threshold > newThreshold) this.threshold = newThreshold
    if (filter) this.splittingFilters.push(filter)

    while (this.splittingFilters.length || this.splitFilters) {
      const { done, value } = this.splitFilters?.next() ?? { done: true }
      if (done) {
        this.splitFilters = undefined
        if (this.splittingFilters.length) {
          this.splitFilters = splitFiltersBySet(this.arts, this.splittingFilters, minCount)[Symbol.iterator]()
          this.splittingFilters = []
        }
      } else {
        return value as RequestFilter
      }
    }
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
