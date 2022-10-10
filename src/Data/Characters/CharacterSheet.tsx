import Assets from "../../Assets/Assets";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { input } from "../../Formula";
import { Data, NumNode } from "../../Formula/type";
import { greaterEq } from "../../Formula/utils";
import { CharacterKey, CharacterSheetKey, ElementKey, Gender, Rarity, TravelerKey, travelerKeys, WeaponTypeKey } from "../../Types/consts";
import { DocumentConditional, DocumentConditionalBase, DocumentSection, IDocumentFields, IDocumentHeader } from "../../Types/sheet";
import { ascensionMaxLevel } from "../LevelData";
import { st, trans } from "../SheetUtil";
import { AssetType } from "./AssetType";

const characterSheets = import('.').then(imp => imp.default)

interface TalentSheetElement {
  name: Displayable //talentName
  img: string
  sections: DocumentSection[]
}

export type TalentSheetElementKey = "auto" | "skill" | "burst" | "sprint" | "passive" | "passive1" | "passive2" | "passive3" | "constellation1" | "constellation2" | "constellation3" | "constellation4" | "constellation5" | "constellation6"

export type TalentSheet = Dict<TalentSheetElementKey, TalentSheetElement>
export type ICharacterSheet = {
  key: CharacterKey
  name: Displayable
  rarity: Rarity
  weaponTypeKey: WeaponTypeKey
  gender: string
  constellationName: Displayable
  title: Displayable
  elementKey: ElementKey
  talent: TalentSheet
}
export type AllCharacterSheets = (characterkey: CharacterKey, gender: Gender) => CharacterSheet
export default class CharacterSheet {
  sheet: ICharacterSheet;
  asset: AssetType;
  data: Data;
  constructor(charSheet: ICharacterSheet, data: Data, asset: AssetType) {
    this.sheet = charSheet
    this.data = data
    this.asset = asset
  }
  static get = (charKey: CharacterKey | "", gender: Gender): Promise<CharacterSheet> | undefined => charKey ? characterSheets.then(c => c[charKeyToCharSheetKey(charKey, gender)]) : undefined
  static get getAll(): Promise<AllCharacterSheets> { return characterSheets.then(cs => (characterkey: CharacterKey, gender: Gender): CharacterSheet => cs[charKeyToCharSheetKey(characterkey, gender)]) }
  get name() { return this.sheet.name }
  get icon() { return <ImgIcon src={this.thumbImgSide} sx={{ height: "2em", marginTop: "-2em", marginLeft: "-0.5em" }} /> }
  get nameWIthIcon() { return <span>{this.icon} {this.name}</span> }
  get cardImg() { return this.asset.card }
  get thumbImg() { return this.asset.thumb }
  get thumbImgSide() { return this.asset.thumbSide }
  get bannerImg() { return this.asset.banner }

  get rarity() { return this.sheet.rarity }
  get elementKey() { return this.sheet.elementKey }
  get weaponTypeKey() { return this.sheet.weaponTypeKey }
  get constellationName() { return this.sheet.constellationName }

  isMelee = () => {
    const weaponTypeKey = this.sheet.weaponTypeKey
    return weaponTypeKey === "sword" || weaponTypeKey === "polearm" || weaponTypeKey === "claymore"
  }
  get isTraveler() {
    return "talents" in this.sheet
  }
  get talent() { return this.sheet.talent }
  getTalentOfKey = (talentKey: TalentSheetElementKey) => this.talent[talentKey]

  static getLevelString = (level: number, ascension: number): string =>
    `${level}/${ascensionMaxLevel[ascension]}`
}

const talentTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, docSections?: DocumentSection[]): TalentSheetElement => ({
  name: tr(`${talentKey}.name`),
  img,
  sections: [
    ...(talentKey !== "auto" ? [{ text: tr(`${talentKey}.description`) }] : []),
    ...(docSections || []),
  ],
})

