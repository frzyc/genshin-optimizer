import type { ArtifactRarity, SetNum } from '../../Types/consts'
import type { DocumentSection } from '../../Types/sheet'
export interface IArtifactSheet {
  name: string // only to stored the English name for OCR, otherwise, should come from localization pipeline
  rarity: readonly ArtifactRarity[]
  setEffects: Dict<SetNum, SetEffectEntry>
}
export interface SetEffectEntry {
  document: DocumentSection[]
}
