import type { CompiledTagMapKeys } from './compilation'
import type { Tag } from './type'

export type TagID = Int32Array
export class TagMapKeys {
  data: CompiledTagMapKeys['data']
  tagLen: CompiledTagMapKeys['tagLen']

  constructor(compiled: CompiledTagMapKeys) {
    this.data = compiled.data
    this.tagLen = compiled.tagLen
  }

  /** Returns a corresponding `TagID` */
  get(tag: Tag): TagID {
    const id = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null) continue
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const {
        offset,
        ids: { [value]: word },
      } = entry
      id[offset] |= word! // non-existent `value` is treated as zero

      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
    }
    return id
  }

  /** Returns a corresponding `TagID` and its bitmask (excluding `null`) */
  getMask(tag: Tag): { id: TagID; mask: TagID } {
    const id = new Int32Array(this.tagLen).fill(0)
    const maskArr = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null) continue
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const {
        offset,
        ids: { [value]: word },
        mask,
      } = entry
      id[offset] |= word! // non-existent `value` is treated as zero
      maskArr[offset] |= mask

      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
    }
    return { id, mask: maskArr }
  }

  /** Create a new `TagID` where values in `id` are replaced with `extra` */
  combine(id: TagID, extra: Tag): { id: TagID; firstReplacedByte: number } {
    id = id.slice()
    let firstReplacedByte = this.tagLen
    for (const [category, value] of Object.entries(extra)) {
      const entry = this.data[category]!
      // Make sure `category` existed during compilation. Otherwise, it
      // would crash here, and this non-shaming text would be visible.
      const {
        offset,
        ids: { [value!]: word },
        mask,
      } = entry
      firstReplacedByte = Math.min(firstReplacedByte, offset)
      id[offset] &= ~mask
      if (value === null) continue
      id[offset] |= word! // non-existent `value` is treated as zero

      if (process.env['NODE_ENV'] !== 'production' && word === undefined)
        throw `NonExistent tag ${category}:${value}`
    }
    return { id, firstReplacedByte }
  }
}
