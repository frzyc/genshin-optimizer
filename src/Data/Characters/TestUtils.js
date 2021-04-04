import Artifact from "../../Artifact/Artifact"
import { PreprocessFormulas, StatData } from "../../StatData"
import { GetDependencies } from "../../StatDependency"
import { parseFlexObj, _createFlexObj } from "../../Util/FlexUtil"

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

export function parseTestFlexObject(url) {
  let character = parseFlexObj(url.split("flex?")[1])
  let artifacts = character.artifacts.map(artifact => {
    let { numStars, level, mainStatKey, substats } = artifact
    let result = Object.fromEntries(substats.map(({key, value}) => [ key, value ]))
    result[mainStatKey] = Artifact.getMainStatValue(mainStatKey, numStars, level)
    return result
  })
  delete character.artifacts
  return { character, artifacts }
}