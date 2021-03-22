import { PreprocessFormulas, StatData } from "../../StatData"
import { GetDependencies } from "../../StatDependency"

export const createProxiedStats = (baseStats) => new Proxy({ ...baseStats }, {
  get: (target, property) => { 
    if (!(property in StatData) && !(property in target)) throw property
    return target[property] ?? StatData[property].default ?? 0
  }
})
export function applyArtifacts(stats, artifacts) {
  artifacts.forEach(artifact =>
    Object.entries(artifact).forEach(([key, value]) =>
      stats[key] += value)
  )
}
export function computeAllStats(baseStats) {
  const stats = { ...baseStats }
  PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
  return stats
}