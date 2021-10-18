import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, List, ListItem, styled, Typography } from "@mui/material";
import React, { useContext, useMemo } from 'react';
import { buildContext } from "../Build/Build";
import Character from "../Character/Character";
import { IFieldDisplay } from "../Types/IFieldDisplay";
import BootstrapTooltip from "./BootstrapTooltip";
import ColorText from "./ColoredText";

export default function FieldDisplay({ field }: { field: IFieldDisplay }) {
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
        retVal = <span>{fieldEquippedVal?.toFixed(fixedVal) ?? fieldEquippedVal}{diff ? <ColorText color={diff > 0 ? "success" : "error"}> ({diff > 0 ? "+" : ""}{diff?.toFixed?.(fixedVal) || diff})</ColorText> : ""}</span>
      }
      return retVal
    }
  }, [compareBuild, fixedVal, equippedBuild, field, build])

  const fieldText = useMemo(() => Character.getTalentFieldValue(field, "text", build), [field, build])
  const fieldVariant = useMemo(() => Character.getTalentFieldValue(field, "variant", build), [field, build])

  const formulaTextOverlay = useMemo(() => {
    const fieldFormulaText = Character.getTalentFieldValue(field, "formulaText", build)
    return fieldFormulaText ? <BootstrapTooltip placement="top" title={<Typography>{fieldFormulaText}</Typography>}>
      <Box component="span" sx={{ cursor: "help", ml: 1 }}><FontAwesomeIcon icon={faQuestionCircle} /></Box>
    </BootstrapTooltip> : null
  }, [field, build])

  const unit = useMemo(() => Character.getTalentFieldValue(field, "unit", build), [field, build])

  if (!canShow) return null
  return <ListItem sx={{ display: "flex", justifyContent: "space-between" }}  >
    <span><b>{fieldText}</b>{formulaTextOverlay}</span>
    <Typography color={`${fieldVariant}.main`}>{fieldVal?.toFixed?.(fixedVal) ?? fieldVal}{unit}</Typography>
  </ListItem>
}
export const FieldDisplayList = styled(List)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  margin: 0,
  '> .MuiListItem-root:nth-of-type(even)': {
    backgroundColor: theme.palette.contentDark.main
  },
  '> .MuiListItem-root:nth-of-type(odd)': {
    backgroundColor: theme.palette.contentDarker.main
  },
}));