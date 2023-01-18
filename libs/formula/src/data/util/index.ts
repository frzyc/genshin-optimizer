import { AnyNode, RawTagMapEntries, ReRead } from '@genshin-optimizer/waverider'

export * from './commonRead'
export * from './read'
export type Data = RawTagMapEntries<AnyNode | ReRead>
