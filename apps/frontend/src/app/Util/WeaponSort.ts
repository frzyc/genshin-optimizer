import { allStats } from '@genshin-optimizer/gi-stats'
import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/util'
import i18n from '../i18n'
import type { ICachedWeapon } from '../Types/weapon'
export const weaponSortKeys = ['level', 'rarity', 'name'] as const
export type WeaponSortKey = (typeof weaponSortKeys)[number]
export function weaponSortConfigs(): SortConfigs<WeaponSortKey, ICachedWeapon> {
  return {
    level: (wp) => wp.level * (wp.ascension + 1) ?? 0,
    rarity: (wp) => allStats.weapon.data[wp.key].rarity,
    name: (wp) => i18n.t(`weaponNames_gen:${wp.key}`) as string,
  }
}
export function weaponFilterConfigs(): FilterConfigs<
  'rarity' | 'weaponType' | 'name',
  ICachedWeapon
> {
  return {
    rarity: (wp, filter) =>
      filter.includes(allStats.weapon.data[wp.key].rarity),
    weaponType: (wp, filter) =>
      filter.includes(allStats.weapon.data[wp.key].weaponType),
    name: (wp, filter) =>
      i18n
        .t(`weaponNames_gen:${wp.key}`)
        .toLowerCase()
        .includes(filter.toLowerCase()),
  }
}

export const weaponSortMap: Partial<Record<WeaponSortKey, WeaponSortKey[]>> = {
  name: ['name'],
  level: ['level', 'rarity', 'name'],
  rarity: ['rarity', 'level', 'name'],
}
