/**
 * Generate all set of artifacts-by-slots based on the filters
 * @param {Object.<slotKey, artifact[]>} artifactsBySlot - list of artifacts, separated by slots
 * @param {Object.<setKey, number>} setFilters - minimum number of artifacts in each set
 *
 */
export function artifactSetPermutations(artifactsBySlot, setFilters) {
  const setKeys = new Set(setFilters.map(i => i.key)), filteredArtifactsBySlot = {}
  const slotKeys = Object.keys(artifactsBySlot)

  for (const slotKey of slotKeys) {
    let artifactsBySet = {}
    for (const artifact of artifactsBySlot[slotKey]) {
      if (setKeys.has(artifact.setKey)) {
        if (artifactsBySet[artifact.setKey]) artifactsBySet[artifact.setKey].push(artifact)
        else artifactsBySet[artifact.setKey] = [artifact]
      } else {
        if (artifactsBySet[null]) artifactsBySet[null].push(artifact)
        else artifactsBySet[null] = [artifact]
      }
    }
    filteredArtifactsBySlot[slotKey] = Object.freeze(artifactsBySet)
  }

  const setCount = {}, accu = {}, result = []

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
export function calculateTotalBuildNumber(artifactsBySlot, setFilters) {
  return artifactSetPermutations(artifactsBySlot, setFilters).reduce((accu, artifactsBySlot) =>
    accu + Object.entries(artifactsBySlot).reduce((accu, artifacts) => accu * artifacts[1].length, 1)
  , 0)
}

/**
 * @callback artifactCallback
 * @param {Object.<artifactKey, artifact>} artifacts - the list of artifacts
 * @param {stats} stats - the total stats for the artifacts
 */

/**
 * Generate all artifact permutations and accumulate the stats
 * @param {stats} initialStats - initial stats before any artifact is added
 * @param {Object.<slotKey, artifact[]>} artifactsBySlot - list of artifacts, separated by slots
 * @param {Object.<setKey, Object.<number, Object.<statKey, statValue>>>} artifactSetEffects - the list of the set effects
 * @param {artifactCallback} callback - the functions called with each permutation
 */
export function artifactPermutations(initialStats, artifactsBySlot, artifactSetEffects, callback) {
  const slotKeys = Object.keys(artifactsBySlot), setCount = {}, accu = {}
  function slotPerm(index, stats) {
    if (index >= slotKeys.length) {
      callback(accu, stats)
      return
    }

    let slotKey = slotKeys[index]
    for (const artifact of artifactsBySlot[slotKey]) {
      let newStats = { ...stats }
      accumulate(slotKey, artifact, setCount, accu, newStats, artifactSetEffects)
      slotPerm(index + 1, newStats)
      setCount[artifact.setKey] -= 1
    }
  }

  slotPerm(0, initialStats)
}

function accumulate(slotKey, art, setCount, accu, stats, artifactSetEffects) {
  let setKey = art.setKey
  accu[slotKey] = art
  setCount[setKey] = (setCount[setKey] ?? 0) + 1

  // Add artifact stats
  if (art.mainStatKey in stats) stats[art.mainStatKey] += art.mainStatVal
  art.substats.forEach((substat) => { 
    if (substat?.key in stats) stats[substat.key] += substat.value
  })

  // Add set effects
  let setEffect = artifactSetEffects[setKey]?.[setCount[setKey]]
  setEffect && Object.entries(setEffect).forEach(([statKey, val]) => {
    if (statKey in stats) stats[statKey] += val
  })
}
