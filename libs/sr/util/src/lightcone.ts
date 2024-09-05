import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/common/util'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { allStats } from '@genshin-optimizer/sr/stats'

export const lightConeSortKeys = ['level', 'name', 'rarity'] as const
export type LightConeSortKey = (typeof lightConeSortKeys)[number]

// TODO: SRO currently has NO i18n at the moment.
// All `name` functions must have the generated LC key names
// wrapped with i18n.t() once it is implemented

export function lightConeSortConfigs(): SortConfigs<
  LightConeSortKey,
  ILightCone
> {
  return {
    level: (lc) => lc.level * (lc.ascension + 1),
    name: (lc) => `lightConeNames_gen:${lc.key}` as string,
    rarity: (lc) => allStats.lightCone[lc.key].rarity,
  }
}
export function lightConeFilterConfigs(): FilterConfigs<
  'name' | 'path' | 'rarity',
  ILightCone
> {
  return {
    rarity: (lc, filter) => filter.includes(allStats.lightCone[lc.key].rarity),
    name: (lc, filter) =>
      `lightConeNames_gen:${lc.key}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
    path: (lc, filter) => filter.includes(allStats.lightCone[lc.key].path),
  }
}

export const lightConeSortMap: Partial<
  Record<LightConeSortKey, LightConeSortKey[]>
> = {
  name: ['name'],
  level: ['level', 'rarity', 'name'],
  rarity: ['rarity', 'level', 'name'],
}
