import Formula from "./Formula"
import { Formulas, StatData } from "./StatData"
import { GetDependencies } from "./StatDependency"
import { ICalculatedStats } from "./Types/stats"
import { mergeStats } from "./Util/StatUtil"

export default function finalStatProcess(stats): ICalculatedStats {
  let dependencies = GetDependencies(stats, stats?.modifiers)
  const { initialStats: preprocessedStats, formula } = PreprocessFormulas(dependencies, stats)
  formula(preprocessedStats)
  return { ...stats, ...preprocessedStats }
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

  initialStats.teamStats = stats.teamStats
  initialStats.partyStats = stats.partyStats
  initialStats.partyOnlyStats = stats.partyOnlyStats
  initialStats.partyActiveStats = stats.partyActiveStats

  const modFormula = Formula.computeModifier(stats, Object.fromEntries(Object.entries(modifiers)
    .filter(([key]) => dependencyKeys.includes(key)) // Keep only relevant keys
  ))

  return {
    initialStats: initialStats as ICalculatedStats,
    formula: (s: ICalculatedStats) => {

      // Calculate all the party-related Stats from different Teammembers.
      const partyActiveStats = s // The "active" member is the char currently being calculated
      const party = [s, ...s.teamStats]

      party.forEach((partyMember, i) => {
        if (!partyMember) return
        const partyOnly = [...party].splice(i, 1)

        // TODO: IMPLEMENT Apply the stats from each party member to each member, except modifiers, which are needed to be calculated in the context of each character.

        // mergeStats(partyActiveStats, partyMember.partyActiveStats)
        // party.forEach(other => {
        //   if (!other) return
        //   mergeStats(other, partyMember.partyStats)
        // })
        // partyOnly.forEach(other => {
        //   if (!other) return
        //   mergeStats(other, partyMember.partyOnlyStats)
        // })
      })
      // Calculate all the stats of the teammates, this will include their modifiers.
      s.teamStats.map(s => s && finalStatProcess(s))

      //TODO: IMPLEMENT calculate the party modifiers from teammates after the finalStatProcess is done.


      premodFormulaList.forEach(([key, formula]) => s[key] = formula(s))

      const modStats = Formula.computeModifier(s, s.modifiers)(s) // late-binding modifiers (arts mod)
      mergeStats(modStats, modFormula(s))
      s.premod = Object.fromEntries(Object.keys(modifiers).map(key => [key, s[key]]))
      s.modStats = modStats
      // Apply modifiers
      mergeStats(s, modStats)
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