import {
  BootstrapTooltip,
  SolidToggleButtonGroup,
  StarsDisplay,
  theme,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  handleMultiSelect,
  objKeyMap,
} from '@genshin-optimizer/common/util'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/gi/consts'
import { useDatabase, useDisplayArtifact } from '@genshin-optimizer/gi/db-ui'
import type { ArtifactFilterOption } from '@genshin-optimizer/gi/util'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
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
import { ExcludeIcon, OptimizationIcon } from '../../consts'
import { SubstatMultiAutocomplete } from '../SubstatMultiAutocomplete'
import { LocationFilterMultiAutocomplete } from '../character/LocationFilterMultiAutocomplete'
import { ArtifactSlotToggle } from '../toggles'
import { ArtifactLevelSlider } from './ArtifactLevelSlider'
import { ArtifactMainStatMultiAutocomplete } from './ArtifactMainStatMultiAutocomplete'
import { ArtifactSetMultiAutocomplete } from './ArtifactSetMultiAutocomplete'
import { RVSlide } from './RVSlide'
import { SubstatToggle } from './SubstatToggle'

const lockedValues = ['locked', 'unlocked'] as const
const excludedValues = ['excluded', 'included'] as const

const rarityHandler = handleMultiSelect([...allArtifactRarityKeys])
const lockedHandler = handleMultiSelect([...lockedValues])
const lineHandler = handleMultiSelect([1, 2, 3, 4])
const excludedHandler = handleMultiSelect([...excludedValues])

interface ArtifactFilterDisplayProps {
  filterOption: ArtifactFilterOption
  filterOptionDispatch: (option: Partial<ArtifactFilterOption>) => void
  disableSlotFilter?: boolean
  filteredIds: string[]
  enableExclusionFilter?: boolean
  excludedIds?: string[]
}
export function ArtifactFilterDisplay({
  filterOption,
  filterOptionDispatch,
  filteredIds,
  disableSlotFilter = false,
  enableExclusionFilter = false,
  excludedIds = [],
}: ArtifactFilterDisplayProps) {
  const { t } = useTranslation(['artifact', 'ui'])

  const filteredIdMap = useMemo(
    () => objKeyMap(filteredIds, (_) => true),
    [filteredIds],
  )

  const {
    artSetKeys = [],
    mainStatKeys = [],
    rarity = [],
    slotKeys = [],
    levelLow = 0,
    levelHigh = 20,
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

  const database = useDatabase()

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
      rarityTotal: allArtifactRarityKeys,
      slotTotal: allArtifactSlotKeys,
      lockedTotal: ['locked', 'unlocked'],
      linesTotal: [0, 1, 2, 3, 4],
      equippedTotal: ['equipped', 'unequipped'],
      setTotal: allArtifactSetKeys,
      mainStatTotal: allMainStatKeys,
      subStatTotal: allSubstatKeys,
      locationTotal: [...allLocationCharacterKeys, ''],
      excludedTotal: ['excluded', 'included'],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.arts.entries.forEach(([id, art]) => {
        const { rarity, slotKey, location, setKey, mainStatKey, substats } = art
        const lock = art.lock ? 'locked' : 'unlocked'
        const lns = art.substats.filter((s) => s.value).length
        const equipped = location ? 'equipped' : 'unequipped'
        const excluded = excludedIds.includes(id) ? 'excluded' : 'included'
        // The slot filter is disabled during artifact swapping, in which case our artifact total displayed by
        // the filter should reflect only the slot being swapped.
        if (!disableSlotFilter || art.slotKey === filterOption.slotKeys[0]) {
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
            ctMap['subStatTotal'][subKey].total++
            if (filteredIdMap[id]) ctMap['subStatTotal'][subKey].current++
          })
          ctMap['locationTotal'][location].total++
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
          // substats handled above
          // substats handled above
          ctMap['locationTotal'][location].current++
          ctMap['excludedTotal'][excluded].current++
        }
      }),
    )
  }, [database, disableSlotFilter, excludedIds, filteredIdMap, filterOption])

  const { effFilter } = useDisplayArtifact()

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
              <ArtifactLevelSlider
                showLevelText
                levelLow={levelLow}
                levelHigh={levelHigh}
                setLow={(levelLow) => filterOptionDispatch({ levelLow })}
                setHigh={(levelHigh) => filterOptionDispatch({ levelHigh })}
                setBoth={(levelLow, levelHigh) =>
                  filterOptionDispatch({ levelLow, levelHigh })
                }
              />
            </Card>
            {/* Artifact rarity filter */}
            <SolidToggleButtonGroup fullWidth value={rarity} size="small">
              {allArtifactRarityKeys.map((star) => (
                <ToggleButton
                  key={star}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  value={star}
                  onClick={() =>
                    filterOptionDispatch({
                      rarity: rarityHandler(rarity, star),
                    })
                  }
                >
                  <StarsDisplay stars={star} inline />
                  <Chip label={rarityTotal[star]} size="small" />
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
                  <Box whiteSpace="nowrap">{t('sub', { count: line })}</Box>
                  <Chip label={linesTotal[line]} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {/* Artifact Slot */}
            <ArtifactSlotToggle
              disabled={disableSlotFilter}
              onChange={(slotKeys) => filterOptionDispatch({ slotKeys })}
              totals={slotTotal}
              value={slotKeys}
            />
          </Stack>
          <Stack spacing={1.5} pt={1.5}>
            {/* Artifact set dropdown */}
            <ArtifactSetMultiAutocomplete
              totals={setTotal}
              artSetKeys={artSetKeys}
              setArtSetKeys={(artSetKeys) =>
                filterOptionDispatch({ artSetKeys })
              }
            />
            {/* Main stat dropdown */}
            <ArtifactMainStatMultiAutocomplete
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
              allSubstatKeys={[...allSubstatKeys]}
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
                    {i ? <LockOpenIcon /> : <LockIcon />}
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
                      {i ? <OptimizationIcon /> : <ExcludeIcon />}
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
                {t('artInInv')}{' '}
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
                {t('equippedArt')}{' '}
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
                      setLocations={(locations) =>
                        filterOptionDispatch({ locations })
                      }
                      disabled={showEquipped}
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
              <RVSlide
                showLevelText
                rvLow={rvLow}
                rvHigh={rvHigh}
                useMaxRV={useMaxRV}
                switchFilter={(useMaxRV) => filterOptionDispatch({ useMaxRV })}
                setLow={(rvLow) => filterOptionDispatch({ rvLow })}
                setHigh={(rvHigh) => filterOptionDispatch({ rvHigh })}
                setBoth={(rvLow, rvHigh) =>
                  filterOptionDispatch({ rvLow, rvHigh })
                }
              />
              {/* RV filter */}
              <SubstatToggle
                selectedKeys={effFilter}
                onChange={(n) => database.displayArtifact.set({ effFilter: n })}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
