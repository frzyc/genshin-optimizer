import Artifact from "../../Artifact/Artifact"
import { parseFlexObj } from "../../FlexPage/FlexUtil"
import { PreprocessFormulas, StatData } from "../../StatData"
import { GetDependencies } from "../../StatDependency"


export const createProxiedStats = (baseStats) => new Proxy({ ...baseStats }, {
  get: (target, property: string) => {
    if (!(property in StatData) && !(property in target)) throw property
    return target[property] ?? StatData[property].default ?? 0
  }
})
export function applyArtifacts(stats, artifacts) {
  artifacts.forEach(artifact =>
    Object.entries(artifact).forEach(([key, value]: any) =>
      stats[key] += value)
  )
}
export function computeAllStats(baseStats) {
  const stats = { ...baseStats }
  PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
  return stats
}

export function parseTestFlexObject(url) {
  const [{ character, artifacts: flexArts }] = parseFlexObj(url.split("flex?")[1])!
  let artifacts = flexArts.map(artifact => {
    let { numStars, level, mainStatKey, substats } = artifact
    return {
      ...Object.fromEntries(substats
        .filter(s => s.key != "")
        .map(({ key, value }) => [key, value])),
      [mainStatKey]: Artifact.mainStatValue(mainStatKey, numStars, level)
    }
  })
  return { character, artifacts }
}