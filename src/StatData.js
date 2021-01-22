import ElementalData from "./Data/ElementalData";
import { clamp, deepClone } from "./Util/Util";

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
  all_dmg_bonus: { name: "All DMG Bonus", unit: "%" },//general all damage increase
  move_spd: { name: "Movement SPD", unit: "%" },
  atk_spd: { name: "ATK SPD", unit: "%" },
  weakspot_dmg: { name: "Weakspot DMG", unit: "%" },
  stamina_dec: { name: "Stamina Consumption Dec.", unit: "%" },
  stamina_gliding_dec: { name: "Gliding Stamina Consumption Dec.", unit: "%" },
  stamina_charged_dec: { name: "Charged Attack Stamina Consumption Dec.", unit: "%" },

  //elemental interaction
  melt_dmg_bonus: { name: "Melt DMG Bonus", unit: "%", variant: "melt" },
  vaporize_dmg_bonus: { name: "Vaporize DMG Bonus", unit: "%", variant: "vaporize" },

  ele_mas_multi_x: { name: "Elementry Mastry Multiplier X", unit: "multi" },
  ele_mas_multi_y: { name: "Elementry Mastry Multiplier Y", unit: "multi" },
  ele_mas_multi_z: { name: "Elementry Mastry Multiplier Z", unit: "multi" },
  trans_reaction_base_multi: { name: "Transformation Reaction Base Multiplier", unit: "multi" },

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
function resMultiplier(res) {
  res = res / 100
  if (res < 0) return 1 - res / 2
  else if (res >= 0.75) return 1 / (res * 4 + 1)
  return 1 - res
}
const ElementToReactionKeys = {
  anemo: ["swirl_dmg"],
  geo: ["crystalize_dmg", "shatter_dmg"],
  electro: ["overloaded_dmg", "electrocharged_dmg", "superconduct_dmg"],
  hydro: ["electrocharged_dmg", "shatter_dmg"],//"hydro_vaporize_multi",
  pyro: ["overloaded_dmg"],// "burning_dmg","pyro_vaporize_multi", "pyro_melt_multi", 
  cryo: ["shatter_dmg", "superconduct_dmg"],//"cryo_melt_multi", 
  // dendro: { name: "Dendro" }
}
const ReactionMatrix = {
  overloaded: [37.4371542286, -4.3991155718, 0.9268181504, -0.0314790536, 0.0005189440, -0.0000027646],
  superconduct: [7.4972486411, -0.4750909512, 0.1836799174, -0.0064237710, 0.0001110078, -0.0000006038],
  electrocharged: [20.8340255487, -1.6987232790, 0.4742385201, -0.0162160738, 0.0002746679, -0.0000014798],
  shattered: [31.2160750111, -3.7397755267, 0.7174530144, -0.0239673351, 0.0003895953, -0.0000020555],
  swirl: [13.5157684329, -1.7733381829, 0.3097567417, -0.0103922088, 0.0001679502, -0.0000008854],
  crystalize: [83.06561, -4.42541, 0.5568372, -0.01637168, 0.0002253889, -0.000001088197]
}
function ampliBase(ele_mas) {
  return 1 + 0.189266831 * ele_mas * Math.exp(-0.000505 * ele_mas) / 100
}
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
  norm_atk_bonus_multi: (s) => (1 + (s.phy_dmg_bonus + s.norm_atk_dmg_bonus + s.all_dmg_bonus) / 100),

  //CHARGED
  char_atk_dmg: (s) => s.atk_final * s.char_atk_bonus_multi * s.enemy_level_multi * s.enemy_phy_res_multi,
  char_atk_crit_dmg: (s) => s.char_atk_dmg * s.crit_dmg_multi,
  char_atk_avg_dmg: (s) => s.char_atk_dmg * s.char_atk_crit_multi,
  char_atk_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.char_atk_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),
  char_atk_bonus_multi: (s) => (1 + (s.phy_dmg_bonus + s.char_atk_dmg_bonus + s.all_dmg_bonus) / 100),

  //PLUNGE
  plunge_dmg: (s) => s.phy_dmg,
  plunge_crit_dmg: (s) => s.phy_crit_dmg,
  plunge_avg_dmg: (s) => s.phy_avg_dmg,
  plunge_bonus_multi: (s) => s.phy_bonus_multi,

  phy_dmg: (s) => s.atk_final * s.phy_bonus_multi * s.enemy_level_multi * s.enemy_phy_res_multi,
  phy_crit_dmg: (s) => s.phy_dmg * s.crit_dmg_multi,
  phy_avg_dmg: (s) => s.phy_dmg * s.crit_multi,
  phy_bonus_multi: (s) => (1 + (s.phy_dmg_bonus + s.all_dmg_bonus) / 100),

  crit_dmg_multi: (s) => (1 + s.crit_dmg / 100),
  crit_multi: (s) => (1 + (clamp(s.crit_rate, 0, 100) / 100) * (s.crit_dmg / 100)),

  skill_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.skill_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),
  burst_crit_multi: (s) => (1 + (clamp(s.crit_rate + s.burst_crit_rate, 0, 100) / 100) * s.crit_dmg / 100),

  enemy_level_multi: (s) => (100 + s.char_level) / (100 + s.enemy_level + 100 + s.char_level),
  enemy_phy_res_multi: (s) => s.enemy_phy_immunity ? 0 : resMultiplier(s.enemy_phy_res),

  //Elemental Reactions
  overloaded_dmg: (s) => (1 + s.overloaded_dmg_bonus / 100) * s.ele_mas_multi_y * s.overloaded_multi * s.pyro_enemy_ele_res_multi,
  overloaded_multi: (s) => ReactionMatrix.overloaded.reduce((accu, val, i) => accu + val * Math.pow(s.char_level, i), 0),
  electrocharged_dmg: (s) => (1 + s.electrocharged_dmg_bonus / 100) * s.ele_mas_multi_y * s.electrocharged_multi * s.electro_enemy_ele_res_multi,
  electrocharged_multi: (s) => ReactionMatrix.electrocharged.reduce((accu, val, i) => accu + val * Math.pow(s.char_level, i), 0),
  superconduct_dmg: (s) => (1 + s.superconduct_dmg_bonus / 100) * s.ele_mas_multi_y * s.superconduct_multi * s.cryo_enemy_ele_res_multi,
  superconduct_multi: (s) => ReactionMatrix.superconduct.reduce((accu, val, i) => accu + val * Math.pow(s.char_level, i), 0),

  // burning_dmg: (s) => "NO_FORMULA",//(1 + s.burning_dmg_bonus / 100)
  swirl_dmg: (s) => (1 + s.swirl_dmg_bonus / 100) * s.ele_mas_multi_y * s.swirl_multi * s.anemo_enemy_ele_res_multi,
  swirl_multi: (s) => ReactionMatrix.swirl.reduce((accu, val, i) => accu + val * Math.pow(s.char_level, i), 0),
  shatter_dmg: (s) => (1 + s.shatter_dmg_bonus / 100) * s.ele_mas_multi_y * s.shatter_multi * s.enemy_phy_res_multi,
  shatter_multi: (s) => ReactionMatrix.shattered.reduce((accu, val, i) => accu + val * Math.pow(s.char_level, i), 0),
  crystalize_dmg: (s) => (1 + s.crystalize_dmg_bonus / 100) * s.ele_mas_multi_z * s.crystalize_multi,
  crystalize_multi: (s) => ReactionMatrix.crystalize.reduce((accu, val, i) => accu + val * Math.pow(s.char_level, i), 0),

  pyro_vaporize_multi: (s) => (1 + s.vaporize_dmg_bonus / 100) * s.ele_mas_multi_x * 1.5 * s.trans_reaction_base_multi,
  hydro_vaporize_multi: (s) => (1 + s.vaporize_dmg_bonus / 100) * s.ele_mas_multi_x * 2 * s.trans_reaction_base_multi,

  pyro_melt_multi: (s) => (1 + s.melt_dmg_bonus / 100) * s.ele_mas_multi_x * 2 * s.trans_reaction_base_multi,
  cryo_melt_multi: (s) => (1 + s.melt_dmg_bonus / 100) * s.ele_mas_multi_x * 1.5 * s.trans_reaction_base_multi,
  trans_reaction_base_multi: (s) => ampliBase(s.ele_mas),

  ele_mas_multi_x: (s) => (1 + (25 / 9 * s.ele_mas / (1401 + s.ele_mas))),
  ele_mas_multi_y: (s) => (1 + (60 / 9 * s.ele_mas / (1401 + s.ele_mas))),
  ele_mas_multi_z: (s) => (1 + (40 / 9 * s.ele_mas / (1401 + s.ele_mas))),
}

