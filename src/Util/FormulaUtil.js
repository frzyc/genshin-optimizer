import { getTalentStatKey } from "../Build/Build"
//for basic formula in the format of "percent/100 * s[statKey]"
function basicDMGFormula(percent, char, skillKey, elemental = false) {
  const val = percent / 100
  const statKey = getTalentStatKey(skillKey, char, elemental)
  return [(s) => val * s[statKey], [statKey]]
}
export {
  basicDMGFormula,
}