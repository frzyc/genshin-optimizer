import { createContext } from "react"
import ElementalData from "../Data/ElementalData"
import { StatKey, ICachedArtifact, SubstatKey } from "../Types/artifact"
import { ArtifactSetEffects, ArtifactsBySlot, SetFilter } from "../Types/Build"
import { ArtifactSetKey, ElementKey, SetNum, SlotKey } from "../Types/consts"
import { BasicStats, BonusStats, ICalculatedStats } from "../Types/stats"
import { mergeStats } from "../Util/StatUtil"
import { deepClone } from "../Util/Util"

type buildContextObj = {
  newBuild?: ICalculatedStats,
  equippedBuild?: ICalculatedStats,
  compareBuild?: boolean,
  setCompareBuild?: ((boolean) => void),
}
export const buildContext = createContext({
  newBuild: undefined,
  equippedBuild: undefined,
  compareBuild: false,
  setCompareBuild: undefined,
} as buildContextObj)

export const maxBuildsToShowList = [1, 2, 3, 4, 5, 8, 10] as const
export const maxBuildsToShowDefault = 5

/**
 * Remove artifacts that can never be used in optimized builds when trying to optimize for top `maxBuildsToShow` builds
 * @param {artifact[]} artifacts - List of artifacts of the same slot
 * @param {Object.<setKey, Object.<number, Object.<statKey, statValue>>>} artifactSetEffects - The list of the set effects
 * @param {Set.<statKey>} significantStats - A set of stats that pruning needs to take into consideration
 * @param {bool} ascending - Whether the sorting is ascending or descending
 * @param {Set.<setKey>} alwaysAccepted - The list of artifact sets that are always included
 */
