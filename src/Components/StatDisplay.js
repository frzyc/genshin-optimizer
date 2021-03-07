import Character from "../Character/Character"
import Stat from "../Stat"
import { StatIconEle } from "./StatIcon"

function DisplayStatDiff({ label = "", val, oldVal, fixed = 0, unit = "", variant = "" }) {
  if (typeof oldVal === "undefined" && typeof val === "number") {//if only one value is filled, display that one.
    oldVal = val
    val = undefined
  }
  const diff = val !== undefined ? val - oldVal : 0;
  let oldText = "", diffText = ""
  if (oldVal || diff === 0) oldText = oldVal.toFixed(fixed)
  else if (oldVal === undefined) oldText = val.toFixed(fixed)//if oldval isnt defined, just display val.
  if (oldText) oldText = <span className={`text-${variant}`}>{oldText}{unit}</span>
  if (diff !== 0) diffText = <span className={`text-${diff > 0 ? "success" : "danger"}`}>{diff > 0 ? "+" : ""}{diff.toFixed(fixed)}{unit}</span>

  return <div>
    <b>{label}</b>
    <span className="float-right text-right">{oldText}{diff ? " " : ""}{diffText}</span>
  </div>
}
export default function StatDisplay({ character, character: { characterKey }, equippedBuild, newBuild, editable, statKey }) {
  let val, oldVal, fixed, unit, variant;
  let label = ""
  if (typeof statKey === "string") {//basic statKey
    if (newBuild && equippedBuild) {//comparable
      //newbuild -> val
      //equippedbuild ->old
      val = newBuild?.finalStats?.[statKey] ?? 0
      oldVal = equippedBuild?.finalStats?.[statKey] ?? 0
    } else {
      const build = newBuild ? newBuild : equippedBuild
      //build ->val
      val = build?.finalStats?.[statKey] ?? 0
      //statvaluewith override -> old
      const invalid = "invalid"//can't use undeinfed as the defVal, since I want undefined for invalid numbers.
      oldVal = Character.getStatValueWithOverride(character, statKey, invalid)
      oldVal === invalid && (oldVal = undefined)
      if (statKey === "finalHP")
        oldVal = Character.getStatValueWithOverride(character, "characterHP")
      else if (statKey === "finalDEF")
        oldVal = Character.getStatValueWithOverride(character, "characterDEF")
      else if (statKey === "finalATK")
        oldVal = Character.getStatValueWithOverride(character, "characterATK") + Character.getStatValueWithOverride(character, "weaponATK")
    }
    unit = Stat.getStatUnit(statKey)
    fixed = Stat.fixedUnit(statKey)
    label = <span>{StatIconEle(statKey)} {Stat.getStatName(statKey)}</span>
  } else {//from character sheet
    const build = newBuild ? newBuild : equippedBuild
    const { talentKey, sectionIndex, fieldIndex } = statKey
    const field = Character.getTalentField(characterKey, talentKey, sectionIndex, fieldIndex)
    const labelVariant = Character.getTalentFieldValue(field, "variant", talentKey, character, build.finalStats)
    label = <span className={`text-${labelVariant}`}>{Character.getTalentFieldValue(field, "text", talentKey, character, build.finalStats)}</span>
    fixed = Character.getTalentFieldValue(field, "fixed", talentKey, character, build.finalStats, 0)
    val = Character.getTalentFieldValue(field, "finalVal", talentKey, character, build.finalStats)
    if (newBuild && equippedBuild) {//comparable
      oldVal = Character.getTalentFieldValue(field, "finalVal", talentKey, character, equippedBuild.finalStats)
    }
  }

  if (editable && Character.hasOverride(character, statKey)) variant = "warning"
  return <DisplayStatDiff {...{ val, oldVal, fixed, unit, variant, label }} />
}