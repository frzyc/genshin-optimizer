import { registerEquipment } from '@genshin-optimizer/game-opt/formula'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpEq,
  cmpGE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allStats, getWengineStat } from '@genshin-optimizer/zzz/stats'
import type { Tag, TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { own, ownBuff } from '../util'

const atk_multiplier = [
  0, 0.1568, 0.3136, 0.4705, 0.6273, 0.7841, 0.9409, 1.0977, 1.2545, 1.4114,
  1.5682, 1.725, 1.8818, 2.0386, 2.1954, 2.3523, 2.5091, 2.6659, 2.8227, 2.9795,
  3.1363, 3.2932, 3.45, 3.6068, 3.7636, 3.9204, 4.0772, 4.2341, 4.3909, 4.5477,
  4.7045, 4.8613, 5.0181, 5.175, 5.3318, 5.4886, 5.6454, 5.8022, 5.959, 6.1159,
  6.2727, 6.4295, 6.5863, 6.7431, 6.8999, 7.0568, 7.2136, 7.3704, 7.5272, 7.684,
  7.8408, 7.9977, 8.1545, 8.3113, 8.4681, 8.6249, 8.7817, 8.9386, 9.0954,
  9.2522, 9.409,
]

export function registerWengine(
  sheet: WengineKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  return registerEquipment<Tag>(sheet, 'wengine', ...data)
}

export function entriesForWengine(key: WengineKey): TagMapNodeEntries {
  const { lvl, modification } = own.wengine
  const { atk_base, second_statkey, second_statvalue } = allStats.wengine[key]
  const wengineCount = own.common.count.sheet(key)
  return [
    // Main stat (Base ATK)
    // atk_base * 1 + atk_multiplier[level] + 0.8922 * modification
    ownBuff.base.atk.add(
      cmpGE(
        wengineCount,
        1,
        prod(
          atk_base,
          sum(1, subscript(lvl, atk_multiplier), prod(0.8922, modification))
        )
      )
    ),
    // Sub stat
    // second_statvalue * (1 + 0.3 * modification)
    ownBuff.initial[second_statkey].add(
      cmpGE(
        wengineCount,
        1,
        prod(second_statvalue, sum(1, prod(0.3, modification)))
      )
    ),
  ]
}

export function cmpSpecialtyAndEquipped(key: WengineKey, num: NumNode) {
  const weCount = own.common.count.sheet(key)
  const type = getWengineStat(key).type
  return cmpEq(type, own.char.specialty, cmpGE(weCount, 1, num))
}

export function showSpecialtyAndEquipped(key: WengineKey) {
  const weCount = own.common.count.sheet(key)
  const type = getWengineStat(key).type
  return cmpEq(type, own.char.specialty, cmpGE(weCount, 1, 'infer', ''), '')
}
