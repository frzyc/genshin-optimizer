import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/common/util'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import type { IWengine } from '@genshin-optimizer/zzz/zood'

export const wengineSortKeys = ['level', 'rarity', 'name'] as const
export type WengineSortKey = (typeof wengineSortKeys)[number]

export function wengineSortConfigs(): SortConfigs<WengineSortKey, IWengine> {
  return {
    level: (we) => we.level * (we.ascension + 1),
    rarity: (we) => getWengineStat(we.key).rarity,
    name: (we) => i18n.t(`${we.key}`) as string,
  }
}
export function wengineFilterConfigs(): FilterConfigs<
  | 'rarity'
  | 'speciality'
  | 'name'
  | 'locked'
  | 'showInventory'
  | 'showEquipped'
  | 'locations',
  IWengine
> {
  return {
    rarity: (we, filter) => filter.includes(getWengineStat(we.key).rarity),
    speciality: (we, filter) => filter.includes(getWengineStat(we.key).type),
    name: (we, filter) =>
      i18n.t(`${we.key}`).toLowerCase().includes(filter.toLowerCase()),
    locked: (we, filter) => {
      if (filter.includes('locked') && we.lock) return true
      if (filter.includes('unlocked') && !we.lock) return true
      return false
    },
    showEquipped: () => true, // Per character filtering is applied in `locations`
    showInventory: (we, filter) => (!we.location ? filter : true),
    locations: (we, filter, filters) =>
      we.location && !filters['showEquipped']
        ? filter.includes(we.location)
        : true,
  }
}

export const wengineSortMap: Partial<Record<WengineSortKey, WengineSortKey[]>> =
  {
    name: ['name'],
    level: ['level', 'rarity', 'name'],
    rarity: ['rarity', 'level', 'name'],
  }
