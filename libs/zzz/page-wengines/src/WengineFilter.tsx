import {
  BootstrapTooltip,
  CardThemed,
  SolidToggleButtonGroup,
  theme,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  catTotal,
  handleMultiSelect,
} from '@genshin-optimizer/common/util'
import {
  allLocationKeys,
  allSpecialityKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import {
  LocationFilterMultiAutocomplete,
  WengineRarityToggle,
  WengineToggle,
} from '@genshin-optimizer/zzz/ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
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

export default function WengineFilter({
  numShowing,
  total,
  wengineIds,
}: {
  numShowing: number
  total: number
  wengineIds: string[]
}) {
  const { t } = useTranslation(['page_wengine', 'ui'])
  const { database } = useDatabaseContext()
  const [state, setState] = useState(database.displayWengine.get())

  useEffect(() => {
    database.displayWengine.follow((_, dbMeta) => setState(dbMeta))
  }, [database])

  const { speciality, rarity, locked, showEquipped, showInventory, locations } =
    state

  const wengineTotals = useMemo(
    () =>
      catTotal(allSpecialityKeys, (sk) =>
        database.wengines.entries.forEach(([id, wengine]) => {
          const wek = getWengineStat(wengine.key).type
          sk[wek].total++
          if (wengineIds.includes(id)) sk[wek].current++
        })
      ),
    [database.wengines.entries, wengineIds]
  )

  const wengineRarityTotals = useMemo(
    () =>
      catTotal(allWengineRarityKeys, (ct) =>
        database.wengines.entries.forEach(([id, wengine]) => {
          const rk = getWengineStat(wengine.key).rarity
          if (rk) {
            ct[rk].total++
            if (wengineIds.includes(id)) ct[rk].current++
          }
        })
      ),
    [database.wengines.entries, wengineIds]
  )

  const { lockedTotal, equippedTotal, locationTotal } = useMemo(() => {
    const catKeys = {
      lockedTotal: ['locked', 'unlocked'],
      equippedTotal: ['equipped', 'unequipped'],
      locationTotal: [...allLocationKeys, ''],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.wengines.entries.forEach(([id, wengine]) => {
        const location = wengine.location
        const lock = wengine.lock ? 'locked' : 'unlocked'
        const equipped = location ? 'equipped' : 'unequipped'
        ctMap['lockedTotal'][lock].total++
        ctMap['equippedTotal'][equipped].total++
        ctMap['locationTotal'][location].total++
        if (wengineIds.includes(id)) {
          ctMap['lockedTotal'][lock].current++
          ctMap['equippedTotal'][equipped].current++
          ctMap['locationTotal'][location].current++
        }
      })
    )
  }, [database.wengines.entries, wengineIds])

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Grid container>
          <Grid item>
            <Typography variant="h6">{t('wengineFilterTitle')}</Typography>
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
              onClick={() => database.displayWengine.set({ action: 'reset' })}
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

                <WengineToggle
                  fullWidth
                  onChange={(speciality) =>
                    database.displayWengine.set({ speciality })
                  }
                  value={speciality}
                  totals={wengineTotals}
                  size="small"
                />
                <WengineRarityToggle
                  sx={{ height: '100%' }}
                  fullWidth
                  onChange={(rarity) => database.displayWengine.set({ rarity })}
                  value={rarity}
                  totals={wengineRarityTotals}
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
                          database.displayWengine.set({
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
                      database.displayWengine.set({
                        showInventory: !showInventory,
                      })
                    }
                  >
                    {t('wengineInInv')}{' '}
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
                      database.displayWengine.set({
                        showEquipped: !showEquipped,
                      })
                    }
                  >
                    {t('equippedWengine')}{' '}
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
                            database.displayWengine.set({ locations })
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
