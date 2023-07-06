import type { AnyNode, ReRead } from '@genshin-optimizer/pando'
import type { Tag } from './read'

export * from './listing'
export * from './read'
export * from './sheet'
export * from './tag'

/** See `TagMapEntry`. This tighten `Tag` to a `gi-formula` version, so we cannot use `TagMapEntry<Node>`. */
export type TagMapNodeEntry = { tag: Tag; value: AnyNode | ReRead }
/** See `TagMapEntries` */
export type TagMapNodeEntries = TagMapNodeEntry[]
