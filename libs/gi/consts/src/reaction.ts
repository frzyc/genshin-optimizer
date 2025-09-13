export const allLunarReactionKeys = ['lunarcharged', 'lunarbloom'] as const
export type LunarReactionKey = (typeof allLunarReactionKeys)[number]
export const allTransformativeReactionKeys = [
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
export type TransformativeReactionKey =
  (typeof allTransformativeReactionKeys)[number]
export const allAmplifyingReactionKeys = ['vaporize', 'melt'] as const
export type AmplifyingReactionKey = (typeof allAmplifyingReactionKeys)[number]
export const allCatalyzeReactionKeys = ['spread', 'aggravate'] as const
export type CatalyzeReactionKey = (typeof allCatalyzeReactionKeys)[number]
