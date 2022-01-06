import elementalData from "./Data/ElementalData";
import { amplifyingReactions, crystalizeLevelMultipliers, hitMoves, hitTypes, transformativeReactionLevelMultipliers, transformativeReactions } from "./StatConstants";
import { ICalculatedStats } from "./Types/stats";
import { clamp } from "./Util/Util";

export interface StatItem {
  name: string, const?: boolean, default?: any, variant?: string,
  unit?: "%" | "multi"
}

const StatData: { [stat: string]: StatItem } = {
  flat: { name: "", default: 1 },

  // Character Stats
  characterHP: { name: "Character Base HP", const: true },
  characterDEF: { name: "Character Base DEF", const: true },
  characterATK: { name: "Character Base ATK", const: true },
  characterEle: { name: "Character Element Key", default: "anemo", const: true },
  characterLevel: { name: "Character Level", default: 1, const: true },

  // Weapon Stats
  weaponATK: { name: "Weapon ATK", const: true },

  // Character & Weapon Stats
  baseATK: { name: "ATK Base", const: true }, // characterATK + weaponATK

  // Weapon & Artifact Stats
  hp: { name: "HP" },//flat hp
  hp_: { name: "HP", unit: "%" },
  atk: { name: "ATK" },
  atk_: { name: "ATK", unit: "%" },
  def: { name: "DEF" },
  def_: { name: "DEF", unit: "%" },
  dmg_: { name: "All DMG Bonus", unit: "%" },

  // Attack-related Character, Weapon & Artifact Stats
  finalHP: { name: "Total HP" },
  finalATK: { name: "Total ATK" },
  finalDEF: { name: "Total DEF" },

  critHit_base_multi: { name: `Crit Multiplier`, unit: "multi" },

  eleMas: { name: "Elemental Mastery", },
  enerRech_: { name: "Energy Recharge", unit: "%", default: 100 },
  critRate_: { name: "CRIT Rate", unit: "%", default: 5 },

  critDMG_: { name: "CRIT DMG", unit: "%", default: 50 },
  weakspotDMG_: { name: "Weakspot DMG", unit: "%" },

  // Misc. Stats
  heal_: { name: "Healing Bonus", unit: "%" },
  incHeal_: { name: "Incoming Healing Bonus", unit: "%" },
  shield_: { name: "Shield Strength", unit: "%" },
  cdRed_: { name: "CD Reduction", unit: "%" },
  skillCDRed_: { name: "Ele. Skill CD Red.", unit: "%" },
  burstCDRed_: { name: "Ele. Burst CD Red.", unit: "%" },
  moveSPD_: { name: "Movement SPD", unit: "%" },
  atkSPD_: { name: "ATK SPD", unit: "%" },
  stamina: { name: "Stamina" },
  staminaDec_: { name: "Stamina Consumption Dec.", unit: "%" },
  staminaSprintDec_: { name: "Sprinting Stamina Consumption Dec.", unit: "%" },
  staminaGlidingDec_: { name: "Gliding Stamina Consumption Dec.", unit: "%" },
  staminaChargedDec_: { name: "Charged Attack Stamina Consumption Dec.", unit: "%" },

  heal_multi: { name: "Heal multiplier", unit: "multi" },

  // Reaction
  transformative_level_multi: { name: "Reaction Level Multiplier", unit: "multi", const: true },
  amplificative_dmg_: { name: "Amplificative Reaction DMG Bonus", unit: "%" },
  transformative_dmg_: { name: "Transformative Reaction DMG Bonus", unit: "%" },
  crystalize_eleMas_: { name: "Crystalize Bonus (Elemental Mastery)", unit: "%", variant: "crystalize" },
  crystalize_multi: { name: "Crystalize Multiplier", unit: "multi", const: true, variant: "crystalize" },
  crystalize_dmg_: { name: "Crystalize Bonus", unit: "%", variant: "crystalize" },
  crystalize_hit: { name: "Crystalize Shield HP", variant: "crystalize" },
  burning_dmg_: { name: "Burning DMG Bonus", variant: "burning" },

  // Enemy
  enemyLevel: { name: "Enemy Level", const: true },
  enemyLevel_multi: { name: "Enemy Level RES Multiplier", unit: "multi", const: true },
  enemyDEFRed_: { name: "Enemy DEF Reduction", unit: "%", const: true },

  //infusion
  infusionSelf: { name: "Elemental Infusion", const: true, default: "" },
  infusionAura: { name: "Elemental Infusion Aura", const: true, default: "" },

  //talentBoost
  autoBoost: { name: "Normal Attack Level Boost", const: true, },
  skillBoost: { name: "Ele. Skill Level Boost", const: true, },
  burstBoost: { name: "Ele. Burst Level Boost", const: true, },
}
const Formulas: Dict<string, (s: ICalculatedStats) => number> = {
  // Basic Stats
  baseATK: (s) => s.characterATK + s.weaponATK,
  finalATK: (s) => s.baseATK * (1 + s.atk_ / 100) + s.atk,
  finalHP: (s) => s.characterHP * (1 + s.hp_ / 100) + s.hp,
  finalDEF: (s) => s.characterDEF * (1 + s.def_ / 100) + s.def,

  critHit_base_multi: (s) => (1 + s.critDMG_ / 100),

  enemyLevel_multi: (s) => (100 + s.characterLevel) / ((100 + s.characterLevel) + (100 + s.enemyLevel) * (1 - Math.min(s.enemyDEFRed_, 90) / 100)),

  heal_multi: (s) => (1 + s.heal_ / 100 + s.incHeal_ / 100),

  // Reactions
  transformative_level_multi: (s) => transformativeReactionLevelMultipliers[s.characterLevel],
  amplificative_dmg_: (s) => 2500 / 9 * s.eleMas / (1400 + s.eleMas),
  transformative_dmg_: (s) => 1600 * s.eleMas / (2000 + s.eleMas),

  crystalize_eleMas_: (s) => 4000 / 9 * s.eleMas / (1400 + s.eleMas),
  crystalize_multi: (s) => crystalizeLevelMultipliers[s.characterLevel],
  crystalize_hit: (s) => (100 + s.crystalize_dmg_ + s.crystalize_eleMas_) / 100 * s.crystalize_multi,
};

