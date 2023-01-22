import type { CompiledTagMapValues } from './compilation'
import type { TagID } from './keys'

export class TagMapValues<V> {
  tagLen: number
  internal: InternalTagMapValues<V>

  constructor(tagLen: number, values: CompiledTagMapValues<V>) {
    this.tagLen = tagLen
    this.internal = createInternal(0, tagLen, values)
  }

  allValues(): V[] {
    const result: V[] = [], tagLen = this.tagLen
    function crawl(v: InternalTagMapValues<V>, offset: number): void {
      if (offset === tagLen) result.push(...v.values)
      else v.children.forEach(v => v.forEach(v => crawl(v, offset + 1)))
    }
    return crawl(this.internal, 0), result
  }
  subset(id: TagID): V[] {
    const result: V[] = [], tagLen = this.tagLen
    function crawl(v: InternalTagMapValues<V>, offset: number): void {
      if (offset === tagLen) result.push(...v.values)
      else v.subset(id[offset]!).forEach(v => crawl(v, offset + 1))
    }
    return crawl(this.internal, 0), result
  }
  refExact(id: TagID, mask: TagID): V[] {
    let current = this.internal, tagLen = this.tagLen
    for (let i = 0; i < tagLen; i++) current = current.exact(id[i]!, mask[i]!)
    return current.values
  }
}

function createInternal<V>(offset: number, tagLen: number, values: CompiledTagMapValues<V> | V[]): InternalTagMapValues<V> {
  if (offset === tagLen) return new InternalTagMapValues(values as V[], new Map())
  return new InternalTagMapValues([], new Map((values as CompiledTagMapValues<V>).map(({ mask, mapping }) =>
    [mask, new Map(mapping.map(({ id, values }) => [id, createInternal(offset + 1, tagLen, values)]))])))
}

export class InternalTagMapValues<V> {
  children: Map<number, Map<number, InternalTagMapValues<V>>>
  values: V[]

  constructor(values: V[], children: InternalTagMapValues<V>['children']) {
    this.values = values
    this.children = children
  }

  subset(id: number): InternalTagMapValues<V>[] {
    return [...this.children].map(([mask, mapping]) => mapping.get(id & mask)!).filter(x => x)
  }
  exact(id: number, mask: number): InternalTagMapValues<V> {
    let idMap = this.children.get(mask)
    if (!idMap) {
      idMap = new Map()
      this.children.set(mask, idMap)
    }
    let result = idMap.get(id)
    if (!result) {
      result = new InternalTagMapValues([], new Map())
      idMap.set(id, result)
    }
    return result
  }
}
