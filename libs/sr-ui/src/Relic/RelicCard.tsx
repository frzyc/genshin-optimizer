import type { IRelic } from '@genshin-optimizer/sr-srod'
import { getRelicMainStatDisplayVal } from '@genshin-optimizer/sr-util'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { CardContent, Stack, Typography } from '@mui/material'

export function RelicCard({ relic }: { relic: IRelic }) {
  console.log({ relic })
  return (
    <Stack>
      <CardThemed>
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
    </Stack>
  )
}
