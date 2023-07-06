import type { AnyNode, ReRead } from '@genshin-optimizer/pando'
import { Tag } from './read'

export * from './listing'
export * from './read'
export * from './tag'
export * from './sheet'

/** See `TagMapEntry`. This tighten `Tag` to a `gi-formula` version, so we cannot use `TagMapEntry<Node>`. */
export type TagMapNodeEntry = { tag: Tag; value: AnyNode | ReRead }
/** See `TagMapEntries` */
export type TagMapNodeEntries = TagMapNodeEntry[]
