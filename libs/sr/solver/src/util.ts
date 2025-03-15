import type {
  RelicMainStatKey,
  RelicSetKey,
  RelicSubStatKey,
} from '@genshin-optimizer/sr/consts'
import type { IBuildTc, ICachedRelic } from '@genshin-optimizer/sr/db'
import type { TagMapNodeEntries } from '@genshin-optimizer/sr/formula'
import { relicTagMapNodeEntries } from '@genshin-optimizer/sr/formula'
import { getRelicMainStatVal } from '@genshin-optimizer/sr/util'
export function relicsTagMapNodes(relics: ICachedRelic[]): TagMapNodeEntries {
  const sets: Partial<Record<RelicSetKey, number>> = {},
    stats: Partial<Record<RelicMainStatKey | RelicSubStatKey, number>> = {}
  relics.forEach((relic) => {
    sets[relic.setKey] = (sets[relic.setKey] ?? 0) + 1
    stats[relic.mainStatKey] =
      (stats[relic.mainStatKey] ?? 0) + relic.mainStatVal
    relic.substats.forEach((substat) => {
      if (!substat.key || !substat.accurateValue) return
      stats[substat.key] = (stats[substat.key] ?? 0) + substat.accurateValue
    })
  })
  return relicTagMapNodeEntries(stats, sets)
}

export function relicTcTagMapNodes(
  relic: IBuildTc['relic'],
): TagMapNodeEntries {
  const {
    slots,
    substats: { stats: substats },
    sets,
  } = relic
  const stats = { ...substats } as Record<
    RelicMainStatKey | RelicSubStatKey,
    number
  >
  Object.values(slots).forEach(({ level, statKey, rarity }) => {
    const val = getRelicMainStatVal(rarity, statKey, level)
    stats[statKey] = (stats[statKey] ?? 0) + val
  })
  return relicTagMapNodeEntries(stats, sets)
}
