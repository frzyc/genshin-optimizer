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
    levelStats,
    coreStats,
    stats: {
      atk_base,
      atk_growth,
      def_base,
      def_growth,
      hp_base,
      hp_growth,
      anomMas,
      anomProf,
    },
  } = getCharStat(ck)
  const stats: Record<string, number> = {
    charLvl: level,
    crit_: 0.05,
    crit_dmg_: 0.5,
    anomMas,
    anomProf,
    atk_base:
      atk_base +
      atk_growth * (level - 1) +
      levelStats[Math.floor(level / 10) - 1].atk,
    def_base:
      def_base +
      def_growth * (level - 1) +
      levelStats[Math.floor(level / 10) - 1].def,
    hp_base:
      hp_base +
      hp_growth * (level - 1) +
      levelStats[Math.floor(level / 10) - 1].hp,
  }
  Object.entries(coreStats[core - 1]).forEach(([k, v]) => {
    stats[k] = (stats[k] || 0) + v
  })

  return stats
}
