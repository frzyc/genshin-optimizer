import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import type { ICharacter } from '@genshin-optimizer/sr/srod'

export interface ICachedCharacter extends ICharacter {
  equippedRelics: Record<RelicSlotKey, string | undefined>
  equippedLightCone?: string
}
