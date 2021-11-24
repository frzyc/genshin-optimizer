import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy } from "../Types/consts";
import { BonusStats, ICalculatedStats, Modifier } from "../Types/stats";
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

/**
 * Merge stats, being aware of wher the stats are suppose to go.(partyAll, partyOnly, partyActive)
 */
export function mergeCalculatedStats(initialStats: ICalculatedStats, stats: BonusStats | undefined) {
  if (!stats) return
  return Object.entries(stats).forEach(([key, val]: any) => {
    switch (key) {
      case "partyAll": {
        const { modifiers, ...rest } = val
        mergeStats(initialStats, rest)
        initialStats.teamStats.forEach(t => t && mergeStats(t, rest))
        modifiers && mergeModifiers(initialStats[`${key}Modifiers`], modifiers)
        break;
      }
      case "partyOnly": {
        const { modifiers, ...rest } = val
        initialStats.teamStats.forEach(t => t && mergeStats(t, rest))
        modifiers && mergeModifiers(initialStats[`${key}Modifiers`], modifiers)
        break;
      }
      case "partyActive": {
        const { modifiers, ...rest } = val;
        const active = [initialStats, ...initialStats.teamStats].find(t => t?.activeCharacter)
        active && mergeStats(active, rest)
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