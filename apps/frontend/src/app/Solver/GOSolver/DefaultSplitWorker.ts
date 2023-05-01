import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import type { Interim, Setup } from '..'
import { assertUnreachable } from '../../Util/Util'
import type { ArtifactsBySlot, RequestFilter } from '../common'
import { countBuilds, filterArts } from '../common'
import type { SplitWorker } from './BackgroundWorker'

export class DefaultSplitWorker implements SplitWorker {
  arts: ArtifactsBySlot
  stack: { filter: RequestFilter; count: number; splittedBy: 'id' | 'set' }[] =
    []

  constructor({ arts }: Setup, _callback: (interim: Interim) => void) {
    this.arts = arts
  }

  popFilters(_: number): RequestFilter[] {
    return []
  }

  setThreshold(_newThreshold: number): void {}
  add(
    filter: RequestFilter,
    splittedBy: (typeof this.stack)[number]['splittedBy']
  ) {
    this.stack.push({
      filter,
      count: countBuilds(filterArts(this.arts, filter)),
      splittedBy,
    })
  }
  *split(filter: RequestFilter, minCount: number): Generator<RequestFilter> {
    this.add(filter, 'set')
    for (let current = this.stack.pop(); current; current = this.stack.pop()) {
      const { filter, count, splittedBy } = current
      if (count <= minCount) {
        yield filter
        continue
      }

      switch (splittedBy) {
        case 'set':
          this.splitBySet(filter)
          break
        case 'id':
          this.splitByID(filter, count, minCount)
          break
        default:
          assertUnreachable(splittedBy)
      }
    }
  }

  splitBySet(filter: RequestFilter): void {
    const arts = filterArts(this.arts, filter)
    const candidates = allArtifactSlotKeys
      .map((slot) => ({
        slot,
        sets: new Set(arts.values[slot].map((x) => x.set)),
      }))
      .filter(({ sets }) => sets.size > 1)

    if (!candidates.length) return this.add(filter, 'id')

    const { sets, slot } = candidates.reduce((a, b) =>
      a.sets.size < b.sets.size ? a : b
    )
    sets.forEach((set) =>
      this.add(
        { ...filter, [slot]: { kind: 'required', sets: new Set([set]) } },
        'set'
      )
    )
  }
  splitByID(filter: RequestFilter, count: number, minCount: number): void {
    const arts = filterArts(this.arts, filter)
    const { slot, length } = allArtifactSlotKeys
      .map((slot) => ({ slot, length: arts.values[slot].length }))
      .filter((x) => x.length > 1)
      // We always have entries because `count > 1`
      .reduce((a, b) => (a.length < b.length ? a : b))

    const numChunks = Math.ceil(count / minCount)
    const boundedNumChunks = Math.min(numChunks, length)
    const chunk = Array(boundedNumChunks)
      .fill(0)
      .map((_) => new Set<string>())
    arts.values[slot].forEach(({ id }, i) =>
      chunk[i % boundedNumChunks].add(id)
    )
    chunk.forEach((ids) =>
      this.add({ ...filter, [slot]: { kind: 'id', ids } }, 'id')
    )
  }
}
