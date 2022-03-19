import ImgIcon from "../../Components/Image/ImgIcon";
import { ascensionMaxLevel } from "../LevelData";
import { Data } from "../../Formula/type";
import { TalentSheet, TalentSheetElement, TalentSheetElementKey } from "../../Types/character_WR";
import { CharacterKey, ElementKey, Rarity, WeaponTypeKey } from "../../Types/consts";
import SqBadge from "../../Components/SqBadge";
import Assets from "../../Assets/Assets";
import IConditional from "../../Types/IConditional";
import { IFieldDisplay } from "../../Types/IFieldDisplay";
import { DocumentSection } from "../../Types/sheet";
import { UIData } from "../../Formula/uiData";

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
  data: Data;
  constructor(charSheet: ICharacterSheet, data: Data) {
    this.sheet = charSheet
    this.data = data
  }
  static get = (charKey: CharacterKey | ""): Promise<CharacterSheet> | undefined => charKey ? characterSheets.then(c => c[charKey]) : undefined
  static get getAll() { return characterSheets }
  get name() { return this.sheet.name }
  get nameWIthIcon() { return <span><ImgIcon src={this.thumbImgSide} sx={{ height: "2em", marginTop: "-2em", marginLeft: "-0.5em" }} /> {this.name}</span> }
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
  getTalent = (eleKey: ElementKey = "anemo"): TalentSheet | undefined => {
    if ("talent" in this.sheet) return this.sheet.talent
    else return this.sheet.talents[eleKey]
  }
  getTalentOfKey = (talentKey: TalentSheetElementKey, eleKey: ElementKey = "anemo") => this.getTalent(eleKey)?.sheets[talentKey]

  static getLevelString = (level: number, ascension: number): string =>
    `${level}/${ascensionMaxLevel[ascension]}`
}

export const talentTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, fields?: IFieldDisplay[], conditional?: IConditional, additionalSections?: DocumentSection[]): TalentSheetElement => ({
  name: tr(`${talentKey}.name`),
  img,
  sections: [
    {
      ...sectionTemplate(talentKey, tr, img, fields, conditional, undefined, false, false),
      text: talentKey !== "auto" ? tr(`${talentKey}.description`) : undefined
    },
    ...(additionalSections || [])],
})
export const sectionTemplate = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string, fields?: IFieldDisplay[], conditional?: IConditional, fieldsCanShow?: (data: UIData) => boolean, teamBuff?: boolean, showFieldsHeaderDesc?: boolean): DocumentSection => ({
  fieldsHeader: showFieldsHeaderDesc ? conditionalHeader(talentKey, tr, img): undefined,
  fieldsDescription: showFieldsHeaderDesc ? tr(`${talentKey}.description`) : undefined,
  fields,
  canShow: fieldsCanShow,
  teamBuff,
  conditional: conditional
    ? { ...conditional,
      header: conditional.header ? conditional.header : conditionalHeader(talentKey, tr, img),
      description: conditional.description ? conditional.description : tr(`${talentKey}.description`) }
    : undefined,
})

const talentStrMap: Record<TalentSheetElementKey, string> = {
  auto: "Auto",
  skill: "Skill",
  burst: "Burst",
  passive: "Passive",
  passive1: "Ascension 1",
  passive2: "Ascension 4",
  passive3: "Passive",
  sprint: "Sprint",
  constellation1: "C1",
  constellation2: "C2",
  constellation3: "C3",
  constellation4: "C4",
  constellation5: "C5",
  constellation6: "C6"
}
export const conditionalHeader = (talentKey: TalentSheetElementKey, tr: (string) => Displayable, img: string): IConditional["header"] => {
  return {
    title: tr(`${talentKey}.name`),
    icon: <ImgIcon size={2} sx={{ m: -1 }} src={img} />,
    action: <SqBadge color="success">{talentStrMap[talentKey]}</SqBadge>,
  }
}

export const normalSrc = (weaponKey: WeaponTypeKey) => Assets.weaponTypes[weaponKey]
