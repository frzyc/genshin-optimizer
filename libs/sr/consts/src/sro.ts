export const allHitModeKeys = ['hit', 'avgHit', 'critHit'] as const
export type HitModeKey = (typeof allHitModeKeys)[number]

export const relicSubstatTypeKeys = ['max', 'mid', 'min'] as const
export type RelicSubstatTypeKey = (typeof relicSubstatTypeKeys)[number]