["pyro", "cryo", "electro", "hydro"].forEach(ele => {
  StatData[`${ele}_crystalize_hit`] = { name: `Crystalize Shield ${elementalData[ele].name} Effective HP`, variant: ele }
  Formulas[`${ele}_crystalize_hit`] = s => s.crystalize_hit * 2.5
})


const ElementToReactionKeys = {
  physical: [],
  anemo: ["electro_swirl_hit", "pyro_swirl_hit", "cryo_swirl_hit", "hydro_swirl_hit"],
  geo: ["shattered_hit", "crystalize_hit", "electro_crystalize_hit", "pyro_crystalize_hit", "cryo_crystalize_hit", "hydro_crystalize_hit"],
  electro: ["overloaded_hit", "electrocharged_hit", "superconduct_hit"],
  hydro: ["electrocharged_hit", "shattered_hit"],//"hydro_vaporize_multi",
  pyro: ["overloaded_hit"],// "burning_hit","pyro_vaporize_multi", "pyro_melt_multi",
  cryo: ["shattered_hit", "superconduct_hit"],//"cryo_melt_multi",
  dendro: []
}
function resMultiplier(res) {
  res = res / 100
  if (res < 0) return 1 - res / 2
  else if (res >= 0.75) return 1 / (res * 4 + 1)
  return 1 - res
}

Object.entries(hitMoves).forEach(([move, moveName]) => {
  StatData[`${move}_dmg_`] = { name: `${moveName} DMG Bonus`, unit: "%" }
  StatData[`${move}_critRate_`] = { name: `${moveName} CRIT Rate Bonus`, unit: "%" }
  StatData[`final_${move}_critRate_`] = { name: `${moveName} CRIT Rate`, unit: "%" }

  Formulas[`final_${move}_critRate_`] = (s) => clamp(s.critRate_ + s[`${move}_critRate_`], 0, 100)
})

Object.entries(elementalData).forEach(([ele, { name: eleName }]) => {
  const opt = { variant: ele }
  // DONT CHANGE. needed for screenshot parsing
  StatData[`${ele}_dmg_`] = { name: `${eleName} DMG Bonus`, unit: "%", ...opt }
  StatData[`${ele}_res_`] = { name: `${eleName} DMG RES`, unit: "%", ...opt }

  StatData[`${ele}_enemyRes_`] = { name: `Enemy ${eleName} DMG RES`, unit: "%", default: 10, ...opt }
  StatData[`${ele}_enemyImmunity`] = { name: `Enemy ${eleName} Immunity`, default: false, const: true, ...opt }

  StatData[`${ele}_enemyRes_multi`] = { name: `Enemy ${eleName} RES Multiplier`, unit: "multi", ...opt }
  StatData[`${ele}_bonus_multi`] = { name: `${eleName} Attack Bonus DMG Multiplier`, unit: "multi", ...opt }

  Formulas[`${ele}_enemyRes_multi`] = (s) => s[`${ele}_enemyImmunity`] ? 0 : resMultiplier(s[`${ele}_enemyRes_`])
})

