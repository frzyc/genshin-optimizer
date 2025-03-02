import type {
  TagMapNodeEntries as BaseTagMapNodeEntries,
  TagMapNodeEntry as BaseTagMapNodeEntry,
} from '@genshin-optimizer/game-opt/engine'
import type { Tag } from './read'

/** See `TagMapEntry` */
export type TagMapNodeEntry = BaseTagMapNodeEntry<Tag>
/** See `TagMapEntries` */
export type TagMapNodeEntries = BaseTagMapNodeEntries<Tag>
