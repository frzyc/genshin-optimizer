import { ElementalData } from "./Character/CharacterData";

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
  norm_atk_dmg: { name: "Normal Attack DMG", unit: "%" },
  char_atk_dmg: { name: "Charged Attack DMG", unit: "%" },
  skill_dmg: { name: "Elemental Skill DMG", unit: "%" },
  burst_dmg: { name: "Elemental Burst DMG", unit: "%" },
};

export {
  StatData,
}