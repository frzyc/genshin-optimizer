import type { Tag, TagCategory, TagValue } from './type'

/*
 * If access to multiple `TagMaps` with shared tags is needed, it may be better to use separate
 * instances of `TagMapValues` and `TagMapKeys`. This way, the lookup needs to be performed only
 * once from `TagMapKeys`, and the lookup result can be used on different `TagMapValues`. If
 * multiple `TagMap`s are used, the lookup will be performed multiple times, once  on each `TagMap`.
 */
export class TagMap<V> {
  keys: TagMapKeys
  values: TagMapValues<V>

  constructor(keys: CompiledTagMapKeys, ...values: CompiledTagMapValues<V>[]) {
    this.keys = new TagMapKeys(keys)
    this.values = new TagMapValues(keys.tagLen, ...values)
  }

  /** Add `value` to the associated `tag` */
  add(tag: Tag, value: V) {
    this.values.add(this.keys.get(tag), value)
  }

  /** Return entries that are supersets of `tag`; matching entries may contain additional tags */
  superset(tag: Tag): V[] {
    return this.values.superset(this.keys.get(tag))
  }

  /** Return entries that are subsets of `tag`; matching entries may omit some tags */
  subset(tag: Tag): V[] {
    return this.values.subset(this.keys.get(tag))
  }

  /** Return entries that exactly match `tag` */
  exact(tag: Tag): V[] {
    return this.values.exact(this.keys.get(tag))
  }
}

export type CompiledTagMapValues<V> = Map<number, CompiledTagMapValues<V> | V[]>
type Entry<V> = CompiledTagMapValues<V>
export class TagMapValues<V> {
  data: Entry<V>

  constructor(tagLen: number, ...compiled: CompiledTagMapValues<V>[]) {
    this.data = mergeValues([...compiled], tagLen)
  }

  /** Add `value` to the associated `tag` */
  add(tagID: TagID, value: V) {
    let current = this.data
    for (const word of tagID.subarray(0, -1)) {
      if (current.has(word))
        current = current.get(word) as Entry<V>
      else {
        const newEntry: Entry<V> = new Map()
        current.set(word, newEntry)
        current = newEntry
      }
    }
    const lastWord = tagID.at(-1)!
    if (current.has(lastWord)) (current.get(lastWord) as V[]).push(value)
    else current.set(lastWord, [value])
  }

  /** Return entries that are supersets of `tagID`; matching entries may contain additional tags */
  superset(tagID: TagID): V[] {
    let current = [this.data]
    for (const word of tagID)
      current = current.flatMap(entry => {
        const keys = [...entry.keys()].filter(key => (key & word) == word)
        return keys.map(key => entry.get(key) as Entry<V>)
      })
    return (current as unknown as V[][]).flat()
  }

  /** Return entries that are subsets of `tagID`; matching entries may omit some tags */
  subset(tagID: TagID): V[] {
    let current = [this.data]
    for (const word of tagID)
      current = current.flatMap(entry => {
        const keys = [...entry.keys()].filter(key => (key & word) == key)
        return keys.map(key => entry.get(key) as Entry<V>)
      })
    return (current as unknown as V[][]).flat()
  }

  /** Return entries that exactly match `tagID` */
  exact(tagID: TagID): V[] {
    let current: Entry<V> = this.data
    for (const word of tagID)
      if (!current.has(word)) return []
      else current = current.get(word) as Entry<V>
    return [...current] as unknown as V[]
  }
}

export type TagID = Int32Array
export type CompiledTagMapKeys = {
  tagLen: number
  data: Record<TagCategory, { offset: number, mapping: Record<TagValue, number> }>
}
export class TagMapKeys {
  tagLen: CompiledTagMapKeys['tagLen']
  data: CompiledTagMapKeys['data']

  constructor(compiled: CompiledTagMapKeys) {
    this.tagLen = compiled.tagLen
    this.data = compiled.data
  }

  /** Returns a corresponding `TagID` */
  get(tag: Tag): TagID {
    const raw = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null) continue
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const { offset, mapping } = entry, word = mapping[value]!
      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
      raw[offset] |= word // non-existent `value`s is treated as zero
    }
    return raw
  }
}

function mergeValues<V>(values: CompiledTagMapValues<V>[], tagLen: number): CompiledTagMapValues<V> {
  if (values.length <= 1) return values[0] ?? new Map()

  const keys = [...new Set(values.flatMap(v => [...v.keys()]))]
  if (tagLen === 1)
    return new Map(keys.map(k => [k,
      values.flatMap(v => v.get(k) as V[] ?? [])
    ]))

  return new Map(keys.map(k => [k, mergeValues(
    values.filter(v => v.has(k)).map(v => v.get(k) as CompiledTagMapValues<V>),
    tagLen - 1
  )]))
}

/** Convert a compiled tag map values to a JSON-able object; `V` must support JSON */
export function tagMapValuesToJSON<V>(entries: CompiledTagMapValues<V>): object {
  return Object.fromEntries([...entries.entries()].map(([k, v]) =>
    Array.isArray(v) ? [k, v] : [k, tagMapValuesToJSON(v)]))
}
/** Convert an object returned from `tagMapValuesToJSON` back to `CompiledTagMapValues<V>` */
export function jsonToTagMapValues<V>(obj: object): CompiledTagMapValues<V> {
  return new Map(Object.entries(obj).map(([k, v]: [string, Entry<V> | V[]]) =>
    [parseInt(k), Array.isArray(v) ? v : jsonToTagMapValues<V>(v)]))
}
