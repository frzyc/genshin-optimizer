import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICharacter } from '@genshin-optimizer/zzz/zood'

export interface ICachedCharacter extends ICharacter {
  equippedDiscs: Record<DiscSlotKey, string>
  equippedWengine: string
}
