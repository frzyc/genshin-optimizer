import { CardThemed } from '@genshin-optimizer/common/ui'
import type { RelicSlotKey } from '@genshin-optimizer/sr/consts'
import { type ICachedRelic } from '@genshin-optimizer/sr/db'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import type { BuildResult, ProgressResult } from '@genshin-optimizer/sr/solver'
import { MAX_BUILDS, Solver } from '@genshin-optimizer/sr/solver'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
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
import { TeamContext } from '../../context'
import { BuildDisplay } from './BuildDisplay'
import OptConfigProvider, { OptConfigContext } from './OptConfigWrapper'
import { StatFilterCard } from './StatFilterCard'
import { WorkerSelector } from './WorkerSelector'

export default function Optimize() {
  const { database } = useDatabaseContext()
  const { teamMetadatum, teamId } = useContext(TeamContext)
  const optConfigId = teamMetadatum.optConfigId
  const createOptConfig = useCallback(() => {
    if (optConfigId) return

    database.teams.set(teamId, (team) => {
      const meta = team.teamMetadata.find(
        (meta) => meta?.characterKey === teamMetadatum.characterKey
      )
      if (meta) {
        const newOptConfigId = database.optConfigs.new()
        meta.optConfigId = newOptConfigId
      }
    })
  }, [teamId, teamMetadatum.characterKey, database, optConfigId])
  if (optConfigId) {
    return (
      <OptConfigProvider optConfigId={optConfigId}>
        <OptimizeWrapper />
      </OptConfigProvider>
    )
  } else {
    return (
      <CardThemed>
        <CardHeader
          title={
            <span>Optimize this team for {teamMetadatum.characterKey}</span>
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
  const {
    team,
    teamMetadatum: { characterKey },
  } = useContext(TeamContext)
  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<ProgressResult | undefined>(
    undefined
  )
  const { optConfig } = useContext(OptConfigContext)

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
    const optimizer = new Solver(
      characterKey,
      calc,
      team.frames,
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
  }, [
    calc,
    characterKey,
    team,
    numWorkers,
    optConfig.statFilters,
    relicsBySlot,
  ])

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
