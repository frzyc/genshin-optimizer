import { CardThemed } from '@genshin-optimizer/common/ui'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { CardContent, Grid } from '@mui/material'
import { LightConeSheetDisplay } from './LightConeSheetDisplay'

// TODO: hardcoded to LightConeSheetsDisplay.tsx for now. Can be expanded to all lightcones with sheets
const cones: LightConeKey[] = ['PastSelfInMirror'] as const
export function LightConeSheetsDisplay() {
  return (
    <CardThemed bgt="dark">
      <CardContent>
        <Grid container columns={3} spacing={1}>
          {cones.map((lcKey) => (
            <Grid item xs={1} key={lcKey}>
              <LightConeSheetDisplay lcKey={lcKey} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
