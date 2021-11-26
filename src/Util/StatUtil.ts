import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy } from "../Types/consts";
import { BonusStats, ICalculatedStats, Modifier } from "../Types/stats";
import { deepClone } from "./Util";
export const characterStatKeys = ["characterATK", "characterHP", "characterDEF",] as const
export const enemyEditorKeys = ["enemyLevel", ...allElementsWithPhy.map(eleKey => `${eleKey}_enemyImmunity`), ...allElementsWithPhy.map(eleKey => `${eleKey}_enemyRes_`), "enemyDEFRed_"]
export const overrideStatKeys = [...enemyEditorKeys, ...characterStatKeys]
export function mergeStats(initialStats: BonusStats, stats: BonusStats | undefined) {
  if (!stats) return
  return Object.entries(stats).forEach(([key, val]: any) => {
    switch (key) {
      case "partyAll":
      case "partyOnly":
      case "partyActive":
        if (!initialStats[key]) initialStats[key] = {}
        mergeStats(initialStats[key], val)
        break;
      case "modifiers":
        initialStats.modifiers = initialStats.modifiers ?? {}
        mergeModifiers(initialStats.modifiers, val as Modifier)
        break;
      case "infusionSelf":
        // TODO: handle multiple aura priority
        if (!initialStats.infusionAura)
          initialStats.infusionAura = val
        break;
      default:
        if (initialStats[key] === undefined) initialStats[key] = val
        else if (typeof initialStats[key] === "number") initialStats[key] += val
    }
  })
}
function mergeModifiers(dest: Modifier, partial: Modifier) {
  for (const [key, paths] of Object.entries(partial)) {
    dest[key] = dest[key] ?? []
    dest[key].push(...paths)
  }
}
function mergePartyStats(initialStats: ICalculatedStats, stats: BonusStats | undefined) {
  mergeStats(initialStats, stats)
  mergeStats(initialStats.partyBuff, stats)
}
/**
 * Merge stats, being aware of wher the stats are suppose to go.(partyAll, partyOnly, partyActive)
 */
export function mergeCalculatedStats(initialStats: ICalculatedStats, stats: BonusStats | undefined) {
  if (!stats) return
  return Object.entries(stats).forEach(([key, val]: any) => {
    switch (key) {
      case "partyAll": {
        const { modifiers, ...rest } = val
        mergePartyStats(initialStats, rest)
        initialStats.teamStats.forEach(t => t && mergePartyStats(t, rest))
        modifiers && mergeModifiers(initialStats[`${key}Modifiers`], modifiers)
        break;
      }
      case "partyOnly": {
        const { modifiers, ...rest } = val
        initialStats.teamStats.forEach(t => t && mergePartyStats(t, rest))
        modifiers && mergeModifiers(initialStats[`${key}Modifiers`], modifiers)
        break;
      }
      case "partyActive": {
        const { modifiers, ...rest } = val;
        const active = [initialStats, ...initialStats.teamStats].find(t => t?.activeCharacter)
        active && mergePartyStats(active, rest)
        modifiers && mergeModifiers(initialStats[`${key}Modifiers`], modifiers)
        break;
      }
      default:
        mergeStats(initialStats, { [key]: val })
    }
  })
}

export function characterBaseStats(character: ICachedCharacter) {
  const { level, } = character
  return {
    enemyLevel: level ?? 1,
    ...Object.fromEntries(allElementsWithPhy.map(eleKey => [`${eleKey}_enemyRes_`, 10])),
    ...Object.fromEntries(allElementsWithPhy.map(eleKey => [`${eleKey}_enemyImmunity`, false])),
    critRate_: 5,
    critDMG_: 50,
    enerRech_: 100,
    stamina: 100
  } as any as ICalculatedStats
}

export function deepCloneStats(stats: ICalculatedStats): ICalculatedStats {
  const newStats = { ...stats }

  // Hand-pick costly copying
  if (newStats.modifiers) newStats.modifiers = deepClone(newStats.modifiers)
  if (stats.teamStats) {
    const teamStats = stats.teamStats.map(t => {
      if (!t) return t
      const { teamStats, ...rest } = t
      return deepClone(rest)
    })
    const team = [newStats, ...teamStats]
    teamStats.forEach((t, i) => t && (t.teamStats = team.filter((_, index) => index !== i + 1)))
    newStats.teamStats = teamStats as ICalculatedStats['teamStats']
  }
  newStats.partyAllModifiers = deepClone(newStats.partyAllModifiers)
  newStats.partyOnlyModifiers = deepClone(newStats.partyOnlyModifiers)
  newStats.partyActiveModifiers = deepClone(newStats.partyActiveModifiers)
  newStats.partyBuff = deepClone(newStats.partyBuff)
  newStats.tlvl = deepClone(newStats.tlvl)
  return newStats
}