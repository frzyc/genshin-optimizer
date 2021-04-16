import ElementalData from "../Data/ElementalData"

/**
 * Remove artifacts that can never be used in optimized builds
 * @param {artifact[]} artifacts - List of artifacts of the same slot
 * @param {Object.<setKey, Object.<number, Object.<statKey, statValue>>>} artifactSetEffects - The list of the set effects
 * @param {Set.<statKey>} significantStats - A set of stats that pruning needs to take into consideration
 * @param {bool} ascending - Whether the sorting is ascending or descending
 * @param {Set.<setKey>} alwaysAccepted - The list of artifact sets that are always included
 */
export function pruneArtifacts(artifacts, artifactSetEffects, significantStats, ascending, alwaysAccepted = new Set()) {
  const tmp = artifacts.map(artifact => {
    let potential = {}

    if (significantStats.has(artifact.mainStatKey))
      potential[artifact.mainStatKey] = artifact.mainStatVal
    for (const {key, value} of artifact.substats)
      if (significantStats.has(key))
        potential[key] = (potential[key] ?? 0) + value

    const min = { ...potential }

    for (const effects of Object.values(artifactSetEffects[artifact.setKey] ?? {})) {
      for (const [key, value] of Object.entries(effects))
        if (significantStats.has(key))
          potential[key] = (potential[key] ?? 0) + value
    }

    if (ascending) {
      for (const key in min)
        min[key] = -min[key]
      for (const key in potential)
        potential[key] = -potential[key]
      return {artifact, min: potential, max: min}
    }
    return { artifact, min, max: potential }
  })

  return tmp.filter(({artifact: candidate, max: candidateMax}) =>
    // Keep if no `other` is better than `candidate`
    alwaysAccepted.has(candidate.setKey) || tmp.every(({artifact: other, min: otherMin}) => {
      // return true if `candidate` is better than or incomparable to `other`
      if (candidate.id === other.id) return true

      let equal = true
      for (const [key, candidateValue] of Object.entries(candidateMax)) {
        const otherValue = otherMin[key] ?? 0
        if (candidateValue > otherValue)
          return true
        if (candidateValue !== otherValue)
          equal = false
      }
      for (const key in otherMin) {
        if (!(key in candidateMax))
          equal = false
      }

      return equal
    })
  ).map(tmp => tmp.artifact)
}

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

/**
  * Create statKey in the form of ${ele}_elemental_${type} for elemental DMG, ${ele}_${src}_${type} for talent DMG.
  * @param {string} skillKey - The DMG src. Can be "norm","skill". Use an elemental to specify a elemental hit "physical" -> physical_elemental_{type}. Use "elemental" here to specify a elemental hit of character's element/reactionMode
  * @param {*} stats - The character. Will extract hitMode, autoInfused...
  * @param {*} elemental - Override the hit to be the character's elemental, that is not part of infusion.
  */
export function getTalentStatKey(skillKey, stats, elemental = false) {
  const { hitMode = "", autoInfused = false, reactionMode = null, characterEle = "anemo", weaponType = "sword" } = stats
  if (Object.keys(ElementalData).includes(skillKey)) return `${skillKey}_elemental_${hitMode}`//elemental DMG
  if (!elemental) elemental = weaponType === "catalyst" || autoInfused
  let eleKey = "physical"
  if (skillKey === "elemental" || skillKey === "burst" || skillKey === "skill" || elemental)
    eleKey = (reactionMode ? reactionMode : characterEle)
  return `${eleKey}_${skillKey}_${hitMode}`
}

export function getTalentStatKeyVariant(skillKey, stats, elemental = false) {
  if (Object.keys(ElementalData).includes(skillKey)) return skillKey
  const { autoInfused = false, characterEle = "anemo", weaponType = "sword" } = stats
  let { reactionMode } = stats
  //reactionMode can be one of pyro_vaporize, pyro_melt, hydro_vaporize,cryo_melt
  if (["pyro_vaporize", "hydro_vaporize"].includes(reactionMode))
    reactionMode = "vaporize"
  else if (["pyro_melt", "cryo_melt"].includes(reactionMode))
    reactionMode = "melt"
  if (!elemental) elemental = weaponType === "catalyst" || autoInfused
  let eleKey = "physical"
  if (skillKey === "elemental" || skillKey === "burst" || skillKey === "skill" || elemental)
    eleKey = (reactionMode ? reactionMode : characterEle)
  return eleKey
}