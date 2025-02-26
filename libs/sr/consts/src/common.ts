import type { AbilityKey } from './character'
import { allRelicMainStatKeys, allRelicSubStatKeys } from './relic'

export const allRarityKeys = [5, 4, 3, 2, 1] as const
export type RarityKey = (typeof allRarityKeys)[number]

export const otherStatKeys = ['spd_', 'dmg_', 'weakness_', 'resPen_'] as const

export const allStatKeys = Array.from(
  new Set([...allRelicMainStatKeys, ...allRelicSubStatKeys, ...otherStatKeys])
)
export type StatKey = (typeof allStatKeys)[number]

export const allElementalDamageKeys = [
  'physical_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'wind_dmg_',
  'lightning_dmg_',
  'quantum_dmg_',
  'imaginary_dmg_',
] as const
export type ElementalDamageKey = (typeof allElementalDamageKeys)[number]

export const allAscensionKeys = [0, 1, 2, 3, 4, 5, 6] as const
export type AscensionKey = (typeof allAscensionKeys)[number]

export const abilityLimits = [1, 2, 3, 4, 6, 8, 10] as const
export const basicAbilityLimits = [1, 1, 2, 3, 4, 5, 6] as const
export const allAbilityLimits: Record<
  Exclude<AbilityKey, 'technique' | 'overworld'>,
  typeof abilityLimits | typeof basicAbilityLimits
> = {
  basic: basicAbilityLimits,
  skill: abilityLimits,
  ult: abilityLimits,
  talent: abilityLimits,
} as const

export const allPathKeys = [
  'Erudition',
  'Preservation',
  'Abundance',
  'Nihility',
  'Destruction',
  'Harmony',
  'TheHunt',
  'Remembrance',
] as const
export type PathKey = (typeof allPathKeys)[number]
