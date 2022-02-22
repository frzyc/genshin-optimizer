import { arch } from "os";
import { arrayBuffer } from "stream/consumers";
import { Translate } from "./Components/Translate";
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
  dmg_: "Total DMG Bonus",
  dmgInc: "Total DMG Increase",
  all_dmg_: "Common DMG Bonus",
  allElements_elemental_dmgInc: "Common DMG Increase",
  cryo_elemental_dmgInc: "Cryo Move DMG Increase",
  pyro_elemental_dmgInc: "Pyro Move DMG Increase",
  hydro_elemental_dmgInc: "Hydro Move DMG Increase",
  dendro_elemental_dmgInc: "Dendro Move DMG Increase",
  electro_elemental_dmgInc: "Electro Move DMG Increase",
  anemo_elemental_dmgInc: "Anemo Move DMG Increase",
  geo_elemental_dmgInc: "Geo Move DMG Increase",
  physical_elemental_dmgInc: "Physical Move DMG Increase",
  cryo_normal_dmgInc: "Cryo Normal DMG Increase",
  pyro_normal_dmgInc: "Pyro Normal DMG Increase",
  hydro_normal_dmgInc: "Hydro Normal DMG Increase",
  dendro_normal_dmgInc: "Dendro Normal DMG Increase",
  electro_normal_dmgInc: "Electro Normal DMG Increase",
  anemo_normal_dmgInc: "Anemo Normal DMG Increase",
  geo_normal_dmgInc: "Geo Normal DMG Increase",
  physical_normal_dmgInc: "Physical Normal DMG Increase",
  allElements_normal_dmgInc: "Normal DMG Increase",
  cryo_charged_dmgInc: "Cryo Charged DMG Increase",
  pyro_charged_dmgInc: "Pyro Charged DMG Increase",
  hydro_charged_dmgInc: "Hydro Charged DMG Increase",
  dendro_charged_dmgInc: "Dendro Charged DMG Increase",
  electro_charged_dmgInc: "Electro Charged DMG Increase",
  anemo_charged_dmgInc: "Anemo Charged DMG Increase",
  geo_charged_dmgInc: "Geo Charged DMG Increase",
  physical_charged_dmgInc: "Physical Charged DMG Increase",
  allElements_charged_dmgInc: "Charged DMG Increase",
  cryo_plunging_dmgInc: "Cryo Plunging DMG Increase",
  pyro_plunging_dmgInc: "Pyro Plunging DMG Increase",
  hydro_plunging_dmgInc: "Hydro Plunging DMG Increase",
  dendro_plunging_dmgInc: "Dendro Plunging DMG Increase",
  electro_plunging_dmgInc: "Electro Plunging DMG Increase",
  anemo_plunging_dmgInc: "Anemo Plunging DMG Increase",
  geo_plunging_dmgInc: "Geo Plunging DMG Increase",
  physical_plunging_dmgInc: "Physical Plunging DMG Increase",
  allElements_plunging_dmgInc: "Plunging DMG Increase",
  cryo_skill_dmgInc: "Cryo Skill DMG Increase",
  pyro_skill_dmgInc: "Pyro Skill DMG Increase",
  hydro_skill_dmgInc: "Hydro Skill DMG Increase",
  dendro_skill_dmgInc: "Dendro Skill DMG Increase",
  electro_skill_dmgInc: "Electro Skill DMG Increase",
  anemo_skill_dmgInc: "Anemo Skill DMG Increase",
  geo_skill_dmgInc: "Geo Skill DMG Increase",
  physical_skill_dmgInc: "Physical Skill DMG Increase",
  allElements_skill_dmgInc: "Skill DMG Increase",
  cryo_burst_dmgInc: "Cryo Burst DMG Increase",
  pyro_burst_dmgInc: "Pyro Burst DMG Increase",
  hydro_burst_dmgInc: "Hydro Burst DMG Increase",
  dendro_burst_dmgInc: "Dendro Burst DMG Increase",
  electro_burst_dmgInc: "Electro Burst DMG Increase",
  anemo_burst_dmgInc: "Anemo Burst DMG Increase",
  geo_burst_dmgInc: "Geo Burst DMG Increase",
  physical_burst_dmgInc: "Geo Burst DMG Increase",
  allElements_burst_dmgInc: "Geo Burst DMG Increase",
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

  // Reaction
  transformative_level_multi: "Reaction Level Multiplier",
  amplificative_dmg_: "Amplificative Reaction DMG Bonus",
  transformative_dmg_: "Transformative Reaction DMG Bonus",
  crystallize_dmg_: "Crystallize Bonus",
  burning_dmg_: "Burning DMG Bonus",
  crystallize: `Crystallize`, // for displaying general crystallize

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

