import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import type { RelicIds } from '@genshin-optimizer/sr/db'
import { useRelics } from '@genshin-optimizer/sr/db-ui'
import { EmptyRelicCard, RelicCard } from '@genshin-optimizer/sr/ui'
import { Grid } from '@mui/material'

export function GeneratedBuildDisplay({ build }: { build: RelicIds }) {
  const relics = useRelics(build)
  return (
    <Grid container columns={3} spacing={1}>
      {allRelicSlotKeys.map((slot) => {
        const relic = relics[slot]
        return (
          <Grid item xs={1} key={`${slot}_${relic?.id}`}>
            {relic ? (
              <RelicCard relic={relic} />
            ) : (
              <EmptyRelicCard slot={slot} />
            )}
          </Grid>
        )
      })}
    </Grid>
  )
}
