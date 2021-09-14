import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useMemo } from 'react';
import { ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { buildContext } from "../Build/Build";
import Character from "../Character/Character";
import { IFieldDisplay } from "../Types/IFieldDisplay";

export default function FieldDisplay({ field, index, className = "p-2" }: { field: IFieldDisplay, index: number, className?: string }) {
  const { newBuild, equippedBuild, compareBuild } = useContext(buildContext)
  const build = (newBuild ? newBuild : equippedBuild)
  const canShow = useMemo(() => build ? field?.canShow?.(build) : false, [field, build])
  const fixedVal = field?.fixed || 0
  const fieldVal = useMemo(() => {
    if (field.value) return Character.getTalentFieldValue(field, "value", build)
    else if (field.formula) {
      let retVal = Character.getTalentFieldValue(field, "formula", build)?.[0]?.(build)
      //compareAgainstEquipped
      if (compareBuild && equippedBuild && typeof retVal === "number") {
        let fieldEquippedVal = field.value ? field.value : field.formula?.(equippedBuild)?.[0]?.(equippedBuild)
        if (typeof fieldEquippedVal === "function")
          fieldEquippedVal = parseInt(fieldEquippedVal?.(equippedBuild)?.toFixed?.(fixedVal))
        let diff = retVal - fieldEquippedVal
        retVal = <span>{fieldEquippedVal?.toFixed(fixedVal) ?? fieldEquippedVal}{diff ? <span className={diff > 0 ? "text-success" : "text-danger"}> ({diff > 0 ? "+" : ""}{diff?.toFixed?.(fixedVal) || diff})</span> : ""}</span>
      }
      return retVal
    }
  }, [compareBuild, fixedVal, equippedBuild, field, build])

  const fieldText = useMemo(() => Character.getTalentFieldValue(field, "text", build), [field, build])
  const fieldVariant = useMemo(() => Character.getTalentFieldValue(field, "variant", build), [field, build])

  const formulaTextOverlay = useMemo(() => {
    const fieldFormulaText = Character.getTalentFieldValue(field, "formulaText", build)
    return fieldFormulaText ? <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="field-formula">{fieldFormulaText}</Tooltip>}
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
    </OverlayTrigger> : null
  }, [field, build])

  const unit = useMemo(() => Character.getTalentFieldValue(field, "unit", build), [field, build])

  if (!canShow) return null
  return <ListGroup.Item variant={index % 2 ? "customdark" : "customdarker"} className={className}>
    <span><b>{fieldText}</b>{formulaTextOverlay}</span>
    <span className={`float-right text-right text-${fieldVariant}`} >{fieldVal?.toFixed?.(fixedVal) ?? fieldVal}{unit}</span>
  </ListGroup.Item>
}
