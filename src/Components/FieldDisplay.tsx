import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useMemo } from 'react';
import { ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import Character from "../Character/Character";
import { compareAgainstEquippedContext } from "../Character/CharacterDisplayCard";
import { ICalculatedStats } from "../Types/stats";
import { IFieldDisplay } from "../Types/IFieldDisplay";

export default function FieldDisplay({ field, index, equippedBuild, newBuild, className = "p-2" }: { field: IFieldDisplay, index: number, equippedBuild?: ICalculatedStats, newBuild?: ICalculatedStats, className?: string }) {
  const compareAgainstEquipped = useContext(compareAgainstEquippedContext)
  const stats = (newBuild ? newBuild : equippedBuild)
  const canShow = useMemo(() => stats ? field?.canShow?.(stats) : false, [field, stats])
  const fixedVal = field?.fixed || 0
  const fieldVal = useMemo(() => {
    if (field.value) return Character.getTalentFieldValue(field, "value", stats)
    else if (field.formula) {
      let retVal = Character.getTalentFieldValue(field, "formula", stats)?.[0]?.(stats)
      //compareAgainstEquipped
      if (compareAgainstEquipped && equippedBuild && typeof retVal === "number") {
        let fieldEquippedVal = field.value ? field.value : field.formula?.(equippedBuild)?.[0]?.(equippedBuild)
        if (typeof fieldEquippedVal === "function")
          fieldEquippedVal = parseInt(fieldEquippedVal?.(equippedBuild)?.toFixed?.(fixedVal))
        let diff = retVal - fieldEquippedVal
        retVal = <span>{fieldEquippedVal?.toFixed(fixedVal) ?? fieldEquippedVal}{diff ? <span className={diff > 0 ? "text-success" : "text-danger"}> ({diff > 0 ? "+" : ""}{diff?.toFixed?.(fixedVal) || diff})</span> : ""}</span>
      }
      return retVal
    }
  }, [compareAgainstEquipped, fixedVal, equippedBuild, field, stats])

  const fieldText = useMemo(() => Character.getTalentFieldValue(field, "text", stats), [field, stats])
  const fieldVariant = useMemo(() => Character.getTalentFieldValue(field, "variant", stats), [field, stats])

  const formulaTextOverlay = useMemo(() => {
    const fieldFormulaText = Character.getTalentFieldValue(field, "formulaText", stats)
    return fieldFormulaText ? <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="field-formula">{fieldFormulaText}</Tooltip>}
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
    </OverlayTrigger> : null
  }, [field, stats])

  const unit = useMemo(() => Character.getTalentFieldValue(field, "unit", stats), [field, stats])

  if (!canShow) return null
  return <ListGroup.Item variant={index % 2 ? "customdark" : "customdarker"} className={className}>
    <span><b>{fieldText}</b>{formulaTextOverlay}</span>
    <span className={`float-right text-right text-${fieldVariant}`} >{fieldVal?.toFixed?.(fixedVal) ?? fieldVal}{unit}</span>
  </ListGroup.Item>
}
