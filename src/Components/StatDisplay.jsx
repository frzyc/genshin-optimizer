import { useMemo } from "react"
import { Col, Row } from "react-bootstrap"
import Character from "../Character/Character"
import Formula from "../Formula"
import Stat from "../Stat"
import { StatIconEle } from "./StatIcon"

function DisplayStatDiff({ label = "", val, oldVal, fixed = 0, unit = "", variant = "" }) {
  if (typeof oldVal === "undefined" && typeof val === "number") {//if only one value is filled, display that one.
    oldVal = val
    val = undefined
  }
  const diff = val !== undefined ? val - oldVal : 0;
  let oldText = "", diffText = ""
  if (oldVal || diff === 0) oldText = oldVal?.toFixed(fixed)
  else if (oldVal === undefined) oldText = val?.toFixed(fixed)//if oldval isnt defined, just display val.
  if (oldText) oldText = <span className={`text-${variant}`}>{oldText}{unit}</span>
  if (diff !== 0) diffText = <span className={`text-${diff > 0 ? "success" : "danger"}`}>{diff > 0 ? "+" : ""}{diff?.toFixed(fixed)}{unit}</span>

  return <Col xs="12"><Row>
    <Col><b>{label}</b></Col>
    <Col xs="auto">{oldText}{diff ? " " : ""}{diffText}</Col>
  </Row></Col>
}
export default function StatDisplay({ character, equippedBuild, newBuild, editable, statKey }) {
  const { val, oldVal, fixed, unit, variant, label } = useMemo(() => {
    let val, oldVal, fixed, unit, variant, label = ""
    if (typeof statKey === "string") {//basic statKey
      if (newBuild && equippedBuild) {//comparable
        //newbuild -> val
        //equippedbuild ->old
        val = newBuild?.[statKey] ?? 0
        oldVal = equippedBuild?.[statKey] ?? 0
      } else {
        const build = newBuild ? newBuild : equippedBuild
        //build ->val
        val = build?.[statKey] ?? 0
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
    } else {//Formula
      const build = newBuild ? newBuild : equippedBuild
      const formula = Formula.get(statKey)
      const field = formula.field
      const labelVariant = Character.getTalentFieldValue(field, "variant", build)
      label = <span className={`text-${labelVariant}`}>{Character.getTalentFieldValue(field, "text", build)}</span>
      fixed = Character.getTalentFieldValue(field, "fixed", build, 0)
      val = Character.getTalentFieldValue(field, "formula", build)?.[0]?.(build)
      if (newBuild && equippedBuild) {//comparable
        oldVal = Character.getTalentFieldValue(field, "formula", equippedBuild)?.[0]?.(equippedBuild)
      }
    }
    if (editable && Character.hasOverride(character, statKey)) variant = "warning"
    return { val, oldVal, fixed, unit, variant, label }
  }, [character, equippedBuild, newBuild, editable, statKey])

  return <DisplayStatDiff {...{ val, oldVal, fixed, unit, variant, label }} />
}