import { isDebug } from '../util'
import type { RawTagMapKeys } from './compilation'
import type { Tag } from './type'

export type TagId = Int32Array
/** Mapping from `Tag` to a faster internal representation `TagId`. */
export class TagMapKeys {
  data: RawTagMapKeys['data']
  tagLen: RawTagMapKeys['tagLen']

  constructor(compiled: RawTagMapKeys) {
    this.data = compiled.data
    this.tagLen = compiled.tagLen
  }

  /** Returns a corresponding `TagId` */
  get(tag: Tag): TagId {
    const id = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null || value === undefined) continue
      const entry = this.data[category]!
      const {
        // Make sure `category` existed during compilation. Otherwise, it
        // would crash here, and this non-shaming text would be visible.
        offset,
        ids: { [value]: word },
      } = entry
      id[offset] |= word! // non-existent `value` is treated as zero

      if (isDebug('tag_db') && word === undefined)
        throw `NonExistent tag ${category}:${value} in ${JSON.stringify(tag)}`
    }
    return id
  }

  /** Returns a corresponding `TagId` and its bitmask (excluding `null`) */
  getMask(tag: Tag): { id: TagId; mask: TagId } {
    const id = new Int32Array(this.tagLen).fill(0)
    const maskArr = new Int32Array(this.tagLen).fill(0)
    for (const [category, value] of Object.entries(tag)) {
      if (value === null || value === undefined) continue
      const entry = this.data[category]!
      const {
        // Make sure `category` existed during compilation. Otherwise, it
        // would crash here, and this non-shaming text would be visible.
        offset,
        ids: { [value]: word },
        mask,
      } = entry
      id[offset] |= word! // non-existent `value` is treated as zero
      maskArr[offset] |= mask

      if (isDebug('tag_db') && word === undefined)
        throw `NonExistent tag ${category}:${value} in ${JSON.stringify(tag)}`
    }
    return { id, mask: maskArr }
  }

  /** Create a new `TagId` where values in `id` are replaced with `extra` */
  combine(id: TagId, extra: Tag): { id: TagId; firstReplacedByte: number } {
    id = id.slice()
    let firstReplacedByte = this.tagLen
    for (const [category, value] of Object.entries(extra)) {
      const entry = this.data[category]!
      const {
        // Make sure `category` existed during compilation. Otherwise, it
        // would crash here, and this non-shaming text would be visible.
        offset,
        ids: { [value!]: word },
        mask,
      } = entry
      firstReplacedByte = Math.min(firstReplacedByte, offset)
      id[offset] &= ~mask
      if (value === null) continue
      id[offset] |= word! // non-existent `value` is treated as zero

      if (isDebug('tag_db') && word === undefined)
        throw `NonExistent tag ${category}:${value} in ${JSON.stringify(extra)}`
    }
    return { id, firstReplacedByte }
  }
}
