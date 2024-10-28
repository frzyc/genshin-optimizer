import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/sr/consts'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function StatDisplay({
  statKey,
  showPercent = false,
  disableIcon = false,
}: {
  statKey: StatKey
  showPercent?: boolean
  disableIcon?: boolean
}) {
  const { t: tk } = useTranslation('statKey_gen')
  const text = (
    <span>
      {tk(statKey)}
      {showPercent && getUnitStr(statKey)}
    </span>
  )
  if (disableIcon) return text
  return (
    <Box component="span" display="inline-flex" alignItems="center" gap={1}>
      {!disableIcon && (
        <StatIcon statKey={statKey} iconProps={iconInlineProps} />
      )}
      {text}
    </Box>
  )
}
