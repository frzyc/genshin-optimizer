import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, List, styled, Typography } from "@mui/material";
import React, { useContext, useMemo } from 'react';
import { DataContext } from "../DataContext";
import { NodeDisplay, valueString } from "../Formula/api";
import KeyMap from "../KeyMap";
import { IBasicFieldDisplay, IFieldDisplay } from "../Types/IFieldDisplay_WR";
import { evalIfFunc } from "../Util/Util";
import BootstrapTooltip from "./BootstrapTooltip";
import ColorText from "./ColoredText";
import StatIcon from "./StatIcon";

export default function FieldDisplay({ field }: { field: IFieldDisplay }) {
  const { data, oldData } = useContext(DataContext)
  const canShow = useMemo(() => data ? (!field?.canShow || field?.canShow?.(data)) : false, [field, data])
  if (!canShow) return null
  if ("node" in field) {
    const node = data.get(field.node)
    if (node.isEmpty) return null
    if (oldData) {
      const oldNode = oldData.get(field.node)
      const oldValue = oldNode.isEmpty ? 0 : oldNode.value
      return <NodeFieldDisplay node={node} oldValue={oldValue} />
    }
    else return <NodeFieldDisplay node={node} />
  }
  return <BasicFieldDisplay field={field} />
}

function BasicFieldDisplay({ field }: { field: IBasicFieldDisplay }) {
  const { data } = useContext(DataContext)
  const v = field.value
  const variant = evalIfFunc(field.variant, data)
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between" }}  >
    <ColorText color={variant}><b>{field.text}</b></ColorText>
    <Typography >{typeof v === "number" ? v.toFixed?.(field.fixed) : v}{field.unit}</Typography>
  </Box>
}

// TODO: "dim" field and use `N/A` for value when the node.isEmpty
export function NodeFieldDisplay({ node, oldValue }: { node: NodeDisplay, oldValue?: number }) {
  const fieldText = node.key ? KeyMap.get(node.key) : ""
  const fieldFormulaText = node.formula
  let fieldVal = "" as Displayable
  if (oldValue) {
    const diff = node.value - oldValue
    fieldVal = <span>{valueString(oldValue, node.unit)}{diff ? <ColorText color={diff > 0 ? "success" : "error"}> {diff > 0 ? "+" : ""}{valueString(diff, node.unit)}</ColorText> : ""}</span>
  } else fieldVal = valueString(node.value, node.unit)
  const formulaTextOverlay = !!node.formula && <BootstrapTooltip placement="top" title={<Typography>{fieldFormulaText}</Typography>}>
    <Box component="span" sx={{ cursor: "help", ml: 1 }}><FontAwesomeIcon icon={faQuestionCircle} /></Box>
  </BootstrapTooltip>
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between" }}  >
    <ColorText color={node.variant}>{node.key && (<span>{StatIcon[node.key]} </span>)}<b>{fieldText}</b>{formulaTextOverlay}</ColorText>
    <Typography >{fieldVal}</Typography>
  </Box>
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
