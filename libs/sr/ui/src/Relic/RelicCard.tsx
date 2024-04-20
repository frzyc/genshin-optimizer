import { CardThemed } from '@genshin-optimizer/common/ui'
import type { IRelic } from '@genshin-optimizer/sr/srod'
import { getRelicMainStatDisplayVal } from '@genshin-optimizer/sr/util'
import { CardContent, Typography } from '@mui/material'

export function RelicCard({ relic }: { relic: IRelic }) {
  return (
    <CardThemed sx={{ height: '100%' }}>
      <CardContent>
        <Typography>Slot: {relic.slotKey}</Typography>
        <Typography>Set: {relic.setKey}</Typography>
        <Typography>Level: {relic.level}</Typography>
        <Typography>
          Main: {relic.mainStatKey} ◦{' '}
          {getRelicMainStatDisplayVal(
            relic.rarity,
            relic.mainStatKey,
            relic.level
          )}
        </Typography>
        {relic.substats.map((substat) => (
          <Typography key={substat.key}>
            Sub: {substat.key} ◦ {substat.value}
          </Typography>
        ))}
      </CardContent>
    </CardThemed>
  )
}
