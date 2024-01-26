export const allRarityKeys = [5, 4, 3, 2, 1] as const
export type RarityKey = (typeof allRarityKeys)[number]
export const talentLimits = [1, 1, 2, 4, 6, 8, 10] as const
