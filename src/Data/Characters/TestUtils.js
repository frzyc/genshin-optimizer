import { StatData } from "../../StatData"

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