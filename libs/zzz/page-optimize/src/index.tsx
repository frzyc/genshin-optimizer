import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import {
  objFilter,
  objMap,
  range,
  toDecimal,
} from '@genshin-optimizer/common/util'
import type { DiscSlotKey, FormulaKey } from '@genshin-optimizer/zzz/consts'
import {
  allCoreKeysWithNone,
  allDiscSlotKeys,
  allFormulaKeys,
  wengineSheets,
  type LocationKey,
} from '@genshin-optimizer/zzz/consts'
import type { Stats } from '@genshin-optimizer/zzz/db'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { combineStats, type BuildResult } from '@genshin-optimizer/zzz/solver'
import {
  getCharacterStats,
  getWengineStats,
} from '@genshin-optimizer/zzz/stats'
import {
  LocationAutocomplete,
  WengineAutocomplete,
  WengineRefineDesc,
  WengineRefineName,
} from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardContent,
  InputAdornment,
  MenuItem,
  Typography,
} from '@mui/material'
import { Stack } from '@mui/system'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BaseStatCard from './BaseStatCard'
import { BuildDisplay } from './BuildDisplay'
import { BuildsDisplay } from './BuildsDisplay'
import { CharacterContext } from './CharacterContext'
import { ConditionalToggles } from './ConditionalToggle'
import { DiscConditionalsCard } from './DiscConditionalCard'
import OptimizeWrapper from './Optimize'
import { OptimizeTargetSelector } from './OptimizeTargetSelector'
import { StatsDisplay } from './StatsDisplay'

