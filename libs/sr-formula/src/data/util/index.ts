import type {
  AnyNode,
  ReRead,
  Tag as BaseTag,
  Read as BaseRead,
} from '@genshin-optimizer/waverider'

export type TaggedFormula = { tag: Tag; value: AnyNode | ReRead }
export type TaggedFormulas = TaggedFormula[]

// TODO: tighten theses types and/or add util functions; See `formula/src/data/util/read.ts` for an example
export type Tag = BaseTag
export type Read = BaseRead
