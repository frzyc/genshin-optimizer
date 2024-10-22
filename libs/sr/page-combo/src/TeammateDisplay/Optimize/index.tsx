import { CardThemed } from '@genshin-optimizer/common/ui'
import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { type ICachedRelic } from '@genshin-optimizer/sr/db'
import type { BuildResult, ProgressResult } from '@genshin-optimizer/sr/solver'
import { MAX_BUILDS, Solver } from '@genshin-optimizer/sr/solver'
import {
  BuildDisplay,
  useDatabaseContext,
  useSrCalcContext,
} from '@genshin-optimizer/sr/ui'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
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
import { ComboContext } from '../../context'
import OptConfigWrapper, { OptConfigContext } from './OptConfigWrapper'
import { StatFilterCard } from './StatFilterCard'
import { WorkerSelector } from './WorkerSelector'

export default function Optimize() {
  const { database } = useDatabaseContext()
  const { comboMetadatum, comboId } = useContext(ComboContext)
  const optConfigId = comboMetadatum.optConfigId
  const createOptConfig = useCallback(() => {
    if (optConfigId) return

    database.combos.set(comboId, (combo) => {
      const meta = combo.comboMetadata.find(
        (meta) => meta?.characterKey === comboMetadatum.characterKey
      )
      if (meta) {
        const newOptConfigId = database.optConfigs.new()
        meta.optConfigId = newOptConfigId
      }
    })
  }, [comboId, comboMetadatum.characterKey, database, optConfigId])
  if (optConfigId) {
    return (
      <OptConfigWrapper optConfigId={optConfigId}>
        <OptimizeWrapper />
      </OptConfigWrapper>
    )
  } else {
    return (
      <CardThemed>
        <CardHeader
          title={
            <span>Optimize this combo for {comboMetadatum.characterKey}</span>
          }
          action={<Button onClick={createOptConfig}>Optimize</Button>}
        />
      </CardThemed>
    )
  }
}

function OptimizeWrapper() {
  const { t } = useTranslation('optimize')
  const { database } = useDatabaseContext()

  const calc = useSrCalcContext()

  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<ProgressResult | undefined>(
    undefined
  )
  const { optConfig } = useContext(OptConfigContext)

  const optTarget = optConfig?.optimizationTarget

  const relicsBySlot = useMemo(
    () =>
      database.relics.values.reduce(
        (relicsBySlot, relic) => {
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
      ),
    [database.relics.values]
  )
  const totalPermutations = Object.values(relicsBySlot).reduce(
    (total, relics) => total * relics.length,
    1
  )

  const [build, setBuild] = useState<BuildResult | undefined>(undefined)
  const [optimizing, setOptimizing] = useState(false)

  // Provides a function to cancel the work
  const cancelToken = useRef(() => {})
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])

  const onOptimize = useCallback(async () => {
    if (!optTarget || !calc) return
    const cancelled = new Promise<void>((r) => (cancelToken.current = r))
    setProgress(undefined)
    setOptimizing(true)

    // Filter out disabled
    const statFilters = (optConfig.statFilters ?? [])
      .filter(({ disabled }) => !disabled)
      .map(({ read, value, isMax }) => ({
        read,
        value,
        isMax,
      }))
    const optimizer = new Solver(
      calc,
      optTarget, // TODO: use combo
      statFilters,
      relicsBySlot,
      numWorkers,
      setProgress
    )

    cancelled.then(async () => await optimizer.terminate())
    const results = await optimizer.optimize()
    // Clean up workers
    await optimizer.terminate()
    cancelToken.current = () => {}

    setOptimizing(false)
    setBuild(results[0])
  }, [calc, numWorkers, optConfig, optTarget, relicsBySlot])

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
        <StatFilterCard />
        <Stack>
          {progress && (
            <ProgressIndicator
              progress={progress}
              totalPermutations={totalPermutations}
            />
          )}
          {build && (
            <Box>
              <Typography>Best: {build.value}</Typography>
              <BuildDisplay build={build.ids} />
            </Box>
          )}
        </Stack>
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
