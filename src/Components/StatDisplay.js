import { Col } from "react-bootstrap"
import Character from "../Character/Character"
import Stat from "../Stat"
import { StatIconEle } from "./StatIcon"

const DisplayStats = ({ statKey, character, build, editable, ...otherProps }) => {
  let statVal = Character.getStatValueWithOverride(character, statKey)
  if (statKey === "hp_final")
    statVal = Character.getStatValueWithOverride(character, "hp_base")
  else if (statKey === "def_final")
    statVal = Character.getStatValueWithOverride(character, "def_base")
  else if (statKey === "atk_final")
    statVal = Character.getStatValueWithOverride(character, "atk_base") + Character.getStatValueWithOverride(character, "atk_weapon")
  let unit = Stat.getStatUnit(statKey)
  let buildDiff = (build?.finalStats?.[statKey] || 0) - statVal
  return <Col {...otherProps}>
    <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
    <span className={`float-right text-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
      {statVal || !buildDiff ? statVal?.toFixed(Stat.fixedUnit(statKey)) + unit : null}
      {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> {buildDiff > 0 && "+"}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit}</span> : null}
    </span>
  </Col>
}
const DisplayNewBuildDiff = ({ statKey, character, equippedBuild, newBuild, editable, ...otherProps }) => {
  let statVal = (equippedBuild?.finalStats?.[statKey] || Character.getStatValueWithOverride(character, statKey))
  let unit = Stat.getStatUnit(statKey)
  let buildDiff = (newBuild?.finalStats?.[statKey] || 0) - (equippedBuild?.finalStats?.[statKey] || 0)

  return <Col {...otherProps}>
    <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
    <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
      {statVal || !buildDiff ? statVal?.toFixed(Stat.fixedUnit(statKey)) + unit : null}
      {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> ({buildDiff > 0 && "+"}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit})</span> : null}
    </span>
  </Col>
}
export {
  DisplayStats,
  DisplayNewBuildDiff,
}