//The formulas here will generate formulas for every element, for example pyro_skill_avg_dmg from skill_avg_dmg
const eleFormulas = {
  norm_atk_dmg: (s, ele) => s.atk_final * s[`${ele}_norm_atk_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  norm_atk_crit_dmg: (s, ele) => s[`${ele}_norm_atk_dmg`] * s.crit_dmg_multi,
  norm_atk_avg_dmg: (s, ele) => s[`${ele}_norm_atk_dmg`] * s.norm_atk_crit_multi,
  norm_atk_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.norm_atk_dmg_bonus + s.all_dmg_bonus) / 100),

  char_atk_dmg: (s, ele) => s.atk_final * s[`${ele}_char_atk_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  char_atk_crit_dmg: (s, ele) => s[`${ele}_char_atk_dmg`] * s.crit_dmg_multi,
  char_atk_avg_dmg: (s, ele) => s[`${ele}_char_atk_dmg`] * s.char_atk_crit_multi,
  char_atk_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.char_atk_dmg_bonus + s.all_dmg_bonus) / 100),

  plunge_dmg: (s, ele) => s[`${ele}_ele_dmg`],
  plunge_crit_dmg: (s, ele) => s[`${ele}_ele_crit_dmg`],
  plunge_avg_dmg: (s, ele) => s[`${ele}_ele_avg_dmg`],
  plunge_bonus_multi: (s, ele) => s[`${ele}_ele_bonus_multi`],

  ele_dmg: (s, ele) => s.atk_final * s[`${ele}_ele_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  ele_crit_dmg: (s, ele) => s[`${ele}_ele_dmg`] * s.crit_dmg_multi,
  ele_avg_dmg: (s, ele) => s[`${ele}_ele_dmg`] * s.crit_multi,
  ele_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.all_dmg_bonus) / 100),

  skill_dmg: (s, ele) => s.atk_final * s[`${ele}_skill_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  skill_crit_dmg: (s, ele) => s[`${ele}_skill_dmg`] * s.crit_dmg_multi,
  skill_avg_dmg: (s, ele) => s[`${ele}_skill_dmg`] * s.skill_crit_multi,
  skill_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.skill_dmg_bonus + s.all_dmg_bonus) / 100),

  burst_dmg: (s, ele) => s.atk_final * s[`${ele}_burst_bonus_multi`] * s.enemy_level_multi * s[`${ele}_enemy_ele_res_multi`],
  burst_crit_dmg: (s, ele) => s[`${ele}_burst_dmg`] * s.crit_dmg_multi,
  burst_avg_dmg: (s, ele) => s[`${ele}_burst_dmg`] * s.burst_crit_multi,
  burst_bonus_multi: (s, ele) => (1 + (s[`${ele}_ele_dmg_bonus`] + s.burst_dmg_bonus + s.all_dmg_bonus) / 100),

  enemy_ele_res_multi: (s, ele) => s[`${ele}_enemy_ele_immunity`] ? 0 : resMultiplier(s[`${ele}_enemy_ele_res`]),
};
//nontransformation reactions  
[["overloaded", "Overloaded"], ["electrocharged", "Electro-Charged"], ["superconduct", "Superconduct"], ["burning", "Burning"], ["swirl", "Swirl"], ["shatter", "Shattered"], ["crystalize", "Crystalize"]].forEach(([reactionKey, reactionName]) =>
  [["dmg", "DMG"], ["dmg_bonus", "DMG Bonus", { unit: "%" }], ["multi", "Multiplier", { unit: "multi" }]].forEach(([dmgKey, dmgName, props = {}]) => {
    StatData[`${reactionKey}_${dmgKey}`] = {
      name: `${reactionName} ${dmgName}`,
      variant: reactionKey,
      ...props
    };
  }));

