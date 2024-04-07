import type {
  CharacterKey,
  ElementKey,
  RarityKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import type { DocumentSection } from '../sheet'

export interface TalentSheetElement {
  name: ReactNode //talentName
  img: string
  sections: DocumentSection[]
}
export type TalentSheetElementKey =
  | 'auto'
  | 'skill'
  | 'burst'
  | 'sprint'
  | 'passive'
  | 'passive1'
  | 'passive2'
  | 'passive3'
  | 'constellation1'
  | 'constellation2'
  | 'constellation3'
  | 'constellation4'
  | 'constellation5'
  | 'constellation6'
export type TalentSheet = Partial<
  Record<TalentSheetElementKey, TalentSheetElement>
>

export type ICharacterSheet = {
  key: CharacterKey
  name: ReactNode
  rarity: RarityKey
  weaponTypeKey: WeaponTypeKey
  gender: string
  constellationName: ReactNode
  title: ReactNode
  elementKey: ElementKey
  talent: TalentSheet
}
