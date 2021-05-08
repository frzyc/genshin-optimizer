import Formula from "../Formula";
import { ElementToReactionKeys } from "../StatData";
import { ICharacterSheet } from "../Types/character";
import { allCharacterKeys, CharacterKey } from "../Types/consts";
import ICalculatedStats from "../Types/ICalculatedStats";
import { deepClone, evalIfFunc } from "../Util/Util";

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
  isAutoElemental = () => this.sheet.weaponTypeKey === "catalyst"
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

  getDisplayStatKeys = (stats, defVal = { basicKeys: [] }) => {
    if (!stats || !Object.keys(stats).length) return defVal
    const { characterKey } = stats
    let eleKey = this.elementKey
    if (!eleKey) return defVal //usually means the character has not been lazy loaded yet
    const basicKeys = ["finalHP", "finalATK", "finalDEF", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_", `${eleKey}_dmg_`]
    const isAutoElemental = this.isAutoElemental
    if (!isAutoElemental) basicKeys.push("physical_dmg_")

    //show elemental interactions
    const transReactions = deepClone(ElementToReactionKeys[eleKey])
    const weaponTypeKey = this.weaponTypeKey
    if (!transReactions.includes("shattered_hit") && weaponTypeKey === "claymore") transReactions.push("shattered_hit")
    if (Formula.formulas.character?.[characterKey]) {
      const charFormulas = {}
      Object.entries(Formula.formulas.character[characterKey]).forEach(([talentKey, formulas]: any) => {
        Object.values(formulas as any).forEach((formula: any) => {
          if (!formula.field.canShow(stats)) return
          if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") talentKey = "auto"
          if (!charFormulas[talentKey]) charFormulas[talentKey] = []
          charFormulas[talentKey].push(formula.keys)
        })
      })
      return { basicKeys, ...charFormulas, transReactions }
    } else {//TODO: doesnt have character sheet
      //generic average hit parameters.
      const genericAvgHit: string[] = []
      if (!isAutoElemental) //add phy auto + charged + physical
        genericAvgHit.push("physical_normal_avgHit", "physical_charged_avgHit")

      else if (weaponTypeKey === "bow") {//bow charged atk does elemental dmg on charge
        genericAvgHit.push(`${eleKey}_charged_avgHit`)
      }
      //show skill/burst
      genericAvgHit.push(`${eleKey}_skill_avgHit`, `${eleKey}_burst_avgHit`)

      //add reactions.
      if (eleKey === "pyro") {
        const reactions: string[] = []
        reactions.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_vaporize_`)))
        reactions.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_melt_`)))
        genericAvgHit.push(...reactions)
      } else if (eleKey === "cryo")
        genericAvgHit.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_melt_`)))
      else if (eleKey === "hydro")
        genericAvgHit.push(...genericAvgHit.filter(key => key.startsWith(`${eleKey}_`)).map(key => key.replace(`${eleKey}_`, `${eleKey}_vaporize_`)))

      return { basicKeys, genericAvgHit, transReactions }
    }
  }

}