//add variant to physical related stats.
[
  "phy_dmg_bonus", "phy_res", "enemy_phy_res", "enemy_phy_immunity", "phy_dmg", "phy_crit_dmg", "phy_avg_dmg", "phy_bonus_multi",
  ...Object.keys(StatData).filter(key => ["norm_atk", "char_atk", "plunge"].some(str => key.includes(str))),
].forEach(key => {
  StatData[key].variant = "physical"
});

//Add Vaporize and Melt stats
[["pyro_vaporize", "Vaporize(Pyro)", "vaporize", "pyro"], ["hydro_vaporize", "Vaporize(Hydro)", "vaporize", "hydro"], ["pyro_melt", "Melt(Pyro)", "melt", "pyro"], ["cryo_melt", "Melt(Cryo)", "melt", "cryo"]].forEach(([reactionKey, reactionName, variant, baseEle]) => {
  [["multi", "Multiplier", { unit: "multi" }]].forEach(([dmgKey, dmgName, props = {}]) => {
    StatData[`${reactionKey}_${dmgKey}`] = {
      name: `${reactionName} ${dmgName}`,
      variant,
      ...props
    };
  });
  [["norm_atk", "Nomal Attack"], ["char_atk", "Charged Attack"], ["plunge", "Plunging Attack"], ["skill", "Ele. Skill"], ["burst", "Ele. Burst"], ["ele", "Elemental"]].forEach(([atkType, atkTypeName]) =>
    [["dmg", "DMG"], ["avg_dmg", "Avg. DMG"], ["crit_dmg", "CRIT Hit DMG"]].forEach(([dmgMode, dmgModeName]) => {
      let reactionDMGKey = `${reactionKey}_${atkType}_${dmgMode}`
      StatData[reactionDMGKey] = { name: `${reactionName} ${atkTypeName} ${dmgModeName}`, variant }
      let baseDmg = `${baseEle}_${atkType}_${dmgMode}`
      Formulas[reactionDMGKey] = (s) => s[`${reactionKey}_multi`] * s[baseDmg]
    }));
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
    StatData[ele_key].variant = eleKey
  })
  // delete StatData[key]
})
if (process.env.NODE_ENV === "development") console.log(StatData)

