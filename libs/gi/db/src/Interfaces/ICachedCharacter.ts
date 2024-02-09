import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import type { IGOCharacter } from './IGOCharacter'

export interface ICachedCharacter extends IGOCharacter {
  equippedArtifacts: Record<ArtifactSlotKey, string>
  equippedWeapon: string
}
