import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { WengineSubStatKey } from '@genshin-optimizer/zzz/consts'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { StatDisplay } from '../Character'

export function WengineSubstatDisplay({
  substatKey,
  substatValue,
  showStatName,
}: {
  substatKey: WengineSubStatKey
  substatValue: number
  showStatName?: boolean
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
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showStatName ? (
          <StatDisplay statKey={substatKey} />
        ) : (
          <StatIcon statKey={substatKey} />
        )}
      </Box>
      <Box component={'span'}>
        {displayValue}
        {getUnitStr(substatKey)}
      </Box>
    </Typography>
  )
}
