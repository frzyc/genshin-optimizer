import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { PandoGeneratedBuild } from '@genshin-optimizer/gi/db'
import { ArtifactCard, WeaponCard } from '@genshin-optimizer/gi/ui'
import { Grid } from '@mui/material'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
} as const

/** Read-only weapon + artifact cards for generated build details. */
export function BuildEquipGrid({
  artIds,
  weaponId,
}: {
  artIds: PandoGeneratedBuild['artIds']
  weaponId: string | undefined
}) {
  return (
    <Grid container columns={columns} spacing={1}>
      {weaponId ? (
        <Grid item xs={1}>
          <WeaponCard weaponId={weaponId} />
        </Grid>
      ) : null}
      {allArtifactSlotKeys.map((slot) => {
        const artId = artIds[slot]
        if (!artId) return null
        return (
          <Grid item xs={1} key={slot}>
            <ArtifactCard artifactId={artId} hideLocation />
          </Grid>
        )
      })}
    </Grid>
  )
}
