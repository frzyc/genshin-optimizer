import type { Tag } from '../type'
import type { CompiledTagMapKeys } from './compilation'

export type TagID = Int32Array
export class TagMapKeys {
  tagLen: CompiledTagMapKeys['tagLen']
  data: CompiledTagMapKeys['data']

  constructor(compiled: CompiledTagMapKeys) {
    this.tagLen = compiled.tagLen
    this.data = compiled.data
  }

  /** Returns a corresponding `TagID` */
  get(tag: Tag): TagID {
    const id = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null) continue
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const { offset, mapping } = entry, word = mapping[value]!
      id[offset] |= word // non-existent `value` is treated as zero

      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
    }
    return id
  }

  /** Returns a corresponding `TagID`, bit mask, and the first byte containing a tag category in `tag` */
  getMask(tag: Tag): { id: TagID, mask: TagID } {
    const id = new Int32Array(this.tagLen).fill(0), maskArr = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null) continue
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const { offset, mapping, mask } = entry, word = mapping[value]!
      id[offset] |= word // non-existent `value` is treated as zero
      maskArr[offset] |= mask

      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
    }
    return { id, mask: maskArr }
  }

  /** Returns a corresponding `TagID`, bit mask, and the first byte containing a tag category in `tag` */
  getMaskWithNull(tag: Tag): { id: TagID, mask: TagID, minByteOffset: number } {
    const id = new Int32Array(this.tagLen).fill(0)
    const maskArr = new Int32Array(this.tagLen).fill(0)
    let minByteOffset = this.tagLen
    for (const [category, value] of Object.entries(tag)) {
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const { offset, mapping, mask } = entry
      // Make sure `mask` is included even when `value` is `null` so
      // that `null` can be used to *delete* the category.
      minByteOffset = Math.min(offset, minByteOffset)
      maskArr[offset] |= mask
      if (value === null) continue

      const word = mapping[value]!
      id[offset] |= word // non-existent `value` is treated as zero

      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
    }
    return { id, mask: maskArr, minByteOffset }
  }
}
