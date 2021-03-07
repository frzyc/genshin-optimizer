import { Formulas, StatData } from "./StatData"
import { ReactionMatrix, hitTypes, hitMoves, hitElements, transformativeReactions, amplifyingReactions } from "./StatConstants"

export default class Stat {
  //do not instantiate.
  constructor() {
    if (this instanceof Stat)
      throw Error('A static class cannot be instantiated.');
  }
  static getStatName = (key, defVal = "") =>
    (htmlStatsData[key] || StatData[key]?.name) || defVal
  static getStatNamePretty = (key, defVal = "") =>
    (htmlStatsData[key] || StatData[key]?.pretty || StatData[key]?.name) || defVal
  static getStatNameRaw = (key, defVal = "") =>
    StatData[key]?.name || defVal
  static getStatNameWithPercent = (key, defVal = "") => {
    let name = this.getStatName(key, defVal)
    if (name !== defVal && (key === "hp_" || key === "atk_" || key === "def_"))
      name += "%"
    return name;
  }
  static getStatVariant = (key, defVal = "") =>
    StatData[key]?.variant || defVal
  static getStatUnit = (key, defVal = "") =>
    StatData[key]?.unit === "multi" ? defVal : (StatData[key]?.unit || defVal)

  static fixedUnit = (key) => {
    if (StatData[key]?.unit === "multi") return 3
    let unit = Stat.getStatUnit(key)
    return unit === "%" ? 1 : 0
  }
  static printStat = (statKey, stats) =>
    f({ stats, expand: false }, statKey)

  static getPrintableFormulaStatKeyList = (statList = [], modifiers = {}) => {
    let formulaKeys = Object.keys(FormulaText)
    let newModifiersKeys = Object.keys(modifiers).filter(x => !formulaKeys.includes(x))
    return [...newModifiersKeys, ...formulaKeys].filter((key) => statList.includes(key))
  }

  static printFormula = (statKey, stats, modifiers = {}, expand = true) => {
    const modifierText = Object.entries(modifiers?.[statKey] ?? []).map(([mkey, multiplier]) =>
      <span key={statKey + mkey} className="text-nowrap"> + {this.printStat(mkey, stats)} * {multiplier?.toFixed?.(3) ?? multiplier}</span>)
    if (typeof FormulaText?.[statKey] === "function")
      return <span>{FormulaText[statKey]({ stats, expand })}{modifierText}</span>
    else
      return <span>Basic Stats from artifacts/weapon{modifierText}</span>
  }
}
//generate html tags based on tagged variants of the statData
const htmlStatsData = Object.fromEntries(Object.entries(StatData).filter(([key, obj]) => obj.variant).map(([key, obj]) => [key, (<span className={`text-${obj.variant} text-nowrap`}>{obj.name}</span>)]))

function f(options, statKey) {
  let { stats, expand = true } = options
  if (!stats) return
  if (expand && FormulaText?.[statKey])
    return <span>( {FormulaText[statKey](options)} )</span>
  let statName = Stat.getStatNamePretty(statKey)
  let statUnit = Stat.getStatUnit(statKey)
  let fixedUnit = Stat.fixedUnit(statKey)
  let value = stats?.[statKey]?.toFixed?.(fixedUnit) || stats?.[statKey]
  return <span className="text-nowrap"><b>{statName}</b> <span className="text-info">{value}{statUnit}</span></span>
}

function reactionMatrixElementRenderer(o, val, i) {
  let sign = val < 0 ? " - " : " + ";
  let disVal = Math.abs(val)
  let powerText = ""
  if (i > 1) powerText = <span> * ( {f(o, "characterLevel")} )^{i}</span>
  if (i === 1) powerText = <span> * {f(o, "characterLevel")}</span>
  return <span key={i}>{sign}{disVal}{powerText}</span>
}

// Base Formula

const FormulaText = {
  baseATK: (o) => <span>{f(o, "characterATK")} + {f(o, "weaponATK")} </span>,
  finalATK: (o) => <span>{f(o, "baseATK")} * ( 1 + {f(o, "atk_")} ) + {f(o, "atk")}</span>,
  finalHP: (o) => <span>{f(o, "characterHP")} * ( 1 + {f(o, "hp_")} ) + {f(o, "hp")}</span>,
  finalDEF: (o) => <span>{f(o, "characterDEF")} * ( 1 + {f(o, "def_")} ) + {f(o, "def")}</span>,

  heal_multi: (o) => <span>( 1 + {f(o, "heal_")} + {f(o, "incHeal_")} )</span>,

  enemyLevel_multi: (o) => <span>( 100 + {f(o, "characterLevel")} ) / ( 100 + {f(o, "enemyLevel")} + 100 + {f(o, "characterLevel")} )</span>,
}

// Enemy RES

Object.entries(hitElements).forEach(([ele, { name: eleName }]) => {
  FormulaText[`${ele}_enemyRes_multi`] = (o) => {
    if (o.stats[`${ele}_enemyImmunity`])
      return <span>0 (immune)</span>
    let res = (o.stats[`${ele}_enemyRes_`] || 0) / 100
    if (res < 0) return <span> 1 - {f(o, `${ele}_enemyRes_`)} / 2</span>
    else if (res >= 0.75) return <span> 1 / ( {f(o, `${ele}_enemyRes_`)} * 4 + 1)</span>
    return <span> 1 - {f(o, `${ele}_enemyRes_`)} </span>
  }
})

// Crit Rate

