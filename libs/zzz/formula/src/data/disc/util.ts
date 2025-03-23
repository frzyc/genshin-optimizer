import { registerEquipment } from '@genshin-optimizer/game-opt/formula'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { disc2pEffect } from '@genshin-optimizer/zzz/consts'
import type { Tag, TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { getStatFromStatKey, own, ownBuff, registerBuff } from '../util'

export function registerDisc(
  sheet: DiscSetKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  return registerEquipment<Tag>(sheet, 'disc', ...data)
}

export function entriesForDisc(key: DiscSetKey): TagMapNodeEntries {
  const discCount = own.common.count.sheet(key)
  const showCond2Set = cmpGE(discCount, 2, 'infer', '')
  // currrently mapped to dmg_, which is not specific enough. will be cleaned up post M4.
  if (key === 'ShadowHarmony')
    return [
      ...registerBuff(
        'set2_dash',
        ownBuff.initial.dmg_.addWithDmgType('dash', cmpGE(discCount, 2, 0.15)),
        showCond2Set
      ),
      ...registerBuff(
        'set2_aftershock',
        ownBuff.initial.dmg_.addWithDmgType(
          'aftershock',
          cmpGE(discCount, 2, 0.15)
        ),
        showCond2Set
      ),
    ]

  const dataGen = disc2pEffect[key]

  // Passive stats
  return Object.entries(dataGen).flatMap(([stat, value]) =>
    registerBuff(
      'set2',
      getStatFromStatKey(ownBuff.initial, stat).add(cmpGE(discCount, 2, value)),
      showCond2Set
    )
  )
}
