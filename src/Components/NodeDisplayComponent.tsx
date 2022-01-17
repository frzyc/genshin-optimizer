import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { List, ListItem, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { NodeDisplay, valueString } from "../Formula/api";
import StatMap from "../StatMap";
import BootstrapTooltip from "./BootstrapTooltip";

export default function NodeDisplayComponent({ node, newNode }: { node: NodeDisplay, newNode?: NodeDisplay }) {
  const fieldText = node.key ? StatMap[node.key] : ""
  const fieldFormulaText = node.formula
  const fieldVariant = node.variant
  const fieldVal = valueString(node.value, node.unit)
  const formulaTextOverlay = !!node.formula && <BootstrapTooltip placement="top" title={<Typography>{fieldFormulaText}</Typography>}>
    <Box component="span" sx={{ cursor: "help", ml: 1 }}><FontAwesomeIcon icon={faQuestionCircle} /></Box>
  </BootstrapTooltip>
  return <ListItem sx={{ display: "flex", justifyContent: "space-between" }}  >
    <span><b>{fieldText}</b>{formulaTextOverlay}</span>
    <Typography color={`${fieldVariant}.main`}>{fieldVal}</Typography>
  </ListItem>
}


export const NodeDisplayList = styled(List)(({ theme }) => ({
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