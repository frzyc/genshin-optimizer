export const allHitModeKeys = ['hit', 'avgHit', 'critHit'] as const
export type HitModeKey = (typeof allHitModeKeys)[number]
