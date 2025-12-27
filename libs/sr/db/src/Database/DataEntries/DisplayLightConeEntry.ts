import type { PathKey, RarityKey } from '@genshin-optimizer/sr/consts'
import { allPathKeys, allRarityKeys } from '@genshin-optimizer/sr/consts'
import { DataEntry } from '../DataEntry'
import type { SroDatabase } from '../Database'

export const lightConeSortKeys = ['level', 'rarity', 'name'] as const
export type LightConeSortKey = (typeof lightConeSortKeys)[number]
export interface IDisplayLightCone {
  sortType: LightConeSortKey
  ascending: boolean
  rarity: RarityKey[]
  path: PathKey[]
}

const initialState = () => ({
  sortType: lightConeSortKeys[0],
  ascending: false,
  rarity: [...allRarityKeys],
  path: [...allPathKeys],
})

export class DisplayLightConeEntry extends DataEntry<
  'display_lightcone',
  'display_lightcone',
  IDisplayLightCone,
  IDisplayLightCone
> {
  constructor(database: SroDatabase) {
    super(database, 'display_lightcone', initialState, 'display_lightcone')
  }
  override validate(obj: any): IDisplayLightCone | undefined {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return undefined
    let { sortType, ascending, rarity, path } = obj
    if (
      typeof sortType !== 'string' ||
      !lightConeSortKeys.includes(sortType as any)
    )
      sortType = lightConeSortKeys[0]
    if (typeof ascending !== 'boolean') ascending = false
    if (!Array.isArray(rarity)) rarity = [...allRarityKeys]
    else rarity = rarity.filter((r) => allRarityKeys.includes(r))
    if (!Array.isArray(path)) path = [...allPathKeys]
    else path = path.filter((r) => allPathKeys.includes(r))
    const data: IDisplayLightCone = {
      sortType,
      ascending,
      rarity,
      path,
    }
    return data
  }
}
