import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact, ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { input } from '@genshin-optimizer/gi/wr'
import { Box, Card, Grid, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext } from '../../../context'
import { ArtifactCardPico } from '../../artifact'
import { WeaponCardPico, WeaponCardPicoObj } from '../../weapon'

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
        ),
      )}
    </>
  )
}
export function CharacterCardEquipmentRowTC({
  weapon,
}: {
  weapon: ICachedWeapon
}) {
  const { t } = useTranslation('page_weapon')
  return (
    <Box>
      <Grid container columns={weapon ? 6 : 5} spacing={0.5} sx={{}}>
        {weapon && (
          <Grid item xs={1} height="100%">
            <WeaponCardPicoObj weapon={weapon} />
          </Grid>
        )}
        <Grid item xs={5}>
          <Card
            sx={{
              backgroundColor: 'secondary.main',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>
              <strong>{t('tcBuild')}</strong>
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
