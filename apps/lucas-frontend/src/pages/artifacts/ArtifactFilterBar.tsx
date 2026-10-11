import { SolidToggleButtonGroup, StarsDisplay } from '@genshin-optimizer/common/ui'
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
import type { FilterOption } from '@genshin-optimizer/gi/schema'
import { initialFilterOption } from '@genshin-optimizer/gi/schema'
import {
  ArtifactLevelSlider,
  ArtifactMainStatMultiAutocomplete,
  ArtifactSetMultiAutocomplete,
  ArtifactSlotToggle,
  LocationFilterMultiAutocomplete,
  RVSlide,
  SubstatMultiAutocomplete,
  SubstatToggle,
} from '@genshin-optimizer/gi/ui'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  Popover,
  ToggleButton,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const lockedValues = ['locked', 'unlocked'] as const
const lineValues = [1, 2, 3, 4] as const
const rarityHandler = handleMultiSelect([...allArtifactRarityKeys])
const lockedHandler = handleMultiSelect([...lockedValues])
const lineHandler = handleMultiSelect([...lineValues])

/** Per-category counts ("current/total"), same as the upstream ArtifactFilterDisplay. */
function useArtifactTotals(filteredIds: string[]) {
  const database = useDatabase()
  return useMemo(() => {
    const filteredIdMap = objKeyMap(filteredIds, (_) => true)
    const catKeys = {
      rarityTotal: allArtifactRarityKeys,
      slotTotal: allArtifactSlotKeys,
      lockedTotal: lockedValues,
      linesTotal: [0, 1, 2, 3, 4],
      equippedTotal: ['equipped', 'unequipped'],
      setTotal: allArtifactSetKeys,
      mainStatTotal: allMainStatKeys,
      subStatTotal: allSubstatKeys,
      locationTotal: [...allLocationCharacterKeys, ''],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.arts.entries.forEach(([id, art]) => {
        const { rarity, slotKey, location, setKey, mainStatKey, substats } =
          art
        const lock = art.lock ? 'locked' : 'unlocked'
        const lns = substats.filter((s) => s.value).length
        const equipped = location ? 'equipped' : 'unequipped'
        const inFilter = filteredIdMap[id]
        const bump = (cat: keyof typeof catKeys, key: string | number) => {
          ctMap[cat][key].total++
          if (inFilter) ctMap[cat][key].current++
        }
        bump('rarityTotal', rarity)
        bump('slotTotal', slotKey)
        bump('lockedTotal', lock)
        bump('linesTotal', lns)
        bump('equippedTotal', equipped)
        bump('setTotal', setKey)
        bump('mainStatTotal', mainStatKey)
        bump('locationTotal', location)
        substats.forEach((sub) => sub.key && bump('subStatTotal', sub.key))
      })
    )
  }, [database, filteredIds])
}

/** A filter button that opens its controls in a popover; shows the current value when active. */
function FilterMenu({
  label,
  value,
  active,
  width = 380,
  children,
}: {
  label: string
  value?: ReactNode
  active: boolean
  width?: number
  children: ReactNode
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button
        color="secondary"
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        startIcon={
          active ? (
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
              }}
            />
          ) : undefined
        }
        sx={{ color: active ? 'common.white' : undefined }}
      >
        <Box
          component="span"
          sx={{
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {active && value !== undefined ? (
            <>
              {label}: {value}
            </>
          ) : (
            label
          )}
        </Box>
      </Button>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 1, p: 1.5, width, maxWidth: '95vw' } } }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Popover>
    </>
  )
}

type ActiveChip = { key: string; label: ReactNode; onDelete: () => void }

