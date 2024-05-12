import { SqBadge } from '@genshin-optimizer/common/ui'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { Button, Grid, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

function WeaponRedButtons({ weaponIds }: { weaponIds: string[] }) {
  const { t } = useTranslation(['weapon', 'ui'])
  const database = useDatabase()
  const { numDelete, numUnlock, numLock } = useMemo(() => {
    const weapons = weaponIds.map((id) =>
      database.weapons.get(id)
    ) as ICachedWeapon[]
    const numUnlock = weapons.reduce(
      (w, weapon) => w + (weapon.lock ? 0 : 1),
      0
    )
    const numLock = weapons.length - numUnlock
    const numDelete = weapons.reduce(
      (w, weapon) => w + (weapon.lock || weapon.location ? 0 : 1),
      0
    )
    return { numDelete, numUnlock, numLock }
  }, [weaponIds, database])

  const deleteWeapons = () =>
    window.confirm(`Are you sure you want to delete ${numDelete} weapons?`) &&
    weaponIds.map((id) => {
      const weapon = database.weapons.get(id)
      if (!weapon?.lock && !weapon?.location) database.weapons.remove(id)
    })

  const lockWeapons = () =>
    window.confirm(`Are you sure you want to lock ${numLock} weapons ?`) &&
    weaponIds.map((id) => database.weapons.set(id, { lock: true }))

  const unlockWeapons = () =>
    window.confirm(`Are you sure you want to unlock ${numLock} weapons ?`) &&
    weaponIds.map((id) => database.weapons.set(id, { lock: false }))

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={16} sm={8} md={4}>
        <Button
          fullWidth
          color="error"
          disabled={!numDelete}
          onClick={deleteWeapons}
          startIcon={<DeleteForeverIcon />}
        >
          <Trans t={t} i18nKey="button.deleteWeapons">
            Delete Weapons
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numDelete ? 'success' : 'secondary'}>
            {numDelete}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={16} sm={8} md={4}>
        <Button
          fullWidth
          color="error"
          disabled={!numLock}
          onClick={unlockWeapons}
          startIcon={<LockOpenIcon />}
        >
          <Trans t={t} i18nKey="button.unlockWeapons">
            Unlock Weapons
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numLock ? 'success' : 'secondary'}>
            {numLock}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={16} sm={8} md={4}>
        <Button
          fullWidth
          color="error"
          disabled={!numUnlock}
          onClick={lockWeapons}
          startIcon={<LockIcon />}
        >
          <Trans t={t} i18nKey="button.lockWeapons">
            Lock Weapons
          </Trans>
          <SqBadge sx={{ ml: 1 }} color={numUnlock ? 'success' : 'secondary'}>
            {numUnlock}
          </SqBadge>
        </Button>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="space-around">
        <Typography variant="caption" color="text.secondary">
          <Trans t={t} i18nKey="buttonHint">
            Note: the red buttons above only apply to
            <b>currently filtered weapons</b>
          </Trans>
        </Typography>
      </Grid>
    </Grid>
  )
}

export default WeaponRedButtons
