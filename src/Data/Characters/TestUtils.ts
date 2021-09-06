import Artifact from "../../Artifact/Artifact"
import { parseFlexObj } from "../../FlexPage/FlexUtil"
import { PreprocessFormulas, StatData } from "../../StatData"
import { GetDependencies } from "../../StatDependency"
import { ICalculatedStats } from "../../Types/stats"

export const createProxiedStats = (baseStats: Partial<ICalculatedStats>) => new Proxy({ ...baseStats }, {
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
  const { initialStats, formula } = PreprocessFormulas(GetDependencies(stats, stats.modifiers), stats)
  formula(initialStats)
  return { ...stats, ...initialStats }
}

export function parseTestFlexObject(url) {
  const [database, charKey] = parseFlexObj(url.split("flex?")[1])!
  const character = database._getChar(charKey)!
  const artifacts = Object.values(character.equippedArtifacts).filter(id => id).map(id => {
    const { numStars, level, mainStatKey, substats } = database._getArt(id)!
    return {
      ...Object.fromEntries(substats
        .filter(s => s.key != "")
        .map(({ key, value }) => [key, value])),
      [mainStatKey]: Artifact.mainStatValue(mainStatKey, numStars, level)
    }
  })
  return { character, artifacts }
}