export function ArtifactFilterBar({ filteredIds }: { filteredIds: string[] }) {
  const { t } = useTranslation([
    'artifact',
    'artifactNames_gen',
    'statKey_gen',
    'ui',
  ])
  const database = useDatabase()
  const { filterOption, effFilter } = useDisplayArtifact()
  const dispatch = useCallback(
    (option: Partial<FilterOption>) =>
      database.displayArtifact.set({
        filterOption: { ...filterOption, ...option },
      }),
    [database, filterOption]
  )
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
  } = useArtifactTotals(filteredIds)
  const [moreOpen, setMoreOpen] = useState(false)

  const {
    artSetKeys,
    mainStatKeys,
    rarity,
    slotKeys,
    levelLow,
    levelHigh,
    substats,
    locations,
    showEquipped,
    showInventory,
    locked,
    rvLow,
    rvHigh,
    useMaxRV,
    lines,
  } = filterOption

  const slotName = (k: string) => t(`artifact:slotName.${k}`)
  const setName = (k: string) => t(`artifactNames_gen:${k}`)
  const statName = (k: string) => t(`statKey_gen:${k}`)
  const one = <K,>(keys: readonly K[], name: (k: K) => string) =>
    keys.length === 1 ? name(keys[0]) : `${keys.length}`

  const levelActive = levelLow !== 0 || levelHigh !== 20
  const rvActive = rvLow !== 0 || rvHigh !== 900
  const moreActiveCount = [
    rarity.length < allArtifactRarityKeys.length,
    lines.length < lineValues.length,
    locked.length < lockedValues.length,
    !showInventory,
    !showEquipped,
    !showEquipped && locations.length > 0,
    rvActive,
  ].filter(Boolean).length

  const chips: ActiveChip[] = [
    ...(slotKeys.length < allArtifactSlotKeys.length
      ? [
          {
            key: 'slot',
            label: slotKeys.map(slotName).join(', ') || 'Nenhum slot',
            onDelete: () => dispatch({ slotKeys: [...allArtifactSlotKeys] }),
          },
        ]
      : []),
    ...artSetKeys.map((k) => ({
      key: `set-${k}`,
      label: setName(k),
      onDelete: () =>
        dispatch({ artSetKeys: artSetKeys.filter((s) => s !== k) }),
    })),
    ...mainStatKeys.map((k) => ({
      key: `main-${k}`,
      label: statName(k),
      onDelete: () =>
        dispatch({ mainStatKeys: mainStatKeys.filter((s) => s !== k) }),
    })),
    ...substats.map((k) => ({
      key: `sub-${k}`,
      label: `Sub: ${statName(k)}`,
      onDelete: () => dispatch({ substats: substats.filter((s) => s !== k) }),
    })),
    ...(levelActive
      ? [
          {
            key: 'level',
            label: `Nível ${levelLow}–${levelHigh}`,
            onDelete: () => dispatch({ levelLow: 0, levelHigh: 20 }),
          },
        ]
      : []),
    ...(rarity.length < allArtifactRarityKeys.length
      ? [
          {
            key: 'rarity',
            label: `Raridade: ${rarity.map((r) => `${r}★`).join(', ') || '—'}`,
            onDelete: () => dispatch({ rarity: [...allArtifactRarityKeys] }),
          },
        ]
      : []),
    ...(lines.length < lineValues.length
      ? [
          {
            key: 'lines',
            label: `${lines.join(', ') || '—'} substatus`,
            onDelete: () => dispatch({ lines: [...lineValues] }),
          },
        ]
      : []),
    ...(locked.length < lockedValues.length
      ? [
          {
            key: 'locked',
            label: locked[0] === 'locked' ? 'Trancados' : 'Destrancados',
            onDelete: () => dispatch({ locked: [...lockedValues] }),
          },
        ]
      : []),
    ...(!showInventory
      ? [
          {
            key: 'inventory',
            label: 'Sem os do inventário',
            onDelete: () => dispatch({ showInventory: true }),
          },
        ]
      : []),
    ...(!showEquipped
      ? [
          {
            key: 'equipped',
            label:
              locations.length > 0
                ? `Equipados em ${locations.length} personagem(ns)`
                : 'Sem os equipados',
            onDelete: () => dispatch({ showEquipped: true, locations: [] }),
          },
        ]
      : []),
    ...(rvActive
      ? [
          {
            key: 'rv',
            label: `RV ${rvLow}–${rvHigh}${useMaxRV ? ' (máx.)' : ''}`,
            onDelete: () => dispatch({ rvLow: 0, rvHigh: 900 }),
          },
        ]
      : []),
  ]

  const caption = (text: string) => (
    <Typography variant="caption" color="text.secondary" component="div">
      {text}
    </Typography>
  )

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
        <FilterMenu
          label="Slot"
          active={slotKeys.length < allArtifactSlotKeys.length}
          value={one(slotKeys, slotName)}
          width={600}
        >
          <ArtifactSlotToggle
            onChange={(slotKeys) => dispatch({ slotKeys })}
            totals={slotTotal}
            value={slotKeys}
          />
        </FilterMenu>
        <FilterMenu
          label="Conjunto"
          active={artSetKeys.length > 0}
          value={one(artSetKeys, setName)}
        >
          <ArtifactSetMultiAutocomplete
            totals={setTotal}
            artSetKeys={artSetKeys}
            setArtSetKeys={(artSetKeys) => dispatch({ artSetKeys })}
          />
        </FilterMenu>
        <FilterMenu
          label="Atributo principal"
          active={mainStatKeys.length > 0}
          value={one(mainStatKeys, statName)}
        >
          <ArtifactMainStatMultiAutocomplete
            totals={mainStatTotal}
            mainStatKeys={mainStatKeys}
            setMainStatKeys={(mainStatKeys) => dispatch({ mainStatKeys })}
          />
        </FilterMenu>
        <FilterMenu
          label="Substatus"
          active={substats.length > 0}
          value={one(substats, statName)}
        >
          <SubstatMultiAutocomplete
            totals={subStatTotal}
            substatKeys={substats}
            setSubstatKeys={(substats) => dispatch({ substats })}
            allSubstatKeys={[...allSubstatKeys]}
          />
        </FilterMenu>
        <FilterMenu
          label="Nível"
          active={levelActive}
          value={`${levelLow}–${levelHigh}`}
          width={440}
        >
          <ArtifactLevelSlider
            showLevelText
            levelLow={levelLow}
            levelHigh={levelHigh}
            setLow={(levelLow) => dispatch({ levelLow })}
            setHigh={(levelHigh) => dispatch({ levelHigh })}
            setBoth={(levelLow, levelHigh) => dispatch({ levelLow, levelHigh })}
          />
        </FilterMenu>
        <Button
          variant="text"
          color="inherit"
          startIcon={<TuneIcon />}
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          sx={{ color: moreOpen ? 'primary.light' : 'text.secondary' }}
        >
          Mais filtros{moreActiveCount ? ` (${moreActiveCount})` : ''}
        </Button>
      </Box>

      <Collapse in={moreOpen} unmountOnExit>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={1}>
            {caption('Raridade')}
            <SolidToggleButtonGroup fullWidth value={rarity} size="small">
              {allArtifactRarityKeys.map((star) => (
                <ToggleButton
                  key={star}
                  value={star}
                  sx={{ display: 'flex', gap: 1 }}
                  onClick={() =>
                    dispatch({ rarity: rarityHandler(rarity, star) })
                  }
                >
                  <StarsDisplay stars={star} inline />
                  <Chip label={rarityTotal[star]} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {caption('Número de substatus')}
            <SolidToggleButtonGroup fullWidth value={lines} size="small">
              {lineValues.map((line) => (
                <ToggleButton
                  key={line}
                  value={line}
                  sx={{ display: 'flex', gap: 1 }}
                  onClick={() =>
                    dispatch({
                      lines: lineHandler(lines, line) as Array<1 | 2 | 3 | 4>,
                    })
                  }
                >
                  {line}
                  <Chip label={linesTotal[line]} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={1}>
            {caption('Estado')}
            <SolidToggleButtonGroup fullWidth value={locked} size="small">
              {lockedValues.map((v, i) => (
                <ToggleButton
                  key={v}
                  value={v}
                  sx={{ display: 'flex', gap: 1 }}
                  onClick={() => dispatch({ locked: lockedHandler(locked, v) })}
                >
                  {i ? <LockOpenIcon /> : <LockIcon />}
                  {t(`ui:${v}`)}
                  <Chip label={lockedTotal[v]} size="small" />
                </ToggleButton>
              ))}
            </SolidToggleButtonGroup>
            {caption('Localização')}
            <SolidToggleButtonGroup
              fullWidth
              size="small"
              value={[
                ...(showInventory ? ['inventory'] : []),
                ...(showEquipped ? ['equipped'] : []),
              ]}
            >
              <ToggleButton
                value="inventory"
                sx={{ display: 'flex', gap: 1 }}
                onClick={() => dispatch({ showInventory: !showInventory })}
              >
                <BusinessCenterIcon />
                Inventário
                <Chip label={equippedTotal['unequipped']} size="small" />
              </ToggleButton>
              <ToggleButton
                value="equipped"
                sx={{ display: 'flex', gap: 1 }}
                onClick={() =>
                  dispatch({ showEquipped: !showEquipped, locations: [] })
                }
              >
                <PersonSearchIcon />
                Equipados
                <Chip label={equippedTotal['equipped']} size="small" />
              </ToggleButton>
            </SolidToggleButtonGroup>
            <Suspense fallback={null}>
              <LocationFilterMultiAutocomplete
                totals={locationTotal}
                locations={showEquipped ? [] : locations}
                setLocations={(locations) => dispatch({ locations })}
                disabled={showEquipped}
              />
            </Suspense>
            {showEquipped && caption('Desligue "Equipados" para escolher personagens.')}
          </Grid>
          <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={1}>
            {caption('Valor de Roll')}
            <RVSlide
              showLevelText
              rvLow={rvLow}
              rvHigh={rvHigh}
              useMaxRV={useMaxRV}
              switchFilter={(useMaxRV) => dispatch({ useMaxRV })}
              setLow={(rvLow) => dispatch({ rvLow })}
              setHigh={(rvHigh) => dispatch({ rvHigh })}
              setBoth={(rvLow, rvHigh) => dispatch({ rvLow, rvHigh })}
            />
            {caption('Atributos que contam para o RV')}
            <SubstatToggle
              selectedKeys={effFilter}
              onChange={(effFilter) => database.displayArtifact.set({ effFilter })}
            />
          </Grid>
        </Grid>
      </Collapse>

      {chips.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Filtrando:
          </Typography>
          {chips.map(({ key, label, onDelete }) => (
            <Chip key={key} label={label} onDelete={onDelete} />
          ))}
          <Button
            variant="text"
            size="small"
            onClick={() =>
              database.displayArtifact.set({
                filterOption: initialFilterOption(),
              })
            }
          >
            Limpar tudo
          </Button>
        </Box>
      )}
    </Box>
  )
}
