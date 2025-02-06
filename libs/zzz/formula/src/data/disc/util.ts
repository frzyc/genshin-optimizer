import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { disc2pEffect } from '@genshin-optimizer/zzz/consts'
import type { TagMapNodeEntries } from '../util'
import { getStatFromStatKey, own, ownBuff } from '../util'

export function entriesForDisc(key: DiscSetKey): TagMapNodeEntries {
  const relicCount = own.common.count.sheet(key)
  const dataGen = disc2pEffect[key]
  return [
    // Passive stats
    ...Object.entries(dataGen).map(([stat, value]) =>
      getStatFromStatKey(ownBuff.initial, stat).add(cmpGE(relicCount, 2, value))
    ),
  ]
}