const talentHeader = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string): IDocumentHeader => {
  return {
    title: tr(`${talentKey}.name`),
    icon: <ImgIcon size={2} sx={{ m: -1 }} src={img} />,
    action: <SqBadge color="success">{st(`talents.${talentKey}`)}</SqBadge>,
    description: tr(`${talentKey}.description`),
  }
}

const headerTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, partialSection: DocumentSection): DocumentSection => ({
  ...partialSection,
  header: talentHeader(talentKey, tr, img),
  canShow: canShowTemplate(talentKey, partialSection.canShow),
})

const fieldsTemplate = (talentKey: TalentSheetElementKey, partialFields: IDocumentFields): IDocumentFields => ({
  ...partialFields,
  canShow: canShowTemplate(talentKey, partialFields.canShow),
})

const conditionalTemplate = (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase, tr: (string) => Displayable, img: string): DocumentConditional => ({
  ...partialCond,
  header: { ...talentHeader(talentKey, tr, img), ...partialCond.header },
  canShow: canShowTemplate(talentKey, partialCond.canShow),
})

const canShowTalentsNodes: Partial<Record<TalentSheetElementKey, NumNode>> = {
  "passive1": greaterEq(input.asc, 1, 1),
  "passive2": greaterEq(input.asc, 4, 1),
  "constellation1": greaterEq(input.constellation, 1, 1),
  "constellation2": greaterEq(input.constellation, 2, 1),
  "constellation3": greaterEq(input.constellation, 3, 1),
  "constellation4": greaterEq(input.constellation, 4, 1),
  "constellation5": greaterEq(input.constellation, 5, 1),
  "constellation6": greaterEq(input.constellation, 6, 1),
}
function canShowTemplate(talentKey: TalentSheetElementKey, canShow: NumNode | undefined): NumNode | undefined {
  if (!canShowTalentsNodes[talentKey]) {
    return canShow
  }
  let compareVal
  let val
  if (["passive1", "passive2"].includes(talentKey)) {
    compareVal = input.asc
    val = +talentKey.slice(-1) === 1 ? 1 : 4
  } else {
    compareVal = input.constellation
    val = +talentKey.slice(-1)
  }
  // Try to reuse the base canShow node when possible for caching performance
  return canShow
    ? greaterEq(compareVal, val, canShow ? canShow : 1)
    : canShowTalentsNodes[talentKey]
}

export interface ICharacterTemplate {
  talentTemplate: (talentKey: TalentSheetElementKey, docSections?: DocumentSection[]) => TalentSheetElement
  headerTemplate: (talentKey: TalentSheetElementKey, partialSection: DocumentSection) => DocumentSection
  fieldsTemplate: (talentKey: TalentSheetElementKey, partialFields: IDocumentFields) => IDocumentFields
  conditionalTemplate: (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase) => DocumentConditional
}
export const charTemplates = (cKey: CharacterSheetKey, wKey: WeaponTypeKey, assets: AssetType): ICharacterTemplate => {
  const [tr] = trans("char", cKey)

  const img = (tk: TalentSheetElementKey): string => {
    if (tk === "auto") return Assets.weaponTypes[wKey]
    return assets[tk] ?? ""
  }

  return {
    talentTemplate: (talentKey: TalentSheetElementKey, docSections?: DocumentSection[]) => talentTemplate(talentKey, tr, img(talentKey), docSections),
    headerTemplate: (talentKey: TalentSheetElementKey, partialSection: DocumentSection) => headerTemplate(talentKey, tr, img(talentKey), partialSection),
    fieldsTemplate: (talentKey: TalentSheetElementKey, partialFields: IDocumentFields) => fieldsTemplate(talentKey, partialFields),
    conditionalTemplate: (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase) => conditionalTemplate(talentKey, partialCond, tr, img(talentKey))
  }
}

function charKeyToCharSheetKey(charKey: CharacterKey, gender: Gender): CharacterSheetKey {
  if (travelerKeys.includes(charKey as TravelerKey)) return `${charKey}${gender}` as CharacterSheetKey
  else return charKey as CharacterSheetKey
}
