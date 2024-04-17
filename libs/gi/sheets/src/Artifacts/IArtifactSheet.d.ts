import type { SetNum } from '@genshin-optimizer/gi/consts'
import type { DocumentSection } from '../sheet'
export type SetEffectSheet = Partial<Record<SetNum, SetEffectEntry>>
export interface SetEffectEntry {
  document: DocumentSection[]
}
