import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allMainStatKeys,
  allSubstatKeys,
} from '@genshin-optimizer/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import { Box, Button, Chip, Grid, ToggleButton } from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { DatabaseContext } from '../../Database/Database'
import type { FilterOption } from '../../PageArtifact/ArtifactSort'
import { handleMultiSelect } from '../../Util/MultiSelect'
import { bulkCatTotal } from '../../Util/totalUtils'
import BootstrapTooltip from '../BootstrapTooltip'
import SolidToggleButtonGroup from '../SolidToggleButtonGroup'
import { StarsDisplay } from '../StarDisplay'
import ArtifactLevelSlider from './ArtifactLevelSlider'
import ArtifactMainStatMultiAutocomplete from './ArtifactMainStatMultiAutocomplete'
import ArtifactSetMultiAutocomplete from './ArtifactSetMultiAutocomplete'
import ArtifactSubstatMultiAutocomplete from './ArtifactSubstatMultiAutocomplete'
import LocationFilterMultiAutocomplete from './LocationFilterMultiAutocomplete'
import RVSlide from './RVSlide'
import SlotIcon from './SlotIcon'

const lockedValues = ['locked', 'unlocked'] as const

const rarityHandler = handleMultiSelect([...allArtifactRarityKeys])
const slotHandler = handleMultiSelect([...allArtifactSlotKeys])
const lockedHandler = handleMultiSelect([...lockedValues])
const lineHandler = handleMultiSelect([1, 2, 3, 4])

interface ArtifactFilterDisplayProps {
  filterOption: FilterOption
  filterOptionDispatch: (option: Partial<FilterOption>) => void
  disableSlotFilter?: boolean
  filteredIds: string[]
}
export default function ArtifactFilterDisplay({
  filterOption,
  filterOptionDispatch,
  filteredIds,
  disableSlotFilter = false,
}: ArtifactFilterDisplayProps) {
  const { t } = useTranslation(['artifact', 'ui'])

  const filteredIdMap = useMemo(
    () => objKeyMap(filteredIds, (_) => true),
    [filteredIds]
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
    lines = [],
  } = filterOption

  const { database } = useContext(DatabaseContext)

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
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      Object.entries(database.arts.data).forEach(([id, art]) => {
        const { rarity, slotKey, location, setKey, mainStatKey, substats } = art
        const lock = art.lock ? 'locked' : 'unlocked'
        const lns = art.substats.filter((s) => s.value).length
        const equipped = location ? 'equipped' : 'unequipped'
        // The slot filter is disabled during artifact swapping, in which case our artifact total displayed by
        // the filter should reflect only the slot being swapped.
        if (!disableSlotFilter || art.slotKey === filterOption.slotKeys[0]) {
          ctMap.rarityTotal[rarity].total++
          ctMap.slotTotal[slotKey].total++
          ctMap.lockedTotal[lock].total++
          ctMap.linesTotal[lns].total++
          ctMap.equippedTotal[equipped].total++
          ctMap.setTotal[setKey].total++
          ctMap.mainStatTotal[mainStatKey].total++
          substats.forEach((sub) => {
            const subKey = sub.key
            if (!subKey) return
            ctMap.subStatTotal[subKey].total++
            if (filteredIdMap[id]) ctMap.subStatTotal[subKey].current++
          })
          ctMap.locationTotal[location].total++
        }

        if (filteredIdMap[id]) {
          ctMap.rarityTotal[rarity].current++
          ctMap.slotTotal[slotKey].current++
          ctMap.lockedTotal[lock].current++
          ctMap.linesTotal[lns].current++
          ctMap.equippedTotal[equipped].current++
          ctMap.setTotal[setKey].current++
          ctMap.mainStatTotal[mainStatKey].current++
          // substats handled above
          ctMap.locationTotal[location].current++
        }
      })
    )
  }, [database, disableSlotFilter, filteredIdMap, filterOption])

  return (
    <Grid container spacing={1}>
      {/* left */}
      <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
        {/* Artifact rarity filter */}
        <SolidToggleButtonGroup fullWidth value={rarity} size="small">
          {allArtifactRarityKeys.map((star) => (
            <ToggleButton
              key={star}
              sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
              value={star}
              onClick={() =>
                filterOptionDispatch({ rarity: rarityHandler(rarity, star) })
              }
            >
              <StarsDisplay stars={star} inline />
              <Chip label={rarityTotal[star]} size="small" />
            </ToggleButton>
          ))}
        </SolidToggleButtonGroup>
        {/* Artifact Slot */}
        <SolidToggleButtonGroup
          fullWidth
          value={slotKeys}
          size="small"
          disabled={disableSlotFilter}
        >
          {allArtifactSlotKeys.map((slotKey) => (
            <ToggleButton
              key={slotKey}
              sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
              value={slotKey}
              onClick={() =>
                filterOptionDispatch({
                  slotKeys: slotHandler(slotKeys, slotKey),
                })
              }
            >
              <SlotIcon slotKey={slotKey} />
              <Chip label={slotTotal[slotKey]} size="small" />
            </ToggleButton>
          ))}
        </SolidToggleButtonGroup>
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
        {/* Lines */}
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
        <Button
          startIcon={<PersonSearchIcon />}
          color={showEquipped ? 'success' : 'secondary'}
          onClick={() => filterOptionDispatch({ showEquipped: !showEquipped })}
        >
          {t`equippedArt`}{' '}
          <Chip sx={{ ml: 1 }} label={equippedTotal.equipped} size="small" />
        </Button>
        <Button
          startIcon={<BusinessCenterIcon />}
          color={showInventory ? 'success' : 'secondary'}
          onClick={() =>
            filterOptionDispatch({ showInventory: !showInventory })
          }
        >
          {t`artInInv`}{' '}
          <Chip sx={{ ml: 1 }} label={equippedTotal.unequipped} size="small" />
        </Button>
        {/* Artiface level filter */}
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

        <RVSlide
          showLevelText
          levelLow={rvLow}
          levelHigh={rvHigh}
          setLow={(rvLow) => filterOptionDispatch({ rvLow })}
          setHigh={(rvHigh) => filterOptionDispatch({ rvHigh })}
          setBoth={(rvLow, rvHigh) => filterOptionDispatch({ rvLow, rvHigh })}
        />
      </Grid>
      {/* right */}
      <Grid item xs={12} md={6} display="flex" flexDirection="column" gap={1}>
        {/* Artifact Set */}
        <ArtifactSetMultiAutocomplete
          totals={setTotal}
          artSetKeys={artSetKeys}
          setArtSetKeys={(artSetKeys) => filterOptionDispatch({ artSetKeys })}
        />
        <ArtifactMainStatMultiAutocomplete
          totals={mainStatTotal}
          mainStatKeys={mainStatKeys}
          setMainStatKeys={(mainStatKeys) =>
            filterOptionDispatch({ mainStatKeys })
          }
        />
        <ArtifactSubstatMultiAutocomplete
          totals={subStatTotal}
          substatKeys={substats}
          setSubstatKeys={(substats) => filterOptionDispatch({ substats })}
        />
        <Suspense fallback={null}>
          <BootstrapTooltip
            title={showEquipped ? t`locationsTooltip` : ''}
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
      </Grid>
    </Grid>
  )
}
