import type { ArtifactRarity, SetNum } from '@genshin-optimizer/gi/consts'
import type { DocumentSection } from '../sheet'
export interface IArtifactSheet {
  name: string // only to stored the English name for OCR, otherwise, should come from localization pipeline
  rarity: readonly ArtifactRarity[]
  setEffects: Partial<Record<SetNum, SetEffectEntry>>
}
export interface SetEffectEntry {
  document: DocumentSection[]
}
