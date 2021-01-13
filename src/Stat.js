import ElementalData from "./Data/ElementalData";
import { Formulas, OverrideFormulas, StatData } from "./StatData";

export default class Stat {
  //do not instantiate.
  constructor() {
    if (this instanceof Stat)
      throw Error('A static class cannot be instantiated.');
  }
  static getStatName = (key, defVal = "") =>
    (StatData[key]?.html || StatData[key]?.name) || defVal
  static getStatNamePretty = (key, defVal = "") =>
    (StatData[key]?.html || StatData[key]?.pretty || StatData[key]?.name) || defVal
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

  static printFormula = (statKey, stats, formulaOverrides = [], expand = true) => {
    for (const formulaOverride of formulaOverrides)
      if (OverrideFormulas[formulaOverride?.key]?.key === statKey)
        return Stat.printOverrideFormula(stats, formulaOverride.key, formulaOverride.options, false)
    return FormulaText?.[statKey] && typeof FormulaText?.[statKey] === "function" &&
      (<span>{FormulaText[statKey]({ stats, expand })}</span>)
  }

  static printOverrideFormula = (stats, overrideKey, options, expand = true) =>
    OverrideFormulasText?.[overrideKey] && typeof OverrideFormulasText?.[overrideKey].formulaText === "function" &&
    (<span>{OverrideFormulasText[overrideKey].formulaText(options)({ stats, expand })}</span>)
}

function f(options, statKey) {
  let { stats, expand = true } = options
  if (expand && FormulaText?.[statKey])
    return <span>( {FormulaText[statKey](options)} )</span>
  let statName = Stat.getStatNamePretty(statKey)
  let statUnit = Stat.getStatUnit(statKey)
  let fixedUnit = Stat.fixedUnit(statKey)
  let value = stats[statKey]?.toFixed?.(fixedUnit) || stats[statKey]
  return <span className="text-nowrap"><b>{statName}</b> <span className="text-info">{value}{statUnit}</span></span>
}

