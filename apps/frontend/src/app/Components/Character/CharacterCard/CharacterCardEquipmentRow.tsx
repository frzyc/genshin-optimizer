import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Box, Grid } from '@mui/material'
import { useContext } from 'react'
import { DataContext } from '../../../Context/DataContext'
import { input } from '../../../Formula'
import ArtifactCardPico from '../../Artifact/ArtifactCardPico'
import WeaponCardPico from '../../Weapon/WeaponCardPico'

export function CharacterCardEquipmentRow({
  hideWeapon = false,
}: {
  hideWeapon?: boolean
}) {
  const { data } = useContext(DataContext)
  return (
    <Box>
      <Grid container columns={hideWeapon ? 5 : 6} spacing={0.5}>
        {!hideWeapon && (
          <Grid item xs={1} height="100%">
            <WeaponCardPico
              weaponId={data.get(input.weapon.id).value?.toString() ?? ''}
            />
          </Grid>
        )}
        <Artifacts />
      </Grid>
    </Box>
  )
}
function Artifacts() {
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const artifacts: Array<[ArtifactSlotKey, ICachedArtifact | undefined]> =
    allArtifactSlotKeys.map((k) => [
      k,
      database.arts.get(data.get(input.art[k].id).value?.toString() ?? ''),
    ])

  return (
    <>
      {artifacts.map(
        ([key, art]: [ArtifactSlotKey, ICachedArtifact | undefined]) => (
          <Grid item key={key} xs={1}>
            <ArtifactCardPico artifactObj={art} slotKey={key} />
          </Grid>
        )
      )}
    </>
  )
}
