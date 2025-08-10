import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import {
  allEleEnemyResKeys,
  crittableTransformativeReactions,
} from '@genshin-optimizer/gi/keymap'
/**
 * Copied from Formula
 */
const allElements = allElementWithPhyKeys
const allTalents = ['auto', 'skill', 'burst'] as const
const allMoves = [
  'normal',
  'charged',
  'plunging_collision',
  'plunging_impact',
  'skill',
  'burst',
  'elemental',
] as const
const allArtModStats = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'eleMas',
  'enerRech_',
  'critRate_',
  'critDMG_',
  'electro_dmg_',
  'hydro_dmg_',
  'pyro_dmg_',
  'cryo_dmg_',
  'physical_dmg_',
  'anemo_dmg_',
  'geo_dmg_',
  'dendro_dmg_',
  'heal_',
] as const
const allTransformative = [
  'overloaded',
  'shattered',
  'electrocharged',
  'lunarcharged',
  'superconduct',
  'swirl',
  'burning',
  'bloom',
  'burgeon',
  'hyperbloom',
] as const
const allAmplifying = ['vaporize', 'melt'] as const
const allAdditive = ['spread', 'aggravate'] as const
const allMisc = [
  'stamina',
  'staminaDec_',
  'staminaSprintDec_',
  'staminaGlidingDec_',
  'staminaChargedDec_',
  'incHeal_',
  'shield_',
  'cdRed_',
  'moveSPD_',
  'atkSPD_',
  'weakspotDMG_',
  'dmgRed_',
  'healInc',
] as const
const allBase = ['base_atk', 'base_hp', 'base_def'] as const

const allModStats = [
  ...allArtModStats,
  ...(
    [
      'all',
      ...allTransformative,
      ...allAmplifying,
      ...allAdditive,
      ...allMoves,
      'plunging',
      'normalEle',
    ] as const
  ).map((x) => `${x}_dmg_` as const),
] as const
const allNonModStats = [
  ...allElements.flatMap((x) => [
    `${x}_dmgInc` as const,
    `${x}_critDMG_` as const,
    `${x}_res_` as const,
  ]),
  ...allTalents.map((x) => `${x}Boost` as const),
  ...([...allMoves, 'plunging'] as const).flatMap((x) => [
    `${x}_dmgInc` as const,
    `${x}_critDMG_` as const,
    `${x}_critRate_` as const,
  ]),
  ...crittableTransformativeReactions.flatMap((x) => [
    `${x}_critRate_` as const,
    `${x}_critDMG_` as const,
  ]),
  'all_dmgInc' as const,
  ...allEleEnemyResKeys,
  'enemyDefRed_' as const,
  'enemyDefIgn_' as const,
  ...allMisc,
  ...allBase,
] as const
/**
 * @deprecated
 * Copied from Formula
 */
export const allInputPremodKeys = [...allModStats, ...allNonModStats] as const
/**
 * @deprecated
 * Copied from Formula
 */
export type InputPremodKey = (typeof allInputPremodKeys)[number]