Object.entries(hitMoves).forEach(([move, moveName]) => {
  FormulaText[`final_${move}_critRate_`] = (o) => <span>Min( {f(o, "critRate_")} + {f(o, `${move}_critRate_`)} , 100% )</span>
})

// Hit

Object.entries(hitElements).forEach(([ele, { name: eleName }]) => {
  FormulaText[`${ele}_elemental_hit_multi`] = (o) => <span>( 1 + {f(o, `dmg_`)} * {f(o, `${ele}_dmg_`)} ) * {f(o, `enemyLevel_multi`)} * {f(o, `${ele}_enemyRes_multi`)}</span>
  FormulaText[`${ele}_elemental_hit`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_elemental_hit_multi`)}</span>
  FormulaText[`${ele}_elemental_critHit_multi`] = (o) => <span>( 1 + {f(o, `critDMG_`)} ) * {f(o, `${ele}_elemental_hit_multi`)}</span>
  FormulaText[`${ele}_elemental_critHit`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_elemental_critHit_multi`)}</span>
  FormulaText[`${ele}_elemental_avgHit_multi`] = (o) => <span>( 1 + {f(o, `critDMG_`)} * {f(o, `critRate_`)} ) * {f(o, `${ele}_elemental_hit_multi`)}</span>
  FormulaText[`${ele}_elemental_avgHit`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_elemental_avgHit_multi`)}</span>

  Object.entries(hitMoves).forEach(([move, moveName]) => {
    FormulaText[`${ele}_${move}_hit_multi`] = (o) => <span>( 1 + {f(o, `dmg_`)} + {f(o, `${ele}_dmg_`)} + {f(o, `${move}_dmg_`)} ) * {f(o, `enemyLevel_multi`)} * {f(o, `${ele}_enemyRes_multi`)}</span>
    FormulaText[`${ele}_${move}_hit`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_${move}_hit_multi`)}</span>
    FormulaText[`${ele}_${move}_critHit_multi`] = (o) => <span>( 1 + {f(o, `critDMG_`)} ) * {f(o, `${ele}_${move}_hit_multi`)}</span>
    FormulaText[`${ele}_${move}_critHit`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_${move}_critHit_multi`)}</span>
    FormulaText[`${ele}_${move}_avgHit_multi`] = (o) => <span>( 1 + {f(o, `critDMG_`)} * {f(o, `final_${move}_critRate_`)} ) * {f(o, `${ele}_${move}_hit_multi`)}</span>
    FormulaText[`${ele}_${move}_avgHit`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_${move}_avgHit_multi`)}</span>
  })
})

// Reaction

Object.assign(FormulaText, {
  amplificative_dmg_: (o) => <span>25 / 9 * {f(o, "eleMas")} / ( 1400 + {f(o, "eleMas")} ) * 100%</span>,
})
Object.entries(amplifyingReactions).forEach(([reaction, [name, variants]]) => {
  Object.entries(variants).forEach(([ele, baseMulti]) => {
    // Move them to the right position
    FormulaText[`${ele}_${reaction}_multi`] = (o) => <span>{baseMulti} * ( 100% + {f(o, "amplificative_dmg_")} + {f(o, `${reaction}_dmg_`)} )</span>

    Object.entries(hitTypes).forEach(([type, typeName]) => {
      FormulaText[`${ele}_${reaction}_elemental_${type}`] = (o) => <span>{f(o, `${ele}_elemental_${type}`)} * {f(o, `${ele}_${reaction}_multi`)}</span>
      Object.entries(hitMoves).forEach(([move, moveName]) => {
        FormulaText[`${ele}_${reaction}_${move}_${type}`] = (o) => <span>{f(o, `${ele}_${move}_${type}`)} * {f(o, `${ele}_${reaction}_multi`)}</span>
      })
    })
  })
})

Object.assign(FormulaText, {
  transformative_dmg_: (o) => <span>60 / 9 * {f(o, "eleMas")} / ( 1400 + {f(o, "eleMas")} ) * 100%</span>,
})
Object.entries(transformativeReactions).forEach(([reaction, [reactionName, ele, baseMulti]]) => {
  FormulaText[`${reaction}_multi`] = (o) => ReactionMatrix[reaction].map((val, i) => reactionMatrixElementRenderer(o, val, i))
  FormulaText[`${reaction}_hit`] = (o) => <span>( 100% + {f(o, `transformative_dmg_`)} + {f(o, `${reaction}_dmg_`)} ) * {f(o, `${reaction}_multi`)} * {f(o, `${ele}_enemyRes_multi`)}</span>
})
Object.assign(FormulaText, {
  crystalize_eleMas_: (o) => <span>40 / 9 * {f(o, "eleMas")} / ( 1400 + {f(o, "eleMas")} ) * 100%</span>,
  crystalize_multi: (o) => ReactionMatrix["crystalize"].map((val, i) => reactionMatrixElementRenderer(o, val, i)),
  crystalize_hit: (o) => <span>( 100% + {f(o, "crystalize_dmg_")} + {f(o, "crystalize_eleMas_")} ) * {f(o, "crystalize_multi")}</span>,
})

//checks for development
process.env.NODE_ENV === "development" && Object.keys(Formulas).forEach(key => {
  if (!FormulaText[key]) console.error(`Formula "${key}" does not have a corresponding entry in FormulaText`)
})
process.env.NODE_ENV === "development" && Object.keys(Formulas).forEach(key => {
  if (!StatData[key]) console.error(`Formula "${key}" does not have a corresponding entry in StatData`)
})
