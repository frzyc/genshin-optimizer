import type { Read, Tag } from '@genshin-optimizer/gameOpt/engine'
import type { DebugMeta } from '@genshin-optimizer/pando/engine'

export type GenericRead = Read<
  Tag<string | null, string | null, string>,
  string | null,
  string | null,
  string
>
export type FilterFunc = (debug: DebugMeta) => boolean
