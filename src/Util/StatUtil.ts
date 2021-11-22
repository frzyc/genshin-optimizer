import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy } from "../Types/consts";
import { BonusStats, ICalculatedStats, Modifier } from "../Types/stats";
export const characterStatKeys = ["characterATK", "characterHP", "characterDEF",] as const
export const enemyEditorKeys = ["enemyLevel", ...allElementsWithPhy.map(eleKey => `${eleKey}_enemyImmunity`), ...allElementsWithPhy.map(eleKey => `${eleKey}_enemyRes_`), "enemyDEFRed_"]
export const overrideStatKeys = [...enemyEditorKeys, ...characterStatKeys]
export function mergeStats(initialStats: BonusStats, stats: BonusStats | undefined) {
  if (!stats) return
  return Object.entries(stats).forEach(([key, val]: any) => {
    if (key === "modifiers") {
      initialStats.modifiers = initialStats.modifiers ?? {}
      for (const [key, paths] of (Object.entries(val as Modifier))) {
        initialStats.modifiers[key] = initialStats.modifiers[key] ?? []
        initialStats.modifiers[key].push(...paths)
      }
    } else if (key === "infusionSelf") {
      if (!initialStats.infusionSelf)
        initialStats.infusionSelf = val
    } else if (key === "infusionAura") {
      // TODO: handle multiple aura priority
      if (!initialStats.infusionAura)
        initialStats.infusionAura = val
    } else {
      if (initialStats[key] === undefined) initialStats[key] = val
      else if (typeof initialStats[key] === "number") initialStats[key] += val
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