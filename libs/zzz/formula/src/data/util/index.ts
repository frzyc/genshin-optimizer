import type {
  TagMapNodeEntries as BaseTagMapNodeEntries,
  TagMapNodeEntry as BaseTagMapNodeEntry,
} from '@genshin-optimizer/game-opt/engine'
import type { Dst, Sheet, Src } from './listing'
import type { Tag } from './read'

export * from './listing'
export * from './read'
export * from './sheet'
export * from './tag'

/** See `TagMapEntry` */
export type TagMapNodeEntry = BaseTagMapNodeEntry<Tag, Src, Dst, Sheet>
/** See `TagMapEntries` */
export type TagMapNodeEntries = BaseTagMapNodeEntries<Tag, Src, Dst, Sheet>
