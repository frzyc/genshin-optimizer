import elementalData from "./Data/ElementalData";
import { amplifyingReactions, AmplifyingReactionsKey, HitMoveKey, hitMoves, transformativeReactions, TransformativeReactionsKey } from "./StatConstants";
import { allElementsWithPhy, ElementKeyWithPhy } from "./Types/consts";

const statMap = {
  hp: "HP", hp_: "HP%", atk: "ATK", atk_: "ATK%", def: "DEF", def_: "DEF%",
  eleMas: "Elemental Mastery", enerRech_: "Energy Recharge",
  critRate_: "Crit Rate", critDMG_: "Crit DMG",
  heal_: "Healing Bonus",

  // Misc. Stats
  base: "Base DMG",
  dmg_: "All DMG Bonus",
  weakspotDMG_: "Weakspot DMG",
  incHeal_: "Incoming Healing Bonus",
  shield_: "Shield Strength",
  cdRed_: "CD Reduction",
  skillCDRed_: "Ele. Skill CD Red.",
  burstCDRed_: "Ele. Burst CD Red.",
  moveSPD_: "Movement SPD",
  atkSPD_: "ATK SPD",
  stamina: "Stamina",
  staminaDec_: "Stamina Consumption Dec.",
  staminaSprintDec_: "Sprinting Stamina Consumption Dec.",
  staminaGlidingDec_: "Gliding Stamina Consumption Dec.",
  staminaChargedDec_: "Charged Attack Stamina Consumption Dec.",

  heal_multi: "Heal multiplier",

  // Reaction
  transformative_level_multi: "Reaction Level Multiplier",
  amplificative_dmg_: "Amplificative Reaction DMG Bonus",
  transformative_dmg_: "Transformative Reaction DMG Bonus",
  crystalize_dmg_: "Crystalize Bonus",
  burning_dmg_: "Burning DMG Bonus",

  // Enemy
  enemyLevel: "Enemy Level",
  enemyLevel_multi: "Enemy Level RES Multiplier",
  enemyDEF_multi: "Enemy DEF Multiplier",
  enemyDEFRed_: "Enemy DEF Reduction",

  //infusion
  infusionSelf: "Elemental Infusion",
  infusionAura: "Elemental Infusion Aura",

  //talentBoost
  autoBoost: "Normal Attack Level Boost",
  skillBoost: "Ele. Skill Level Boost",
  burstBoost: "Ele. Burst Level Boost",

} as const

export type BaseKeys = keyof typeof statMap

export type EleDmgKey = `${ElementKeyWithPhy}_dmg_`
export const allEleDmgKeys = allElementsWithPhy.map(e => `${e}_dmg_`) as EleDmgKey[]

export type EleResKey = `${ElementKeyWithPhy}_res_`
export const allEleResKeys = allElementsWithPhy.map(e => `${e}_res_`) as EleResKey[]

export type EleEnemyResKey = `${ElementKeyWithPhy}_enemyRes_`
export const allEleEnemyResKeys = allElementsWithPhy.map(e => `${e}_enemyRes_`) as EleEnemyResKey[]

Object.entries(elementalData).forEach(([e, { name }]) => {
  statMap[`${e}_dmg_`] = `${name} DMG Bonus`
  statMap[`${e}_res_`] = `${name} DMG RES`

  statMap[`${e}_enemyRes_`] = `Enemy ${name} DMG RES`
  // statMap[`${e}_enemyImmunity`] = `Enemy ${name} Immunity` TODO: figure out immunity
})

export type HitMoveDmgKey = `${HitMoveKey}_dmg_`
export const allHitMoveDmgKeys = Object.keys(hitMoves).map(h => `${h}_dmg_`) as HitMoveDmgKey[]

export type HitMoveIncKey = `${HitMoveKey}_dmg_inc`
export const allHitMoveIncKeys = Object.keys(hitMoves).map(h => `${h}_dmg_inc`) as HitMoveIncKey[]

export type HitMoveCritRateKey = `${HitMoveKey}_critRate_`
export const allHitMoveCritRateKeys = Object.keys(hitMoves).map(h => `${h}_critRate_`) as HitMoveCritRateKey[]

Object.entries(hitMoves).forEach(([move, moveName]) => {
  statMap[`${move}_dmg_inc`] = `${moveName} DMG Increase`
  statMap[`${move}_dmg_`] = `${moveName} DMG Bonus`
  statMap[`${move}_critRate_`] = `${moveName} CRIT Rate Bonus`
})

export type TransformativeReactionsDmgKey = `${TransformativeReactionsKey}_dmg_`
export const allTransformativeReactionsDmgKeys = Object.keys(transformativeReactions).map(e => `${e}_dmg_`) as TransformativeReactionsDmgKey[]

Object.entries(transformativeReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
})

export type AmplifyingReactionsDmgKey = `${AmplifyingReactionsKey}_dmg_`
export const allAmplifyingReactionsDmgKey = Object.keys(amplifyingReactions).map(e => `${e}_dmg_`) as AmplifyingReactionsDmgKey[]

Object.entries(amplifyingReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
})

export type Statkey = BaseKeys | EleDmgKey | EleResKey | EleEnemyResKey | HitMoveDmgKey | HitMoveIncKey | HitMoveCritRateKey | TransformativeReactionsDmgKey | AmplifyingReactionsDmgKey

export const allStatKeys = Object.keys(statMap) as Statkey[]

export default class KeyMap {
  //do not instantiate.
  constructor() {
    if (this instanceof KeyMap)
      throw Error('A static class cannot be instantiated.');
  }
  static get(key: string): string | undefined {
    const name = statMap[key]
    if (name) return name
    return undefined
  }
  static getNoUnit(key: string): string {
    const name = KeyMap.get(key) ?? ""
    return name.endsWith("%") ? name.slice(0, -1) : name
  }
  static unit(key: string): "%" | "flat" {
    if (key.endsWith("_")) return "%"
    return "flat"
  }
}
