import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type { StatKey } from '@genshin-optimizer/sr/consts'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function StatDisplay({
  statKey,
  disableIcon = false,
}: {
  statKey: StatKey
  disableIcon?: boolean
}) {
  const { t: tk } = useTranslation('statKey_gen')
  const text = (
    <span>
      {tk(statKey)}
      {statPercent(statKey)}
    </span>
  )
  if (disableIcon) return text
  return (
    <Box component="span" display="flex" alignItems="center" gap={1}>
      {!disableIcon && (
        <StatIcon statKey={statKey} iconProps={iconInlineProps} />
      )}
      {text}
    </Box>
  )
}
export function statPercent(statkey: StatKey) {
  return statkey.endsWith('_') ? '%' : ''
}
