import { ICharacterSheet, TalentSheet } from "../Types/character";
import { allCharacterKeys, CharacterKey, ElementKey } from "../Types/consts";
import ICalculatedStats from "../Types/ICalculatedStats";
import { evalIfFunc } from "../Util/Util";
import expCurve from './expCurve_gen.json'

export const charImport = import('../Data/Characters').then(imp =>
  Object.fromEntries(Object.entries(imp.default).map(([charKey, value]) =>
    [charKey, new CharacterSheet(value)])) as unknown as StrictDict<CharacterKey, CharacterSheet>)

const loadCharacterSheet = Object.fromEntries(allCharacterKeys.map(set =>
  [set, charImport.then(sheets => sheets[set])])) as StrictDict<CharacterKey, Promise<CharacterSheet>>

export default class CharacterSheet {
  sheet: ICharacterSheet;
  constructor(charSheet: ICharacterSheet) { this.sheet = charSheet }
  static get = (charKey: CharacterKey | ""): Promise<CharacterSheet> | undefined => charKey ? loadCharacterSheet[charKey] : undefined
  static getAll = (): Promise<StrictDict<CharacterKey, CharacterSheet>> => charImport
  get name() { return this.sheet.name }
  get cardImg() { return this.sheet.cardImg }
  get thumbImg() { return this.sheet.thumbImg }
  get star() { return this.sheet.star }
  get elementKey() { return "elementKey" in this.sheet ? this.sheet.elementKey : undefined }
  get weaponTypeKey() { return this.sheet.weaponTypeKey }
  get constellationName() { return this.sheet.constellationName }
  get isAutoElemental() { return this.sheet.weaponTypeKey === "catalyst" }
  getBase = (statKey: "hp" | "def" | "atk", level = 1, ascensionLvl = 0) =>
    this.sheet.baseStat[statKey] * expCurve[this.sheet.baseStatCurve[statKey]][level] + this.sheet.ascensions[ascensionLvl].props[statKey]
  getSpecializedStat = (ascensionLvl = 0) => Object.keys(this.sheet.ascensions[ascensionLvl].props).find(k => k !== "hp" && k !== "def" && k !== "atk")
  getSpecializedStatVal = (ascensionLvl = 0) => {
    const statKey = this.getSpecializedStat(ascensionLvl)
    if (!statKey) return 0
    return this.sheet.ascensions[0].props[statKey] ?? 0
  }
  isMelee = () => {
    const weaponTypeKey = this.sheet.weaponTypeKey
    return weaponTypeKey === "sword" || weaponTypeKey === "polearm" || weaponTypeKey === "claymore"
  }

  getTalent = (eleKey: ElementKey = "anemo"): TalentSheet | undefined => {
    if ("talent" in this.sheet) return this.sheet.talent
    else return this.sheet.talents[eleKey]
  }
  getTalentOfKey = (talentKey: string, eleKey: ElementKey = "anemo") => this.getTalent(eleKey)?.sheets[talentKey]

  getTalentStats = (talentKey: string, stats: ICalculatedStats) => {
    const [, constell] = talentKey.split("constellation")
    if (parseInt(constell) > stats.constellation) return null
    return evalIfFunc(this.getTalentOfKey(talentKey)?.stats, stats)
  }
  getTalentStatsAll = (stats: ICalculatedStats, eleKey: ElementKey = "anemo") => {
    const talents = this.getTalent(eleKey)?.sheets
    if (!talents) return []
    const statsArr: any[] = []
    Object.keys(talents).forEach(talentKey => {
      const talentStats = this.getTalentStats(talentKey, stats)
      if (talentStats) statsArr.push(talentStats)
    })
    return statsArr
  }
}
