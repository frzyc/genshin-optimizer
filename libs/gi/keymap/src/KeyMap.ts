import type {
  ElementWithPhyKey,
  TransformativeReactionKey,
} from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'

import elementalData from './ElementalData'
import type {
  AdditiveReactionsKey,
  AmplifyingReactionsKey,
  CrittableTransformativeReactionsKey,
  HitMoveKey,
} from './StatConstants'
import {
  additiveReactions,
  amplifyingReactions,
  crittableTransformativeReactions,
  hitMoves,
  transformativeReactions,
} from './StatConstants'

const baseMap = {
  hp: 'HP',
  hp_: 'HP',
  atk: 'ATK',
  atk_: 'ATK',
  def: 'DEF',
  def_: 'DEF',
  eleMas: 'Elemental Mastery',
  enerRech_: 'Energy Recharge',
  critRate_: 'Crit Rate',
  critDMG_: 'Crit DMG',
  heal_: 'Healing Bonus',

  // Misc. Stats
  base: 'Base DMG',
  dmg_: 'Total DMG Bonus',
  dmgInc: 'Total DMG Increase',
  all_dmg_: 'Common DMG Bonus',
  all_dmgInc: 'Common DMG Increase',
  weakspotDMG_: 'Weakspot DMG',
  incHeal_: 'Incoming Healing Bonus',
  shield_: 'Shield Strength',
  cdRed_: 'CD Reduction',
  skillCDRed_: 'Ele. Skill CD Red.',
  burstCDRed_: 'Ele. Burst CD Red.',
  moveSPD_: 'Movement SPD',
  atkSPD_: 'ATK SPD',
  stamina: 'Stamina',
  staminaDec_: 'Stamina Consumption Dec.',
  staminaSprintDec_: 'Sprinting Stamina Consumption Dec.',
  staminaGlidingDec_: 'Gliding Stamina Consumption Dec.',
  staminaChargedDec_: 'Charged Attack Stamina Consumption Dec.',
  dmgRed_: 'Damage Reduction',
  normalEle_dmg_: 'Normal Att. Ele. DMG Bonus',

  heal_multi: 'Heal multiplier',
  healInc: 'Heal Increase',

  // Reaction
  transformative_level_multi: 'Transformative Reaction Level Multiplier',
  crystallize_level_multi_: 'Crystallize Reaction Level Multiplier',
  amplificative_dmg_: 'Amplificative Reaction DMG Bonus',
  transformative_dmg_: 'Transformative Reaction DMG Bonus',
  crystallize_dmg_: 'Crystallize Bonus',
  crystallize: `Crystallize`, // for displaying general crystallize
  base_amplifying_multi_: 'Base Amplifying Multiplier',
  base_transformative_multi_: 'Base Transformative Multiplier',
  base_crystallize_multi_: 'Base Crystallize Multiplier',

  // Enemy
  enemyLevel: 'Enemy Level',
  enemyLevel_multi_: 'Enemy Level RES Multiplier',
  enemyDef_multi_: 'Enemy DEF Multiplier',
  enemyDefRed_: 'Enemy DEF Reduction',
  enemyDefIgn_: 'Enemy DEF Ignore',

  //infusion
  infusionSelf: 'Elemental Infusion',
  infusionAura: 'Elemental Infusion Aura',

  //talentBoost
  autoBoost: 'Normal Attack Level Boost',
  skillBoost: 'Ele. Skill Level Boost',
  burstBoost: 'Ele. Burst Level Boost',

  // Modifiable base stats
  base_atk: 'Base ATK',
  base_hp: 'Base HP',
  base_def: 'Base DEF',

  level: 'Level',
  ascension: 'Ascension',
  constellation: 'Constellation',
  auto: 'Normal Attack Lv.',
  skill: 'Elemental Skill Lv.',
  burst: 'Elemental Burst Lv.',
} as const

const statMap = { ...baseMap } as Record<StatKey, string>

export type Unit = '' | '%' | 's'

export type BaseKeys = keyof typeof baseMap

/* Elemental extension keys */

export type EleDmgKey = `${ElementWithPhyKey}_dmg_`
export const allEleDmgKeys = allElementWithPhyKeys.map(
  (e) => `${e}_dmg_`
) as EleDmgKey[]

export type EleResKey = `${ElementWithPhyKey}_res_`
export const allEleResKeys = allElementWithPhyKeys.map(
  (e) => `${e}_res_`
) as EleResKey[]

type EleDmgIncKey = `${ElementWithPhyKey}_dmgInc`

export type EleEnemyResKey = `${ElementWithPhyKey}_enemyRes_`
export const allEleEnemyResKeys = allElementWithPhyKeys.map(
  (e) => `${e}_enemyRes_`
) as EleEnemyResKey[]

type EleECritDmgKey = `${ElementWithPhyKey}_critDMG_`

Object.entries(elementalData).forEach(([e, { name }]) => {
  statMap[`${e}_dmg_`] = `${name} DMG Bonus`
  statMap[`${e}_res_`] = `${name} DMG RES`

  statMap[`${e}_enemyRes_`] = `Enemy ${name} DMG RES`
  statMap[`${e}_dmgInc`] = `${name} DMG Increase`
  statMap[`${e}_critDMG_`] = `${name} CRIT DMG Bonus`
})

type ElementExtKey =
  | EleDmgKey
  | EleResKey
  | EleEnemyResKey
  | EleDmgIncKey
  | EleECritDmgKey

