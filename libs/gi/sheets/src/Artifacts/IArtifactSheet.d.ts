import type { ArtifactRarity } from '@genshin-optimizer/gi/consts'
import type { DocumentSection } from '@genshin-optimizer/gi/sheets'
import type { SetNum } from '../../Types/consts'
export interface IArtifactSheet {
  name: string // only to stored the English name for OCR, otherwise, should come from localization pipeline
  rarity: readonly ArtifactRarity[]
  setEffects: Partial<Record<SetNum, SetEffectEntry>>
}
export interface SetEffectEntry {
  document: DocumentSection[]
}
