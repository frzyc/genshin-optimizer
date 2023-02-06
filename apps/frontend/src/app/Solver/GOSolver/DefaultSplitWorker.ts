import { allSlotKeys } from '@genshin-optimizer/consts';
import type { InterimResult, Setup, SplitWorker } from './BackgroundWorker';
import { ArtifactsBySlot, countBuilds, filterArts, RequestFilter } from '../common';

export class DefaultSplitWorker implements SplitWorker {
  arts: ArtifactsBySlot
  filters: RequestFilter[] = []

  constructor({ arts }: Setup, _callback: (interim: InterimResult) => void) {
    this.arts = arts
  }
  addFilter(filter: RequestFilter) {
    this.filters.push(filter)
  }
  split(_newThreshold: number, minCount: number) {
    while (this.filters.length) {
      const filter = this.filters.pop()!, count = countBuilds(filterArts(this.arts, filter))
      if (count <= minCount) return filter
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
