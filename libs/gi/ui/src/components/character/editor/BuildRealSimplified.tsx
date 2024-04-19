import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useBuild } from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { Box, Grid } from '@mui/material'
import { ArtifactCardNano } from '../../artifact'
import { BuildCard } from '../../build'
import { WeaponCardNano } from '../../weapon'

// TODO: Translation
export function BuildRealSimplified({
  buildId,
  characterKey,
}: {
  buildId: string
  characterKey: CharacterKey
}) {
  const { name, description, weaponId, artifactIds } = useBuild(buildId)!

  const weaponTypeKey = getCharStat(characterKey).weaponType

  return (
    <BuildCard name={name} description={description} hideFooter>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'stretch',
        }}
      >
        <Grid
          container
          spacing={1}
          columns={{ xs: 2, sm: 2, md: 2, lg: 3, xl: 3 }}
        >
          <Grid item xs={1}>
            <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
              <WeaponCardNano
                weaponId={weaponId}
                weaponTypeKey={weaponTypeKey}
              />
            </CardThemed>
          </Grid>
          {Object.entries(artifactIds).map(([slotKey, id]) => (
            <Grid item key={id || slotKey} xs={1}>
              <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
                <ArtifactCardNano artifactId={id} slotKey={slotKey} />
              </CardThemed>
            </Grid>
          ))}
        </Grid>
      </Box>
    </BuildCard>
  )
}
