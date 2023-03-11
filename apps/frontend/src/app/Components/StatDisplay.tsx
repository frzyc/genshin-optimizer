import { Box } from '@mui/material'
import type { StatKey } from '../KeyMap'
import KeyMap from '../KeyMap'
import StatIcon from '../KeyMap/StatIcon'
import { iconInlineProps } from '../SVGIcons'
import ColorText from './ColoredText'

export function StatWithUnit({
  statKey,
  disableIcon = false,
}: {
  statKey: StatKey
  disableIcon?: boolean
}) {
  return (
    <Box component="span" display="flex" alignItems="center" gap={1}>
      {!disableIcon && (
        <StatIcon statKey={statKey} iconProps={iconInlineProps} />
      )}
      <span>
        {KeyMap.get(statKey)}
        {KeyMap.unit(statKey)}
      </span>
    </Box>
  )
}
export function StatColoredWithUnit({
  statKey,
  disableIcon = false,
}: {
  statKey: StatKey
  disableIcon?: boolean
}) {
  return (
    <ColorText color={KeyMap.getVariant(statKey)}>
      <StatWithUnit statKey={statKey} disableIcon={disableIcon} />
    </ColorText>
  )
}
