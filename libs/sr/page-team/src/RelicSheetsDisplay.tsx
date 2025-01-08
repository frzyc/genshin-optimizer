import { allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import { Grid } from '@mui/material'
import { RelicSheetDisplay } from './RelicSheetDisplay'

export function RelicSheetsDisplay() {
  return (
    <Grid container columns={3} spacing={1}>
      {allRelicSetKeys.map((setKey) => (
        <Grid item xs={1} key={setKey}>
          <RelicSheetDisplay setKey={setKey} />
        </Grid>
      ))}
    </Grid>
  )
}
