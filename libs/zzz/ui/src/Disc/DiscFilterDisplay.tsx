import {
  BootstrapTooltip,
  SolidToggleButtonGroup,
  theme,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  handleMultiSelect,
  objKeyMap,
} from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscMainStatKeys,
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  allLocationKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import type { DiscFilterOption } from '@genshin-optimizer/zzz/util'
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

const lockedValues = ['locked', 'unlocked'] as const
const excludedValues = ['excluded', 'included'] as const

const rarityHandler = handleMultiSelect([...allDiscRarityKeys])
const lineHandler = handleMultiSelect([1, 2, 3, 4])
const lockedHandler = handleMultiSelect([...lockedValues])
const excludedHandler = handleMultiSelect([...excludedValues])
interface DiscFilterDisplayProps {
  filterOption: DiscFilterOption
  filterOptionDispatch: (option: Partial<DiscFilterOption>) => void
  filteredIds: string[]
  disableSlotFilter?: boolean
  enableExclusionFilter?: boolean
  excludedIds?: string[]
}
export function DiscFilterDisplay({
  filterOption,
  filterOptionDispatch,
  filteredIds,
  disableSlotFilter = false,
  enableExclusionFilter = false,
  excludedIds = [],
}: DiscFilterDisplayProps) {
  const { t } = useTranslation(['disc', 'ui'])

  const filteredIdMap = useMemo(
    () => objKeyMap(filteredIds, (_) => true),
    [filteredIds]
  )
  const {
    discSetKeys = [],
    mainStatKeys = [],
    rarity = [],
    slotKeys = [],
    levelLow = 0,
    levelHigh = 15,
    substats = [],
    locations,
    showEquipped,
    showInventory,
    locked = [...lockedValues],
    rvLow = 0,
    rvHigh = 900,
    useMaxRV = false,
    lines = [],
    excluded = [...excludedValues],
  } = filterOption

  const database = useDatabaseContext().database
  const {
    rarityTotal,
    slotTotal,
    lockedTotal,
    linesTotal,
    equippedTotal,
    setTotal,
    mainStatTotal,
    subStatTotal,
    locationTotal,
    excludedTotal,
  } = useMemo(() => {
    const catKeys = {
      rarityTotal: allDiscRarityKeys,
      slotTotal: allDiscSlotKeys,
      lockedTotal: ['locked', 'unlocked'],
      linesTotal: [1, 2, 3, 4],
      equippedTotal: ['equipped', 'unequipped'],
      setTotal: allDiscSetKeys,
      mainStatTotal: allDiscMainStatKeys,
      subStatTotal: allDiscSubStatKeys,
      locationTotal: [...allLocationKeys, ''],
      excludedTotal: ['excluded', 'included'],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.discs.entries.forEach(([id, disc]) => {
        const { rarity, slotKey, location, setKey, mainStatKey, substats } =
          disc
        const lock = disc.lock ? 'locked' : 'unlocked'
        const lns = disc.substats.filter((s) => s.upgrades).length
        const equipped = location ? 'equipped' : 'unequipped'
        const excluded = excludedIds.includes(id) ? 'excluded' : 'included'
        // The slot filter is disabled during artifact swapping, in which case our artifact total displayed by
        // the filter should reflect only the slot being swapped.
        if (!disableSlotFilter || disc.slotKey === filterOption.slotKeys[0]) {
          ctMap['rarityTotal'][rarity].total++
          ctMap['slotTotal'][slotKey].total++
          ctMap['lockedTotal'][lock].total++
          ctMap['linesTotal'][lns].total++
          ctMap['equippedTotal'][equipped].total++
          ctMap['setTotal'][setKey].total++
          ctMap['mainStatTotal'][mainStatKey].total++
          substats.forEach((sub) => {
            const subKey = sub.key
            if (!subKey) return
            ctMap['subStatTotal'][subKey].total++ //Remove if later
            if (filteredIdMap[id]) ctMap['subStatTotal'][subKey].current++
          })
          if (location) ctMap['locationTotal'][location].total++
          ctMap['excludedTotal'][excluded].total++
        }

        if (filteredIdMap[id]) {
          ctMap['rarityTotal'][rarity].current++
          ctMap['slotTotal'][slotKey].current++
          ctMap['lockedTotal'][lock].current++
          ctMap['linesTotal'][lns].current++
          ctMap['equippedTotal'][equipped].current++
          ctMap['setTotal'][setKey].current++
          ctMap['mainStatTotal'][mainStatKey].current++
          if (location) ctMap['locationTotal'][location].current++ //Remove if later
          ctMap['excludedTotal'][excluded].current++
        }
      })
    )
  }, [
    database.discs.entries,
    disableSlotFilter,
    excludedIds,
    filterOption.slotKeys,
    filteredIdMap,
  ])
  return (
    <Box>
      <Grid container spacing={1}>
        {/* left */}
        <Grid item xs={12} md={6} display="flex" flexDirection="column">
          {/* General */}
          <Trans t={t} i18nKey="subheadings.general" />
          <Stack spacing={1}>
            <Divider sx={{ bgcolor: theme.palette.contentNormal.light }} />
            {/* Disc level filter */}
            <Card>
              <DiscLevelSlider
                levelLow={levelLow}
                levelHigh={levelHigh}
                setLow={(levelLow) => filterOptionDispatch({ levelLow })}
                setHigh={(levelHigh) => filterOptionDispatch({ levelHigh })}
                setBoth={(levelLow, levelHigh) =>
                  filterOptionDispatch({ levelLow, levelHigh })
                }
              ></DiscLevelSlider>
            </Card>
            {/* Disc rarity filter */}
            <SolidToggleButtonGroup fullWidth value={rarity} size="small">
              {allDiscRarityKeys.map((rarityKey) => (
                <ToggleButton
                  key={rarityKey}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  value={rarityKey}
                  onClick={() =>
                    filterOptionDispatch({
                      rarity: rarityHandler(rarity, rarityKey),
                    })
                  }
                >
                  <Chip label={rarityKey} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {/* Number of Sub stats filter */}
            <SolidToggleButtonGroup fullWidth value={lines} size="small">
              {[1, 2, 3, 4].map((line) => (
                <ToggleButton
                  key={line}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  value={line}
                  onClick={() =>
                    filterOptionDispatch({
                      lines: lineHandler(lines, line) as Array<1 | 2 | 3 | 4>,
                    })
                  }
                >
                  <Box whiteSpace="nowrap">
                    {t('sub-needs translate', { count: line })}
                  </Box>
                  <Chip label={linesTotal[line]} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {/* Disc Slot */}
            <DiscSlotToggle
              disabled={false}
              onChange={(slotKeys: DiscSlotKey[]) =>
                filterOptionDispatch({ slotKeys })
              }
              value={slotKeys}
              totals={slotTotal}
            />
          </Stack>
          <Stack spacing={1.5} pt={1.5}>
            {/* Disc set dropdown */}
            <DiscSetMultiAutocomplete
              totals={setTotal}
              discSetKeys={discSetKeys}
              setDiscSetKeys={(discSetKeys) =>
                filterOptionDispatch({ discSetKeys })
              }
            />
            {/* Main stat dropdown */}
            <DiscMainStatMultiAutocomplete
              totals={mainStatTotal}
              mainStatKeys={mainStatKeys}
              setMainStatKeys={(mainStatKeys) =>
                filterOptionDispatch({ mainStatKeys })
              }
            />
            {/* Sub stat dropdown */}
            <SubstatMultiAutocomplete
              totals={subStatTotal}
              substatKeys={substats}
              setSubstatKeys={(substats) => filterOptionDispatch({ substats })}
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
              <SolidToggleButtonGroup fullWidth value={locked} size="small">
                {lockedValues.map((v, i) => (
                  <ToggleButton
                    key={v}
                    value={v}
                    sx={{ display: 'flex', gap: 1 }}
                    onClick={() =>
                      filterOptionDispatch({ locked: lockedHandler(locked, v) })
                    }
                  >
                    {/* {i ? <LockOpenIcon /> : <LockIcon />} */}
                    <Trans i18nKey={`ui:${v}`} t={t} />
                    <Chip
                      label={lockedTotal[i ? 'unlocked' : 'locked']}
                      size="small"
                    />
                  </ToggleButton>
                ))}
              </SolidToggleButtonGroup>
              {/* Excluded from optimization */}
              {enableExclusionFilter && (
                <SolidToggleButtonGroup fullWidth value={excluded} size="small">
                  {excludedValues.map((v, i) => (
                    <ToggleButton
                      key={v}
                      value={v}
                      sx={{ display: 'flex', gap: 1 }}
                      onClick={() =>
                        filterOptionDispatch({
                          excluded: excludedHandler(excluded, v),
                        })
                      }
                    >
                      {/* {i ? <OptimizationIcon /> : <ExcludeIcon />} */}
                      <Trans i18nKey={`ui:${v}`} t={t} />
                      <Chip
                        label={excludedTotal[i ? 'included' : 'excluded']}
                        size="small"
                      />
                    </ToggleButton>
                  ))}
                </SolidToggleButtonGroup>
              )}
              {/* All inventory toggle */}
              <Button
                startIcon={<BusinessCenterIcon />}
                color={showInventory ? 'success' : 'secondary'}
                onClick={() =>
                  filterOptionDispatch({ showInventory: !showInventory })
                }
              >
                {t('discInInv')}{' '}
                <Chip
                  sx={{ ml: 1 }}
                  label={equippedTotal['unequipped']}
                  size="small"
                />
              </Button>
              {/* All equipped toggle */}
              <Button
                startIcon={<PersonSearchIcon />}
                color={showEquipped ? 'success' : 'secondary'}
                onClick={() =>
                  filterOptionDispatch({ showEquipped: !showEquipped })
                }
              >
                {t('equippedDisc')}{' '}
                <Chip
                  sx={{ ml: 1 }}
                  label={equippedTotal['equipped']}
                  size="small"
                />
              </Button>
            </Stack>
            <Stack spacing={1.5} pt={1.5}>
              {/* Filter characters */}
              <Suspense fallback={null}>
                <BootstrapTooltip
                  title={showEquipped ? t('locationsTooltip') : ''}
                  placement="top"
                >
                  <span>
                    <LocationFilterMultiAutocomplete
                      totals={locationTotal}
                      locations={showEquipped ? [] : locations}
                      setLocations={(locations) => locations}
                      disabled={showEquipped}
                    />
                  </span>
                </BootstrapTooltip>
              </Suspense>
            </Stack>
          </Box>
          {/* Role Value */}
        </Grid>
      </Grid>
    </Box>
  )
}