export function pruneArtifacts(artifacts: ICachedArtifact[], artifactSetEffects: ArtifactSetEffects, significantStats: Set<StatKey>, maxBuildsToShow: number = 1, alwaysAccepted: Set<ArtifactSetKey> = new Set()): ICachedArtifact[] {
  function shouldKeepFirst(first: Dict<StatKey, number>, second: Dict<StatKey, number>, preferFirst: boolean) {
    let firstBetter = Object.entries(first).some(([k, v]) => !isFinite(v) || v > (second[k] ?? 0))
    let secondBetter = Object.entries(second).some(([k, v]) => !isFinite(v) || v > (first[k] ?? 0))
    // Keep if first is strictly better, uncomparable, or equal + prefer first.
    // That is, return false if second is strictly better, or equal + NOT prefer first
    return firstBetter || (!secondBetter && preferFirst)
  }

  // Prune unused set effects. Sets with no relevant effects are regrouped to "other"
  const prunedSetEffects: PrunedArtifactSetEffects = { "other": {} }
  Object.entries(artifactSetEffects).forEach(([set, effect]) => {
    Object.entries(effect).forEach(([num, item]) => {
      const effects = Object.entries(item).filter(([key]) => significantStats.has(key as StatKey))
      if (effects.length > 0) {
        prunedSetEffects[set] = prunedSetEffects[set] ?? {}
        prunedSetEffects[set]![num] = Object.fromEntries(effects)
      }
      const modifiers = item.modifiers
      if (modifiers) {
        // Modifiers are treated as infinite stats
        prunedSetEffects[set] = prunedSetEffects[set] ?? {}
        prunedSetEffects[set]![num] = prunedSetEffects[set]![num] ?? {}

        Object.keys(modifiers)
          .filter(key => significantStats.has(key as StatKey))
          .forEach(key =>
            prunedSetEffects[set]![num]![key] = Infinity
          )
      }
    })
  })

  // array of artifacts, artifact stats, and set (may be "other")
  let tmp: { artifact: ICachedArtifact, numberOfBetterSameSetArtifacts: number, stats: Dict<StatKey, number>, set: ArtifactSetKey | "other" }[] = artifacts.map(artifact => {
    const stats: Dict<StatKey, number> = {}, set: ArtifactSetKey | "other" = (artifact.setKey in prunedSetEffects || alwaysAccepted.has(artifact.setKey)) ? artifact.setKey : "other"
    if (significantStats.has(artifact.mainStatKey as any))
      stats[artifact.mainStatKey] = artifact.mainStatVal!
    for (const { key, value } of artifact.substats)
      if (key && significantStats.has(key as SubstatKey))
        stats[key] = (stats[key] ?? 0) + value
    for (const key in stats)
      if (key.endsWith("enemyRes_"))
        stats[key as StatKey] = -stats[key as StatKey]!
    return { artifact, numberOfBetterSameSetArtifacts: 0, stats, set }
  })

  // Compare artifacts' base stats from the same set
  tmp = tmp.filter((first) => {
    const { artifact: candidate, stats: candidateStats, set: candidateSet } = first
    return tmp.every(({ artifact: other, stats: otherStats, set: otherSet }) => {
      if (candidateSet !== otherSet || shouldKeepFirst(candidateStats, otherStats, candidate.id! <= other.id!)) {
        return true
      } else {
        first.numberOfBetterSameSetArtifacts += 1
        return first.numberOfBetterSameSetArtifacts < maxBuildsToShow
      }
    })
  })

  // Cross-check with different sets
  tmp = tmp.filter(({ artifact: candidate, stats: candidateStats, set: candidateSet }) => {
    if (alwaysAccepted.has(candidate.setKey))
      return true
    // Possible "additional stats" if a build equips `candidate` on an empty slot.
    let possibleStats = [...Object.values(prunedSetEffects[candidateSet]!), {}].map(c => {
      const current: BonusStats = { ...candidateStats }
      mergeStats(current, c)
      return { stat: current, numberOfBetterArtifacts: 0 }
    })
    return tmp.every(({ artifact: other, stats: otherStats, set: otherSet, numberOfBetterSameSetArtifacts }) => {
      if (candidateSet === otherSet) return true // Already checked same-set

      // Remove possibilities that shouldn't be kept
      possibleStats = possibleStats.filter(current => {
        if (shouldKeepFirst(current.stat, otherStats, candidate.id! <= other.id!)) {
          return true
        } else {
          current.numberOfBetterArtifacts += 1
          return current.numberOfBetterArtifacts + numberOfBetterSameSetArtifacts < maxBuildsToShow
        }
      })
      return possibleStats.length !== 0
    })
  })

  return tmp.map(tmp => tmp.artifact)
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
export function artifactPermutations(initialStats: ICalculatedStats, artifactsBySlot: ArtifactsBySlot, artifactSetEffects: ArtifactSetEffects, callback) {
  const slotKeys = Object.keys(artifactsBySlot), setCount: Dict<ArtifactSetKey, SetNum> = {}, accu = {}
  function slotPerm(index: number, stats: ICalculatedStats) {
    if (index >= slotKeys.length) {
      callback(accu, stats)
      return
    }

    const slotKey = slotKeys[index]
    for (const artifact of artifactsBySlot[slotKey] ?? []) {
      const newStats = { ...stats }

      // Hand-pick costly copying
      if (newStats.modifiers) newStats.modifiers = deepClone(newStats.modifiers)

      accumulate(slotKey, artifact, setCount, accu, newStats, artifactSetEffects)
      slotPerm(index + 1, newStats)
      setCount[artifact.setKey]! -= 1
    }
  }

  slotPerm(0, initialStats)
}

function accumulate(slotKey: SlotKey, art: ICachedArtifact, setCount: Dict<ArtifactSetKey, SetNum>, accu: Dict<SlotKey, ICachedArtifact>, stats: ICalculatedStats, artifactSetEffects: ArtifactSetEffects) {
  const setKey = art.setKey
  accu[slotKey] = art
  setCount[setKey] = (setCount[setKey] ?? 0) + 1 as SetNum

  // Add artifact stats
  if (art.mainStatKey in stats) stats[art.mainStatKey] += art.mainStatVal!
  art.substats.forEach((substat) => {
    if (substat?.key in stats) stats[substat.key] += substat.value
  })

  // Add set effects
  const setEffect = artifactSetEffects[setKey]?.[setCount[setKey]!]
  setEffect && mergeStats(stats, setEffect) // TODO: This may slow down the computation
}

/**
  * Create statKey in the form of ${ele}_elemental_${type} for elemental DMG, ${ele}_${src}_${type} for talent DMG.
  * @param {string} skillKey - The DMG src. Can be "norm","skill". Use an elemental to specify a elemental hit "physical" -> physical_elemental_{type}. Use "elemental" here to specify a elemental hit of character's element/reactionMode
  * @param {*} stats - The calculated stats
  * @param {*} overwriteElement - Override the hit to be the character's elemental, that is not part of infusion.
  */
export function getTalentStatKey(skillKey: string, stats: BasicStats, overwriteElement?: ElementKey | "physical") {
  const { hitMode = "", infusionAura = "", infusionSelf = "", reactionMode = null, characterEle = "anemo", weaponType = "sword" } = stats
  if ((Object.keys(ElementalData) as any).includes(skillKey)) return `${skillKey}_elemental_${hitMode}`//elemental DMG
  if (!overwriteElement && weaponType === "catalyst") overwriteElement = characterEle

  if (skillKey === "elemental" || skillKey === "burst" || skillKey === "skill" || overwriteElement) {
    if (reactionMode && reactionMode.startsWith(overwriteElement || characterEle)) return `${reactionMode}_${skillKey}_${hitMode}`
    return `${overwriteElement || characterEle}_${skillKey}_${hitMode}`
  }
  //auto attacks
  let eleKey = "physical"
  if (infusionSelf) eleKey = infusionSelf
  else if (infusionAura) eleKey = infusionAura
  if (reactionMode && reactionMode.startsWith(eleKey)) return `${reactionMode}_${skillKey}_${hitMode}`

  return `${eleKey}_${skillKey}_${hitMode}`
}

export function getTalentStatKeyVariant(skillKey: string, stats: BasicStats, overwriteElement: ElementKey | "physical" | undefined | "" = "") {
  if ((Object.keys(ElementalData) as any).includes(skillKey)) return skillKey//elemental DMG
  const { infusionAura = "", infusionSelf = "", reactionMode = null, characterEle = "anemo", weaponType = "sword" } = stats
  if (!overwriteElement && weaponType === "catalyst") overwriteElement = characterEle

  if (skillKey === "elemental" || skillKey === "burst" || skillKey === "skill" || overwriteElement) {
    if (reactionMode && reactionMode.startsWith(overwriteElement || characterEle)) {
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

export type PrunedArtifactSetEffects = Dict<ArtifactSetKey | "other", Dict<SetNum, Dict<StatKey, number>>>
