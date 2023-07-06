import type {
  AnyNode,
  ReRead,
  Tag as BaseTag,
  Read as BaseRead,
} from '@genshin-optimizer/pando'

/** See `TagMapEntry`. This tighten `Tag` to a `gi-formula` version, so we cannot use `TagMapEntry<Node>`. */
export type TagMapNodeEntry = { tag: Tag; value: AnyNode | ReRead }
/** See `TagMapEntries` */
export type TagMapNodeEntries = TagMapNodeEntry[]

// TODO: tighten theses types and/or add util functions; See `formula/src/data/util/read.ts` for an example
export type Tag = BaseTag
export type Read = BaseRead
