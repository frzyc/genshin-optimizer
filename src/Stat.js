import ElementalData from "./Data/ElementalData";
import { deepClone } from "./Util/Util";

export default class Stat {
  //do not instantiate.
  constructor() {
    if (this instanceof Stat)
      throw Error('A static class cannot be instantiated.');
  }
  static getStatName = (key, defVal = "") =>
    StatData[key]?.name || defVal;
  static getStatNameWithPercent = (key, defVal = "") => {
    let name = this.getStatName(key, defVal)
    if (name !== defVal && (key === "hp_" || key === "atk_" || key === "def_"))
      name += "%"
    return name;
  }
  static getStatUnit = (key, defVal = "") =>
    StatData[key]?.unit === "multi" ? defVal : (StatData[key]?.unit || defVal)

  static fixedUnit = (key) => {
    if (StatData[key]?.unit === "multi") return 3
    let unit = Stat.getStatUnit(key)
    return unit === "%" ? 1 : 0
  }
}
const StatData = {
  //HP
  base_hp: { name: "Base HP" },
  hp: { name: "HP" },
  hp_flat: { name: "Flat HP" },
  hp_: { name: "HP", unit: "%" },
  //ATK
  base_atk: { name: "Base ATK" },//character atk + weapon atk
  atk: { name: "ATK", },
  atk_flat: { name: "Flat HP" },
  atk_: { name: "ATK", unit: "%" },
  //DEF
  base_def: { name: "Base DEF" },
  def: { name: "DEF", },
  def_flat: { name: "Flat HP" },
  def_: { name: "DEF", unit: "%" },

  phy_dmg: { name: "Physical DMG Bonus", unit: "%" },
  phy_res: { name: "Physical RES", unit: "%" },
  phy_avg_dmg: { name: "Physical Avg. DMG" },
  ele_dmg: { name: "DMG Bonus", unit: "%" },//will expact to "Anemo DMG Bonus" DONT CHANGE needed for screenshot parsing
  ele_res: { name: "DMG RES", unit: "%" },//will expact to "Anemo DMG RES"
  ele_mas: { name: "Elemental Mastery", },
  ele_avg_dmg: { name: "Elemental Avg. DMG" },
  ener_rech: { name: "Energy Recharge", unit: "%" },
  crit_rate: { name: "Crit Rate", unit: "%" },
  crit_dmg: { name: "Crit DMG", unit: "%" },
  heal_bonu: { name: "Healing Bonus", unit: "%" },
  stam: { name: "Stamina" },
  inc_heal: { name: "Incoming Healing Bonus", unit: "%" },
  pow_shield: { name: "Powerful Shield", unit: "%" },
  red_cd: { name: "Reduce CD", unit: "%" },
  //auto
  norm_atk_dmg: { name: "Normal Attack DMG", unit: "%" },
  char_atk_dmg: { name: "Charged Attack DMG", unit: "%" },
  norm_atk_crit_rate: { name: "Nomral Attack CRIT Rate", unit: "%" },
  char_atk_crit_rate: { name: "Charged Attack CRIT Rate", unit: "%" },
  normal_atk_crit_multi: { name: "Normal Attack Crit Multiplier", unit: "multi" },
  char_atk_crit_multi: { name: "Charged Attack Crit Multiplier", unit: "multi" },
  norm_atk_bonus_dmg: { name: "Normal Attack Bonus DMG Muitiplier", unit: "multi" },
  char_atk_bonus_dmg: { name: "Charged Attack Bonus DMG Muitiplier", unit: "multi" },
  norm_atk_avg_dmg: { name: "Normal Attack DMG" },
  char_atk_avg_dmg: { name: "Charged Attack DMG" },
  //skill
  skill_dmg: { name: "Ele. Skill DMG", unit: "%" },
  burst_dmg: { name: "Ele. Burst DMG", unit: "%" },
  skill_crit_rate: { name: "Ele. Skill CRIT Rate", unit: "%" },
  burst_crit_rate: { name: "Ele. Burst CRIT Rate", unit: "%" },
  skill_crit_multi: { name: "Ele. Skill Crit Multiplier", unit: "multi" },
  burst_crit_multi: { name: "Ele. Burst Crit Multiplier", unit: "multi" },
  skill_bonus_dmg: { name: "Ele. Skill Bonus DMG Muitiplier", unit: "multi" },
  burst_bonus_dmg: { name: "Ele. Burst Bonus DMG Muitiplier", unit: "multi" },
  skill_cd_red: { name: "Ele. Skill CD Red.", unit: "%" },
  burst_cd_red: { name: "Ele. Burst CD Red.", unit: "%" },
  skill_avg_dmg: { name: "Ele. Skill DMG" },
  burst_avg_dmg: { name: "Ele. Burst DMG" },

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
};

