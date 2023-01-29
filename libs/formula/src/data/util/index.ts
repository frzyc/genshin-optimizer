import type { AnyNode, ReRead } from '@genshin-optimizer/waverider'
import type { Tag } from './read'
export * from './commonRead'
export * from './listing'
export * from './read'
export type Data = { tag: Tag, value: AnyNode | ReRead }[]
