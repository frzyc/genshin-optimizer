import ImgIcon from "../Components/Image/ImgIcon";
import { Data } from "../Formula/type";
import { ICharacterSheet, TalentSheet, TalentSheetElementKey } from "../Types/character_WR";
import { CharacterKey, ElementKey } from "../Types/consts";
import { objectMap } from "../Util/Util";

export const charImport = import('../Data/Characters/index_WR')

charImport.then(console.log)

// TODO: remove typecasting
const characterSheets = charImport.then(imp => objectMap(imp.default, char => new CharacterSheet(char.default, char.data))) as Promise<Record<CharacterKey, CharacterSheet>>

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
  get isAutoElemental() { return this.sheet.weaponTypeKey === "catalyst" }
  // getBase = (statKey: "characterHP" | "characterDEF" | "characterATK", level = 1, ascensionLvl = 0) => {
  //   const key = statKey === "characterHP" ? "hp" : statKey === "characterDEF" ? "def" : "atk"
  //   return this.sheet.baseStat[key] * (expCurve[this.sheet.baseStatCurve[key] as any])[level] + this.sheet.ascensions[ascensionLvl].props[key]
  // }

  // getSpecializedStat = (ascensionLvl = 0): string | undefined => Object.keys(this.sheet.ascensions[ascensionLvl].props).find(k => k !== "hp" && k !== "def" && k !== "atk")
  // getSpecializedStatVal = (ascensionLvl = 0): number => {
  //   const statKey = this.getSpecializedStat(ascensionLvl)
  //   if (!statKey) return 0
  //   const value = this.sheet.ascensions[ascensionLvl].props[statKey] ?? 0
  //   if (Stat.getStatUnit(statKey) === "%") return value * 100
  //   return value
  // }
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
}
