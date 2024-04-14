export const weaponSortKeys = ['level', 'rarity', 'name'] as const
export type WeaponSortKey = (typeof weaponSortKeys)[number]
