import type { ArtifactsBySlot } from "./Worker"
import type { ArtifactSetKey } from "../Types/consts"

export function countArtSet(arts: ArtifactsBySlot): Dict<ArtifactSetKey, { min: number, max: number }> {
  return Object.values(arts).map(arts => {
    const result: Dict<ArtifactSetKey, { min: number, max: number }> = {}
    arts.forEach(art => result[art.set] = { min: 0, max: 1 })
    if (Object.keys(result).length === 1)
      for (const value of Object.values(result)) value.min = 1
    return result
  }).reduce((a, b) => {
    for (const [key, value] of Object.entries(b)) {
      const aValue = a[key]
      if (aValue) {
        aValue.min += value.min
        aValue.max += value.max
      } else a[key] = value
    }
    return a
  }, {})
}
