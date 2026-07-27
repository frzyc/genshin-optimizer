import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICharacter } from '@genshin-optimizer/zzz/zood'

export interface ICharMeta {
  description: string
  /** Talent sheet categories collapsed in the optimize target picker / stats panel. */
  collapsedOptCategories: string[]
}

export interface ICachedCharacter extends ICharacter {
  equippedDiscs: Record<DiscSlotKey, string | undefined>
  equippedWengine?: string
}
