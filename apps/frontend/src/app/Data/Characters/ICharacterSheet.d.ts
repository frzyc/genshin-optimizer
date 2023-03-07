import { CharacterKey, ElementKey, RarityKey, WeaponTypeKey } from "@genshin-optimizer/consts";
import { DocumentSection } from "../../Types/sheet";

export interface TalentSheetElement {
  name: Displayable //talentName
  img: string
  sections: DocumentSection[]
}
export type TalentSheetElementKey = "auto" | "skill" | "burst" | "sprint" | "passive" | "passive1" | "passive2" | "passive3" | "constellation1" | "constellation2" | "constellation3" | "constellation4" | "constellation5" | "constellation6"
export type TalentSheet = Dict<TalentSheetElementKey, TalentSheetElement>

export type ICharacterSheet = {
  key: CharacterKey
  name: Displayable
  rarity: RarityKey
  weaponTypeKey: WeaponTypeKey
  gender: string
  constellationName: Displayable
  title: Displayable
  elementKey: ElementKey
  talent: TalentSheet
}
