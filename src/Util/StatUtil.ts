import { BonusStats, Modifier } from "../Types/stats"

export function mergeStats(initialStats: BonusStats, stats: BonusStats | undefined) {
  if (!stats) return
  return Object.entries(stats).forEach(([key, val]: any) => {
    if (key === "modifiers") {
      initialStats.modifiers = initialStats.modifiers ?? {}
      for (const [key, paths] of (Object.entries(val as Modifier))) {
        initialStats.modifiers[key] = initialStats.modifiers[key] ?? []
        initialStats.modifiers[key].push(...paths)
      }
    } else {
      if (initialStats[key] === undefined) initialStats[key] = val
      else if (typeof initialStats[key] === "number") initialStats[key] += val
    }
  })
}