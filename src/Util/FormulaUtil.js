import Character from "../Character/Character"
//TODO need to move this formula to Build, since this function will be used in worker, and worker doesnt need to import character sheet.
//for basic formula in the format of "percent/100 * s[statKey]"
function basicDMGFormula(percent, char, skillKey, elemental = false) {
  const val = percent / 100
  const statKey = Character.getTalentStatKey(skillKey, char, elemental)
  return [(s) => val * s[statKey], [statKey]]
}
export {
  basicDMGFormula,
}