/* Hit move extension keys */
type HitMoveDmgKey = `${HitMoveKey}_dmg_`
type HitMoveDmgIncKey = `${HitMoveKey}_dmgInc`
type HitMoveCritRateKey = `${HitMoveKey}_critRate_`
type HitMoveCritDmgKey = `${HitMoveKey}_critDMG_`

Object.entries(hitMoves).forEach(([move, moveName]) => {
  statMap[`${move}_dmgInc`] = `${moveName} DMG Increase`
  statMap[`${move}_dmg_`] = `${moveName} DMG Bonus`
  statMap[`${move}_critRate_`] = `${moveName} CRIT Rate Bonus`
  statMap[`${move}_critDMG_`] = `${moveName} CRIT DMG Bonus`
})
type MoveExtKey =
  | HitMoveDmgKey
  | HitMoveDmgIncKey
  | HitMoveCritRateKey
  | HitMoveCritDmgKey

/* Transformation extension keys */
type TransformativeReactionsDmgKey = `${TransformativeReactionKey}_dmg_`

Object.entries(transformativeReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
})

type SwirlReactionKey =
  `${(typeof transformativeReactions.swirl.variants)[number]}_swirl_hit`
type NonSwirlReactionHitKey = `${
  | 'overloaded'
  | 'shattered'
  | 'electrocharged'
  | 'superconduct'
  | 'burning'
  | 'bloom'
  | 'burgeon'
  | 'hyperbloom'}_hit`
type NonSwirlReactionMultiKey = `${keyof typeof transformativeReactions}_multi_`
type TransformativeReactions =
  | SwirlReactionKey
  | NonSwirlReactionHitKey
  | NonSwirlReactionMultiKey
Object.entries(transformativeReactions).forEach(([reaction, { name }]) => {
  if (reaction === 'swirl')
    transformativeReactions.swirl.variants.forEach((v) => {
      statMap[`${v}_${reaction}_hit`] = `${elementalData[v].name} ${name} DMG`
    })
  else statMap[`${reaction}_hit`] = `${name} DMG`
  statMap[`${reaction}_multi_`] = `${name} Multiplier`
})

type TransformativeReactionsCritRateKey =
  `${CrittableTransformativeReactionsKey}_critRate_`
type TransformativeReactionsCritDMGKey =
  `${CrittableTransformativeReactionsKey}_critDMG_`

crittableTransformativeReactions.forEach((reaction) => {
  statMap[
    `${reaction}_critRate_`
  ] = `${transformativeReactions[reaction].name} Crit Rate`
  statMap[
    `${reaction}_critDMG_`
  ] = `${transformativeReactions[reaction].name} Crit DMG`
})
const crystallizeElements = ['cryo', 'hydro', 'pyro', 'electro'] as const
export type CrystallizeKey =
  `${(typeof crystallizeElements)[number]}_crystallize`
//Crystallize
crystallizeElements.forEach((e) => {
  statMap[`${e}_crystallize`] = `${elementalData[e].name} Crystallize`
})

type AmplifyingReactionsDmgKey = `${AmplifyingReactionsKey}_dmg_`
type AmplifyingReactionsMultiKey = `${AmplifyingReactionsKey}_multi_`

Object.entries(amplifyingReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
  statMap[`${reaction}_multi_`] = `${name} Multiplier`
})

type AdditiveReactionsDmgKey = `${AdditiveReactionsKey}_dmg_`
type AdditiveReactionsDmgIncKey = `${AdditiveReactionsKey}_dmgInc`

Object.entries(additiveReactions).forEach(([reaction, { name }]) => {
  statMap[`${reaction}_dmg_`] = `${name} DMG Bonus`
  statMap[`${reaction}_dmgInc`] = `${name} DMG Increase`
})

/* EVERY stat key */
export type StatKey =
  | BaseKeys
  | ElementExtKey
  | MoveExtKey
  | TransformativeReactions
  | TransformativeReactionsDmgKey
  | TransformativeReactionsCritRateKey
  | TransformativeReactionsCritDMGKey
  | CrystallizeKey
  | AmplifyingReactionsDmgKey
  | AmplifyingReactionsMultiKey
  | AdditiveReactionsDmgKey
  | AdditiveReactionsDmgIncKey

/**
 * @deprecated This hosts a lot of key-> english string translations, but should not be used beyond Waverider.
 */
export class KeyMap {
  //do not instantiate.
  constructor() {
    if (this instanceof KeyMap)
      throw Error('A static class cannot be instantiated.')
  }
  static getStr(key = ''): string | undefined {
    return statMap[key as keyof typeof statMap]
  }
  static get(key = '') {
    return KeyMap.getStr(key) ?? key
  }
  static getVariant(
    key = ''
  ):
    | ElementWithPhyKey
    | TransformativeReactionKey
    | AmplifyingReactionsKey
    | AdditiveReactionsKey
    | 'heal'
    | undefined {
    const trans = Object.keys(transformativeReactions).find((e) =>
      key.startsWith(e)
    ) as undefined | keyof typeof transformativeReactions
    if (trans) return trans
    const amp = Object.keys(amplifyingReactions).find((e) =>
      key.startsWith(e)
    ) as undefined | keyof typeof amplifyingReactions
    if (amp) return amp
    const add = Object.keys(additiveReactions).find((e) =>
      key.startsWith(e)
    ) as undefined | keyof typeof additiveReactions
    if (add) return add
    if (key.includes('heal')) return 'heal'
    return allElementWithPhyKeys.find((e) => key.startsWith(e))
  }
}
