import type { NumNode } from '../../../../Formula/type';
import { allSlotKeys } from '../../../../Types/consts';
import type { InterimResult, Setup } from './BackgroundWorker';
import { ArtifactsBySlot, countBuilds, filterArts, RequestFilter } from './common';

export class SplitWorker {
  min: number[]

  arts: ArtifactsBySlot
  nodes: NumNode[]

  filters: { count: number, filter: RequestFilter }[] = []

  callback: (interim: InterimResult) => void

  constructor({ arts, optimizationTarget, filters }: Setup, callback: (interim: InterimResult) => void) {
    this.arts = arts
    this.min = filters.map(x => x.min)
    this.nodes = filters.map(x => x.value)
    this.callback = callback

    this.min.push(-Infinity)
    this.nodes.push(optimizationTarget)
  }
  addFilter(filter: RequestFilter) {
    const count = countBuilds(filterArts(this.arts, filter))
    this.filters.push({ count, filter })
  }
  split(newThreshold: number, minCount: number) {
    if (this.min[this.min.length - 1] > newThreshold) this.min[this.min.length - 1] = newThreshold

    while (this.filters.length) {
      const { count, filter } = this.filters.pop()!
      if (count <= minCount) return { count, filter }
      splitBySetOrID(this.arts, filter, minCount).forEach(filter => this.addFilter(filter))
    }
  }
}

function splitBySetOrID(_arts: ArtifactsBySlot, filter: RequestFilter, limit: number): RequestFilter[] {
  const arts = filterArts(_arts, filter)

  const candidates = allSlotKeys
    .map(slot => ({ slot, sets: new Set(arts.values[slot].map(x => x.set)) }))
    .filter(({ sets }) => sets.size > 1)
  if (!candidates.length)
    return splitByID(arts, filter, limit)
  const { sets, slot } = candidates.reduce((a, b) => a.sets.size < b.sets.size ? a : b)
  return [...sets].map(set => ({ ...filter, [slot]: { kind: "required", sets: new Set([set]) } }))
}
function splitByID(_arts: ArtifactsBySlot, filter: RequestFilter, limit: number): RequestFilter[] {
  const arts = filterArts(_arts, filter)
  const count = countBuilds(arts)

  const candidates = allSlotKeys
    .map(slot => ({ slot, length: arts.values[slot].length }))
    .filter(x => x.length > 1)
  const { slot, length } = candidates.reduce((a, b) => a.length < b.length ? a : b)

  const numChunks = Math.ceil(count / limit)
  const boundedNumChunks = Math.min(numChunks, length)
  const chunk = Array(boundedNumChunks).fill(0).map(_ => new Set<string>())
  arts.values[slot].forEach(({ id }, i) => chunk[i % boundedNumChunks].add(id))
  return chunk.map(ids => ({ ...filter, [slot]: { kind: "id", ids } }))
}
