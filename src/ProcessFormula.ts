import Formula from "./Formula"
import { Formulas, StatData } from "./StatData"
import { GetDependencies } from "./StatDependency"
import { ICalculatedStats, Modifier } from "./Types/stats"
import { mergeCalculatedStats, mergeStats } from "./Util/StatUtil"

export default function finalStatProcess(stats): ICalculatedStats {
  let dependencies = GetDependencies(stats, stats?.modifiers)
  const { initialStats: preprocessedStats, formula } = PreprocessFormulas(dependencies, stats)
  formula(preprocessedStats)
  return { ...stats, ...preprocessedStats }
}

function addPreModValues(stats: ICalculatedStats, mod: Modifier) {
  if (!mod || !stats) return
  Object.keys(mod).forEach(k => {
    if (!stats.premod) stats.premod = {}
    stats.premod[k] = stats?.premod?.[k] ?? stats[k]
  })
}

function ModStatsFormula(stats: ICalculatedStats, mods: Modifier, targets: (s: ICalculatedStats) => Array<ICalculatedStats | null>, context: "partyAll" | "partyOnly" | "partyActive") {
  if (!mods || !Object.keys(mods).length) return () => null
  const modStatsFunc = Formula.computeModifier(stats, mods)
  return (s: ICalculatedStats) => {
    const modStats = modStatsFunc(s);
    // Use mergeCalculatedStats here to allow the application to s.partyBuff
    mergeCalculatedStats(s, { [context]: modStats })
    targets(s).forEach(b => {
      if (!b) return
      addPreModValues(b, mods)
    })
  }
}

type KeyedFormula = [string, (s: ICalculatedStats) => number]
//assume all the dependency for the modifiers are part of the dependencyKeys as well
export function PreprocessFormulas(dependencyKeys: string[], stats: ICalculatedStats) {
  const { modifiers = {} } = stats, initialStats = {} as ICalculatedStats
  const premodFormulaList: KeyedFormula[] = [], postmodFormulaList: KeyedFormula[] = []
  for (const key of dependencyKeys) {
    switch (getStage(key)) {
      case 0: initialStats[key] = stats[key] ?? StatData[key]?.default ?? 0; break // Stat
      case 1: initialStats[key] = Formulas[key]!(initialStats); break // Const Formula
      case 2: premodFormulaList.push([key, Formulas[key]!]); break // Premod
      case 3:  // Premod + Postmod
        premodFormulaList.push([key, Formulas[key]!])
        postmodFormulaList.push([key, Formulas[key]!])
        break
      case 4: postmodFormulaList.push([key, Formulas[key]!]); break // Postmod
    }
  }

  initialStats.activeCharacter = stats.activeCharacter
  initialStats.teamStats = stats.teamStats
  initialStats.partyBuff = stats.partyBuff

  const modFormula = Formula.computeModifier(stats, Object.fromEntries(Object.entries(modifiers)
    .filter(([key]) => dependencyKeys.includes(key)) // Keep only relevant keys
  ))
  const partyAllFormula = ModStatsFormula(stats, stats.partyAllModifiers, (s) => [s, ...s.teamStats], "partyAll")
  const partyOnlyFormula = ModStatsFormula(stats, stats.partyOnlyModifiers, (s) => s.teamStats, "partyOnly")
  const partyActiveFormula = ModStatsFormula(stats, stats.partyActiveModifiers, (s) => [s], "partyActive")

  return {
    initialStats: initialStats as ICalculatedStats,
    formula: (s: ICalculatedStats) => {
      premodFormulaList.forEach(([key, formula]) => s[key] = formula(s))

      const modStats = Formula.computeModifier(s, s.modifiers)(s) // late-binding modifiers (arts mod)
      mergeStats(modStats, modFormula(s))
      modifiers && addPreModValues(s, modifiers)
      s.modifiers && addPreModValues(s, s.modifiers)

      // Calculate & apply modStats. 
      partyAllFormula(s)
      partyOnlyFormula(s)
      partyActiveFormula(s)
      if (s.activeCharacter) {
        s.teamStats = s.teamStats.map(t => {
          if (!t) return null
          const { initialStats: preprocessedStats, formula } = PreprocessFormulas(dependencyKeys, t)
          formula(preprocessedStats)
          return { ...t, ...preprocessedStats }
        }) as ICalculatedStats["teamStats"]
      }

      // Apply modifiers
      mergeCalculatedStats(s, modStats)
      mergeStats(s, { modifiers })

      postmodFormulaList.forEach(([key, formula]) => s[key] = formula(s))
    }
  }
}
export const numStages = 5
export function getStage(key: string): number {
  if (!(key in Formulas)) return 0 // Stat
  if (StatData[key]?.const) return 1 // Const
  // Premod (doesn't exist right now)
  if (key === "finalATK" || key === "finalDEF" || key === "finalHP") return 3 // Premod + Postmod
  return 4 // Postmod
}