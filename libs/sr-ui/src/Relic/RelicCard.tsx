import type { IRelic } from '@genshin-optimizer/sr-srod'
import { getRelicMainStatDisplayVal } from '@genshin-optimizer/sr-util'
import { Box, Stack, Typography } from '@mui/material'

export function RelicCard({ relic }: { relic: IRelic | undefined }) {
  return (
    <Stack>
      {!relic ? (
        <Typography>Empty</Typography>
      ) : (
        <Box>
          <Typography>
            Main: {relic.mainStatKey} -{' '}
            {getRelicMainStatDisplayVal(
              relic.rarity,
              relic.mainStatKey,
              relic.level
            )}
          </Typography>
          {relic.substats.map((substat) => (
            <Typography key={substat.key}>
              Sub: {substat.key} - {substat.value}
            </Typography>
          ))}
        </Box>
      )}
    </Stack>
  )
}
