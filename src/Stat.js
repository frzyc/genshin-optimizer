import { StatData } from "./StatData"
import { hitTypes, hitMoves, hitElements, transformativeReactions, amplifyingReactions } from "./StatConstants"

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
    let keys = new Set([...Object.keys(FormulaText), ...Object.keys(modifiers)])
    return statList.filter(key => keys.has(key))
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

export const FormulaText = {
  baseATK: (o) => <span>{f(o, "characterATK")} + {f(o, "weaponATK")} </span>,
  finalATK: (o) => <span>{f(o, "baseATK")} * ( 100% + {f(o, "atk_")} ) + {f(o, "atk")}</span>,
  finalHP: (o) => <span>{f(o, "characterHP")} * ( 100% + {f(o, "hp_")} ) + {f(o, "hp")}</span>,
  finalDEF: (o) => <span>{f(o, "characterDEF")} * ( 100% + {f(o, "def_")} ) + {f(o, "def")}</span>,

  enemyLevel_multi: (o) => <span>( 100 + {f(o, "characterLevel")} ) / ( ( 100 + {f(o, "characterLevel")} ) + ( 100 + {f(o, "enemyLevel")} ) * ( 100% - {f(o, "enemyDEFRed_")} ) )</span>,

  heal_multi: (o) => <span>( 100% + {f(o, "heal_")} + {f(o, "incHeal_")} )</span>,

  amplificative_dmg_: (o) => <span>25 / 9 * {f(o, "eleMas")} / ( 1400 + {f(o, "eleMas")} ) * 100%</span>,
  transformative_dmg_: (o) => <span>60 / 9 * {f(o, "eleMas")} / ( 1400 + {f(o, "eleMas")} ) * 100%</span>,

  crystalize_eleMas_: (o) => <span>40 / 9 * {f(o, "eleMas")} / ( 1400 + {f(o, "eleMas")} ) * 100%</span>,
  crystalize_hit: (o) => <span>( 100% + {f(o, "crystalize_dmg_")} + {f(o, "crystalize_eleMas_")} ) * {f(o, "crystalize_multi")}</span>,
}

Object.entries(hitMoves).forEach(([move, moveName]) => {
  FormulaText[`final_${move}_critRate_`] = (o) => <span>Min( {f(o, "critRate_")} + {f(o, `${move}_critRate_`)} , 100% )</span>
})

Object.entries(hitElements).forEach(([ele, { name: eleName }]) => {
  FormulaText[`${ele}_enemyRes_multi`] = (o) => {
    if (o.stats[`${ele}_enemyImmunity`])
      return <span>0 (immune)</span>
    let res = (o.stats[`${ele}_enemyRes_`] || 0) / 100
    if (res < 0) return <span> 100% - {f(o, `${ele}_enemyRes_`)} / 2</span>
    else if (res >= 0.75) return <span> 1 / ( {f(o, `${ele}_enemyRes_`)} * 4 + 1)</span>
    return <span> 100% - {f(o, `${ele}_enemyRes_`)} </span>
  }
})

Object.entries(hitMoves).forEach(([move, moveName]) => {
  Object.entries(hitElements).forEach(([ele, { name: eleName }]) => {
    Object.entries(hitTypes).forEach(([type, typeName]) => {
      FormulaText[`${ele}_${move}_${type}`] = (o) => <span>{f(o, `finalATK`)} * {f(o, `${ele}_${move}_${type}_multi`)}</span>
    })

    FormulaText[`${ele}_${move}_hit_base_multi`] = (o) => <span>100% + {f(o, 'dmg_')} + {f(o, `${ele}_dmg_`)} + {f(o, `${move}_dmg_`)}</span>
    FormulaText[`${move}_avgHit_base_multi`] = (o) => <span>100% + {f(o, 'critDMG_')} + {f(o, `final_${move}_critRate_`)} </span>
    FormulaText[`critHit_base_multi`] = (o) => <span>100% + {f(o, 'critDMG_')}</span>

    FormulaText[`${ele}_${move}_hit_multi`] = (o) => <span>{f(o, `${ele}_${move}_hit_base_multi`)} * {f(o, `enemyLevel_multi`)} * {f(o, `${ele}_enemyRes_multi`)}</span>
    FormulaText[`${ele}_${move}_critHit_multi`] = (o) => <span>{f(o, `critHit_base_multi`)} * {f(o, `${ele}_${move}_hit_multi`)}</span>
    FormulaText[`${ele}_${move}_avgHit_multi`] = (o) => <span>{f(o, `${move}_avgHit_base_multi`)} * {f(o, `${ele}_${move}_hit_multi`)}</span>
  })
})

Object.entries(transformativeReactions).forEach(([reaction, { multi, variants }]) => {
  FormulaText[`${reaction}_multi`] = (o) => <span>{multi} * {f(o, 'transformative_level_multi')}</span>
  if (variants.length === 1) {
    const [ ele ] = variants
    FormulaText[`${reaction}_hit`] = (o) => <span>( 100% + {f(o, `transformative_dmg_`)} + {f(o, `${reaction}_dmg_`)} ) * {f(o, `${reaction}_multi`)} * {f(o, `${ele}_enemyRes_multi`)}</span>  
  } else {
    variants.forEach(ele => {
      FormulaText[`${ele}_${reaction}_hit`] = (o) => <span>( 100% + {f(o, `transformative_dmg_`)} + {f(o, `${reaction}_dmg_`)} ) * {f(o, `${reaction}_multi`)} * {f(o, `${ele}_enemyRes_multi`)}</span>  
    })    
  }
})

Object.entries(amplifyingReactions).forEach(([reaction, { variants }]) => {
  Object.entries(variants).forEach(([ele, baseMulti]) => {
    FormulaText[`${ele}_${reaction}_multi`] = (o) => <span>{baseMulti} * ( 100% + {f(o, "amplificative_dmg_")} + {f(o, `${reaction}_dmg_`)} )</span>
    Object.entries(hitTypes).forEach(([type, typeName]) => {
      Object.entries(hitMoves).forEach(([move, moveName]) => {
        FormulaText[`${ele}_${reaction}_${move}_${type}_multi`] = (o) => <span>{f(o, `${ele}_${move}_${type}_multi`)} * {f(o, `${ele}_${reaction}_multi`)}</span>
        FormulaText[`${ele}_${reaction}_${move}_${type}`] = (o) => <span>{f(o, "finalATK")} * {f(o, `${ele}_${reaction}_${move}_${type}_multi`)}</span>
      })
    })
  })
})
