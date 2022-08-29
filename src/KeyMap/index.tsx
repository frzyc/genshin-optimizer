import { Translate } from "../Components/Translate";
import { MainStatKey, SubstatKey } from "../Types/artifact";
import { allElementsWithPhy, ElementKeyWithPhy } from "../Types/consts";
import elementalData from "./ElementalData";
import { additiveReactions, AdditiveReactionsKey, amplifyingReactions, AmplifyingReactionsKey, HitMoveKey, hitMoves, transformativeReactions, TransformativeReactionsKey } from "./StatConstants";

const statMap = {
  hp: "HP", hp_: "HP", atk: "ATK", atk_: "ATK", def: "DEF", def_: "DEF",
  eleMas: "Elemental Mastery", enerRech_: "Energy Recharge",
  critRate_: "Crit Rate", critDMG_: "Crit DMG",
  heal_: "Healing Bonus",

  // Misc. Stats
  base: "Base DMG",
  dmg_: "Total DMG Bonus",
  dmgInc: "Total DMG Increase",
  all_dmg_: "Common DMG Bonus",
  all_dmgInc: "Common DMG Increase",
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
  dmgRed_: "Damage Reduction",

  heal_multi: "Heal multiplier",
  healInc: "Heal Increase",

  // Reaction
  transformative_level_multi: "Transformative Reaction Level Multiplier",
  crystallize_level_multi: "Crystallize Reaction Level Multiplier",
  amplificative_dmg_: "Amplificative Reaction DMG Bonus",
  transformative_dmg_: "Transformative Reaction DMG Bonus",
  crystallize_dmg_: "Crystallize Bonus",
  crystallize: `Crystallize`, // for displaying general crystallize
  base_amplifying_multi: "Base Amplifying Multiplier",
  base_transformative_multi: "Base Transformative Multiplier",
  base_crystallize_multi: "Base Crystallize Multiplier",

  // Enemy
  enemyLevel: "Enemy Level",
  enemyLevel_multi: "Enemy Level RES Multiplier",
  enemyDef_multi: "Enemy DEF Multiplier",
  enemyDefRed_: "Enemy DEF Reduction",
  enemyDefIgn_: "Enemy DEF Ignore",

  //infusion
  infusionSelf: "Elemental Infusion",
  infusionAura: "Elemental Infusion Aura",

  //talentBoost
  autoBoost: "Normal Attack Level Boost",
  skillBoost: "Ele. Skill Level Boost",
  burstBoost: "Ele. Burst Level Boost",

  level: "Level",
} as const

export type Unit = "" | "%" | "s"

export type BaseKeys = keyof typeof statMap

/* Elemental extension keys */

export type EleDmgKey = `${ElementKeyWithPhy}_dmg_`
export const allEleDmgKeys = allElementsWithPhy.map(e => `${e}_dmg_`) as EleDmgKey[]

export type EleResKey = `${ElementKeyWithPhy}_res_`
export const allEleResKeys = allElementsWithPhy.map(e => `${e}_res_`) as EleResKey[]

export type EleDmgIncKey = `${ElementKeyWithPhy}_dmgInc`
export const allEleDmgIncKeys = allElementsWithPhy.map(ele => `${ele}_dmgInc` as const) as EleDmgIncKey[]

export type EleEnemyResKey = `${ElementKeyWithPhy}_enemyRes_`
export const allEleEnemyResKeys = allElementsWithPhy.map(e => `${e}_enemyRes_`) as EleEnemyResKey[]

export type EleECritDmgKey = `${ElementKeyWithPhy}_critDMG_`
export const allEleECritDmgKeys = allElementsWithPhy.map(e => `${e}_enemyRes_`) as EleEnemyResKey[]

Object.entries(elementalData).forEach(([e, { name }]) => {
  statMap[`${e}_dmg_`] = `${name} DMG Bonus`
  statMap[`${e}_res_`] = `${name} DMG RES`

  statMap[`${e}_enemyRes_`] = `Enemy ${name} DMG RES`
  statMap[`${e}_dmgInc`] = `${name} DMG Increase`
  statMap[`${e}_critDMG_`] = `${name} CRIT DMG Bonus`
})

type ElementExtKey = EleDmgKey | EleResKey | EleEnemyResKey | EleDmgIncKey | EleECritDmgKey

/* Hit move extension keys */
export type HitMoveDmgKey = `${HitMoveKey}_dmg_`
export const allHitMoveDmgKeys = Object.keys(hitMoves).map(h => `${h}_dmg_`) as HitMoveDmgKey[]

export type HitMoveDmgIncKey = `${HitMoveKey}_dmgInc`
export const allHitMoveDmgIncKeys = Object.keys(hitMoves).map(ele => `${ele}_dmgInc` as const) as HitMoveDmgIncKey[]

export type HitMoveCritRateKey = `${HitMoveKey}_critRate_`
export const allHitMoveCritRateKeys = Object.keys(hitMoves).map(h => `${h}_critRate_`) as HitMoveCritRateKey[]

export type HitMoveCritDmgKey = `${HitMoveKey}_critDMG_`
export const allHitMoveCritDmgKeys = Object.keys(hitMoves).map(h => `${h}_critDMG_`) as HitMoveCritRateKey[]

