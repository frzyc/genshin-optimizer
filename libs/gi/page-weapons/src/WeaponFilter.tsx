import {
  BootstrapTooltip,
  CardThemed,
  SolidToggleButtonGroup,
  SqBadge,
  theme,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  catTotal,
  handleMultiSelect,
} from '@genshin-optimizer/common/util'
import {
  allLocationCharacterKeys,
  allRarityKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  LocationFilterMultiAutocomplete,
  WeaponRarityToggle,
  WeaponToggle,
} from '@genshin-optimizer/gi/ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import ReplayIcon from '@mui/icons-material/Replay'
import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  ToggleButton,
  Typography,
} from '@mui/material'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

const lockedValues = ['locked', 'unlocked'] as const

const lockedHandler = handleMultiSelect([...lockedValues])

function WeaponFilter({
  numShowing,
  total,
  weaponIds,
}: {
  numShowing: number
  total: number
  weaponIds: string[]
}) {
  const { t } = useTranslation(['page_weapon', 'ui'])
  const database = useDatabase()
  const [state, setState] = useState(database.displayWeapon.get())

  useEffect(() => {
    database.displayWeapon.follow((r, dbMeta) => setState(dbMeta))
  }, [database])

  const { weaponType, rarity, locked, showEquipped, showInventory, locations } =
    state

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        database.weapons.entries.forEach(([id, weapon]) => {
          const wtk = getWeaponStat(weapon.key).weaponType
          ct[wtk].total++
          if (weaponIds.includes(id)) ct[wtk].current++
        })
      ),
    [database, weaponIds]
  )

  const weaponRarityTotals = useMemo(
    () =>
      catTotal(allRarityKeys, (ct) =>
        database.weapons.entries.forEach(([id, weapon]) => {
          const wr = getWeaponStat(weapon.key).rarity
          ct[wr].total++
          if (weaponIds.includes(id)) ct[wr].current++
        })
      ),
    [database, weaponIds]
  )

  const { lockedTotal, equippedTotal, locationTotal } = useMemo(() => {
    const catKeys = {
      lockedTotal: ['locked', 'unlocked'],
      equippedTotal: ['equipped', 'unequipped'],
      locationTotal: [...allLocationCharacterKeys, ''],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.weapons.entries.forEach(([id, weapon]) => {
        const location = weapon.location
        const lock = weapon.lock ? 'locked' : 'unlocked'
        const equipped = location ? 'equipped' : 'unequipped'
        ctMap['lockedTotal'][lock].total++
        ctMap['equippedTotal'][equipped].total++
        ctMap['locationTotal'][location].total++
        if (weaponIds.includes(id)) {
          ctMap['lockedTotal'][lock].current++
          ctMap['equippedTotal'][equipped].current++
          ctMap['locationTotal'][location].current++
        }
      })
    )
  }, [database, weaponIds])

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Grid container>
          <Grid item>
            <Typography variant="h6">{t('weaponFilterTitle')}</Typography>
          </Grid>
          <Grid
            item
            flexGrow={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography>
              <strong>{numShowing}</strong> / {total}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              size="small"
              color="error"
              onClick={() => database.displayWeapon.set({ action: 'reset' })}
              startIcon={<ReplayIcon />}
            >
              <Trans t={t} i18nKey="ui:reset" />
            </Button>
          </Grid>
        </Grid>
        <Box>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} display="flex" flexDirection="column">
              <Trans t={t} i18nKey="subheadings.general" />
              <Stack spacing={1}>
                <Divider sx={{ bgcolor: theme.palette.contentNormal.light }} />
                <WeaponToggle
                  fullWidth
                  onChange={(weaponType) =>
                    database.displayWeapon.set({ weaponType })
                  }
                  value={weaponType}
                  totals={weaponTotals}
                  size="small"
                />
                <WeaponRarityToggle
                  sx={{ height: '100%' }}
                  fullWidth
                  onChange={(rarity) => database.displayWeapon.set({ rarity })}
                  value={rarity}
                  totals={weaponRarityTotals}
                  size="small"
                />
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              display="flex"
              flexDirection="column"
              gap={1}
            >
              <Box>
                <Trans t={t} i18nKey="subheadings.inventory" />
                <Stack spacing={1}>
                  <Divider
                    sx={{ bgcolor: theme.palette.contentNormal.light }}
                  />
                  <SolidToggleButtonGroup fullWidth value={locked} size="small">
                    {lockedValues.map((v, i) => (
                      <ToggleButton
                        key={v}
                        value={v}
                        sx={{ display: 'flex', gap: 1 }}
                        onClick={() =>
                          database.displayWeapon.set({
                            locked: lockedHandler(locked, v),
                          })
                        }
                      >
                        {i ? <LockOpenIcon /> : <LockIcon />}
                        <Trans t={t} i18nKey={`ui:${v}`} />
                        <Chip
                          label={lockedTotal[i ? 'unlocked' : 'locked']}
                          size="small"
                        />
                      </ToggleButton>
                    ))}
                  </SolidToggleButtonGroup>
                  <Button
                    startIcon={<BusinessCenterIcon />}
                    color={showInventory ? 'success' : 'secondary'}
                    onClick={() =>
                      database.displayWeapon.set({
                        showInventory: !showInventory,
                      })
                    }
                  >
                    {t('weaponInInv')}{' '}
                    <Chip
                      sx={{ ml: 1 }}
                      label={equippedTotal['unequipped']}
                      size="small"
                    />
                  </Button>
                  <Button
                    startIcon={<PersonSearchIcon />}
                    color={showEquipped ? 'success' : 'secondary'}
                    onClick={() =>
                      database.displayWeapon.set({
                        showEquipped: !showEquipped,
                      })
                    }
                  >
                    {t('equippedWeapon')}{' '}
                    <Chip
                      sx={{ ml: 1 }}
                      label={equippedTotal['equipped']}
                      size="small"
                    />
                  </Button>
                </Stack>
                <Stack spacing={1.5} pt={1.5}>
                  <Suspense fallback={null}>
                    <BootstrapTooltip
                      title={showEquipped ? t('locationsTooltip') : ''}
                      placement="top"
                    >
                      <span>
                        <LocationFilterMultiAutocomplete
                          totals={locationTotal}
                          locations={showEquipped ? [] : locations}
                          setLocations={(locations) =>
                            database.displayWeapon.set({ locations })
                          }
                          disabled={showEquipped}
                        />
                      </span>
                    </BootstrapTooltip>
                  </Suspense>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </CardThemed>
  )
}

function WeaponRedButtons({ weaponIds }: { weaponIds: string[] }) {
  const { t } = useTranslation(['page_weapon', 'ui'])
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
    window.confirm(`Are you sure you want to lock ${numUnlock} weapons ?`) &&
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

export default WeaponFilter
export { WeaponRedButtons }
