export const allRarities = [5, 4, 3, 2, 1] as const
export type Rarity = typeof allRarities[number]
