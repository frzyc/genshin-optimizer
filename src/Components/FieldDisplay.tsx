import { Groups } from "@mui/icons-material";
import { Box, Divider, List, ListItem, ListProps, Palette, PaletteColor, Skeleton, styled, Typography } from "@mui/material";
import React, { Suspense, useCallback, useContext, useMemo } from 'react';
import { DataContext } from "../Context/DataContext";
import { FormulaDataContext } from "../Context/FormulaDataContext";
import { NodeDisplay } from "../Formula/api";
import { Variant } from "../Formula/type";
import KeyMap, { valueString } from "../KeyMap";
import { allAmpReactions, AmpReactionKey } from "../Types/consts";
import { IBasicFieldDisplay, IFieldDisplay } from "../Types/fieldDisplay";
import { evalIfFunc } from "../Util/Util";
import AmpReactionModeText from "./AmpReactionModeText";
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

export function BasicFieldDisplay({ field, component }: { field: IBasicFieldDisplay, component?: React.ElementType }) {
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

export function NodeFieldDisplay({ node, oldValue, suffix, component, emphasize }: { node: NodeDisplay, oldValue?: number, suffix?: Displayable, component?: React.ElementType, emphasize?: boolean }) {
  const { data } = useContext(DataContext)
  const { setFormulaData } = useContext(FormulaDataContext)
  const onClick = useCallback(() => setFormulaData(data, node), [setFormulaData, data, node])

  if (node.isEmpty) return null

  suffix = suffix && <span>{suffix}</span>
  const icon = node.info.key && StatIcon[node.info.key]
  const fieldText = node.info.key ? KeyMap.get(node.info.key) : ""
  const isTeamBuff = node.info.isTeamBuff
  const fieldFormulaText = node.formula
  let fieldVal = "" as Displayable
  if (oldValue !== undefined) {
    const diff = node.value - oldValue
    fieldVal = <span>{valueString(oldValue, node.unit)}{diff > 0.0001 || diff < -0.0001 ? <ColorText color={diff > 0 ? "success" : "error"}> {diff > 0 ? "+" : ""}{valueString(diff, node.unit)}</ColorText> : ""}</span>
  } else fieldVal = valueString(node.value, node.unit)

  const formulaTextOverlay = !!node.formula && <QuestionTooltip onClick={onClick} title={<Typography><Suspense fallback={<Skeleton variant="rectangular" width={300} height={30} />}>
    {allAmpReactions.includes(node.info.variant as any) && <Box sx={{ display: "inline-flex", gap: 1, mr: 1 }}>
      <Box><AmpReactionModeText reaction={node.info.variant as AmpReactionKey} trigger={node.info.subVariant as Variant} /></Box>
      <Divider orientation="vertical" flexItem />
    </Box>}
    <span>{fieldFormulaText}</span>
  </Suspense></Typography>} />
  return <Box width="100%" sx={{ display: "flex", justifyContent: "space-between", gap: 1, boxShadow: emphasize ? "0px 0px 0px 2px red inset" : undefined }} component={component} >
    <Typography color={`${node.info.variant}.main`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>{!!isTeamBuff && <Groups />}{icon}{fieldText}{suffix}</Typography>
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Typography noWrap>{fieldVal}</Typography>
      {formulaTextOverlay}
    </Box>
  </Box>
}
export interface FieldDisplayListProps extends ListProps {
  light?: keyof Palette,
  dark?: keyof Palette,
  palletOption?: keyof PaletteColor
}
export const FieldDisplayList = styled(List)<FieldDisplayListProps>(({ theme, light = "contentDark", dark = "contentDarker", palletOption = "main" }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  margin: 0,
  '> .MuiListItem-root:nth-of-type(even)': {
    backgroundColor: (theme.palette[light] as PaletteColor)[palletOption]
  },
  '> .MuiListItem-root:nth-of-type(odd)': {
    backgroundColor: (theme.palette[dark] as PaletteColor)[palletOption]
  },
}));
