import type { CharacterSkillKey } from '@genshin-optimizer/gi/consts'
import type { StaticImageData } from 'next/image'
import type { DocumentSection } from '../sheet'
export interface TalentSheetElement {
  name: ReactNode //talentName
  img: string | StaticImageData
  sections: DocumentSection[]
}
export type TalentSheetElementKey = CharacterSkillKey
export type TalentSheet = Partial<
  Record<TalentSheetElementKey, TalentSheetElement>
>
