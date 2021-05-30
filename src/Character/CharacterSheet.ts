import { ICharacterSheet } from "../Types/character";
import { allCharacterKeys, CharacterKey } from "../Types/consts";
import ICalculatedStats from "../Types/ICalculatedStats";
import { evalIfFunc } from "../Util/Util";

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
  get elementKey() { return this.sheet.elementKey }
  get weaponTypeKey() { return this.sheet.weaponTypeKey }
  get constellationName() { return this.sheet.constellationName }
  get specializeStat() { return this.sheet.specializeStat }
  get baseStat() { return this.sheet.baseStat }
  get talent() { return this.sheet.talent }
  get formula() { return this.sheet.formula }
  get conditionals() { return this.sheet.conditionals }
  get isAutoElemental() { return this.sheet.weaponTypeKey === "catalyst" }
  isMelee = () => {
    const weaponTypeKey = this.sheet.weaponTypeKey
    return weaponTypeKey === "sword" || weaponTypeKey === "polearm" || weaponTypeKey === "claymore"
  }

  getTalent = (talentKey: string) => this.talent[talentKey]
  get hasTalentPage() { return Boolean(Object.keys(this.sheet.talent).length) } //TODO: remove when all chararacter sheets are complete

  getTalentStats = (talentKey: string, stats: ICalculatedStats) => {
    const [, constell] = talentKey.split("constellation")
    if (parseInt(constell) > stats.constellation) return null
    return evalIfFunc(this.getTalent(talentKey)?.stats, stats)
  }
  getTalentStatsAll = (stats: ICalculatedStats) => {
    const talents = this.sheet.talent
    const statsArr: any[] = []
    Object.keys(talents).forEach(talentKey => {
      const talentStats = this.getTalentStats(talentKey, stats)
      if (talentStats) statsArr.push(talentStats)
    })
    return statsArr
  }
}
