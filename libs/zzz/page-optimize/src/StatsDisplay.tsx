import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import { statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import { Box, Typography } from '@mui/material'

export function StatsDisplay({
  stats,
  showBase = false,
}: {
  stats: Record<string, number>
  showBase?: boolean
}) {
  return (
    <Box sx={{ columnCount: 2 }}>
      {Object.entries(stats)
        .filter(([k]) => showBase || !k.endsWith('_base'))
        .map(([k, v]) => (
          <Typography key={k}>
            {statKeyTextMap[k] ?? k}: {valueString(v, getUnitStr(k))}
          </Typography>
        ))}
    </Box>
  )
}
