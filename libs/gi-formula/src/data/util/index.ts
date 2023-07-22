import type {
  AnyNode,
  ReRead,
  TagMapEntries,
  TagMapEntry,
} from '@genshin-optimizer/pando'
import type { Tag } from './read'

export * from './listing'
export * from './read'
export * from './sheet'
export * from './tag'

/** See `TagMapEntry` */
export type TagMapNodeEntry = TagMapEntry<AnyNode | ReRead, Tag>
/** See `TagMapEntries` */
export type TagMapNodeEntries = TagMapEntries<AnyNode | ReRead, Tag>
