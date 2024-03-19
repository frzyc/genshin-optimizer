import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useBuild } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { Box, Grid } from '@mui/material'
import { BuildCard } from '../../../PageTeam/CharacterDisplay/Build/BuildCard'
import ArtifactCardNano from '../../Artifact/ArtifactCardNano'
import WeaponCardNano from '../../Weapon/WeaponCardNano'

// TODO: Translation
export default function BuildRealSimplified({
  buildId,
  characterKey,
}: {
  buildId: string
  characterKey: CharacterKey
}) {
  const { name, description, weaponId, artifactIds } = useBuild(buildId)!

  const weaponTypeKey = getCharData(characterKey).weaponType

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
            <WeaponCardNano weaponId={weaponId} weaponTypeKey={weaponTypeKey} />
          </Grid>
          {Object.entries(artifactIds).map(([slotKey, id]) => (
            <Grid item key={id || slotKey} xs={1}>
              <ArtifactCardNano artifactId={id} slotKey={slotKey} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </BuildCard>
  )
}
