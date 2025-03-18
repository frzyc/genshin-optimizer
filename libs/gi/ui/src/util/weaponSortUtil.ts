import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/common/util'
import type { WeaponSortKey } from '@genshin-optimizer/gi/db'
import type { IWeapon } from '@genshin-optimizer/gi/good'
import { i18n } from '@genshin-optimizer/gi/i18n'
import { allStats } from '@genshin-optimizer/gi/stats'

export function weaponSortConfigs(): SortConfigs<WeaponSortKey, IWeapon> {
  return {
    level: (wp) => wp.level * (wp.ascension + 1),
    rarity: (wp) => allStats.weapon.data[wp.key].rarity,
    name: (wp) => i18n.t(`weaponNames_gen:${wp.key}`) as string,
  }
}
export function weaponFilterConfigs(): FilterConfigs<
  | 'rarity'
  | 'weaponType'
  | 'name'
  | 'locked'
  | 'showInventory'
  | 'showEquipped'
  | 'locations',
  IWeapon
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
    locked: (wp, filter) => {
      if (filter.includes('locked') && wp.lock) return true
      if (filter.includes('unlocked') && !wp.lock) return true
      return false
    },
    showEquipped: () => true, // Per character filtering is applied in `locations`
    showInventory: (wp, filter) => (!wp.location ? filter : true),
    locations: (wp, filter, filters) =>
      wp.location && !filters.showEquipped
        ? filter.includes(wp.location)
        : true,
  }
}

export const weaponSortMap: Partial<Record<WeaponSortKey, WeaponSortKey[]>> = {
  name: ['name'],
  level: ['level', 'rarity', 'name'],
  rarity: ['rarity', 'level', 'name'],
}
