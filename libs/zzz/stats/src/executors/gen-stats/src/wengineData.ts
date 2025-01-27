import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import type { WengineData } from '@genshin-optimizer/zzz/dm'
import { wengineDetailedJSONData } from '@genshin-optimizer/zzz/dm'

export type WengineDatum = WengineData

export type WenginesData = Record<WengineKey, WengineDatum>
export function WengineData(): WenginesData {
  return wengineDetailedJSONData
}