Object.entries(hitMoves).forEach(([move, moveName]) => {
  StatData[`${move}_avgHit_base_multi`] = { name: `${moveName} Avg. Multiplier`, unit: "multi" }
  Formulas[`${move}_avgHit_base_multi`] = (s) => (1 + s.critDMG_ * s[`final_${move}_critRate_`] / 10000)
  Object.entries(elementalData).forEach(([ele, { name: eleName }]) => {
    const opt = { variant: ele }
    StatData[`${ele}_${move}_hit_base_multi`] = { name: `${moveName} Base Multiplier`, unit: "multi", ...opt }
    Formulas[`${ele}_${move}_hit_base_multi`] = (s) => (100 + s.dmg_ + s[`${ele}_dmg_`] + s[`${move}_dmg_`]) / 100
    Object.entries(hitTypes).forEach(([type, typeName]) => {
      StatData[`${ele}_${move}_${type}`] = { name: `${moveName} ${typeName}`, ...opt }
      Formulas[`${ele}_${move}_${type}`] = (s) => s.finalATK * s[`${ele}_${move}_${type}_multi`]
      StatData[`${ele}_${move}_${type}_multi`] = { name: `${moveName} ${typeName} Multiplier`, unit: "multi", ...opt }
    })

    Formulas[`${ele}_${move}_hit_multi`] = (s) => s[`${ele}_${move}_hit_base_multi`] * s.enemyLevel_multi * s[`${ele}_enemyRes_multi`]
    Formulas[`${ele}_${move}_critHit_multi`] = (s) => s[`${ele}_${move}_hit_multi`] * s[`critHit_base_multi`]
    Formulas[`${ele}_${move}_avgHit_multi`] = (s) => s[`${ele}_${move}_hit_multi`] * s[`${move}_avgHit_base_multi`]
  })
})

Object.entries(transformativeReactions).forEach(([reaction, { name, multi, variants }]) => {
  const opt = { variant: reaction }
  StatData[`${reaction}_dmg_`] = { name: `${name} DMG Bonus`, unit: "%", ...opt }
  StatData[`${reaction}_multi`] = { name: `${name} Multiplier`, unit: "multi", const: true, ...opt }
  Formulas[`${reaction}_multi`] = (s) => multi * s.transformative_level_multi
  if (variants.length === 1) {
    const [ele] = variants, opt = { variant: reaction }
    StatData[`${reaction}_hit`] = { name: `${name} DMG`, ...opt }
    Formulas[`${reaction}_hit`] = (s) => (100 + s.transformative_dmg_ + s[`${reaction}_dmg_`]) / 100 * s[`${reaction}_multi`] * s[`${ele}_enemyRes_multi`]
  } else {
    variants.forEach(ele => {
      const opt = { variant: ele }

      StatData[`${ele}_${reaction}_hit`] = { name: `${elementalData[ele].name} ${name} DMG`, ...opt }
      Formulas[`${ele}_${reaction}_hit`] = (s) => (100 + s.transformative_dmg_ + s[`${reaction}_dmg_`]) / 100 * s[`${reaction}_multi`] * s[`${ele}_enemyRes_multi`]
    })
  }
})

Object.entries(amplifyingReactions).forEach(([reaction, { name, variants }]) => {
  const opt = { variant: reaction }
  StatData[`${reaction}_dmg_`] = { name: `${name} DMG Bonus`, unit: "%", ...opt }
  Object.entries(variants).forEach(([ele, baseMulti]) => {
    StatData[`${ele}_${reaction}_multi`] = { name: `${name} Multiplier`, unit: "multi", ...opt }
    Formulas[`${ele}_${reaction}_multi`] = (s) => baseMulti * (100 + s.amplificative_dmg_ + s[`${reaction}_dmg_`]) / 100
    Object.entries(hitTypes).forEach(([type, typeName]) => {
      Object.entries(hitMoves).forEach(([move, moveName]) => {
        StatData[`${ele}_${reaction}_${move}_${type}_multi`] = { name: `${name} ${moveName} ${typeName} Multiplier`, unit: "multi", ...opt }
        StatData[`${ele}_${reaction}_${move}_${type}`] = { name: `${name} ${moveName} ${typeName}`, ...opt }

        Formulas[`${ele}_${reaction}_${move}_${type}_multi`] = (s) => s[`${ele}_${move}_${type}_multi`] * s[`${ele}_${reaction}_multi`]
        Formulas[`${ele}_${reaction}_${move}_${type}`] = (s) => s.finalATK * s[`${ele}_${reaction}_${move}_${type}_multi`]
      })
    })
  })
})
// if (process.env.NODE_ENV === "development") console.log(StatData)

export {
  Formulas,
  StatData,
  ElementToReactionKeys,
};

