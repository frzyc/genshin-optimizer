import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { objMap, toDecimal } from '@genshin-optimizer/common/util'
import type { FormulaKey } from '@genshin-optimizer/zzz/consts'
import {
  allCoreKeys,
  allFormulaKeys,
  type LocationKey,
} from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import {
  combineStats,
  type BuildResult,
  type Stats,
} from '@genshin-optimizer/zzz/solver'
import {
  getCharacterStats,
  getWengineStats,
} from '@genshin-optimizer/zzz/stats'
import {
  LocationAutocomplete,
  WengineAutocomplete,
} from '@genshin-optimizer/zzz/ui'
import {
  Box,
  CardContent,
  InputAdornment,
  MenuItem,
  Typography,
} from '@mui/material'
import { Stack } from '@mui/system'
import { useMemo, useState } from 'react'
import BaseStatCard from './BaseStatCard'
import { BuildsDisplay } from './BuildsDisplay'
import OptimizeWrapper from './Optimize'
import { OptimizeTargetSelector } from './OptimizeTargetSelector'
import { StatsDisplay } from './StatsDisplay'

export default function PageOptimize() {
  const { database } = useDatabaseContext()
  const [builds, setBuilds] = useState<BuildResult[]>([])
  const [locationKey, setLocationKey] = useState<LocationKey>('')

  const character = useCharacter(locationKey)
  if (!character && locationKey)
    // if not created, create.
    database.chars.getOrCreate(locationKey)

  // base stats are in percent for displayability
  const [stats, setStats] = useState<Stats>({
    enemyDef: 953, // default enemy DEF
  })

  const characterStats = useMemo(() => {
    if (!character) return undefined
    return getCharacterStats(character.key, character.level, character.core)
  }, [character])

  const wengineStats = useMemo(() => {
    if (!character) return undefined
    return getWengineStats(character.wengineKey, character.wengineLvl)
  }, [character])

  const baseStats = useMemo(
    () =>
      combineStats(
        characterStats ?? {},
        wengineStats ?? {},
        objMap(stats, (v, k) => toDecimal(v, k))
      ),
    [characterStats, stats, wengineStats]
  )

  const [formulaKey, setFormulaKey] = useState<FormulaKey>(allFormulaKeys[0])
  return (
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
                title={`Core: ${allCoreKeys[character?.core ?? 0]}`}
                disabled={!character}
              >
                {allCoreKeys.map((n, i) => (
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
            {characterStats && <StatsDisplay stats={characterStats} showBase />}
            <OptimizeTargetSelector
              disabled={!character}
              formulaKey={formulaKey}
              setFormulaKey={setFormulaKey}
            />
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
            </Box>
            {wengineStats && <StatsDisplay stats={wengineStats} showBase />}
          </Stack>
        </CardContent>
      </CardThemed>
      <BaseStatCard
        locationKey={locationKey}
        baseStats={stats}
        setBaseStats={setStats}
      />
      <OptimizeWrapper
        setResults={setBuilds}
        baseStats={baseStats}
        location={locationKey}
        formulaKey={formulaKey}
      />
      <BuildsDisplay builds={builds} stats={baseStats} location={locationKey} />
    </Box>
  )
}
