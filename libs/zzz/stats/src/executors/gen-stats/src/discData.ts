import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import type { DiscData } from '@genshin-optimizer/zzz/dm'
import { discsDetailedJSONData } from '@genshin-optimizer/zzz/dm'

export type DiscDatum = DiscData

export type discsData = Record<DiscSetKey, DiscDatum>
export function getDiscsData(): discsData {
  return discsDetailedJSONData
}
