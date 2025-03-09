import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { WengineSubStatKey } from '@genshin-optimizer/zzz/consts'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { StatDisplay } from '../Character'

export function WengineSubstatDisplay({
  substatKey,
  substatValue,
  showStatName,
  styleProps,
}: {
  substatKey: WengineSubStatKey
  substatValue: number
  showStatName?: boolean
  styleProps?: any
}) {
  if (!substatKey) return null
  const displayValue = toPercent(substatValue, substatKey).toFixed(
    statKeyToFixed(substatKey)
  )
  return (
    <Typography
      variant="subtitle2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: '500',
        fontSize: '1rem',
        gap: 1.5,
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, ...styleProps }}
      >
        <StatDisplay statKey={substatKey} showStatName={showStatName} />
      </Box>
      <Box component={'span'}>
        {displayValue}
        {getUnitStr(substatKey)}
      </Box>
    </Typography>
  )
}
