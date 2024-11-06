import { CardThemed } from '@genshin-optimizer/common/ui'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { CardContent, Grid } from '@mui/material'
import { RelicSheetDisplay } from './RelicSheetDisplay'

// TODO: hardcoded to RelicSheetsDisplay.tsx for now. Can be expanded to all relic sets with sheets
const sets: RelicSetKey[] = ['WatchmakerMasterOfDreamMachinations'] as const
export function RelicSheetsDisplay() {
  return (
    <CardThemed bgt="dark">
      <CardContent>
        <Grid container columns={3} spacing={1}>
          {sets.map((setKey) => (
            <Grid item xs={1} key={setKey}>
              <RelicSheetDisplay setKey={setKey} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
