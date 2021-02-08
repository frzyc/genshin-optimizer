/*
 * Generate all set of artifacts-by-slots based on the filters
 * Each entry is of the form { flower: [art1, art2, ...], plume: [art3, art4, ...] }
 */
export function* artifactSetPermutations(artifacts, setFilters) {
  const setKeys = new Set(setFilters.map(i => i.key)), artifactsBySlot = {}
  const slotKeys = Object.keys(artifacts)

  for (const slotKey of slotKeys) {
    let artifactsBySet = {}
    for (const artifact of artifacts[slotKey]) {
      if (setKeys.has(artifact.setKey)) {
        if (artifactsBySet[artifact.setKey]) artifactsBySet[artifact.setKey].push(artifact)
        else artifactsBySet[artifact.setKey] = [artifact]
      } else {
        if (artifactsBySet[null]) artifactsBySet[null].push(artifact)
        else artifactsBySet[null] = [artifact]
      }
    }
    artifactsBySlot[slotKey] = Object.freeze(artifactsBySet)
  }

  const setCount = {}, accu = {}

  function* slotPerm(index) {
    if (index >= slotKeys.length) {
      for (const { key, num } of setFilters)
        if ((setCount[key] ?? 0) < num)
          return
      yield { ...accu }
      return
    }

    const slotKey = slotKeys[index]
    let artifactsBySet = artifactsBySlot[slotKey]
    for (const setKey in artifactsBySet) {
      setCount[setKey] = (setCount[setKey] ?? 0) + 1
      accu[slotKey] = artifactsBySet[setKey]
      yield* slotPerm(index + 1)
      setCount[setKey] -= 1
    }
  }

  yield* slotPerm(0)
}

export function calculateTotalBuildNumber(splitArtifacts, setFilters) {
  return [...artifactSetPermutations(splitArtifacts, setFilters)].reduce((accu, artifactsBySlot) => {
    return accu + Object.entries(artifactsBySlot).reduce((accu, artifacts) => {
      return accu * artifacts[1].length
    }, 1)
  }, 0)
}
