import ElementalData from "./Data/ElementalData";
import { clamp, deepClone } from "./Util/Util";

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

  static printFormula = (statKey, stats, expand = true) =>
    FormulaText?.[statKey] && typeof FormulaText?.[statKey] === "function" &&
    (<span>{FormulaText[statKey]({ stats, expand })}</span>)

  static printOverrideFormula = (stats, overrideKey, options, expand = true) =>
    OverrideFormulas?.[overrideKey] && typeof OverrideFormulas?.[overrideKey].formulaText === "function" &&
    (<span>{OverrideFormulas[overrideKey].formulaText(options)({ stats, expand })}</span>)

}
const StatData = {
  //HP
  hp_base: { name: "HP", pretty: "HP Base" },
  hp: { name: "HP", pretty: "HP Flat" },//flat hp
  hp_: { name: "HP", unit: "%", pretty: "HP Percent" },
  hp_final: { name: "HP", pretty: "HP Final" },
  //ATK
  atk_base: { name: "ATK", pretty: "ATK Base" },//character atk + weapon atk
  atk: { name: "ATK", pretty: "ATK Flat" },
  atk_: { name: "ATK", unit: "%", pretty: "ATK Percent" },
  atk_final: { name: "ATK", pretty: "ATK Final" },
  atk_weapon: { name: "Weapon ATK", pretty: "ATK Weapon" },
  //DEF
  def_base: { name: "DEF", pretty: "DEF Base" },
  def: { name: "DEF", pretty: "DEF Flat" },
  def_: { name: "DEF", unit: "%", pretty: "DEF Percent" },
  def_final: { name: "DEF", pretty: "DEF Final" },

  phy_dmg_bonus: { name: "Physical DMG Bonus", unit: "%" },
  phy_res: { name: "Physical RES", unit: "%" },
  ele_dmg_bonus: { name: "DMG Bonus", unit: "%" },//will expand to "Anemo DMG Bonus" DONT CHANGE needed for screenshot parsing
  ele_res: { name: "DMG RES", unit: "%" },//will expand to "Anemo DMG RES"
  ele_mas: { name: "Elemental Mastery", },
  ener_rech: { name: "Energy Recharge", unit: "%" },
  crit_rate: { name: "CRIT Rate", unit: "%" },
  crit_dmg: { name: "CRIT DMG", unit: "%" },
  heal_bonu: { name: "Healing Bonus", unit: "%" },
  stam: { name: "Stamina" },
  inc_heal: { name: "Incoming Healing Bonus", unit: "%" },
  pow_shield: { name: "Powerful Shield", unit: "%" },
  red_cd: { name: "Reduce CD", unit: "%" },

  //auto
  norm_atk_dmg: { name: "Normal Attack DMG" },
  char_atk_dmg: { name: "Charged Attack DMG" },
  plunge_dmg: { name: "Plunging Attack DMG" },
  norm_atk_crit_dmg: { name: "Normal Attack CRIT Hit DMG" },
  char_atk_crit_dmg: { name: "Charged Attack CRIT Hit DMG" },
  plunge_crit_dmg: { name: "Plunging Attack CRIT Hit DMG" },
  norm_atk_avg_dmg: { name: "Normal Attack Avg. DMG" },
  char_atk_avg_dmg: { name: "Charged Attack Avg. DMG" },
  plunge_avg_dmg: { name: "Plunging Attack Avg. DMG" },
  norm_atk_dmg_bonus: { name: "Normal Attack DMG Bonus", unit: "%" },
  char_atk_dmg_bonus: { name: "Charged Attack DMG Bonus", unit: "%" },
  norm_atk_crit_rate: { name: "Nomral Attack CRIT Rate", unit: "%" },
  char_atk_crit_rate: { name: "Charged Attack CRIT Rate", unit: "%" },
  norm_atk_crit_multi: { name: "Normal Attack Crit Multiplier", unit: "multi" },
  char_atk_crit_multi: { name: "Charged Attack Crit Multiplier", unit: "multi" },
  norm_atk_bonus_multi: { name: "Normal Attack Bonus DMG Multiplier", unit: "multi" },
  char_atk_bonus_multi: { name: "Charged Attack Bonus DMG Multiplier", unit: "multi" },
  plunge_bonus_multi: { name: "Plunging Attack Bonus DMG Multiplier", unit: "multi" },

  //skill
  skill_dmg: { name: "Ele. Skill DMG" },
  burst_dmg: { name: "Ele. Burst DMG" },
  skill_crit_dmg: { name: "Ele. Skill CRIT Hit DMG" },
  burst_crit_dmg: { name: "Ele. Burst CRIT Hit DMG" },
  skill_avg_dmg: { name: "Ele. Skill Avg. DMG" },
  burst_avg_dmg: { name: "Ele. Burst Avg. DMG" },
  skill_dmg_bonus: { name: "Ele. Skill DMG Bonus", unit: "%" },
  burst_dmg_bonus: { name: "Ele. Burst DMG Bonus", unit: "%" },
  skill_crit_rate: { name: "Ele. Skill CRIT Rate", unit: "%" },
  burst_crit_rate: { name: "Ele. Burst CRIT Rate", unit: "%" },
  skill_crit_multi: { name: "Ele. Skill Crit Multiplier", unit: "multi" },
  burst_crit_multi: { name: "Ele. Burst Crit Multiplier", unit: "multi" },
  skill_bonus_multi: { name: "Ele. Skill Bonus DMG Multiplier", unit: "multi" },
  burst_bonus_multi: { name: "Ele. Burst Bonus DMG Multiplier", unit: "multi" },
  skill_cd_red: { name: "Ele. Skill CD Red.", unit: "%" },
  burst_cd_red: { name: "Ele. Burst CD Red.", unit: "%" },

  phy_dmg: { name: "Physical Attack DMG" },
  phy_crit_dmg: { name: "Physical Attack CRIT Hit DMG" },
  phy_avg_dmg: { name: "Physical Attack Avg. DMG" },
  phy_bonus_multi: { name: "Physical Attack Bonus DMG Multiplier", unit: "multi" },

  ele_dmg: { name: "Elemental Attack DMG" },
  ele_crit_dmg: { name: "Elemental Attack CRIT Hit DMG" },
  ele_avg_dmg: { name: "Elemental Attack Avg. DMG" },
  ele_bonus_multi: { name: "Elemental Attack Bonus DMG Multiplier", unit: "multi" },

  crit_dmg_multi: { name: "Crit Hit Multiplier", unit: "multi" },
  crit_multi: { name: "Crit Multiplier", unit: "multi" },
  dmg: { name: "All DMG", unit: "%" },//general all damage increase
  move_spd: { name: "Movement SPD", unit: "%" },
  atk_spd: { name: "ATK SPD", unit: "%" },
  weakspot_dmg: { name: "Weakspot DMG", unit: "%" },
  stamina_dec: { name: "Stamina Consumption Dec.", unit: "%" },
  stamina_gliding_dec: { name: "Gliding Stamina Consumption Dec.", unit: "%" },
  stamina_charged_dec: { name: "Charged Attack Stamina Consumption Dec.", unit: "%" },
  //elemental
  overloaded_dmg: { name: "Overloaded DMG", unit: "%" },
  electro_charged_dmg: { name: "Electro-Charged DMG", unit: "%" },
  superconduct_dmg: { name: "Superconduct DMG", unit: "%" },
  burning_dmg: { name: "Overloaded DMG", unit: "%" },
  vaporize_dmg: { name: "Vaporize DMG", unit: "%" },
  melt_dmg: { name: "Melt DMG", unit: "%" },
  swirl_dmg: { name: "Swirl DMG", unit: "%" },

  //character stuff
  char_ele_key: { name: "Character Element Key", default: "anemo" },
  char_level: { name: "Character Level", default: 1 },
  //enemy
  enemy_level: { name: "Enemy Level" },
  enemy_level_multi: { name: "Enemy Level Multiplier", unit: "multi" },
  //enemy resistance and stuff
  enemy_phy_res: { name: "Enemy Physical RES", unit: "%", default: 10 },
  enemy_phy_res_multi: { name: "Enemy Physical RES Multiplier", unit: "multi" },
  enemy_phy_immunity: { name: "Enemy Physical Immunity", default: false },
  enemy_ele_res: { name: "Enemy Elemental RES", unit: "%", default: 10 },
  enemy_ele_res_multi: { name: "Enemy Elemental RES Multiplier", unit: "multi" },
  enemy_ele_immunity: { name: "Enemy Elemental Immunity", default: false },
};

