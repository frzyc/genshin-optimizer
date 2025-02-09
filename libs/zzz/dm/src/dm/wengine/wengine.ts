import { isPercentStat } from '@genshin-optimizer/common/util'
import type {
  SpecialityKey,
  WengineKey,
  WengineRarityKey,
} from '@genshin-optimizer/zzz/consts'
import { readHakushinJSON } from '../../util'
import {
  specialityMap,
  subStatMap,
  WengineIdMap,
  wengineRarityMap,
} from './consts'
const SCALING = 10000
type WengineRawData = {
  Rarity: number
  WeaponType: Record<string, string>
  Name: string
  Desc: string
  Desc2: string
  Desc3: string
  Icon: string
  BaseProperty: {
    Name: 'Base ATK'
    Name2: 'Base ATK'
    Format: '{0:0.#}'
    Value: 40
  }
  RandProperty: {
    Name: 'ATK'
    Name2: 'Percent ATK'
    Format: '{0:0.#%}'
    Value: 1000
  }
}
export type WengineData = {
  rarity: WengineRarityKey
  type: SpecialityKey
  atk_base: number
  second_statkey: (typeof subStatMap)[keyof typeof subStatMap]
  second_statvalue: number
  icon: string
  desc: string
  desc2: string
  desc3: string
}
export const wengineDetailedJSONData = Object.fromEntries(
  Object.entries(WengineIdMap).map(([id, name]) => {
    const raw = JSON.parse(
      readHakushinJSON(`weapon/${id}.json`)
    ) as WengineRawData
    const second_statkey = subStatMap[raw.RandProperty.Name2]
    const data: WengineData = {
      rarity: wengineRarityMap[raw.Rarity],
      type: specialityMap[Object.keys(raw.WeaponType)[0] as any],
      atk_base: raw.BaseProperty.Value,
      second_statkey,
      second_statvalue:
        raw.RandProperty.Value / (isPercentStat(second_statkey) ? SCALING : 1),
      icon: raw.Icon,
      desc: raw.Desc,
      desc2: raw.Desc2,
      desc3: raw.Desc3,
    }
    return [name, data] as const
  })
) as Record<WengineKey, WengineData>
