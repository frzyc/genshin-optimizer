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
}: {
  substatKey: WengineSubStatKey
  substatValue: number
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
        justifyContent: 'space-between',
        fontWeight: 'bold',
        width: '100%',
        lineHeight: '1.60',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StatDisplay statKey={substatKey} />
      </Box>
      <span>
        {displayValue}
        {getUnitStr(substatKey)}
      </span>
    </Typography>
  )
}