//formulas for calculating
const Formulas = {
  //HP
  hp_final: (s) => s.hp_base * (1 + s.hp_ / 100) + s.hp,
  //ATK
  atk_final: (s) => (s.atk_base + s.atk_weapon) * (1 + s.atk_ / 100) + s.atk,
  //DEF
  def_final: (s) => s.def_base * (1 + s.def_ / 100) + s.def,

  //NORMAL
  norm_atk_dmg: (s) => s.atk_final * s.norm_atk_bonus_multi * s.enemy_level_multi * s.enemy_phy_res_multi,
  norm_atk_crit_dmg: (s) => s.norm_atk_dmg * s.crit_dmg_multi,
  norm_atk_avg_dmg: (s) => s.norm_atk_dmg * s.norm_atk_crit_multi,
  norm_atk_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.norm_atk_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),
  norm_atk_bonus_multi: (s) => (1 + (s.phy_dmg_bonus + s.norm_atk_dmg_bonus + s.dmg) / 100),

  //CHARGED
  char_atk_dmg: (s) => s.atk_final * s.char_atk_bonus_multi * s.enemy_level_multi * s.enemy_phy_res_multi,
  char_atk_crit_dmg: (s) => s.char_atk_dmg * s.crit_dmg_multi,
  char_atk_avg_dmg: (s) => s.char_atk_dmg * s.char_atk_crit_multi,
  char_atk_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.char_atk_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),
  char_atk_bonus_multi: (s) => (1 + (s.phy_dmg_bonus + s.char_atk_dmg_bonus + s.dmg) / 100),

  //PLUNGE
  plunge_dmg: (s) => s.phy_dmg,
  plunge_crit_dmg: (s) => s.phy_crit_dmg,
  plunge_avg_dmg: (s) => s.phy_avg_dmg,
  plunge_bonus_multi: (s) => s.phy_bonus_multi,

  phy_dmg: (s) => s.atk_final * s.phy_bonus_multi * s.enemy_level_multi * s.enemy_phy_res_multi,
  phy_crit_dmg: (s) => s.phy_dmg * s.crit_dmg_multi,
  phy_avg_dmg: (s) => s.phy_dmg * s.crit_multi,
  phy_bonus_multi: (s) => (1 + (s.phy_dmg_bonus + s.dmg) / 100),

  crit_dmg_multi: (s) => (1 + s.crit_dmg / 100),
  crit_multi: (s) => (1 + (clamp(s.crit_rate, 0, 100) / 100) * (s.crit_dmg / 100)),

  skill_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.skill_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),
  burst_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.burst_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),

  enemy_level_multi: (s) => (100 + s.char_level) / (100 + s.enemy_level + 100 + s.char_level),
  enemy_phy_res_multi: (s) => s.enemy_phy_immunity ? 0 : resMultiplier(s.enemy_phy_res)
}
function resMultiplier(res) {
  res = res / 100
  if (res < 0) return 1 - res / 2
  else if (res >= 0.75) return 1 / (res * 4 + 1)
  return 1 - res
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

//The formulas here will generate formulas for every element, for example pyro_skill_avg_dmg from skill_avg_dmg
const eleFormulas = {
  norm_atk_dmg: (s, ele) => s.atk_final * s[`${ele}_norm_atk_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  norm_atk_crit_dmg: (s, ele) => s[`${ele}_norm_atk_dmg`] * s.crit_dmg_multi,
  norm_atk_avg_dmg: (s, ele) => s[`${ele}_norm_atk_dmg`] * s.norm_atk_crit_multi,
  norm_atk_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.norm_atk_dmg_bonus + s.dmg) / 100),

  char_atk_dmg: (s, ele) => s.atk_final * s[`${ele}_char_atk_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  char_atk_crit_dmg: (s, ele) => s[`${ele}_char_atk_dmg`] * s.crit_dmg_multi,
  char_atk_avg_dmg: (s, ele) => s[`${ele}_char_atk_dmg`] * s.char_atk_crit_multi,
  char_atk_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.char_atk_dmg_bonus + s.dmg) / 100),

  plunge_dmg: (s, ele) => s[`${ele}_ele_dmg`],
  plunge_crit_dmg: (s, ele) => s[`${ele}_ele_crit_dmg`],
  plunge_avg_dmg: (s, ele) => s[`${ele}_ele_avg_dmg`],
  plunge_bonus_multi: (s, ele) => s[`${ele}_ele_bonus_multi`],

  ele_dmg: (s, ele) => s.atk_final * s[`${ele}_ele_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  ele_crit_dmg: (s, ele) => s[`${ele}_ele_dmg`] * s.crit_dmg_multi,
  ele_avg_dmg: (s, ele) => s[`${ele}_ele_dmg`] * s.crit_multi,
  ele_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.dmg) / 100),

  skill_dmg: (s, ele) => s.atk_final * s[`${ele}_skill_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  skill_crit_dmg: (s, ele) => s[`${ele}_skill_dmg`] * s.crit_dmg_multi,
  skill_avg_dmg: (s, ele) => s[`${ele}_skill_dmg`] * s.skill_crit_multi,
  skill_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.skill_dmg_bonus + s.dmg) / 100),

  burst_dmg: (s, ele) => s.atk_final * s[`${ele}_burst_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  burst_crit_dmg: (s, ele) => s[`${ele}_burst_dmg`] * s.crit_dmg_multi,
  burst_avg_dmg: (s, ele) => s[`${ele}_burst_dmg`] * s.burst_crit_multi,
  burst_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.burst_dmg_bonus + s.dmg) / 100),

  enemy_ele_res_multi: (s, ele) => s[`${ele}_enemy_ele_immunity`] ? 0 : resMultiplier(s[`${ele}_enemy_ele_res`]),
};
//add html text to physical related stuff with html elements.
[
  "phy_dmg_bonus", "phy_res", "enemy_phy_res", "enemy_phy_immunity", "phy_dmg", "phy_crit_dmg", "phy_avg_dmg", "phy_bonus_multi",
  ...Object.keys(StatData).filter(key => ["norm_atk", "char_atk", "plunge"].some(str => key.includes(str))),
].forEach(key => {
  StatData[key].html = <span className="text-physical text-nowrap">{StatData[key].name}</span>
  StatData[key].variant = "physical"
});
//add Elemental entries to stats. we use the keys from eleFormulas before it gets expanded to elementals
["ele_dmg_bonus", "ele_res", "enemy_ele_res", "enemy_ele_immunity", ...Object.keys(eleFormulas)].forEach(key => {
  let obj = StatData[key]
  Object.keys(ElementalData).forEach(eleKey => {
    let ele_key = `${eleKey}_${key}`
    StatData[ele_key] = deepClone(obj)
    if (key === "enemy_ele_res")
      StatData[ele_key].name = `Enemy ${ElementalData[eleKey].name} RES`
    else if (key === "enemy_ele_res_multi")
      StatData[ele_key].name = `Enemy ${ElementalData[eleKey].name} RES Multiplier`
    else if (key === "enemy_ele_immunity")
      StatData[ele_key].name = `Enemy ${ElementalData[eleKey].name} Immunity`
    else
    StatData[ele_key].name = `${ElementalData[eleKey].name} ${obj.name}`
    StatData[ele_key].html = <span className={`text-${eleKey} text-nowrap`}>{StatData[ele_key].name}</span>
    StatData[ele_key].variant = eleKey
  })
  // delete StatData[key]
})

//expand the eleFormulas to elementals
Object.entries(eleFormulas).forEach(([key, func]) =>
  Object.keys(ElementalData).forEach(eleKey =>
    Object.defineProperty(Formulas, `${eleKey}_${key}`, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (obj) => (func)(obj, eleKey),
    })))

//checks for development
process.env.NODE_ENV === "development" && Object.keys(Formulas).forEach(key => {
  if (!FormulaText[key]) console.error(`Formula "${key}" does not have a corresponding entry in FormulaText`)
})
process.env.NODE_ENV === "development" && Object.keys(Formulas).forEach(key => {
  if (!StatData[key]) console.error(`Formula "${key}" does not have a corresponding entry in StatData`)
})

const OverrideFormulas = {
  noelle_burst_atk: {
    key: "atk_final",
    formula: (options) => (s) => (s.atk_base + s.atk_weapon) * (1 + s.atk_ / 100) + s.atk + s.def_final * (options.value / 100),
    dependency: ["atk_base", "atk_weapon", "atk_", "atk", "def_final", "def_base", "def_", "def"],
    formulaText: (options) => (o) => <span>( {f(o, "atk_base")} + {f(o, "atk_weapon")} ) * ( 1 + {f(o, "atk_")} ) + {f(o, "atk")} + {f(o, "def_final")} * {options.value}%</span>,
  }
}

//the keyfilters are used by build generator to reduce the amount of calculations required
function AttachLazyFormulas(obj, options = {}) {
  let { formulaKeys = Object.keys(Formulas), statKeys = Object.keys(StatData) } = options;
  let { formulaOverrides = [] } = obj;
  formulaOverrides.forEach(formulaOverride => {
    let { key: overrideFormulaKey, options } = formulaOverride
    let { key, formula } = OverrideFormulas[overrideFormulaKey] || {}
    if (!formulaKeys.includes(key)) return
    formula = formula(options)
    Object.defineProperty(obj, key, {
      get: options.formulaKeys ? () => formula(obj) : function () {
        let val = formula(obj)
        Object.defineProperty(this, key, { value: val })
        return val
      },
      configurable: true
    })
  })

  formulaKeys.forEach(key => {
    !obj.hasOwnProperty(key) && Object.defineProperty(obj, key, {
      get: options.formulaKeys ? () => Formulas[key](obj) : function () {
        let val = Formulas[key](obj)
        Object.defineProperty(this, key, { value: val })
        return val
      },
      configurable: true
    })
  })
  //assign zeros or default values to the other stats that are not part of the calculations
  statKeys.forEach(key => !obj.hasOwnProperty(key) && (obj[key] = StatData[key].default || 0))
}

export {
  Formulas,
  OverrideFormulas,
  StatData,
  AttachLazyFormulas,
  FormulaText,
}