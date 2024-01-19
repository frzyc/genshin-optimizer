import type { RelicSlotKey } from '@genshin-optimizer/sr-consts'
import type { ICachedRelic } from '@genshin-optimizer/sr-db'
import type { Read } from '@genshin-optimizer/sr-formula'
import type { BuildResult, ProgressResult } from '@genshin-optimizer/sr-opt'
import { MAX_BUILDS, Optimizer } from '@genshin-optimizer/sr-opt'
import {
  BuildDisplay,
  OptimizationTargetSelector,
  WorkerSelector,
  useCalcContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr-ui'
import { CardThemed } from '@genshin-optimizer/ui-common'
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Optimize() {
  const { database } = useDatabaseContext()

  const { calc } = useCalcContext()

  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<ProgressResult | undefined>(
    undefined
  )

  // Step 1: Pick formula(s); anything that `calc.compute` can handle will work
  const [optTarget, setOptTarget] = useState<Read | undefined>(undefined)

  const relicsBySlot = useMemo(
    () =>
      database.relics.values.reduce(
        (relicsBySlot, relic) => {
          relicsBySlot[relic.slotKey].push(relic)
          return relicsBySlot
        },
        {
          head: [],
          hand: [],
          feet: [],
          body: [],
          sphere: [],
          rope: [],
        } as Record<RelicSlotKey, ICachedRelic[]>
      ),
    [database.relics.values]
  )
  const totalPermutations = Object.values(relicsBySlot).reduce(
    (total, relics) => total * relics.length,
    1
  )

  const [build, setBuild] = useState<BuildResult | undefined>(undefined)

  const onOptimize = useCallback(async () => {
    if (!optTarget || !calc) return
    setProgress(undefined)
    const optimizer = new Optimizer(
      calc,
      optTarget,
      relicsBySlot,
      numWorkers,
      setProgress
    )
    const results = await optimizer.optimize()
    // Clean up workers
    await optimizer.terminate()
    setBuild(results[0])
  }, [calc, numWorkers, optTarget, relicsBySlot])

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <Stack>
            <Typography variant="h5">Optimize</Typography>
            <Box>
              <OptimizationTargetSelector
                optTarget={optTarget}
                setOptTarget={setOptTarget}
              />
              <WorkerSelector
                numWorkers={numWorkers}
                setNumWorkers={setNumWorkers}
              />
              <Button onClick={onOptimize}>Optimize</Button>
            </Box>
            {progress && (
              <ProgressIndicator
                progress={progress}
                totalPermutations={totalPermutations}
              />
            )}
            {progress?.resultsSending && !build && <CircularProgress />}
            {build && (
              <Box>
                <Typography>Best: {build.value}</Typography>
                <BuildDisplay build={build.ids} />
              </Box>
            )}
          </Stack>
        </CardContent>
      </CardThemed>
    </Container>
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
