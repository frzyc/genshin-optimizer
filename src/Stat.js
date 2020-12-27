import { ElementalData } from "./Data/CharacterData";

export default class Stat {
  //do not instantiate.
  constructor() {
    if (this instanceof Stat)
      throw Error('A static class cannot be instantiated.');
  }
  static getStatName = (key, defVal = "") => {
    if (key && StatData[key])
      return StatData[key].name;
    else if (key && key.includes("_ele_dmg")) {
      let element = key.split("_ele_dmg")[0]
      if (ElementalData[element])
        return ElementalData[element].name + " DMG Bonus"
    } else if (key && key.includes("_ele_res")) {
      let element = key.split("_ele_res")[0]
      if (ElementalData[element])
        return ElementalData[element].name + " RES"
    } else if (key && key.includes("_ele_atk")) {
      let element = key.split("_ele_atk")[0]
      if (ElementalData[element])
        return ElementalData[element].name + " Average ATK"
    }
    return defVal
  }
  static getStatNameWithPercent = (key, defVal = "") => {
    let name = this.getStatName(key, defVal)
    if (name !== defVal && (key === "hp_" || key === "atk_" || key === "def_"))
      name += "%"
    return name;
  }
  static getStatUnit = (key, defVal = "") => {
    if (key && StatData[key] && StatData[key].unit)
      return StatData[key].unit
    else if (key && key.includes("_ele_dmg"))
      return this.getStatUnit("ele_dmg")
    else if (key && key.includes("_ele_res"))
      return this.getStatUnit("ele_res")
    else
      return defVal
  }
  static fixedUnit = (key) => {
    if (key === "crit_multi") return 3
    let unit = Stat.getStatUnit(key)
    return unit === "%" ? 1 : 0
  }
  static getAllStatKey = () =>
    [...Object.keys(StatData).filter(key => key !== "ele_dmg" || key !== "ele_res"),
    ...Object.keys(ElementalData).map(ele => `${ele}_ele_dmg`),
    ...Object.keys(ElementalData).map(ele => `${ele}_ele_res`)]
}
const StatData = {
  hp: { name: "HP" },
  hp_: { name: "HP", unit: "%" },
  atk: { name: "ATK", },
  atk_: { name: "ATK", unit: "%" },
  def: { name: "DEF", },
  def_: { name: "DEF", unit: "%" },
  phy_dmg: { name: "Physical DMG Bonus", unit: "%" },
  phy_res: { name: "Physical RES", unit: "%" },
  phy_atk: { name: "Physical Average ATK" },
  ele_dmg: { name: "Elemental DMG Bonus", unit: "%" },
  ele_res: { name: "Elemental DMG RES", unit: "%" },
  ele_mas: { name: "Elemental Mastery", },
  ele_atk: { name: "Elemental Average ATK" },
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
  //skill
  skill_dmg: { name: "Ele. Skill DMG", unit: "%" },
  burst_dmg: { name: "Ele. Burst DMG", unit: "%" },
  skill_crit_rate: { name: "Ele. Skill CRIT Rate", unit: "%" },
  burst_crit_rate: { name: "Ele. Burst CRIT Rate", unit: "%" },
  skill_cd_red: { name: "Ele. Skill CD Red.", unit: "%" },
  burst_cd_red: { name: "Ele. Burst CD Red.", unit: "%" },

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
  swirl_dmg:{ name: "Swirl DMG", unit: "%" },
};

export {
  StatData,
}