import ElementalData from "./Data/ElementalData";
import { ReactionMatrix, Formulas, Modifiers, StatData } from "./StatData";

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

  static getPrintableFormulaStatKeyList = (statList = []) => {
    //remove keys that will be overriden by the modifier
    for (const statKey of statList)
      if (Object.keys(ModifiersText).includes(statKey))
        statList = statList.filter(skey => skey !== Modifiers[statKey].key)
    let formulaKeys = Object.keys(FormulaText)
    let modifiersTextKeys = Object.keys(ModifiersText)
    return statList.filter(statKey => formulaKeys.includes(statKey) || modifiersTextKeys.includes(statKey))
  }

  static printFormula = (statKey, stats, modifiers = {}, expand = true) => {
    if (statKey in ModifiersText)
      return Stat.printModifier(stats, statKey, modifiers[statKey], false)
    return FormulaText?.[statKey] && typeof FormulaText?.[statKey] === "function" &&
      (<span>{FormulaText[statKey]({ stats, expand })}</span>)
  }

  static printModifier = (stats, overrideKey, options, expand = true) =>
    typeof ModifiersText?.[overrideKey]?.formulaText === "function" &&
    (<span>{ModifiersText[overrideKey].formulaText(options)({ stats, expand })}</span>)
}
//generate html tags based on tagged variants of the statData
const htmlStatsData = Object.fromEntries(Object.entries(StatData).filter(([key, obj]) => obj.variant).map(([key, obj]) => [key, (<span className={`text-${obj.variant} text-nowrap`}>{obj.name}</span>)]))

