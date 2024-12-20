import { allLightConeKeys } from '@genshin-optimizer/sr/consts'
import { Grid } from '@mui/material'
import { LightConeSheetDisplay } from './LightConeSheetDisplay'

export function LightConeSheetsDisplay() {
  return (
    <Grid container columns={3} spacing={1}>
      {allLightConeKeys.map((lcKey) => (
        <Grid item xs={1} key={lcKey}>
          <LightConeSheetDisplay lcKey={lcKey} />
        </Grid>
      ))}
    </Grid>
  )
}
