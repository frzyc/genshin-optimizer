import type {
  DiscMainStatKey,
  DiscSetKey,
  DiscSubStatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  getDiscMainStatVal,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import type { TagMapNodeEntries } from '@genshin-optimizer/zzz/formula'
import { discTagMapNodeEntries } from '@genshin-optimizer/zzz/formula'
export function discsTagMapNodes(discs: ICachedDisc[]): TagMapNodeEntries {
  const sets: Partial<Record<DiscSetKey, number>> = {},
    stats: Partial<Record<DiscMainStatKey | DiscSubStatKey, number>> = {}
  discs.forEach(({ setKey, mainStatKey, substats, level, rarity }) => {
    sets[setKey] = (sets[setKey] ?? 0) + 1
    stats[mainStatKey] =
      (stats[mainStatKey] ?? 0) + getDiscMainStatVal(rarity, mainStatKey, level)
    substats.forEach(({ key, upgrades }) => {
      if (!key || !upgrades) return
      stats[key] =
        (stats[key] ?? 0) + getDiscSubStatBaseVal(key, rarity) * upgrades
    })
  })
  return discTagMapNodeEntries(stats, sets)
}
