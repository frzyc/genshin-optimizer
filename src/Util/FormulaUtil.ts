import { getTalentStatKey } from "../Build/Build"
import { FormulaItem } from "../Types/character"

//for basic formula in the format of "percent/100 * s[statKey]"
export function basicDMGFormula(percent, stats, skillKey, elemental = false): FormulaItem {
  const val = percent / 100
  const statKey = getTalentStatKey(skillKey, stats, elemental)
  return [s => val * s[statKey], [statKey]]
}
