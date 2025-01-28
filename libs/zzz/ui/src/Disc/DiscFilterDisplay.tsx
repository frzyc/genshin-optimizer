import {
  BootstrapTooltip,
  SolidToggleButtonGroup,
  theme,
} from '@genshin-optimizer/common/ui'
import { bulkCatTotal } from '@genshin-optimizer/common/util'
import {
  allDiscMainStatKeys,
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSubStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  ToggleButton,
} from '@mui/material'
import Stack from '@mui/system/Stack'
import { Suspense, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LocationFilterMultiAutocomplete } from '../Character/LocationFilterMultiAutocomplete'
import { DiscSlotToggle } from '../toggles'
import { DiscLevelSlider } from './DiscLevelSlider'
import { DiscMainStatMultiAutocomplete } from './DiscMainStatMultiAutocomplete'
import { DiscSetMultiAutocomplete } from './DiscSetMultiAutocomplete'
import { SubstatMultiAutocomplete } from './SubstatMultiAutocomplete'

export function DiscFilterDisplay() {
  const { t } = useTranslation(['artifact', 'ui'])
  const database = useDatabaseContext().database
  const { setTotal, mainStatTotal, subStatTotal } = useMemo(() => {
    const catKeys = {
      setTotal: allDiscSetKeys,
      mainStatTotal: allDiscMainStatKeys,
      subStatTotal: allDiscSubStatKeys,
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.discs.entries.forEach(([, disc]) => {
        const { setKey } = disc
        ctMap['setTotal'][setKey].current++
      })
    )
  }, [database])
  return (
    <Box>
      <Grid container spacing={1}>
        {/* left */}
        <Grid item xs={12} md={6} display="flex" flexDirection="column">
          {/* General */}
          <Trans t={t} i18nKey="subheadings.general" />
          <Stack spacing={1}>
            <Divider sx={{ bgcolor: theme.palette.contentNormal.light }} />
            {/* Artiface level filter */}
            <Card>
              <DiscLevelSlider
                levelLow={0}
                levelHigh={0}
                setLow={function (low: number): void {
                  throw new Error('Function not implemented.')
                }}
                setHigh={function (high: number): void {
                  throw new Error('Function not implemented.')
                }}
                setBoth={function (low: number, high: number): void {
                  throw new Error('Function not implemented.')
                }}
              ></DiscLevelSlider>
            </Card>
            {/* Disc rarity filter */}
            <SolidToggleButtonGroup fullWidth value={'S'} size="small">
              {allDiscRarityKeys.map((rarity) => (
                <ToggleButton
                  key={rarity}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  value={rarity}
                >
                  <Chip label={rarity} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {/* Number of Sub stats filter */}
            <SolidToggleButtonGroup fullWidth value={1} size="small">
              {[1, 2, 3, 4].map((line) => (
                <ToggleButton
                  key={line}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  value={line}
                >
                  <Box whiteSpace="nowrap">{t('sub', { count: line })}</Box>
                  <Chip label={'2'} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {/* Disc Slot */}
            <DiscSlotToggle
              disabled={false}
              onChange={(slotKeys: any) => {
                return slotKeys
              }}
              value={[]}
              totals={null}
            />
          </Stack>
          <Stack spacing={1.5} pt={1.5}>
            {/* Disc set dropdown */}
            <DiscSetMultiAutocomplete
              totals={setTotal}
              discSetKeys={[]}
              setArtSetKeys={(artSetKeys) => {
                return artSetKeys
              }}
            />
            {/* Main stat dropdown */}
            <DiscMainStatMultiAutocomplete
              totals={mainStatTotal}
              mainStatKeys={[]}
              setMainStatKeys={(mainStatKeys) => {
                return mainStatKeys
              }}
            />
            {/* Sub stat dropdown */}
            <SubstatMultiAutocomplete
              totals={subStatTotal}
              substatKeys={[]}
              setSubstatKeys={(substats) => {
                return substats
              }}
              allSubstatKeys={[...allDiscSubStatKeys]}
            />
          </Stack>
        </Grid>
        {/* right */}
        <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
          {/* Inventory */}
          <Box>
            <Trans t={t} i18nKey="subheadings.inventory" />
            <Stack spacing={1}>
              <Divider sx={{ bgcolor: theme.palette.contentNormal.light }} />
              {/* exclusion + locked */}

              {/* Excluded from optimization */}

              {/* All inventory toggle */}
              <Button startIcon={<BusinessCenterIcon />} color={'success'}>
                {t('artInInv')}{' '}
                <Chip sx={{ ml: 1 }} label={'unequipped'} size="small" />
              </Button>
              {/* All equipped toggle */}
              <Button startIcon={<PersonSearchIcon />} color={'success'}>
                {t('equippedArt')}{' '}
                <Chip sx={{ ml: 1 }} label={'equipped'} size="small" />
              </Button>
            </Stack>
            <Stack spacing={1.5} pt={1.5}>
              {/* Filter characters */}
              <Suspense fallback={null}>
                <BootstrapTooltip title={t('locationsTooltip')} placement="top">
                  <span>
                    <LocationFilterMultiAutocomplete
                      totals={[1]}
                      locations={[]}
                      setLocations={(locations) => {
                        return locations
                      }}
                      disabled={true}
                    />
                  </span>
                </BootstrapTooltip>
              </Suspense>
            </Stack>
          </Box>
          {/* Role Value */}
          <Box>
            <Trans t={t} i18nKey="subheadings.rollvalue" />
            <Stack spacing={1}>
              <Divider sx={{ bgcolor: theme.palette.contentNormal.light }} />
              {/* RV slide */}
              RVSlide
              {/* RV filter */}
              SubstatToggle
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
