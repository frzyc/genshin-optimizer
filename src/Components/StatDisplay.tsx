import { useMemo } from "react"
import { Col, Row } from "react-bootstrap"
import Character from "../Character/Character"
import CharacterSheet from "../Character/CharacterSheet"
import Formula from "../Formula"
import Stat from "../Stat"
import { ICharacter } from "../Types/character"
import ICalculatedStats from "../Types/ICalculatedStats"
import { IFieldDisplay } from "../Types/IFieldDisplay"
import { usePromise } from "../Util/ReactUtil"
import WeaponSheet from "../Weapon/WeaponSheet"
import { StatIconEle } from "./StatIcon"

function DisplayStatDiff({ label = "", val, oldVal, fixed = 0, unit = "", variant = "" }) {
  if (typeof oldVal === "undefined" && typeof val === "number") {//if only one value is filled, display that one.
    oldVal = val
    val = undefined
  }
  const diff = val !== undefined ? val - oldVal : 0;
  let oldText: Displayable = "", diffText: Displayable = ""
  if (oldVal || diff === 0) oldText = oldVal?.toFixed(fixed)
  else if (oldVal === undefined) oldText = val?.toFixed(fixed)//if oldval isnt defined, just display val.
  if (oldText) oldText = <span className={`text-${variant}`}>{oldText}{unit}</span>
  if (diff !== 0) diffText = <span className={`text-${diff > 0 ? "success" : "danger"}`}>{diff > 0 ? "+" : ""}{diff?.toFixed(fixed)}{unit}</span>

  return <Col xs="12"><Row>
    <Col><b>{label}</b></Col>
    <Col xs="auto">{oldText}{diff ? " " : ""}{diffText}</Col>
  </Row></Col>
}
type StatDisplayProps = {
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet
  character: ICharacter,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats,
  editable: boolean,
  statKey: string
}
export default function StatDisplay({ characterSheet, weaponSheet, character, equippedBuild, newBuild, editable, statKey }: StatDisplayProps) {
  const formula = usePromise(Array.isArray(statKey) ? Formula.get(statKey) : undefined)

  const { val, oldVal, fixed, unit, variant, label } = useMemo(() => {
    let val, oldVal, fixed, unit, variant, label: Displayable = ""
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
        oldVal = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey, invalid as any)
        oldVal === invalid && (oldVal = undefined)
        if (statKey === "finalHP")
          oldVal = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "characterHP")
        else if (statKey === "finalDEF")
          oldVal = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "characterDEF")
        else if (statKey === "finalATK")
          oldVal = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "characterATK") + Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "weaponATK")
      }
      unit = Stat.getStatUnit(statKey)
      fixed = Stat.fixedUnit(statKey)
      label = <span>{StatIconEle(statKey)} {Stat.getStatName(statKey)}</span>
    } else if (formula) {//Formula
      const build = newBuild ? newBuild : equippedBuild
      const field = (formula as any).field as IFieldDisplay //assume it is attached in post-processing
      const labelVariant = Character.getTalentFieldValue(field, "variant", build)
      label = <span className={`text-${labelVariant}`}>{Character.getTalentFieldValue(field, "text", build)}</span>
      fixed = Character.getTalentFieldValue(field, "fixed", build, 0 as any)
      val = Character.getTalentFieldValue(field, "formula", build)?.[0]?.(build)
      if (newBuild && equippedBuild) {//comparable
        oldVal = Character.getTalentFieldValue(field, "formula", equippedBuild)?.[0]?.(equippedBuild)
      }
    }
    if (editable && Character.hasOverride(character, statKey)) variant = "warning"
    return { val, oldVal, fixed, unit, variant, label }
  }, [character, characterSheet, weaponSheet, equippedBuild, newBuild, editable, statKey, formula])

  return <DisplayStatDiff {...{ val, oldVal, fixed, unit, variant, label: label as any }} />
}