const FormulaText = {
  //HP
  hp_final: (o) => <span>{f(o, "hp_base")} * ( 1 + {f(o, "hp_")} ) + {f(o, "hp")}</span>,
  //ATK
  atk_final: (o) => <span>( {f(o, "atk_base")} + {f(o, "atk_weapon")} ) * ( 1 + {f(o, "atk_")} ) + {f(o, "atk")}</span>,
  //DEF
  def_final: (o) => <span>{f(o, "def_base")} * ( 1 + {f(o, "def_")} ) + {f(o, "def")}</span>,

  //NORMAL
  norm_atk_dmg: (o) => <span>{f(o, "atk_final")} * {f(o, "norm_atk_bonus_multi")} * {f(o, "enemy_level_multi")} * {f(o, "enemy_phy_res_multi")}</span>,
  norm_atk_crit_dmg: (o) => <span>{f(o, "norm_atk_dmg")} * {f(o, "crit_dmg_multi")}</span>,
  norm_atk_avg_dmg: (o) => <span>{f(o, "norm_atk_dmg")} * {f(o, "norm_atk_crit_multi")}</span>,
  norm_atk_crit_multi: (o) => <span>( 1 + Min[( {f(o, "crit_rate")} + {f(o, "norm_atk_crit_rate")} ), 100%] * {f(o, "crit_dmg")} )</span>,
  norm_atk_bonus_multi: (o) => <span>( 1 + {f(o, "phy_dmg_bonus")} + {f(o, "norm_atk_dmg_bonus")} + {f(o, "dmg")} )</span>,

  //CHARGED
  char_atk_dmg: (o) => <span>{f(o, "atk_final")} * {f(o, "char_atk_bonus_multi")} * {f(o, "enemy_level_multi")} * {f(o, "enemy_phy_res_multi")}</span>,
  char_atk_crit_dmg: (o) => <span>{f(o, "char_atk_dmg")} * {f(o, "crit_dmg_multi")}</span>,
  char_atk_avg_dmg: (o) => <span>{f(o, "char_atk_dmg")} * {f(o, "char_atk_crit_multi")}</span>,
  char_atk_crit_multi: (o) => <span>( 1 + Min[( {f(o, "crit_rate")} + {f(o, "char_atk_crit_rate")} ), 100%] * {f(o, "crit_dmg")} )</span>,
  char_atk_bonus_multi: (o) => <span>( 1 + {f(o, "phy_dmg_bonus")} + {f(o, "char_atk_dmg_bonus")} + {f(o, "dmg")} )</span>,

  //PLUNGE
  plunge_dmg: (o) => <span>{f(o, "phy_dmg")}</span>,
  plunge_crit_dmg: (o) => <span>{f(o, "phy_crit_dmg")}</span>,
  plunge_avg_dmg: (o) => <span>{f(o, "phy_avg_dmg")}</span>,
  plunge_bonus_multi: (o) => <span>{f(o, "phy_bonus_multi")}</span>,

  phy_dmg: (o) => <span>{f(o, "atk_final")} * {f(o, "phy_bonus_multi")} * {f(o, "enemy_level_multi")} * {f(o, "enemy_phy_res_multi")}</span>,
  phy_crit_dmg: (o) => <span>{f(o, "phy_dmg")} * {f(o, "crit_dmg_multi")}</span>,
  phy_avg_dmg: (o) => <span>{f(o, "phy_dmg")} * {f(o, "crit_multi")}</span>,
  phy_bonus_multi: (o) => <span>( 1 + {f(o, "phy_dmg_bonus")} + {f(o, "dmg")} )</span>,

  crit_dmg_multi: (o) => <span>( 1 + {f(o, "crit_dmg")} )</span>,
  crit_multi: (o) => <span>( 1 + Min[ {f(o, "crit_rate")} , 100%] * {f(o, "crit_dmg")} )</span>,

  skill_crit_multi: (o) => <span>( 1 + Min[( {f(o, "crit_rate")} + {f(o, "skill_crit_rate")} ), 100%] * {f(o, "crit_dmg")} )</span>,
  burst_crit_multi: (o) => <span>( 1 + Min[( {f(o, "crit_rate")} + {f(o, "burst_crit_rate")} ), 100%] * {f(o, "crit_dmg")} )</span>,

  enemy_level_multi: (o) => <span>( 100 + {f(o, "char_level")}) / ( 100 + {f(o, "enemy_level")} + 100 + {f(o, "char_level")})</span>,
  // enemy_phy_res_multi: (s) => s.enemy_phy_immunity ? 0 : resMultiplier(s.enemy_phy_res)
  enemy_phy_res_multi: (o) => {
    let im = o.stats.enemy_phy_immunity
    if (im)
      return <span>0 due to immunity</span>
    let res = (o.stats.enemy_phy_res || 0) / 100
    if (res < 0) return <span> 1 - {f(o, "enemy_phy_res")} / 2</span>
    else if (res >= 0.75) return <span> 1 / ( {f(o, "enemy_phy_res")} * 4 + 1)</span>
    return <span> 1 - {f(o, "enemy_phy_res")} </span>
  },
}
const eleFormulaText = {
  norm_atk_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_norm_atk_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_phy_res_multi`)}</span>,
  norm_atk_crit_dmg: (o, ele) => <span>{f(o, `${ele}_norm_atk_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  norm_atk_avg_dmg: (o, ele) => <span>{f(o, `${ele}_norm_atk_dmg`)} * {f(o, `norm_atk_crit_multi`)}</span>,
  norm_atk_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `norm_atk_dmg_bonus`)} + {f(o, `dmg`)} )</span>,

  char_atk_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_char_atk_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  char_atk_crit_dmg: (o, ele) => <span>{f(o, `${ele}_char_atk_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  char_atk_avg_dmg: (o, ele) => <span>{f(o, `${ele}_char_atk_dmg`)} * {f(o, `char_atk_crit_multi`)}</span>,
  char_atk_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `char_atk_dmg_bonus`)} + {f(o, `dmg`)} )</span>,

  plunge_dmg: (o, ele) => <span>{f(o, `${ele}_ele_dmg`)}</span>,
  plunge_crit_dmg: (o, ele) => <span>{f(o, `${ele}_ele_crit_dmg`)}</span>,
  plunge_avg_dmg: (o, ele) => <span>{f(o, `${ele}_ele_avg_dmg`)}</span>,
  plunge_bonus_multi: (o, ele) => <span>{f(o, `${ele}_ele_bonus_multi`)}</span>,

  ele_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_ele_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_phy_res_multi`)}</span>,
  ele_crit_dmg: (o, ele) => <span>{f(o, `${ele}_ele_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  ele_avg_dmg: (o, ele) => <span>{f(o, `${ele}_ele_dmg`)} * {f(o, `crit_multi`)}</span>,
  ele_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `dmg`)} )</span>,

  skill_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_skill_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  skill_crit_dmg: (o, ele) => <span>{f(o, `${ele}_skill_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  skill_avg_dmg: (o, ele) => <span>{f(o, `${ele}_skill_dmg`)} * {f(o, `skill_crit_multi`)}</span>,
  skill_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `skill_dmg_bonus`)} + {f(o, `dmg`)} )</span>,

  burst_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_burst_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  burst_crit_dmg: (o, ele) => <span>{f(o, `${ele}_burst_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  burst_avg_dmg: (o, ele) => <span>{f(o, `${ele}_burst_dmg`)} * {f(o, `burst_crit_multi`)}</span>,
  burst_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `burst_dmg_bonus`)} + {f(o, `dmg`)} )</span>,

  enemy_ele_res_multi: (o, ele) => {
    let im = o.stats[`${ele}_enemy_ele_immunity`]
    if (im)
      return <span>0 due to immunity</span>
    let res = (o.stats[`${ele}_enemy_ele_res`] || 0) / 100
    if (res < 0) return <span> 1 - {f(o, `${ele}_enemy_ele_res`)} / 2</span>
    else if (res >= 0.75) return <span> 1 / ( {f(o, `${ele}_enemy_ele_res`)} * 4 + 1)</span>
    return <span> 1 - {f(o, `${ele}_enemy_ele_res`)} </span>
  },
}
//expand the eleFormulaText to elementals
Object.keys(ElementalData).forEach(eleKey =>
  Object.entries(eleFormulaText).forEach(([key, func]) =>
    Object.defineProperty(FormulaText, `${eleKey}_${key}`, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (obj) => (func)(obj, eleKey),
    })))

const OverrideFormulasText = {
  noelle_burst_atk: {
    formulaText: (options) => (o) => <span>( {f(o, "atk_base")} + {f(o, "atk_weapon")} ) * ( 1 + {f(o, "atk_")} ) + {f(o, "atk")} + {f(o, "def_final")} * {options.value}%</span>,
  }
}

//checks for development
process.env.NODE_ENV === "development" && Object.keys(Formulas).forEach(key => {
  if (!FormulaText[key]) console.error(`Formula "${key}" does not have a corresponding entry in FormulaText`)
})
process.env.NODE_ENV === "development" && Object.keys(Formulas).forEach(key => {
  if (!StatData[key]) console.error(`Formula "${key}" does not have a corresponding entry in StatData`)
})

export {
  FormulaText,
};