export default function PageOptimize() {
  const { database } = useDatabaseContext()
  const [builds, setBuilds] = useState<BuildResult[]>([])
  const [locationKey, setLocationKey] = useState<LocationKey>('')

  const character =
    useCharacter(locationKey) ??
    (locationKey ? database.chars.getOrCreate(locationKey) : undefined)

  const setStats = useCallback(
    (stats: Stats) => {
      character && database.chars.set(character.key, { stats })
    },
    [character, database.chars]
  )

  const characterStats = useMemo(() => {
    if (!character) return undefined
    return getCharacterStats(character.key, character.level, character.core)
  }, [character])

  const wengineStats = useMemo(() => {
    if (!character) return undefined
    return getWengineStats(
      character.wengineKey,
      character.wengineLvl,
      character.wenginePhase
    )
  }, [character])

  const baseStats = useMemo(
    () =>
      character
        ? combineStats(
            characterStats ?? {},
            wengineStats ?? {},
            objMap(character.stats, (v, k) => toDecimal(v, k))
          )
        : {},
    [characterStats, character, wengineStats]
  )
  const setFormulaKey = useCallback(
    (key: FormulaKey) => {
      character && database.chars.set(character.key, { formulaKey: key })
    },
    [character, database.chars]
  )

  const sheet = character && wengineSheets[character.wengineKey]

  const wengineCondstats = useMemo(
    () =>
      character &&
      sheet?.getStats &&
      sheet.getStats(character.conditionals, baseStats),
    [baseStats, character, sheet]
  )
  const [dbDirty, setDbDirty] = useForceUpdate()
  useEffect(
    () => database.discs.followAny(setDbDirty),
    [database.discs, setDbDirty]
  )
  const discIds = useMemo(
    () =>
      dbDirty &&
      (Object.fromEntries(
        allDiscSlotKeys.map((k) => [
          k,
          (character &&
            database.discs.values.find(
              ({ slotKey, location }) =>
                slotKey === k && location === character.key
            )?.id) ??
            '',
        ])
      ) as Record<DiscSlotKey, string>),

    [character, database.discs.values, dbDirty]
  )

  return (
    <CharacterContext.Provider value={character}>
      <Box display="flex" flexDirection="column" gap={1} my={1}>
        <CardThemed>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">Character</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LocationAutocomplete
                  locKey={locationKey}
                  setLocKey={(lk) => {
                    setLocationKey(lk)
                    setBuilds([])
                  }}
                  sx={{ flexGrow: 1 }}
                  autoFocus
                />

                <NumberInputLazy
                  disabled={!character}
                  value={character?.level ?? 60}
                  onChange={(l) =>
                    l !== undefined &&
                    character &&
                    database.chars.set(character.key, { level: l })
                  }
                  size="small"
                  inputProps={{
                    sx: { width: '2ch' },
                    max: 60,
                    min: 1,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">Lv.</InputAdornment>
                    ),
                  }}
                />

                <DropdownButton
                  title={`Core: ${allCoreKeysWithNone[character?.core ?? 0]}`}
                  disabled={!character}
                >
                  {allCoreKeysWithNone.map((n, i) => (
                    <MenuItem
                      key={n}
                      onClick={() =>
                        character &&
                        database.chars.set(character.key, { core: i })
                      }
                    >
                      {n}
                    </MenuItem>
                  ))}
                </DropdownButton>
              </Box>
              {characterStats && <StatsDisplay stats={characterStats} />}
              <OptimizeTargetSelector
                disabled={!character}
                formulaKey={character?.formulaKey ?? allFormulaKeys[0]}
                setFormulaKey={setFormulaKey}
              />
            </Stack>
          </CardContent>
        </CardThemed>
        <CardThemed>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">Wengine</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <WengineAutocomplete
                  disabled={!character}
                  wkey={character?.wengineKey ?? ''}
                  setWKey={(wk) =>
                    wk &&
                    character &&
                    database.chars.set(character.key, { wengineKey: wk })
                  }
                  sx={{ flexGrow: 1 }}
                  autoFocus
                />
                {/* TODO: Translation */}
                <DropdownButton
                  title={`Phase: ${character?.wenginePhase ?? 1}`}
                  disabled={!character}
                >
                  {range(1, 5).map((n) => (
                    <MenuItem
                      key={n}
                      onClick={() =>
                        character &&
                        database.chars.set(character.key, { wenginePhase: n })
                      }
                    >
                      Phase {n}
                    </MenuItem>
                  ))}
                </DropdownButton>
                <NumberInputLazy
                  disabled={!character}
                  value={character?.wengineLvl ?? 60}
                  onChange={(l) =>
                    l !== undefined &&
                    character &&
                    database.chars.set(character.key, { wengineLvl: l })
                  }
                  size="small"
                  inputProps={{
                    sx: { width: '2ch' },
                    max: 60,
                    min: 1,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">Lv.</InputAdornment>
                    ),
                  }}
                />
              </Box>
              {wengineStats && (
                <StatsDisplay
                  stats={objFilter(
                    wengineStats,
                    (_, k) => !k.startsWith('wengine')
                  )}
                />
              )}
              {character && (
                <Typography variant="h6">
                  <WengineRefineName
                    wKey={character.wengineKey}
                    phase={character.wenginePhase}
                  />
                </Typography>
              )}
              {character && (
                <Typography>
                  <WengineRefineDesc
                    wKey={character.wengineKey}
                    phase={character.wenginePhase}
                  />
                </Typography>
              )}
            </Stack>
          </CardContent>
          {sheet && <ConditionalToggles condMetas={sheet.condMeta} />}
          {!!wengineCondstats && !!Object.keys(wengineCondstats).length && (
            <CardContent>
              <StatsDisplay stats={wengineCondstats} />
            </CardContent>
          )}
        </CardThemed>
        {character && <BuildDisplay discIds={discIds} baseStats={baseStats} />}
        <BaseStatCard
          locationKey={locationKey}
          baseStats={character?.stats ?? {}}
          setBaseStats={setStats}
        />
        <DiscConditionalsCard baseStats={baseStats} />
        <OptimizeWrapper
          setResults={setBuilds}
          baseStats={baseStats}
          location={locationKey}
          formulaKey={character?.formulaKey ?? allFormulaKeys[0]}
        />
        <BuildsDisplay builds={builds} stats={baseStats} />
      </Box>
    </CharacterContext.Provider>
  )
}
