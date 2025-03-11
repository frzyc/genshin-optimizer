import { useDataManagerBaseDirty } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { BuildResult, Progress } from '@genshin-optimizer/game-opt/solver'
import {
  allRelicSlotKeys,
  type RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import { type ICachedRelic } from '@genshin-optimizer/sr/db'
import {
  OptConfigContext,
  OptConfigProvider,
  useCharacterContext,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { StatFilterCard } from '@genshin-optimizer/sr/formula-ui'
import { optimize } from '@genshin-optimizer/sr/solver'
import { getLightConeStat } from '@genshin-optimizer/sr/stats'
import { useSrCalcContext, WorkerSelector } from '@genshin-optimizer/sr/ui'
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
import GeneratedBuildsDisplay from './GeneratedBuildsDisplay'
import { LightConeFilter } from './LightConeFilter'
import { RelicFilter } from './RelicFilter'

export default function Optimize() {
  const { key: characterKey } = useCharacterContext()!
  const { optConfigId } = useCharOpt(characterKey)!
  const { database } = useDatabaseContext()
  useEffect(() => {
    if (optConfigId) return
    const newOptConfigId = database.optConfigs.new()
    database.charOpts.set(characterKey, {
      optConfigId: newOptConfigId,
    })
  }, [database, optConfigId, characterKey])
  if (!optConfigId) return null
  return (
    <OptConfigProvider optConfigId={optConfigId}>
      <OptimizeWrapper />
      <GeneratedBuildsDisplay />
    </OptConfigProvider>
  )
}

function OptimizeWrapper() {
  const { t } = useTranslation('optimize')
  const { database } = useDatabaseContext()
  const calc = useSrCalcContext()
  const { key: characterKey } = useCharacterContext()!
  const { target } = useCharOpt(characterKey)!
  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<Progress | undefined>(undefined)
  const { optConfig, optConfigId } = useContext(OptConfigContext)
  const relicDirty = useDataManagerBaseDirty(database.relics)
  const relicsBySlot = useMemo(() => {
    const slotKeyMap = {
      body: optConfig.slotBodyKeys,
      feet: optConfig.slotFeetKeys,
      sphere: optConfig.slotSphereKeys,
      rope: optConfig.slotRopeKeys,
    } as const
    const isFilteredSlot = (
      slotKey: RelicSlotKey
    ): slotKey is 'body' | 'feet' | 'sphere' | 'rope' =>
      ['body', 'feet', 'sphere', 'rope'].includes(slotKey)
    return (
      relicDirty &&
      database.relics.values.reduce(
        (relicsBySlot, relic) => {
          const { slotKey, mainStatKey, level, location } = relic
          if (level < optConfig.levelLow || level > optConfig.levelHigh)
            return relicsBySlot
          if (location && !optConfig.useEquipped && location !== characterKey)
            return relicsBySlot
          if (
            isFilteredSlot(slotKey) &&
            !slotKeyMap[slotKey].includes(mainStatKey)
          )
            return relicsBySlot
          relicsBySlot[relic.slotKey].push(relic)
          return relicsBySlot
        },
        {
          head: [],
          hands: [],
          feet: [],
          body: [],
          sphere: [],
          rope: [],
        } as Record<RelicSlotKey, ICachedRelic[]>
      )
    )
  }, [
    characterKey,
    database.relics,
    optConfig.levelHigh,
    optConfig.levelLow,
    optConfig.slotBodyKeys,
    optConfig.slotFeetKeys,
    optConfig.slotRopeKeys,
    optConfig.slotSphereKeys,
    optConfig.useEquipped,
    relicDirty,
  ])
  const lightConeDirty = useDataManagerBaseDirty(database.lightCones)
  const lightCones = useMemo(() => {
    return (
      lightConeDirty &&
      database.lightCones.values.filter(({ key, level, location }) => {
        // only return equipped lightcone if not opting for lightcone
        if (!optConfig.optLightCone) return location === characterKey

        if (level < optConfig.lcLevelLow || level > optConfig.lcLevelHigh)
          return false
        if (
          location &&
          !optConfig.useEquippedLightCone &&
          location !== characterKey
        )
          return false

        const { path } = getLightConeStat(key)
        // filter by path
        if (!optConfig.lightConePaths.includes(path)) return false
        return true
      })
    )
  }, [
    characterKey,
    database.lightCones,
    optConfig.lcLevelLow,
    optConfig.lcLevelHigh,
    optConfig.optLightCone,
    optConfig.lightConePaths,
    optConfig.useEquippedLightCone,
    lightConeDirty,
  ])
  const totalPermutations = useMemo(
    () =>
      Object.values(relicsBySlot).reduce(
        (total, relics) => total * relics.length,
        1
      ) * lightCones.length,
    [lightCones.length, relicsBySlot]
  )

  const [optimizing, setOptimizing] = useState(false)

  // Provides a function to cancel the work
  const cancelToken = useRef(() => {})
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])

  const onOptimize = useCallback(async () => {
    if (!calc) return
    const cancelled = new Promise<void>((r) => (cancelToken.current = r))
    setProgress(undefined)
    setOptimizing(true)

    // Filter out disabled
    const statFilters = (optConfig.statFilters ?? [])
      .filter(({ disabled }) => !disabled)
      .map(({ tag, value, isMax }) => ({
        tag,
        value,
        isMax,
      }))
    const optimizer = optimize(
      characterKey,
      calc,
      [
        {
          tag: target,
          multiplier: 1,
        },
      ],
      10, // TODO: topN
      statFilters,
      optConfig.setFilter2Cavern,
      optConfig.setFilter4Cavern,
      optConfig.setFilter2Planar,
      lightCones,
      relicsBySlot,
      numWorkers,
      setProgress
    )

    cancelled.then(() => optimizer.terminate('user cancelled'))
    let results: BuildResult<string>[]
    try {
      results = await optimizer.results
    } catch (e) {
      return
    } finally {
      cancelToken.current = () => {}
      setOptimizing(false)
    }
    // Save results to optConfig
    if (results.length)
      database.optConfigs.newOrSetGeneratedBuildList(optConfigId, {
        builds: results.slice(0, 5).map(({ ids, value }) => ({
          lightConeId: ids[0],
          relicIds: objKeyMap(
            allRelicSlotKeys,
            (_slot, index) => ids[index + 1]
          ),
          value,
        })),
        buildDate: Date.now(),
      })
  }, [
    calc,
    optConfig.statFilters,
    optConfig.setFilter2Cavern,
    optConfig.setFilter4Cavern,
    optConfig.setFilter2Planar,
    characterKey,
    target,
    lightCones,
    relicsBySlot,
    numWorkers,
    database.optConfigs,
    optConfigId,
  ])

  const onCancel = useCallback(() => {
    cancelToken.current()
    setOptimizing(false)
  }, [cancelToken])

  return (
    <CardThemed>
      <CardContent>
        <Stack spacing={1}>
          <StatFilterCard />
          <LightConeFilter numLightCone={lightCones.length} />
          <RelicFilter relicsBySlot={relicsBySlot} />
          {progress && (
            <ProgressIndicator
              progress={progress}
              totalPermutations={totalPermutations}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
            <Button
              disabled={!totalPermutations}
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

function ProgressIndicator({
  progress,
  totalPermutations,
}: {
  progress: Progress
  totalPermutations: number
}) {
  const { t } = useTranslation('optimize')
  return (
    <Box>
      <Typography>
        {t('computed')}: {progress.computed.toLocaleString()} /{' '}
        {(progress.computed + progress.remaining).toLocaleString()}
      </Typography>
      <Typography>
        {t('computed + skipped')}:{' '}
        {(progress.computed + progress.skipped).toLocaleString()} /{' '}
        {totalPermutations.toLocaleString()}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={
          ((progress.computed + progress.skipped) / totalPermutations) * 100
        }
      />
    </Box>
  )
}
