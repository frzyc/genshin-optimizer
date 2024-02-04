import { ArtifactCard, GenshinUserContext } from '@genshin-optimizer/gi/ui-next'
import { Box, Grid } from '@mui/material'
import { useContext } from 'react'
import { columns } from '../util'
import type { Artifact } from '@genshin-optimizer/gi/frontend-gql'

export default function ArtifactList({
  setEditArt,
}: {
  setEditArt: (a: Artifact) => void
}) {
  const { artifacts } = useContext(GenshinUserContext)
  return (
    <Box>
      <Grid container spacing={1} columns={columns}>
        {artifacts?.map((artifact) => (
          <Grid item key={artifact.id} xs={1}>
            <ArtifactCard
              artifact={artifact}
              onEdit={() => setEditArt({ ...artifact })}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