//expand the eleFormulas to elementals
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
    key: "atk_final",
    formula: (options) => (s) => (s.atk_base + s.atk_weapon) * (1 + s.atk_ / 100) + s.atk + s.def_final * (options.value / 100),
    dependency: ["atk_base", "atk_weapon", "atk_", "atk", "def_final", "def_base", "def_", "def"],
  },
  mona_passive2_hydro_ele_dmg_bonus: {
    key: "hydro_ele_dmg_bonus",
    formula: (options) => (s) => (options.oldval || 0) + s.ener_rech * 0.2,
    dependency: ["ener_rech"],
  }
}

//the keyfilters are used by build generator to reduce the amount of calculations required
function AttachLazyFormulas(obj, options = {}) {
  let { formulaKeys = Object.keys(Formulas), statKeys = Object.keys(StatData) } = options;
  let { formulaOverrides = [] } = obj;
  formulaOverrides.forEach(formulaOverride => {
    let { key: overrideFormulaKey, options: overrideFormulaOptions } = formulaOverride
    let { key, formula } = OverrideFormulas[overrideFormulaKey] || {}
    if (!formulaKeys.includes(key) && !statKeys.includes(key)) return
    formula = formula({ ...overrideFormulaOptions, oldval: obj[key] })
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
  ElementToReactionKeys,
  ReactionMatrix,
  AttachLazyFormulas,
}