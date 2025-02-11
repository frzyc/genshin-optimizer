import { objSumInPlace } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from './allStats'

export function getCharStat(ck: CharacterKey) {
  return allStats.char[ck]
}

export function getCharacterStats(
  ck: CharacterKey,
  level: number,
  core: number
) {
  const {
    promotionStats,
    coreStats,
    stats: {
      atk_base,
      atk_growth,
      def_base,
      def_growth,
      hp_base,
      hp_growth,
      anomMas_base,
      anomProf,
    },
  } = getCharStat(ck)
  const stats: Record<string, number> = {
    charLvl: level,
    crit_: 0.05,
    crit_dmg_: 0.5,
    anomMas_base,
    anomProf,
    atk_base:
      atk_base +
      atk_growth * (level - 1) +
      promotionStats[Math.floor(level / 10) - 1].atk,
    def_base:
      def_base +
      def_growth * (level - 1) +
      promotionStats[Math.floor(level / 10) - 1].def,
    hp_base:
      hp_base +
      hp_growth * (level - 1) +
      promotionStats[Math.floor(level / 10) - 1].hp,
  }
  if (core > 1 && coreStats[core - 1]) objSumInPlace(stats, coreStats[core - 1])

  return stats
}
