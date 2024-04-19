import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import type { ICharacter } from '@genshin-optimizer/gi/good'

export interface ICachedCharacter extends ICharacter {
  equippedArtifacts: Record<ArtifactSlotKey, string>
  equippedWeapon: string
}