function f(options, statKey) {
  let { stats, expand = true } = options
  if (!stats) return
  if (Modifiers[statKey]) statKey = Modifiers[statKey].key
  if (expand && FormulaText?.[statKey])
    return <span>( {FormulaText[statKey](options)} )</span>
  let statName = Stat.getStatNamePretty(statKey)
  let statUnit = Stat.getStatUnit(statKey)
  let fixedUnit = Stat.fixedUnit(statKey)
  let value = stats?.[statKey]?.toFixed?.(fixedUnit) || stats?.[statKey]
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
  norm_atk_bonus_multi: (o) => <span>( 1 + {f(o, "phy_dmg_bonus")} + {f(o, "norm_atk_dmg_bonus")} + {f(o, "all_dmg_bonus")} )</span>,

  //CHARGED
  char_atk_dmg: (o) => <span>{f(o, "atk_final")} * {f(o, "char_atk_bonus_multi")} * {f(o, "enemy_level_multi")} * {f(o, "enemy_phy_res_multi")}</span>,
  char_atk_crit_dmg: (o) => <span>{f(o, "char_atk_dmg")} * {f(o, "crit_dmg_multi")}</span>,
  char_atk_avg_dmg: (o) => <span>{f(o, "char_atk_dmg")} * {f(o, "char_atk_crit_multi")}</span>,
  char_atk_crit_multi: (o) => <span>( 1 + Min[( {f(o, "crit_rate")} + {f(o, "char_atk_crit_rate")} ), 100%] * {f(o, "crit_dmg")} )</span>,
  char_atk_bonus_multi: (o) => <span>( 1 + {f(o, "phy_dmg_bonus")} + {f(o, "char_atk_dmg_bonus")} + {f(o, "all_dmg_bonus")} )</span>,

  //PLUNGE
  plunge_dmg: (o) => <span>{f(o, "phy_dmg")}</span>,
  plunge_crit_dmg: (o) => <span>{f(o, "phy_crit_dmg")}</span>,
  plunge_avg_dmg: (o) => <span>{f(o, "phy_avg_dmg")}</span>,
  plunge_bonus_multi: (o) => <span>{f(o, "phy_bonus_multi")}</span>,

  phy_dmg: (o) => <span>{f(o, "atk_final")} * {f(o, "phy_bonus_multi")} * {f(o, "enemy_level_multi")} * {f(o, "enemy_phy_res_multi")}</span>,
  phy_crit_dmg: (o) => <span>{f(o, "phy_dmg")} * {f(o, "crit_dmg_multi")}</span>,
  phy_avg_dmg: (o) => <span>{f(o, "phy_dmg")} * {f(o, "crit_multi")}</span>,
  phy_bonus_multi: (o) => <span>( 1 + {f(o, "phy_dmg_bonus")} + {f(o, "all_dmg_bonus")} )</span>,

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

  //Elemental Reactions
  overloaded_dmg: (o) => <span>( 1 + {f(o, "overloaded_dmg_bonus")} ) * {f(o, "ele_mas_multi_y")} * {f(o, "overloaded_multi")} * {f(o, "pyro_enemy_ele_res_multi")}</span>,
  overloaded_multi: (o) => ReactionMatrix.overloaded.map((val, i) => reactionMatrixElementRenderer(o, val, i)),
  electrocharged_dmg: (o) => <span>( 1 + {f(o, "electrocharged_dmg_bonus")} ) * {f(o, "ele_mas_multi_y")} * {f(o, "electrocharged_multi")} * {f(o, "electro_enemy_ele_res_multi")}</span>,
  electrocharged_multi: (o) => ReactionMatrix.electrocharged.map((val, i) => reactionMatrixElementRenderer(o, val, i)),
  superconduct_dmg: (o) => <span>( 1 + {f(o, "superconduct_dmg_bonus")} ) * {f(o, "ele_mas_multi_y")} * {f(o, "superconduct_multi")} * {f(o, "cryo_enemy_ele_res_multi")}</span>,
  superconduct_multi: (o) => ReactionMatrix.superconduct.map((val, i) => reactionMatrixElementRenderer(o, val, i)),
  // burning_dmg:
  swirl_dmg: (o) => <span>( 1 + {f(o, "swirl_dmg_bonus")} ) * {f(o, "ele_mas_multi_y")} * {f(o, "swirl_multi")} * {f(o, "anemo_enemy_ele_res_multi")}</span>,
  swirl_multi: (o) => ReactionMatrix.swirl.map((val, i) => reactionMatrixElementRenderer(o, val, i)),
  shatter_dmg: (o) => <span>( 1 + {f(o, "shatter_dmg_bonus")} ) * {f(o, "ele_mas_multi_y")} * {f(o, "shatter_multi")} * {f(o, "enemy_phy_res_multi")}</span>,
  shatter_multi: (o) => ReactionMatrix.shattered.map((val, i) => reactionMatrixElementRenderer(o, val, i)),
  crystalize_dmg: (o) => <span>( 1 + {f(o, "crystalize_dmg_bonus")} ) * {f(o, "ele_mas_multi_z")} * {f(o, "crystalize_multi")}</span>,
  crystalize_multi: (o) => ReactionMatrix.crystalize.map((val, i) => reactionMatrixElementRenderer(o, val, i)),

  pyro_vaporize_multi: (o) => <span>( 1 + {f(o, "vaporize_dmg_bonus")} ) * {f(o, "ele_mas_multi_x")} * 1.5 * {f(o, "amp_reaction_base_multi")}</span>,
  hydro_vaporize_multi: (o) => <span>( 1 + {f(o, "vaporize_dmg_bonus")} ) * {f(o, "ele_mas_multi_x")} * 2 * {f(o, "amp_reaction_base_multi")}</span>,

  pyro_melt_multi: (o) => <span>( 1 + {f(o, "melt_dmg_bonus")} ) * {f(o, "ele_mas_multi_x")} * 2 * {f(o, "amp_reaction_base_multi")}</span>,
  cryo_melt_multi: (o) => <span>( 1 + {f(o, "melt_dmg_bonus")} ) * {f(o, "ele_mas_multi_x")} * 1.5 * {f(o, "amp_reaction_base_multi")}</span>,
  amp_reaction_base_multi: (o) => <span>1 + 0.189266831 * {f(o, "ele_mas")} * exp^(-0.000505 * {f(o, "ele_mas")}) / 100 </span>,

  ele_mas_multi_x: (o) => <span> 1 + (25 / 9 * {f(o, "ele_mas")} / (1401 + {f(o, "ele_mas")} ))</span>,
  ele_mas_multi_y: (o) => <span> 1 + (60 / 9 * {f(o, "ele_mas")} / (1401 + {f(o, "ele_mas")} ))</span>,
  ele_mas_multi_z: (o) => <span> 1 + (40 / 9 * {f(o, "ele_mas")} / (1401 + {f(o, "ele_mas")} ))</span>,
}
function reactionMatrixElementRenderer(o, val, i) {
  let sign = val < 0 ? " - " : " + ";
  let disVal = Math.abs(val)
  let powerText = ""
  if (i > 1) powerText = <span> * ( {f(o, "char_level")} )^{i}</span>
  if (i === 1) powerText = <span> * {f(o, "char_level")}</span>
  return <span key={i}>{sign}{disVal}{powerText}</span>
}

