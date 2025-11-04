import {
  allElementWithPhyKeys,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import {
  allEleEnemyResKeys,
  crittableTransformativeReactions,
} from '@genshin-optimizer/gi/keymap'

export const allElements = allElementWithPhyKeys
export const allTalents = ['auto', 'skill', 'burst'] as const
export const allNonstackBuffs = [
  'no4',
  'totm4',
  'ap4',
  'inst4',
  'vv4pyro',
  'vv4hydro',
  'vv4electro',
  'vv4cryo',
  'dm4',
  'scroll4basepyro',
  'scroll4basehydro',
  'scroll4baseelectro',
  'scroll4basecryo',
  'scroll4baseanemo',
  'scroll4basegeo',
  'scroll4basedendro',
  'scroll4nspyro',
  'scroll4nshydro',
  'scroll4nselectro',
  'scroll4nscryo',
  'scroll4nsanemo',
  'scroll4nsgeo',
  'scroll4nsdendro',
  'millenialatk',
  'patrol',
  'key',
  'crane',
  'starcaller',
  'leafCon',
  'leafRev',
  'hakushinpyro',
  'hakushinhydro',
  'hakushinelectro',
  'hakushincryo',
  'hakushinanemo',
  'hakushingeo',
  'hakushindendro',
  'ttds',
  'wolf',
  'symphonist',
  'gleamingmoonintent',
  'gleamingmoondevotion',
  'nightweaver',
  'bloomcd',
] as const
export type NonStackBuff = (typeof allNonstackBuffs)[number]
export const allMoves = [
  'normal',
  'charged',
  'plunging_collision',
  'plunging_impact',
  'skill',
  'burst',
  'elemental',
] as const
export const allArtModStats = [
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
export const allTransformative = [
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
  'lunarbloom',
] as const
export const allAmplifying = ['vaporize', 'melt'] as const
export const allAdditive = ['spread', 'aggravate'] as const
export const allMisc = [
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
export const allBase = ['base_atk', 'base_hp', 'base_def'] as const

export const allModStats = [
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
export const allNonModStats = [
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
  ...allTransformative.map((x) => `${x}_dmgInc` as const),
  'all_dmgInc' as const,
  ...allLunarReactionKeys.flatMap((lr) => [
    `${lr}_baseDmg_` as const,
    `${lr}_specialDmg_` as const,
  ]),
  ...allEleEnemyResKeys,
  'enemyDefRed_' as const,
  'enemyDefIgn_' as const,
  ...allMisc,
  ...allBase,
] as const

export const allInputPremodKeys = [...allModStats, ...allNonModStats] as const

export type InputPremodKey = (typeof allInputPremodKeys)[number]
