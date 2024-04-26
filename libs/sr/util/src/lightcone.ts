import type { FilterConfigs, SortConfigs } from '@genshin-optimizer/common/util'
import type { ILightCone } from '@genshin-optimizer/sr/srod'
import { allStats } from '@genshin-optimizer/sr/stats'
import { useTranslation } from 'react-i18next'

export const lightConeSortKeys = ['level', 'name', 'rarity'] as const
export type LightConeSortKey = (typeof lightConeSortKeys)[number]

export function lightConeSortConfigs(): SortConfigs<
  LightConeSortKey,
  ILightCone
> {
  const { t } = useTranslation('lightConeNames_gen')
  return {
    level: (lc) => lc.level * (lc.ascension + 1) ?? 0,
    name: (lc) => t(`lightConeNames_gen:${lc.key}`) as string,
    rarity: (lc) => allStats.lightCone[lc.key].rarity,
  }
}
export function lightConeFilterConfigs(): FilterConfigs<
  'name' | 'path' | 'rarity',
  ILightCone
> {
  const { t } = useTranslation('lightConeNames_gen')
  return {
    rarity: (lc, filter) => filter.includes(allStats.lightCone[lc.key].rarity),
    name: (lc, filter) =>
      t(`lightConeNames_gen:${lc.key}`)
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
