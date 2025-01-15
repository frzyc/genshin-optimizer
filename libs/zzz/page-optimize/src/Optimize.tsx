import { CardThemed } from '@genshin-optimizer/common/ui'
import { objMap, toDecimal } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import type {
  BaseStats,
  BuildResult,
  Constraints,
  ProgressResult,
} from '@genshin-optimizer/zzz/solver'
import { MAX_BUILDS, Solver } from '@genshin-optimizer/zzz/solver'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatFilterCard } from './StatFilterCard'
import { WorkerSelector } from './WorkerSelector'

export default function OptimizeWrapper({
  baseStats,
  setResults,
}: {
  baseStats: BaseStats
  setResults: (builds: BuildResult[]) => void
}) {
  const { t } = useTranslation('optimize')
  const { database } = useDatabaseContext()

  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<ProgressResult | undefined>(
    undefined
  )

  const [constraints, setConstraints] = useState<Constraints>({})
  const discsBySlot = useMemo(
    () =>
      database.discs.values.reduce(
        (discsBySlot, disc) => {
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
      ),
    [database.discs.values]
  )

  const totalPermutations = useMemo(
    () =>
      Object.values(discsBySlot).reduce(
        (total, discs) => total * discs.length,
        1
      ),
    // * lightCones.length
    [discsBySlot]
  )

  const [optimizing, setOptimizing] = useState(false)

  // Provides a function to cancel the work
  const cancelToken = useRef(() => {})
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])

  const onOptimize = useCallback(async () => {
    const cancelled = new Promise<void>((r) => (cancelToken.current = r))
    setProgress(undefined)
    setOptimizing(true)

    const optimizer = new Solver(
      objMap(baseStats, (v, k) => toDecimal(v, k)),
      objMap(constraints, (c, k) => ({ ...c, value: toDecimal(c.value, k) })),
      discsBySlot,
      numWorkers,
      setProgress
    )

    cancelled.then(async () => await optimizer.terminate())
    const results = await optimizer.optimize()
    // Clean up workers
    await optimizer.terminate()
    cancelToken.current = () => {}

    setOptimizing(false)
    setResults(results)
  }, [baseStats, constraints, discsBySlot, numWorkers, setResults])

  const onCancel = useCallback(() => {
    cancelToken.current()
    setOptimizing(false)
  }, [cancelToken])

  return (
    <CardThemed>
      <CardHeader
        title={t('optimize')}
        action={
          <Box>
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
            <Button
              onClick={optimizing ? onCancel : onOptimize}
              color={optimizing ? 'error' : 'primary'}
              startIcon={optimizing ? <CloseIcon /> : <TrendingUpIcon />}
            >
              {optimizing ? t('cancel') : t('optimize')}
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <StatFilterCard
          constraints={constraints}
          setConstraints={setConstraints}
        />
        {progress && (
          <ProgressIndicator
            progress={progress}
            totalPermutations={totalPermutations}
          />
        )}
      </CardContent>
    </CardThemed>
  )
}

function ProgressIndicator({
  progress,
  totalPermutations,
}: {
  progress: ProgressResult
  totalPermutations: number
}) {
  const { t } = useTranslation('optimize')
  return (
    <Box>
      <Typography>
        {t('totalProgress')}: {progress.numBuildsComputed.toLocaleString()} /{' '}
        {totalPermutations.toLocaleString()}
      </Typography>
      <Typography>
        {t('buildsKept')}: {progress.numBuildsKept.toLocaleString()} /{' '}
        {MAX_BUILDS.toLocaleString()}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(progress.numBuildsComputed / totalPermutations) * 100}
      />
    </Box>
  )
}
