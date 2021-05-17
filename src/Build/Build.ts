import ElementalData from "../Data/ElementalData"
import { StatKey, StatDict, IArtifact, SubstatKey } from "../Types/artifact"
import { ArtifactSetEffects, PrunedArtifactSetEffects, ArtifactsBySlot, SetFilter } from "../Types/Build"
import { ArtifactSetKey, ElementKey } from "../Types/consts"

/**
 * Remove artifacts that can never be used in optimized builds
 * @param {artifact[]} artifacts - List of artifacts of the same slot
 * @param {Object.<setKey, Object.<number, Object.<statKey, statValue>>>} artifactSetEffects - The list of the set effects
 * @param {Set.<statKey>} significantStats - A set of stats that pruning needs to take into consideration
 * @param {bool} ascending - Whether the sorting is ascending or descending
 * @param {Set.<setKey>} alwaysAccepted - The list of artifact sets that are always included
 */
export function pruneArtifacts(artifacts: IArtifact[], artifactSetEffects: ArtifactSetEffects, significantStats: Set<StatKey>, ascending: boolean = false, alwaysAccepted: Set<ArtifactSetKey> = new Set()): IArtifact[] {
  function shouldKeepFirst(first: StatDict, second: StatDict, preferFirst: boolean) {
    let firstBetter = Object.entries(first).some(([k, v]) => v! > (second[k] ?? 0))
    let secondBetter = Object.entries(second).some(([k, v]) => v! > (first[k] ?? 0))
    if (ascending) [firstBetter, secondBetter] = [secondBetter, firstBetter]
    // Keep if first is strictly better, uncomparable, or equal + prefer first
    return firstBetter || (!secondBetter && preferFirst)
  }

  // Prune unused set effects. Sets with no relevant effects are regrouped to "other"
  const prunedSetEffects: PrunedArtifactSetEffects = { "other": {} }
  for (const set in artifactSetEffects)
    for (const num in artifactSetEffects[set]) {
      const effects = Object.entries(artifactSetEffects[set]![num]).filter(([key]) => significantStats.has(key as StatKey))
      if (effects.length > 0) {
        prunedSetEffects[set] = prunedSetEffects[set] ?? {}
        prunedSetEffects[set]![num] = Object.fromEntries(effects)
      }
    }

  // array of artifacts, artifact stats, and set (may be "other")
  let tmp: { artifact: IArtifact, stats: Dict<StatKey, number>, set: ArtifactSetKey | "other" }[] = artifacts.map(artifact => {
    let stats = {}, set: ArtifactSetKey | "other" = (artifact.setKey in prunedSetEffects) ? artifact.setKey : "other"
    if (significantStats.has(artifact.mainStatKey as any))
      stats[artifact.mainStatKey] = artifact.mainStatVal
    for (const { key, value } of artifact.substats)
      if (significantStats.has(key as SubstatKey))
        stats[key] = (stats[key] ?? 0) + value
    for (const key in stats)
      if (key.endsWith("enemyRes_"))
        stats[key] = -stats[key]
    return { artifact, stats, set }
  })

  // Compare artifacts' base stats from the same set
  tmp = tmp.filter(({ artifact: candidate, stats: candidateStats, set: candidateSet }) =>
    tmp.every(({ artifact: other, stats: otherStats, set: otherSet }) =>
      candidateSet !== otherSet || shouldKeepFirst(candidateStats, otherStats, candidate.id! <= other.id!)
    ))

  if (!ascending) {
    // Cross-check with different sets
    tmp = tmp.filter(({ artifact: candidate, stats: candidateStats, set: candidateSet }) => {
      // Possible "additional stats" if a build equips `candidate` on an empty slot.
      let possibleStats = [...Object.values(prunedSetEffects[candidateSet]!), {}].map(c => {
        const current: Dict<string, number> = { ...candidateStats }
        Object.entries(c).forEach(([key, value]: any) => current[key] = (current[key] ?? 0) + (value ?? 0))
        return current
      })
      return tmp.every(({ artifact: other, stats: otherStats, set: otherSet }) => {
        if (candidateSet === otherSet) return true // Already checked same-set

        // Remove possibilities that shouldn't be kept
        possibleStats = possibleStats.filter(current =>
          shouldKeepFirst(current, otherStats, candidate.id! <= other.id!))
        return possibleStats.length !== 0
      })
    })
  }
  // Reinstate `alwaysAccepted`
  return [
    ...artifacts.filter(artifact => alwaysAccepted.has(artifact.setKey)),
    ...tmp.map(tmp => tmp.artifact).filter(artifact => !alwaysAccepted.has(artifact.setKey)),
  ]
}

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
    let artifactsBySet: { [setKey in ArtifactSetKey]?: IArtifact[] } = {}
    for (const artifact of (artifactsBySlot[slotKey] as any)) {
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
export function artifactPermutations(initialStats, artifactsBySlot: ArtifactsBySlot, artifactSetEffects, callback) {
  const slotKeys = Object.keys(artifactsBySlot), setCount = {}, accu = {}
  function slotPerm(index, stats) {
    if (index >= slotKeys.length) {
      callback(accu, stats)
      return
    }

    let slotKey = slotKeys[index]
    for (const artifact of (artifactsBySlot[slotKey] as any)) {
      let newStats = { ...stats }
      accumulate(slotKey, artifact, setCount, accu, newStats, artifactSetEffects)
      slotPerm(index + 1, newStats)
      setCount[artifact.setKey] -= 1
    }
  }

  slotPerm(0, initialStats)
}

function accumulate(slotKey, art: IArtifact, setCount, accu, stats, artifactSetEffects) {
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
  setEffect && Object.entries(setEffect).forEach(([statKey, val]: any) => {
    if (statKey in stats) stats[statKey] += val
  })
}

/**
  * Create statKey in the form of ${ele}_elemental_${type} for elemental DMG, ${ele}_${src}_${type} for talent DMG.
  * @param {string} skillKey - The DMG src. Can be "norm","skill". Use an elemental to specify a elemental hit "physical" -> physical_elemental_{type}. Use "elemental" here to specify a elemental hit of character's element/reactionMode
  * @param {*} stats - The calcualted stats
  * @param {*} overwriteElement - Override the hit to be the character's elemental, that is not part of infusion.
  */
export function getTalentStatKey(skillKey, stats, overwriteElement: ElementKey | "physical" | undefined | "" = "") {
  const { hitMode = "", infusionAura = "", infusionSelf = "", reactionMode = null, characterEle = "anemo", weaponType = "sword" } = stats
  if ((Object.keys(ElementalData) as any).includes(skillKey)) return `${skillKey}_elemental_${hitMode}`//elemental DMG
  if (!overwriteElement && weaponType === "catalyst") overwriteElement = characterEle

  if (skillKey === "elemental" || skillKey === "burst" || skillKey === "skill" || overwriteElement) {
    if (reactionMode && reactionMode.startsWith(characterEle)) return `${reactionMode}_${skillKey}_${hitMode}`
    return `${overwriteElement || characterEle}_${skillKey}_${hitMode}`
  }
  //auto attacks
  let eleKey = "physical"
  if (infusionSelf) eleKey = infusionSelf
  else if (infusionAura) eleKey = infusionAura
  if (reactionMode && reactionMode.startsWith(eleKey)) return `${reactionMode}_${skillKey}_${hitMode}`

  return `${eleKey}_${skillKey}_${hitMode}`
}

export function getTalentStatKeyVariant(skillKey, stats, overwriteElement: ElementKey | "physical" | undefined | "" = "") {
  if ((Object.keys(ElementalData) as any).includes(skillKey)) return skillKey//elemental DMG
  const { infusionAura = "", infusionSelf = "", reactionMode = null, characterEle = "anemo", weaponType = "sword" } = stats
  if (!overwriteElement && weaponType === "catalyst") overwriteElement = characterEle

  if (skillKey === "elemental" || skillKey === "burst" || skillKey === "skill" || overwriteElement) {
    if (reactionMode && reactionMode.startsWith(characterEle)) {
      if (["pyro_vaporize", "hydro_vaporize"].includes(reactionMode)) return "vaporize"
      else if (["pyro_melt", "cryo_melt"].includes(reactionMode)) return "melt"
    }
    return overwriteElement || characterEle
  }
  //auto attacks
  let eleKey = "physical"
  if (infusionSelf) eleKey = infusionSelf
  else if (infusionAura) eleKey = infusionAura
  if (reactionMode && reactionMode.startsWith(eleKey)) {
    if (["pyro_vaporize", "hydro_vaporize"].includes(reactionMode)) return "vaporize"
    else if (["pyro_melt", "cryo_melt"].includes(reactionMode)) return "melt"
  }
  return eleKey
}