export type Unit = "flat" | "%" | "s"

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
})

export type HitMoveDmgKey = `${HitMoveKey}_dmg_`
export const allHitMoveDmgKeys = Object.keys(hitMoves).map(h => `${h}_dmg_`) as HitMoveDmgKey[]

export type EleHitMoveIncKey = `${ElementKeyWithPhy}_${HitMoveKey}_dmgInc`
export const allEleHitMoveIncKeys = allElementsWithPhy.flatMap(ele => Object.keys(hitMoves).map(move => `${ele}_${move}_dmgInc` as const)) as EleHitMoveIncKey[]

export type HitMoveCritRateKey = `${HitMoveKey}_critRate_`
export const allHitMoveCritRateKeys = Object.keys(hitMoves).map(h => `${h}_critRate_`) as HitMoveCritRateKey[]

Object.entries(hitMoves).forEach(([move, moveName]) => {
  statMap[`${move}_dmgInc`] = `${moveName} DMG Increase`
  statMap[`${move}_dmg_`] = `${moveName} DMG Bonus`
  statMap[`${move}_critRate_`] = `${moveName} CRIT Rate Bonus`
})

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
});

//Crystallize
(["cryo", "hydro", "pyro", "electro"]).forEach(e => {
  statMap[`${e}_crystallize`] = `${elementalData[e].name} Crystallize`
})


export type AmplifyingReactionsDmgKey = `${AmplifyingReactionsKey}_dmg_`
export const allAmplifyingReactionsDmgKey = Object.keys(amplifyingReactions).map(e => `${e}_dmg_`) as AmplifyingReactionsDmgKey[]

Object.entries(amplifyingReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
})

export type StatKey = BaseKeys | EleDmgKey | EleResKey | EleEnemyResKey | HitMoveDmgKey | HitMoveCritRateKey | EleHitMoveIncKey | TransformativeReactionsDmgKey | AmplifyingReactionsDmgKey

export type KeyMapPrefix = 'default' | 'base' | 'total' | 'uncapped' | 'custom' | 'char' | 'art' | 'weapon' | 'teamBuff'
const subKeyMap: StrictDict<KeyMapPrefix, string> = {
  default: "Default", base: "Base", total: "Total", uncapped: "Uncapped",
  custom: "Custom", char: "Char.", art: "Art.", weapon: "Weapon",
  teamBuff: "Team"
}

export const allStatKeys = Object.keys(statMap) as StatKey[]

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
  static get(key: string = ""): Displayable | undefined {
    const name = KeyMap.getStr(key)
    if (name) return name
    if (key.includes(":")) {
      const [ns, key18] = key.split(":")
      return <Translate ns={ns} key18={key18} />
    }
    return key
  }
  static getNoUnit(key: string): Displayable {
    const name = KeyMap.get(key) ?? ""
    if (typeof name === "string")
      return name.endsWith("%") ? name.slice(0, -1) : name
    return name
  }
  static unit(key: string = ""): Unit {
    if (key.endsWith("_")) return "%"
    return "flat"
  }
  static unitStr(key: string = ""): string {
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
  else unit = '' as any
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
