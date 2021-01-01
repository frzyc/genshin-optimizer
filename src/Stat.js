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
    StatData[key]?.unit || defVal
  static fixedUnit = (key) => {
    if (key === "crit_multi") return 3
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
  ele_dmg: { name: "Elemental DMG Bonus", unit: "%" },
  ele_res: { name: "Elemental DMG RES", unit: "%" },
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
  norm_atk_avg_dmg: { name: "Normal Attack Avg. DMG" },
  char_atk_avg_dmg: { name: "Charged Attack Avg. DMG" },
  //skill
  skill_dmg: { name: "Ele. Skill DMG", unit: "%" },
  burst_dmg: { name: "Ele. Burst DMG", unit: "%" },
  skill_crit_rate: { name: "Ele. Skill CRIT Rate", unit: "%" },
  burst_crit_rate: { name: "Ele. Burst CRIT Rate", unit: "%" },
  skill_cd_red: { name: "Ele. Skill CD Red.", unit: "%" },
  burst_cd_red: { name: "Ele. Burst CD Red.", unit: "%" },
  skill_avg_dmg: { name: "Ele. SKill Avg. DMG" },
  burst_avg_dmg: { name: "Ele. Burst Avg. DMG" },

  crit_multi: { name: "Crit Multiplier" },
  dmg: { name: "All DMG", unit: "%" },//general all damage increase
  move_spd: { name: "Movement SPD", unit: "%" },
  atk_spd: { name: "ATK SPD", unit: "%" },
  weakspot_dmg: { name: "Weakspot DMG", unit: "%" },
  stamina_dec: { name: "Stamina Consmption Dec.", unit: "%" },
  //elemental
  overloaded_dmg: { name: "Overloaded DMG", unit: "%" },
  electro_charged_dmg: { name: "Electro-Charged DMG", unit: "%" },
  superconduct_dmg: { name: "Superconduct DMG", unit: "%" },
  burning_dmg: { name: "Overloaded DMG", unit: "%" },
  vaporize_dmg: { name: "Vaporize DMG", unit: "%" },
  melt_dmg: { name: "Melt DMG", unit: "%" },
  swirl_dmg: { name: "Swirl DMG", unit: "%" },
};
//add Elemental entries to replace ele_dmg, ele_res,ele_avg_dmg
["ele_dmg", "ele_res", "ele_avg_dmg"].forEach(key => {
  let obj = StatData[key]
  Object.entries(ElementalData).forEach(([eleKey, val]) => {
    let ele_key = `${eleKey}_${key}`
    StatData[ele_key] = deepClone(obj)
    StatData[ele_key].name = `${ElementalData[eleKey].name} ${obj.name}`
  })
  delete StatData[key]
})

//formulas for calculating
const Formulas = {
  char_ele_key: () => 'anemo', //default value
  hp: (s) => s.base_hp * (1 + s.hp_ / 100) + s.hp_flat,
  //ATK
  atk: (s) => s.base_atk * (1 + s.atk_ / 100) + s.atk_flat,
  //DEF
  def: (s) => s.base_def * (1 + s.def_ / 100) + s.def_flat,
  //PHYSICAL
  phy_avg_dmg: (s) => s.atk * s.crit_multi * (1 + s.phy_dmg / 100) * (1 + s.dmg / 100),

  //auto
  norm_atk_avg_dmg: (s) => s.atk * (1 + (s.crit_rate + s.norm_atk_crit_rate) / 100) * (1 + s.crit_dmg / 100) * (1 + s.phy_dmg / 100) * (1 + s.norm_atk_dmg / 100) * (1 + s.dmg / 100),
  char_atk_avg_dmg: (s) => s.atk * (1 + (s.crit_rate + s.char_atk_crit_rate) / 100) * (1 + s.crit_dmg / 100) * (1 + s.phy_dmg / 100) * (1 + s.char_atk_dmg / 100) * (1 + s.dmg / 100),
  //skill
  skill_avg_dmg: (s) => s.atk * (1 + (s.crit_rate + s.skill_crit_rate) / 100) * (1 + s.crit_dmg / 100) * (1 + s[`${s.char_ele_key}_ele_dmg`] / 100) * (1 + s.skill_dmg / 100) * (1 + s.dmg / 100),
  burst_avg_dmg: (s) => s.atk * (1 + (s.crit_rate + s.burst_crit_rate) / 100) * (1 + s.crit_dmg / 100) * (1 + s[`${s.char_ele_key}_ele_dmg`] / 100) * (1 + s.burst_dmg / 100) * (1 + s.dmg / 100),

  crit_multi: (s) => (1 + (s.crit_rate / 100) * (1 + s.crit_dmg / 100)),
}
const eleFormulas = {
  //ELEMENTAL
  ele_avg_dmg: (s, ele) => s.atk * s.crit_multi * (1 + s[`${ele}_ele_dmg`] / 100) * (1 + s.dmg / 100),
}
Object.entries(eleFormulas).forEach(([key, func]) =>
  Object.keys(ElementalData).forEach(eleKey =>
    Object.defineProperty(Formulas, `${eleKey}_${key}`, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (obj) => (func)(obj, eleKey),
    })))

//the keyfilters are used by build generator to reduce the amount of calculations required
function AttachLazyFormulas(obj, keyFilters) {
  //need to rename the hp,atk,def keys, because they will be the final stat
  ["hp", "atk", "def"].forEach(key => {
    obj.hasOwnProperty(key) && Object.defineProperty(obj, `${key}_flat`,
      Object.getOwnPropertyDescriptor(obj, key));
    delete obj[key];
  })
  let formulaKeys = keyFilters?.[0] || Object.keys(Formulas)
  formulaKeys.forEach(key => {
    !obj.hasOwnProperty(key) && Object.defineProperty(obj, key, {
      get: keyFilters ? () => Formulas[key](obj) : function () {
        let val = Formulas[key](obj)
        Object.defineProperty(this, key, { value: val })
        return val
      },
      configurable: true
    })
  })
  let statKeys = keyFilters?.[1] || Object.keys(StatData)
  //assign zeros to the other stats that are not part of the calculations
  statKeys.forEach(key => !obj.hasOwnProperty(key) && (obj[key] = 0))
}

export {
  Formulas,
  StatData,
  AttachLazyFormulas,
}