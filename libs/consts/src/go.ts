// GO specific consts

export const allHitModeKeys = ['hit', 'avgHit', 'critHit'] as const
export type HitModeKey = (typeof allHitModeKeys)[number]

export const allAdditiveReactions = ['spread', 'aggravate'] as const
export type AdditiveReactionKey = (typeof allAdditiveReactions)[number]

export const allAmpReactionKeys = ['vaporize', 'melt'] as const
export type AmpReactionKey = (typeof allAmpReactionKeys)[number]

export const allInfusionAuraElementKeys = [
  'pyro',
  'cryo',
  'hydro',
  'electro',
] as const
export type InfusionAuraElementKey = (typeof allInfusionAuraElementKeys)[number]

export const substatTypeKeys = ['max', 'mid', 'min'] as const
export type SubstatTypeKey = (typeof substatTypeKeys)[number]
