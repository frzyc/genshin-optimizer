import type {
  AnyNode,
  ReRead,
  TagMapEntries,
  TagMapEntry,
} from '@genshin-optimizer/pando/engine'
import type { Tag } from './read'

/** See `TagMapEntry` */
export type TagMapNodeEntry = TagMapEntry<AnyNode | ReRead, Tag>
/** See `TagMapEntries` */
export type TagMapNodeEntries = TagMapEntries<AnyNode | ReRead, Tag>
