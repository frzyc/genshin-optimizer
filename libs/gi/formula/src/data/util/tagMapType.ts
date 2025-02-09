import type {
  TagMapNodeEntries as BaseTagMapNodeEntries,
  TagMapNodeEntry as BaseTagMapNodeEntry,
} from '@genshin-optimizer/gameOpt/engine'
import type { Dst, Sheet, Src } from './listing'
import type { Tag } from './read'

/** See `TagMapEntry` */
export type TagMapNodeEntry = BaseTagMapNodeEntry<Tag, Src, Dst, Sheet>
/** See `TagMapEntries` */
export type TagMapNodeEntries = BaseTagMapNodeEntries<Tag, Src, Dst, Sheet>