//Add Vaporize and Melt stats
[["pyro_vaporize", "pyro"], ["hydro_vaporize", "hydro"], ["pyro_melt", "pyro"], ["cryo_melt", "cryo"]].forEach(([reactionKey, baseEle]) => {
  [["norm_atk", "Nomal Attack"], ["char_atk", "Charged Attack"], ["plunge", "Plunging Attack"], ["skill", "Ele. Skill"], ["burst", "Ele. Burst"], ["ele", "Elemental"]].forEach(([atkType, atkTypeName]) =>
    ["dmg", "avg_dmg", "crit_dmg"].forEach(dmgMode => {
      let reactionDMGKey = `${reactionKey}_${atkType}_${dmgMode}`
      let baseDmg = `${baseEle}_${atkType}_${dmgMode}`
      FormulaText[reactionDMGKey] = (o) => <span>{f(o, `${reactionKey}_multi`)} * {f(o, baseDmg)}</span>
    }));
});
const eleFormulaText = {
  norm_atk_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_norm_atk_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  norm_atk_crit_dmg: (o, ele) => <span>{f(o, `${ele}_norm_atk_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  norm_atk_avg_dmg: (o, ele) => <span>{f(o, `${ele}_norm_atk_dmg`)} * {f(o, `norm_atk_crit_multi`)}</span>,
  norm_atk_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `norm_atk_dmg_bonus`)} + {f(o, `all_dmg_bonus`)} )</span>,

  char_atk_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_char_atk_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  char_atk_crit_dmg: (o, ele) => <span>{f(o, `${ele}_char_atk_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  char_atk_avg_dmg: (o, ele) => <span>{f(o, `${ele}_char_atk_dmg`)} * {f(o, `char_atk_crit_multi`)}</span>,
  char_atk_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `char_atk_dmg_bonus`)} + {f(o, `all_dmg_bonus`)} )</span>,

  plunge_dmg: (o, ele) => <span>{f(o, `${ele}_ele_dmg`)}</span>,
  plunge_crit_dmg: (o, ele) => <span>{f(o, `${ele}_ele_crit_dmg`)}</span>,
  plunge_avg_dmg: (o, ele) => <span>{f(o, `${ele}_ele_avg_dmg`)}</span>,
  plunge_bonus_multi: (o, ele) => <span>{f(o, `${ele}_ele_bonus_multi`)}</span>,

  ele_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_ele_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  ele_crit_dmg: (o, ele) => <span>{f(o, `${ele}_ele_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  ele_avg_dmg: (o, ele) => <span>{f(o, `${ele}_ele_dmg`)} * {f(o, `crit_multi`)}</span>,
  ele_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `all_dmg_bonus`)} )</span>,

  skill_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_skill_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  skill_crit_dmg: (o, ele) => <span>{f(o, `${ele}_skill_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  skill_avg_dmg: (o, ele) => <span>{f(o, `${ele}_skill_dmg`)} * {f(o, `skill_crit_multi`)}</span>,
  skill_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `skill_dmg_bonus`)} + {f(o, `all_dmg_bonus`)} )</span>,

  burst_dmg: (o, ele) => <span>{f(o, `atk_final`)} * {f(o, `${ele}_burst_bonus_multi`)} * {f(o, `enemy_level_multi`)} * {f(o, `${ele}_enemy_ele_res_multi`)}</span>,
  burst_crit_dmg: (o, ele) => <span>{f(o, `${ele}_burst_dmg`)} * {f(o, `crit_dmg_multi`)}</span>,
  burst_avg_dmg: (o, ele) => <span>{f(o, `${ele}_burst_dmg`)} * {f(o, `burst_crit_multi`)}</span>,
  burst_bonus_multi: (o, ele) => <span>( 1 + {f(o, `${ele}_ele_dmg_bonus`)} + {f(o, `burst_dmg_bonus`)} + {f(o, `all_dmg_bonus`)} )</span>,

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

const ModifiersText = {
  noelle_burst_atk: {
    formulaText: (options) => (o) => <span>( {f(o, "atk_base")} + {f(o, "atk_weapon")} ) * ( 1 + {f(o, "atk_")} ) + {f(o, "atk")} + {f(o, "def_final")} * {options.sweep_multiplier * 100}%</span>,
  },
  mona_passive2_hydro_ele_dmg_bonus: {
    formulaText: () => (o) => <span>{f(o, "hydro_ele_dmg_bonus")} + {f(o, "ener_rech")} * 20%</span>,
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
  ModifiersText,
};
