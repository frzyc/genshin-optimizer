import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { ColorText } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/gi/keymap'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { Box } from '@mui/material'

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
        {getUnitStr(statKey)}
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
