import { objMap } from '@genshin-optimizer/common/util'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { discsDetailedJSONData } from '@genshin-optimizer/zzz/dm'
import type { DiscDatum } from '../../../disc'

export type discsData = Record<DiscSetKey, DiscDatum>
export function getDiscsData(): discsData {
  return objMap(discsDetailedJSONData, (_d) => ({}))
}
