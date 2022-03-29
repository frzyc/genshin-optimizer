import { ICachedArtifact } from "../Types/artifact"
import { ArtifactsBySlot, SetFilter } from "../Types/Build"
import { ArtifactSetKey } from "../Types/consts"

export const maxBuildsToShowList = [1, 2, 3, 4, 5, 8, 10] as const
export const maxBuildsToShowDefault = 5

/**
 * Generate all set of artifacts-by-slots based on the filters
 * @param {Object.<slotKey, artifact[]>} artifactsBySlot - list of artifacts, separated by slots
 * @param {Object.<setKey, number>} setFilters - minimum number of artifacts in each set
 *
 */
export function artifactSetPermutations(artifactsBySlot: ArtifactsBySlot, setFilters: SetFilter) {
  const setKeys = new Set(setFilters.map(i => i.key)), filteredArtifactsBySlot = {}
  const slotKeys = Object.keys(artifactsBySlot)

  for (const slotKey of slotKeys) {
    let artifactsBySet: Dict<ArtifactSetKey, ICachedArtifact[]> = {}
    for (const artifact of (artifactsBySlot[slotKey] ?? [])) {
      if (setKeys.has(artifact.setKey)) {
        if (artifactsBySet[artifact.setKey]) artifactsBySet[artifact.setKey]!.push(artifact)
        else artifactsBySet[artifact.setKey] = [artifact]
      } else {
        if (artifactsBySet['null']) artifactsBySet['null'].push(artifact)
        else artifactsBySet['null'] = [artifact]
      }
    }
    filteredArtifactsBySlot[slotKey] = Object.freeze(artifactsBySet)
  }

  const setCount = {}, accu: ArtifactsBySlot = {}, result: ArtifactsBySlot[] = []

  function slotPerm(index) {
    if (index >= slotKeys.length) {
      for (const { key, num } of setFilters)
        if ((setCount[key] ?? 0) < num)
          return
      result.push({ ...accu })
      return
    }

    const slotKey = slotKeys[index]
    let artifactsBySet = filteredArtifactsBySlot[slotKey]
    for (const setKey in artifactsBySet) {
      setCount[setKey] = (setCount[setKey] ?? 0) + 1
      accu[slotKey] = artifactsBySet[setKey]
      slotPerm(index + 1)
      setCount[setKey] -= 1
    }
  }

  slotPerm(0)
  return result
}

/**
 * Compute number of all artifact permutations based on the filters
 * @param {Object.<slotKey, artifact[]>} artifactsBySlot - list of artifacts, separated by slots
 * @param {Object.<setKey, number>} setFilters - minimum number of artifacts in each set
 */
export function calculateTotalBuildNumber(artifactsBySlot: ArtifactsBySlot, setFilters: SetFilter) {
  return artifactSetPermutations(artifactsBySlot, setFilters).reduce((accu, artifactsBySlot) =>
    accu + Object.entries(artifactsBySlot).reduce((accu, artifacts) => accu * artifacts[1]!.length, 1)
    , 0)
}
