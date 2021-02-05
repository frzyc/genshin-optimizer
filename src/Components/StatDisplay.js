import { Col } from "react-bootstrap"
import Character from "../Character/Character"
import Stat from "../Stat"
import { StatIconEle } from "./StatIcon"
function DisplayStats({ statKey, character, build, editable, ...otherProps }) {
  let buildVal = build?.finalStats?.[statKey] || 0
  let statVal, buildDiff = null
  if (typeof buildVal === "string") {
    statVal = <span>{buildVal}</span>
  } else {
    let originalVal = Character.getStatValueWithOverride(character, statKey)
    if (statKey === "hp_final")
      originalVal = Character.getStatValueWithOverride(character, "hp_base")
    else if (statKey === "def_final")
      originalVal = Character.getStatValueWithOverride(character, "def_base")
    else if (statKey === "atk_final")
      originalVal = Character.getStatValueWithOverride(character, "atk_character_base") + Character.getStatValueWithOverride(character, "atk_weapon")

    let diff = buildVal - originalVal
    let diffText = (diff?.toFixed?.(Stat.fixedUnit(statKey)) || diff) + Stat.getStatUnit(statKey)
    if (diff < 0) buildDiff = <span className="text-success">{diffText}</span>
    else if (diff > 0) buildDiff = <span className="text-success"> +{diffText}</span>

    if (originalVal || !diff) statVal = <span className={editable && Character.hasOverride(character, statKey) ? "text-warning" : ""}>{(originalVal?.toFixed?.(Stat.fixedUnit(statKey)) || originalVal) + Stat.getStatUnit(statKey)}</span>
  }
  return <Col {...otherProps}>
    <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
    <span className="float-right text-right">{statVal}{buildDiff}</span>
  </Col>
}
const DisplayNewBuildDiff = ({ statKey, character, equippedBuild, newBuild, editable, ...otherProps }) => {
  let statVal = (equippedBuild?.finalStats?.[statKey] || Character.getStatValueWithOverride(character, statKey))
  let unit = Stat.getStatUnit(statKey)
  let buildDiff = (newBuild?.finalStats?.[statKey] || 0) - (equippedBuild?.finalStats?.[statKey] || 0)

  return <Col {...otherProps}>
    <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
    <span className={`float-right ${editable && Character.hasOverride(character, statKey) ? "text-warning" : ""}`}>
      {statVal || !buildDiff ? statVal?.toFixed?.(Stat.fixedUnit(statKey)) + unit : null}
      {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> ({buildDiff > 0 && "+"}{buildDiff?.toFixed?.(Stat.fixedUnit(statKey)) + unit})</span> : null}
    </span>
  </Col>
}
export {
  DisplayStats,
  DisplayNewBuildDiff,
}