import { Groups } from "@mui/icons-material";
import { Box, List, ListItem, Skeleton, styled, Typography } from "@mui/material";
import React, { Suspense, useContext, useMemo } from 'react';
import { DataContext } from "../DataContext";
import { NodeDisplay } from "../Formula/api";
import KeyMap, { valueString } from "../KeyMap";
import { IBasicFieldDisplay, IFieldDisplay } from "../Types/IFieldDisplay";
import { evalIfFunc } from "../Util/Util";
import ColorText from "./ColoredText";
import QuestionTooltip from "./QuestionTooltip";
import StatIcon from "./StatIcon";

export default function FieldsDisplay({ fields }: { fields: IFieldDisplay[] }) {
  return <FieldDisplayList sx={{ m: 0 }}>
    {fields.map((field, i) => <FieldDisplay key={i} field={field} component={ListItem} />)}
  </FieldDisplayList>
}

function FieldDisplay({ field, component }: { field: IFieldDisplay, component?: React.ElementType }) {
  const { data, oldData } = useContext(DataContext)
  const canShow = useMemo(() => field?.canShow?.(data) ?? true, [field, data])
  if (!canShow) return null
  if ("node" in field) {
    const node = data.get(field.node)
    if (node.isEmpty) return null
    if (oldData) {
      const oldNode = oldData.get(field.node)
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
  const text = field.text && <span>{field.text}</span>
  const suffix = field.textSuffix && <span>{field.textSuffix}</span>
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between", gap: 1 }} component={component} >
    <Typography color={`${variant}.main`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>{text}{suffix}</Typography>
    <Typography >{typeof v === "number" ? v.toFixed?.(field.fixed) : v}{field.unit}</Typography>
  </Box>
}

export function NodeFieldDisplay({ node, oldValue, suffix, component }: { node: NodeDisplay, oldValue?: number, suffix?: Displayable, component?: React.ElementType }) {
  if (node.isEmpty) return null

  suffix = suffix && <span>{suffix}</span>
  const icon = node.info.key && StatIcon[node.info.key]
  const fieldText = node.info.key ? KeyMap.get(node.info.key) : ""
  const isTeamBuff = node.info.isTeamBuff
  const fieldFormulaText = node.formula
  let fieldVal = "" as Displayable
  if (oldValue) {
    const diff = node.value - oldValue
    fieldVal = <span>{valueString(oldValue, node.unit)}{diff > 0.0001 || diff < -0.0001 ? <ColorText color={diff > 0 ? "success" : "error"}> {diff > 0 ? "+" : ""}{valueString(diff, node.unit)}</ColorText> : ""}</span>
  } else fieldVal = valueString(node.value, node.unit)
  const formulaTextOverlay = !!node.formula && <QuestionTooltip title={<Typography><Suspense fallback={<Skeleton variant="rectangular" width={300} height={30} />}>{fieldFormulaText}</Suspense></Typography>} />
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between", gap: 1 }} component={component} >
    <Typography color={`${node.info.variant}.main`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>{!!isTeamBuff && <Groups />}{icon}{fieldText}{suffix}</Typography>
    <Typography sx={{ display: "flex", gap: 1, alignItems: "center" }} >{fieldVal}{formulaTextOverlay}</Typography>
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
