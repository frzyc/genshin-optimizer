import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, List, styled, Typography } from "@mui/material";
import React, { useContext, useMemo } from 'react';
import { DataContext, dataContextObj } from "../DataContext";
import { NodeDisplay } from "../Formula/api";
import KeyMap, { valueString } from "../KeyMap";
import { IBasicFieldDisplay, IFieldDisplay } from "../Types/IFieldDisplay";
import { evalIfFunc } from "../Util/Util";
import BootstrapTooltip from "./BootstrapTooltip";
import ColorText from "./ColoredText";
import StatIcon from "./StatIcon";
import { data as dataNode } from '../Formula/utils'
import { Data } from "../Formula/type";

export default function FieldDisplay({ field, fieldContext, component }: { field: IFieldDisplay, fieldContext?: dataContextObj, component?: React.ElementType }) {
  const { data, oldData } = useContext(DataContext)
  const canShow = useMemo(() => field?.canShow?.(data) ?? true, [field, data])
  if (!canShow) return null
  if ("node" in field) {
    // TODO: remove as Data
    const node = fieldContext ? data.get(dataNode(field.node, { target: fieldContext.data.data[0] } as Data)) : data.get(field.node)
    if (node.isEmpty) return null
    if (oldData) {
      const oldNode = fieldContext ? oldData.get(dataNode(field.node, { target: fieldContext.oldData!.data[0] } as Data)) : oldData.get(field.node)
      const oldValue = oldNode.isEmpty ? 0 : oldNode.value
      return <NodeFieldDisplay node={node} oldValue={oldValue} suffix={field.textSuffix} component={component} />
    }
    else return <NodeFieldDisplay node={node} suffix={field.textSuffix} component={component} />
  }
  return <BasicFieldDisplay field={field} component={component} />
}

function BasicFieldDisplay({ field, component }: { field: IBasicFieldDisplay, component?: React.ElementType }) {
  const { data } = useContext(DataContext)
  const v = evalIfFunc(field.value, data)
  const variant = evalIfFunc(field.variant, data)
  const suffix = field.textSuffix && <span> {field.textSuffix}</span>
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between" }} component={component} >
    <ColorText color={variant}><b>{field.text}</b>{suffix}</ColorText>
    <Typography >{typeof v === "number" ? v.toFixed?.(field.fixed) : v}{field.unit}</Typography>
  </Box>
}

export function NodeFieldDisplay({ node, oldValue, suffix, component }: { node: NodeDisplay, oldValue?: number, suffix?: Displayable, component?: React.ElementType }) {
  if (node.isEmpty) return null

  suffix = suffix && <span> {suffix}</span>
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
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between" }} component={component} >
    <ColorText color={node.variant}>{node.key && (<span>{StatIcon[node.key]} </span>)}<b>{fieldText}</b>{suffix}{formulaTextOverlay}</ColorText>
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
