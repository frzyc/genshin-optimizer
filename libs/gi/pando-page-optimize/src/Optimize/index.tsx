import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { BuildResult, Progress } from '@genshin-optimizer/game-opt/solver'
import { Solver } from '@genshin-optimizer/game-opt/solver'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  PandoOptConfigContext,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import {
  useGiCalcContext,
  useResolvedOptTarget,
  pandoCardSx,
} from '@genshin-optimizer/gi/formula-ui'
import { createOptimizeConfig } from '@genshin-optimizer/gi/pando-solver'
import { getCharStat, getWeaponStat } from '@genshin-optimizer/gi/stats'
import { useNumWorkers } from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Button,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ArtFilter } from './ArtFilter'
import { BuildsSelector, WorkerSelector } from './BuildsWorkerSelectors'
import { StatFilterCard } from './StatFilterCard'
import { WeaponFilter } from './WeaponFilter'

export default function Optimize() {
  return <OptimizeWrapper />
}

function OptimizeWrapper() {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const calc = useGiCalcContext()
  const { tag: optTag } = useResolvedOptTarget()
  const { character } = useContext(CharacterContext)
  const characterKey = character.key
  const locKey = charKeyToLocCharKey(characterKey)
  const [numWorkers, , setNumWorkers] = useNumWorkers()
  const [progress, setProgress] = useState<Progress | undefined>(undefined)
  const { optConfig, optConfigId } = useContext(PandoOptConfigContext)
  const arts = useDataManagerValues(database.arts)
  const artsBySlot = useMemo(() => {
    const slotKeyMap = {
      sands: optConfig.sands,
      goblet: optConfig.goblet,
      circlet: optConfig.circlet,
    } as const
    const isFilteredSlot = (
      slotKey: ArtifactSlotKey
    ): slotKey is 'sands' | 'goblet' | 'circlet' =>
      slotKey === 'sands' || slotKey === 'goblet' || slotKey === 'circlet'

    return arts.reduce(
      (artsBySlot, art) => {
        const { slotKey, mainStatKey, level, location } = art
        if (level < optConfig.levelLow || level > optConfig.levelHigh)
          return artsBySlot
        if (location && !optConfig.useEquipped && location !== locKey)
          return artsBySlot
        if (
          isFilteredSlot(slotKey) &&
          !slotKeyMap[slotKey].includes(mainStatKey)
        )
          return artsBySlot
        artsBySlot[art.slotKey].push(art)
        return artsBySlot
      },
      objKeyMap(allArtifactSlotKeys, () => [] as ICachedArtifact[])
    )
  }, [
    optConfig.sands,
    optConfig.goblet,
    optConfig.circlet,
    optConfig.levelLow,
    optConfig.levelHigh,
    optConfig.useEquipped,
    arts,
    locKey,
  ])
  const weapons = useDataManagerValues(database.weapons)
  const charWeaponType = getCharStat(characterKey).weaponType
  const filteredWeapons = useMemo(() => {
    return weapons.filter(({ id, key, level, location }) => {
      if (!optConfig.optWeapon) return id === character.equippedWeapon

      if (level < optConfig.wlevelLow || level > optConfig.wlevelHigh)
        return false
      if (location && !optConfig.useEquippedWeapon && location !== locKey)
        return false

      if (getWeaponStat(key).weaponType !== charWeaponType) return false
      return true
    })
  }, [
    character.equippedWeapon,
    locKey,
    weapons,
    optConfig.wlevelLow,
    optConfig.wlevelHigh,
    optConfig.optWeapon,
    optConfig.useEquippedWeapon,
    charWeaponType,
  ])

  const [optimizing, setOptimizing] = useState(false)

  const cancelToken = useRef(() => {})
  useEffect(() => () => cancelToken.current(), [])

  const currentSolver = useRef<Solver<string> | null>(null)
  const cfg = useMemo(() => {
    if (!calc || !optTag) return
    return createOptimizeConfig({
      calc,
      frames: [{ tag: optTag, multiplier: 1 }],
      statFilters: (optConfig.statFilters ?? []).filter((s) => !s.disabled),
      setFilter2: optConfig.setFilter2,
      setFilter4: optConfig.setFilter4,
      allowRainbow: optConfig.allowRainbow,
      weapons: filteredWeapons,
      artsBySlot,
      numWorkers,
      numOfBuilds: optConfig.maxBuildsToShow,
      setProgress,
    })
  }, [
    calc,
    optTag,
    optConfig.statFilters,
    optConfig.setFilter2,
    optConfig.setFilter4,
    optConfig.allowRainbow,
    optConfig.maxBuildsToShow,
    filteredWeapons,
    artsBySlot,
    numWorkers,
  ])

  const onOptimize = useCallback(async () => {
    const cancelled = new Promise<void>((r) => (cancelToken.current = r))
    setProgress(undefined)
    setOptimizing(true)
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 0))
    })

    cancelled.then(() => currentSolver.current?.terminate('user cancelled'))
    let optimizer: Solver<string> | undefined
    let results: BuildResult<string>[]
    try {
      if (!cfg) return
      currentSolver.current = optimizer = new Solver(cfg)
      results = await optimizer.results
      if (currentSolver.current !== optimizer) return
    } catch {
      return
    } finally {
      if (currentSolver.current === optimizer) {
        currentSolver.current = null
        cancelToken.current = () => {}
        setOptimizing(false)
      }
    }
    database.pandoOptConfigs.newOrSetGeneratedBuildList(optConfigId, {
      builds: results.map(({ ids, value }) => ({
        weaponId: ids[0],
        artIds: objKeyMap(
          allArtifactSlotKeys,
          (_slot, index) => ids[index + 1]
        ),
        value,
      })),
      buildDate: Date.now(),
    })
  }, [cfg, database.pandoOptConfigs, optConfigId])

  const onCancel = useCallback(() => {
    cancelToken.current()
    setOptimizing(false)
    setProgress(undefined)
  }, [])

  return (
    <CardThemed sx={pandoCardSx}>
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              '& .MuiPaper-root': { flexGrow: 1 },
            }}
          >
            <StatFilterCard />
            <WeaponFilter weapons={filteredWeapons} />
            <ArtFilter artsBySlot={artsBySlot} />
          </Box>

          {progress && <ProgressIndicator progress={progress} />}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <BuildsSelector
              maxBuildsToShow={optConfig.maxBuildsToShow}
              optConfigId={optConfigId}
            />
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
            <Button
              disabled={!cfg}
              onClick={optimizing ? onCancel : onOptimize}
              color={optimizing ? 'error' : 'primary'}
              startIcon={optimizing ? <CloseIcon /> : <TrendingUpIcon />}
            >
              {optimizing ? t('cancel') : t('optimize')}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function Monospace({ value }: { value: number }): JSX.Element {
  const str = value.toLocaleString()
  return (
    <Box component="span" sx={{ fontFamily: 'Monospace', display: 'inline' }}>
      {str}
    </Box>
  )
}
function ProgressIndicator(props: { progress: Progress }) {
  const { t } = useTranslation('page_optimize')
  const { computed, remaining, skipped, total } = props.progress
  const unskipped = computed + remaining

  const unskippedRatio = Math.log1p(unskipped) / Math.log1p(total)
  const remRatio = (remaining / unskipped) * unskippedRatio
  return (
    <Box>
      <Typography>
        {t('computed')}: <Monospace value={computed} /> /{' '}
        <Monospace value={unskipped} />{' '}
      </Typography>
      <Typography>
        {t('computedSkipped')}: <Monospace value={computed + skipped} /> /{' '}
        <Monospace value={total} />
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(1 - remRatio) * 100}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  )
}
