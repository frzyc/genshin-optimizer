import { registerEquipment } from '@genshin-optimizer/game-opt/formula'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { disc2pEffect } from '@genshin-optimizer/zzz/consts'
import type { Tag, TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { getStatFromStatKey, own, ownBuff } from '../util'

export function registerDisc(
  sheet: DiscSetKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  return registerEquipment<Tag>(sheet, 'disc', ...data)
}

export function entriesForDisc(key: DiscSetKey): TagMapNodeEntries {
  const discCount = own.common.count.sheet(key)
  const dataGen = disc2pEffect[key]
  return [
    // Passive stats
    ...Object.entries(dataGen).map(([stat, value]) =>
      getStatFromStatKey(ownBuff.initial, stat).add(cmpGE(discCount, 2, value))
    ),
  ]
}
