import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import discs from './gen/discs'

export function discDefIcon(setKey: DiscSetKey) {
  return discs[setKey].circleIcon
}
