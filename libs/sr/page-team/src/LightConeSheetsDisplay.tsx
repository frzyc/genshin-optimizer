import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { Grid } from '@mui/material'
import { LightConeSheetDisplay } from './LightConeSheetDisplay'

// TODO: hardcoded to LightConeSheetsDisplay.tsx for now. Can be expanded to all lightcones with sheets
const cones: LightConeKey[] = ['PastSelfInMirror'] as const
export function LightConeSheetsDisplay() {
  return (
    <Grid container columns={3} spacing={1}>
      {cones.map((lcKey) => (
        <Grid item xs={1} key={lcKey}>
          <LightConeSheetDisplay lcKey={lcKey} />
        </Grid>
      ))}
    </Grid>
  )
}
