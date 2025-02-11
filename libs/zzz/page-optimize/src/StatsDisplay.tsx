import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
import { Box, Typography } from '@mui/material'

export function StatsDisplay({ stats }: { stats: Record<string, number> }) {
  return (
    <Box sx={{ columnWidth: '15em' }}>
      {Object.entries(stats).map(([k, v]) => (
        <Typography
          key={k}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <StatDisplay key={k} statKey={k as StatKey} />{' '}
          <span>{valueString(v, getUnitStr(k))}</span>
        </Typography>
      ))}
    </Box>
  )
}
