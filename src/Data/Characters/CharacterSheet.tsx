import Assets from "../../Assets/Assets";
import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { Translate } from "../../Components/Translate";
import { input } from "../../Formula";
import { Data, NumNode } from "../../Formula/type";
import { greaterEq } from "../../Formula/utils";
import { TalentSheet, TalentSheetElement, TalentSheetElementKey } from "../../Types/character";
import { CharacterKey, ElementKey, Rarity, WeaponTypeKey } from "../../Types/consts";
import { DocumentConditional, DocumentConditionalBase, DocumentSection, IDocumentFields, IDocumentHeader } from "../../Types/sheet";
import { ascensionMaxLevel } from "../LevelData";
import { st, trans } from "../SheetUtil";

const characterSheets = import('.').then(imp => imp.default)

interface ICharacterSheetBase {
  name: Displayable
  cardImg: string
  thumbImg: string
  thumbImgSide: string
  barImg?: string
  bannerImg?: string
  rarity: Rarity
  weaponTypeKey: WeaponTypeKey
  gender: string
  constellationName: Displayable
  title: Displayable
}
interface ICharacterSheetTalent extends ICharacterSheetBase {
  elementKey: ElementKey
  talent: TalentSheet
}
interface ICharacterSheetTalents extends ICharacterSheetBase {
  talents: Dict<ElementKey, TalentSheet>
}
export type ICharacterSheet = ICharacterSheetTalent | ICharacterSheetTalents

export default class CharacterSheet {
  sheet: ICharacterSheet;
  private data: Data | Partial<Record<ElementKey, Data>>;
  constructor(charSheet: ICharacterSheet, data: Data | Partial<Record<ElementKey, Data>>) {
    this.sheet = charSheet
    this.data = data
  }
  static get = (charKey: CharacterKey | ""): Promise<CharacterSheet> | undefined => charKey ? characterSheets.then(c => c[charKey]) : undefined
  static get getAll() { return characterSheets }
  get name() { return this.sheet.name }
  get icon() { return <ImgIcon src={this.thumbImgSide} sx={{ height: "2em", marginTop: "-2em", marginLeft: "-0.5em" }} /> }
  get nameWIthIcon() { return <span>{this.icon} {this.name}</span> }
  get cardImg() { return this.sheet.cardImg }
  get thumbImg() { return this.sheet.thumbImg }
  get thumbImgSide() { return this.sheet.thumbImgSide }
  get bannerImg() { return this.sheet.bannerImg }
  get rarity() { return this.sheet.rarity }
  get elementKey() { return "elementKey" in this.sheet ? this.sheet.elementKey : undefined }
  get weaponTypeKey() { return this.sheet.weaponTypeKey }
  get constellationName() { return this.sheet.constellationName }

  isMelee = () => {
    const weaponTypeKey = this.sheet.weaponTypeKey
    return weaponTypeKey === "sword" || weaponTypeKey === "polearm" || weaponTypeKey === "claymore"
  }
  get isTraveler() {
    return "talents" in this.sheet
  }
  getData = (ele: ElementKey = "anemo"): Data => {
    if ("charKey" in this.data)
      return this.data
    return this.data[ele]!
  }
  getTalent = (eleKey: ElementKey = "anemo"): TalentSheet | undefined => {
    if ("talent" in this.sheet) return this.sheet.talent
    else return this.sheet.talents[eleKey]
  }
  getTalentOfKey = (talentKey: TalentSheetElementKey, eleKey: ElementKey = "anemo") => this.getTalent(eleKey)?.sheets[talentKey]

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

interface ICharacterTemplate {
  talentTemplate: (talentKey: TalentSheetElementKey, docSections?: DocumentSection[]) => TalentSheetElement
  headerTemplate: (talentKey: TalentSheetElementKey, partialSection: DocumentSection) => DocumentSection
  fieldsTemplate: (talentKey: TalentSheetElementKey, partialFields: IDocumentFields) => IDocumentFields
  conditionalTemplate: (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase) => DocumentConditional
}
export const charTemplates = (cKey: CharacterKey, wKey: WeaponTypeKey, assets: Partial<Record<TalentSheetElementKey, string>>, travelerEle?: ElementKey): ICharacterTemplate => {
  const [tr] = cKey === "Traveler"
    ? [(key: string) => <Translate ns="char_Traveler_gen" key18={`${travelerEle}.${key}`} />]
    : trans("char", cKey)
  assets.auto = Assets.weaponTypes[wKey]
  return {
    talentTemplate: (talentKey: TalentSheetElementKey, docSections?: DocumentSection[]) => talentTemplate(talentKey, tr, assets[talentKey] ?? "", docSections),
    headerTemplate: (talentKey: TalentSheetElementKey, partialSection: DocumentSection) => headerTemplate(talentKey, tr, assets[talentKey] ?? "", partialSection),
    fieldsTemplate: (talentKey: TalentSheetElementKey, partialFields: IDocumentFields) => fieldsTemplate(talentKey, partialFields),
    conditionalTemplate: (talentKey: TalentSheetElementKey, partialCond: DocumentConditionalBase) => conditionalTemplate(talentKey, partialCond, tr, assets[talentKey] ?? "")
  }
}