//formulas for calculating
const Formulas = {
  char_ele_key: () => 'anemo', //default value
  hp: (s) => s.base_hp * (1 + s.hp_ / 100) + s.hp_flat,
  //ATK
  atk: (s) => s.base_atk * (1 + s.atk_ / 100) + s.atk_flat,
  //DEF
  def: (s) => s.base_def * (1 + s.def_ / 100) + s.def_flat,
  //PHYSICAL, used mainly for plunge dmg
  phy_avg_dmg: (s) => s.atk * s.crit_multi * (1 + (s.phy_dmg + s.dmg) / 100),

  //NORMAL
  norm_atk_avg_dmg: (s) => s.atk * s.normal_atk_crit_multi * s.norm_atk_bonus_dmg,
  normal_atk_crit_multi: (s) => (1 + ((s.crit_rate + s.norm_atk_crit_rate) / 100) * s.crit_dmg / 100),
  norm_atk_bonus_dmg: (s) => (1 + (s.phy_dmg + s.norm_atk_dmg + s.dmg) / 100),

  //CHARGED
  char_atk_avg_dmg: (s) => s.atk * s.char_atk_crit_multi * s.char_atk_bonus_dmg,
  char_atk_crit_multi: (s) => (1 + ((s.crit_rate + s.char_atk_crit_rate) / 100) * s.crit_dmg / 100),
  char_atk_bonus_dmg: (s) => (1 + (s.phy_dmg + s.char_atk_dmg + s.dmg) / 100),


  crit_multi: (s) => (1 + (s.crit_rate / 100) * (s.crit_dmg / 100)),

  skill_crit_multi: (s) => (1 + ((s.crit_rate + s.skill_crit_rate) / 100) * s.crit_dmg / 100),
  burst_crit_multi: (s) => (1 + ((s.crit_rate + s.burst_crit_rate) / 100) * s.crit_dmg / 100),
}
//The formulas here will generate formulas for every element, for example pyro_skill_avg_dmg from skill_avg_dmg
const eleFormulas = {
  norm_atk_avg_dmg: (s, ele) => s.atk * s.normal_atk_crit_multi * s[`${ele}_norm_atk_bonus_dmg`],
  norm_atk_bonus_dmg: (s, ele) => (1 + (s[`${ele}_ele_dmg`] + s.norm_atk_dmg + s.dmg) / 100),

  char_atk_avg_dmg: (s, ele) => s.atk * s.char_atk_crit_multi * s[`${ele}_char_atk_bonus_dmg`],
  char_atk_bonus_dmg: (s, ele) => (1 + (s[`${ele}_ele_dmg`] + s.char_atk_dmg + s.dmg) / 100),

  skill_avg_dmg: (s, ele) => s.atk * s.skill_crit_multi * s[`${ele}_skill_bonus_dmg`],
  skill_bonus_dmg: (s, ele) => (1 + (s[`${ele}_ele_dmg`] + s.skill_dmg + s.dmg) / 100),

  burst_avg_dmg: (s, ele) => s.atk * s.burst_crit_multi * s[`${ele}_burst_bonus_dmg`],
  burst_bonus_dmg: (s, ele) => (1 + (s[`${ele}_ele_dmg`] + s.burst_dmg + s.dmg) / 100),

  ele_avg_dmg: (s, ele) => s.atk * s.crit_multi * (1 + s[`${ele}_ele_dmg`] / 100) * (1 + s.dmg / 100),//TODO is this used anywhere?
};

//add Elemental entries to stats. we use the keys from eleFormulas before it gets expanded to elementals
["ele_dmg", "ele_res", ...Object.keys(eleFormulas)].forEach(key => {
  let obj = StatData[key]
  Object.keys(ElementalData).forEach(eleKey => {
    let ele_key = `${eleKey}_${key}`
    StatData[ele_key] = deepClone(obj)
    StatData[ele_key].name = `${ElementalData[eleKey].name} ${obj.name}`
  })
  // delete StatData[key]
})

//expant the eleFormulas to elementals
Object.entries(eleFormulas).forEach(([key, func]) =>
  Object.keys(ElementalData).forEach(eleKey =>
    Object.defineProperty(Formulas, `${eleKey}_${key}`, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (obj) => (func)(obj, eleKey),
    })))

const OverrideFormulas = {
  noelle_burst_atk: {
    key: "atk",
    formula: (options) => (s) => s.base_atk * (1 + s.atk_ / 100) + s.atk_flat + s.def * (options.value / 100),
    dependency: ["base_atk", "atk_", "atk_flat", "base_def", "def_", "def_flat"]
  }
}

//the keyfilters are used by build generator to reduce the amount of calculations required
function AttachLazyFormulas(obj, options = {}) {
  let { formulaKeys = Object.keys(Formulas), statKeys = Object.keys(StatData) } = options;
  let { formulaOverrides = [] } = obj;
  //need to rename the hp,atk,def keys, because they will be the final stat
  ["hp", "atk", "def"].forEach(key => {
    obj.hasOwnProperty(key) && Object.defineProperty(obj, `${key}_flat`,
      Object.getOwnPropertyDescriptor(obj, key));
    delete obj[key];
  })
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
  //assign zeros to the other stats that are not part of the calculations
  statKeys.forEach(key => !obj.hasOwnProperty(key) && (obj[key] = 0))
}

export {
  Formulas,
  OverrideFormulas,
  StatData,
  AttachLazyFormulas,
}