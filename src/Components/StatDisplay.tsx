import { Box } from "@mui/material"
import KeyMap, { StatKey } from "../KeyMap"
import ColorText from "./ColoredText"
import StatIcon from "./StatIcon"

export function StatWithUnit({ statKey, disableIcon = false }: { statKey: StatKey, disableIcon?: boolean }) {
  return <Box component="span" display="flex" alignItems="center" gap={1}>{!disableIcon && StatIcon[statKey]}<span>{KeyMap.get(statKey)}{KeyMap.unit(statKey)}</span></Box>
}
export function StatColoredWithUnit({ statKey, disableIcon = false }: { statKey: StatKey, disableIcon?: boolean }) {
  return <ColorText color={KeyMap.getVariant(statKey)}><StatWithUnit statKey={statKey} disableIcon={disableIcon} /></ColorText>
}
