import { getTalentStatKey } from "../Build/Build"
import { FormulaItem } from "../Types/character"
import { ElementKey } from "../Types/consts"

//for basic formula in the format of "percent/100 * s[statKey]"
export function basicDMGFormula(percent, stats, skillKey, elemental?: "physical" | ElementKey): FormulaItem {
  const val = percent / 100
  const statKey = getTalentStatKey(skillKey, stats, elemental)
  return [s => val * s[statKey], [statKey]]
}
