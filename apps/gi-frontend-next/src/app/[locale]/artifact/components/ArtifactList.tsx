import type { IArtifact } from '@genshin-optimizer/gi-good'
import { ArtifactCard, GenshinUserContext } from '@genshin-optimizer/gi-ui-next'
import { Grid } from '@mui/material'
import { useContext } from 'react'
const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
export default function ArtifactList() {
  const { artifacts } = useContext(GenshinUserContext)
  return (
    <Grid container spacing={1} columns={columns}>
      {artifacts?.map((artifact) => (
        <Grid item key={artifact.id} xs={1}>
          <ArtifactCard artifact={artifact as IArtifact} />
        </Grid>
      ))}
    </Grid>
  )
}
