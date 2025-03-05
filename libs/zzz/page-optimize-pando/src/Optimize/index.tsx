import { useDataManagerBaseDirty } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { Counters } from '@genshin-optimizer/game-opt/solver'
import {
  allDiscSlotKeys,
  type DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import { type ICachedDisc } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  OptConfigProvider,
  useCharacterContext,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import {
  StatFilterCard,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { optimize } from '@genshin-optimizer/zzz/solver-pando'
import { getCharStat, getWengineStat } from '@genshin-optimizer/zzz/stats'
import { WorkerSelector } from '@genshin-optimizer/zzz/ui'
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
import { DiscFilter } from './DiscFilter'
import GeneratedBuildsDisplay from './GeneratedBuildsDisplay'

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
  const calc = useZzzCalcContext()
  const { key: characterKey } = useCharacterContext()!
  const { target } = useCharOpt(characterKey)!
  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<Counters | undefined>(undefined)
  const { optConfig, optConfigId } = useContext(OptConfigContext)
  const discDirty = useDataManagerBaseDirty(database.discs)
  const discsBySlot = useMemo(() => {
    const slotKeyMap = {
      4: optConfig.slot4,
      5: optConfig.slot5,
      6: optConfig.slot6,
    } as const
    const isFilteredSlot = (slotKey: DiscSlotKey): slotKey is '4' | '5' | '6' =>
      ['4', '5', '6'].includes(slotKey)

    return (
      discDirty &&
      database.discs.values.reduce(
        (discsBySlot, disc) => {
          const { slotKey, mainStatKey, level, location } = disc
          if (level < optConfig.levelLow || level > optConfig.levelHigh)
            return discsBySlot
          if (location && !optConfig.useEquipped && location !== characterKey)
            return discsBySlot
          if (
            isFilteredSlot(slotKey) &&
            !slotKeyMap[slotKey].includes(mainStatKey)
          )
            return discsBySlot
          discsBySlot[disc.slotKey].push(disc)
          return discsBySlot
        },
        {
          1: [],
          2: [],
          3: [],
          4: [],
          5: [],
          6: [],
        } as Record<DiscSlotKey, ICachedDisc[]>
      )
    )
  }, [
    characterKey,
    discDirty,
    database.discs,
    optConfig.levelHigh,
    optConfig.levelLow,
    optConfig.slot4,
    optConfig.slot5,
    optConfig.slot6,
    optConfig.useEquipped,
  ])
  const wengines = useMemo(() => {
    const { specialty } = getCharStat(characterKey)
    return database.wengines.values.filter(({ key }) => {
      // filter by path
      const { type } = getWengineStat(key)
      return specialty === type
    })
  }, [characterKey, database.wengines.values])
  const totalPermutations = useMemo(
    () =>
      Object.values(discsBySlot).reduce(
        (total, discs) => total * discs.length,
        1
      ) * wengines.length,
    [wengines.length, discsBySlot]
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
      statFilters,
      optConfig.setFilter2,
      optConfig.setFilter4,
      wengines,
      discsBySlot,
      numWorkers,
      setProgress
    )

    cancelled.then(() => optimizer.terminate())
    const results = await optimizer.results()
    // Clean up workers
    await optimizer.terminate()
    cancelToken.current = () => {}

    setOptimizing(false)
    // Save results to optConfig
    if (results.length)
      database.optConfigs.newOrSetGeneratedBuildList(optConfigId, {
        builds: results.slice(0, 5).map(({ ids, value }) => ({
          wengineId: ids[0],
          discIds: objKeyMap(allDiscSlotKeys, (_slot, index) => ids[index + 1]),
          value,
        })),
        buildDate: Date.now(),
      })
  }, [
    calc,
    optConfig.statFilters,
    optConfig.setFilter2,
    optConfig.setFilter4,
    characterKey,
    target,
    wengines,
    discsBySlot,
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
          <DiscFilter discsBySlot={discsBySlot} />
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
  progress: Counters
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
