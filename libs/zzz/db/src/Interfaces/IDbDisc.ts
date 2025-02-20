import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { IDisc } from '@genshin-optimizer/zzz/zood'

export interface ICachedDisc extends IDisc {
  id: string
}

export type DiscIds = Record<DiscSlotKey, string | undefined>