Object.entries(hitMoves).forEach(([move, moveName]) => {
  statMap[`${move}_dmgInc`] = `${moveName} DMG Increase`
  statMap[`${move}_dmg_`] = `${moveName} DMG Bonus`
  statMap[`${move}_critRate_`] = `${moveName} CRIT Rate Bonus`
  statMap[`${move}_critDMG_`] = `${moveName} CRIT DMG Bonus`
})
type MoveExtKey = HitMoveDmgKey | HitMoveDmgIncKey | HitMoveCritRateKey | HitMoveCritDmgKey

/* Transformation extension keys */
export type TransformativeReactionsDmgKey = `${TransformativeReactionsKey}_dmg_`
export const allTransformativeReactionsDmgKeys = Object.keys(transformativeReactions).map(e => `${e}_dmg_`) as TransformativeReactionsDmgKey[]

Object.entries(transformativeReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
})

Object.entries(transformativeReactions).forEach(([reaction, { name, variants }]) => {
  if (reaction === "swirl") variants.forEach(v => {
    statMap[`${v}_${reaction}_hit`] = `${elementalData[v].name} ${name} DMG`
  })
  else statMap[`${reaction}_hit`] = `${name} DMG`
  statMap[`${reaction}_multi`] = `${name} Multiplier`
});

//Crystallize
(["cryo", "hydro", "pyro", "electro"]).forEach(e => {
  statMap[`${e}_crystallize`] = `${elementalData[e].name} Crystallize`
})


export type AmplifyingReactionsDmgKey = `${AmplifyingReactionsKey}_dmg_`
export const allAmplifyingReactionsDmgKey = Object.keys(amplifyingReactions).map(e => `${e}_dmg_`) as AmplifyingReactionsDmgKey[]

Object.entries(amplifyingReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
  statMap[`${reaction}_multi`] = `${name} Multiplier`
})

export type AdditiveReactionsDmgKey = `${AdditiveReactionsKey}_dmg_`
export const allAdditiveReactionsDmgKey = Object.keys(additiveReactions).map(e => `${e}_dmg_`) as AdditiveReactionsDmgKey[]

Object.entries(additiveReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
  statMap[`${reaction}_dmgInc`] = `${name} DMG Increase`
})

/* EVERY stat key */
export type StatKey = BaseKeys | ElementExtKey | MoveExtKey | TransformativeReactionsDmgKey | AmplifyingReactionsDmgKey | AdditiveReactionsDmgKey

export type KeyMapPrefix = 'default' | 'base' | 'total' | 'uncapped' | 'custom' | 'char' | 'art' | 'weapon' | 'teamBuff'
const subKeyMap: StrictDict<KeyMapPrefix, string> = {
  default: "Default", base: "Base", total: "Total", uncapped: "Uncapped",
  custom: "Custom", char: "Char.", art: "Art.", weapon: "Weapon",
  teamBuff: "Team"
}

export const allStatKeys = Object.keys(statMap) as StatKey[]
const showPercentKeys = ["hp_", "def_", "atk_"]
export default class KeyMap {
  //do not instantiate.
  constructor() {
    if (this instanceof KeyMap)
      throw Error('A static class cannot be instantiated.');
  }
  static getPrefixStr(prefix: KeyMapPrefix): string {
    return subKeyMap[prefix]
  }
  static getStr(key: string = ""): string | undefined {
    return statMap[key]
  }
  static getArtStr(key: MainStatKey | SubstatKey): string {
    return statMap[key] + (showPercentKeys.includes(key) ? "%" : "")
  }
  static get(key: string = ""): Displayable | undefined {
    const name = KeyMap.getStr(key)
    if (name) return <span>{name}</span>
    if (key.includes(":")) {
      let [ns, key18] = key.split(":")
      if (ns.endsWith("_gen") && key18.endsWith("_"))
        key18 = key18.slice(0, -1);
      return <Translate ns={ns} key18={key18} />
    }
    return <span>{key}</span>
  }
  static getVariant(key: string = ""): ElementKeyWithPhy | TransformativeReactionsKey | AmplifyingReactionsKey | AdditiveReactionsKey | "heal" | undefined {
    const trans = Object.keys(transformativeReactions).find(e => key.startsWith(e))
    if (trans) return trans
    const amp = Object.keys(amplifyingReactions).find(e => key.startsWith(e))
    if (amp) return amp
    const add = Object.keys(additiveReactions).find(e => key.startsWith(e))
    if (add) return add
    if (key.includes("heal")) return "heal"
    return allElementsWithPhy.find(e => key.startsWith(e))
  }
  static unit(key: string = ""): Unit {
    if (key.endsWith("_")) return "%"
    return ""
  }
}

export function valueString(value: number, unit: Unit, fixed = -1): string {
  if (!isFinite(value)) {
    if (value > 0) return `\u221E`
    if (value < 0) return `-\u221E`
    return 'NaN'
  }
  if (unit === "%") value *= 100
  if (Number.isInteger(value)) fixed = 0
  else if (fixed === -1) {
    if (unit === "%") fixed = 1
    else fixed = Math.abs(value) < 10 ? 3 : Math.abs(value) < 1000 ? 2 : Math.abs(value) < 10000 ? 1 : 0
  }
  return `${value.toFixed(fixed)}${unit}`
}

export function cacheValueString(value: number, unit: Unit): string {
  switch (unit as any) {
    case "%": return (Math.round(value * 10) / 10).toFixed(1) // TODO: % conversion
    default: return Math.round(value).toFixed(0)
  }
}
