import { allDiscMainStatKeys, allDiscSubStatKeys } from './disc'

export const otherStatKeys = [
  'impact', // flat impact on character
  'anomMas', // flat Anomally Mastery on character
  'shield_', // Shield Effect
] as const

export const allStatKeys = Array.from(
  new Set([...allDiscMainStatKeys, ...allDiscSubStatKeys, ...otherStatKeys])
)
export type StatKey = (typeof allStatKeys)[number]

export const allAttributeDamageKeys = [
  'electric_dmg_',
  'fire_dmg_',
  'ice_dmg_',
  'frost_dmg_',
  'physical_dmg_',
  'ether_dmg_',
] as const
export type AttributeDamageKey = (typeof allAttributeDamageKeys)[number]
