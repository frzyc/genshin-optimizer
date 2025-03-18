import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { BuildResult, Progress } from '@genshin-optimizer/game-opt/solver'
import { buildCount } from '@genshin-optimizer/game-opt/solver'
import {
  type RelicSlotKey,
  allRelicSlotKeys,
} from '@genshin-optimizer/sr/consts'
import type { ICachedRelic } from '@genshin-optimizer/sr/db'
import {
  OptConfigContext,
  OptConfigProvider,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
import { StatFilterCard } from '@genshin-optimizer/sr/formula-ui'
import { optimize } from '@genshin-optimizer/sr/solver'
import { getCharStat, getLightConeStat } from '@genshin-optimizer/sr/stats'
import { WorkerSelector, useSrCalcContext } from '@genshin-optimizer/sr/ui'
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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { TeamContext, useTeammateContext } from '../context'
import GeneratedBuildsDisplay from './GeneratedBuildsDisplay'

export default function Optimize() {
  const { database } = useDatabaseContext()
  const { teamId } = useContext(TeamContext)
  const teammateDatum = useTeammateContext()
  const optConfigId = teammateDatum.optConfigId
  const createOptConfig = useCallback(() => {
    if (optConfigId) return

    database.teams.set(teamId, (team) => {
      const meta = team.teamMetadata.find(
        (meta) => meta?.characterKey === teammateDatum.characterKey
      )
      if (meta) {
        const newOptConfigId = database.optConfigs.new()
        meta.optConfigId = newOptConfigId
      }
    })
  }, [teamId, teammateDatum.characterKey, database, optConfigId])
  if (optConfigId) {
    return (
      <OptConfigProvider optConfigId={optConfigId}>
        <OptimizeWrapper />
        <GeneratedBuildsDisplay />
      </OptConfigProvider>
    )
  }
  return (
    <CardThemed>
      <CardHeader
        title={<span>Optimize this team for {teammateDatum.characterKey}</span>}
        action={<Button onClick={createOptConfig}>Optimize</Button>}
      />
    </CardThemed>
  )
}

function OptimizeWrapper() {
  const { t } = useTranslation('optimize')
  const { database } = useDatabaseContext()

  const calc = useSrCalcContext()
  const { team } = useContext(TeamContext)
  const { characterKey } = useTeammateContext()
  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<Progress | undefined>(undefined)
  const { optConfig, optConfigId } = useContext(OptConfigContext)
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
  const lightCones = useMemo(() => {
    const { path } = getCharStat(characterKey)
    return database.lightCones.values.filter(({ key }) => {
      // filter by path
      const { path: lcPath } = getLightConeStat(key)
      return path === lcPath
    })
  }, [characterKey, database.lightCones.values])
  const totalPermutations = useMemo(
    () => buildCount(Object.values(relicsBySlot)) * lightCones.length,
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
    const statFilters = (optConfig.statFilters ?? []).filter((s) => !s.disabled)
    const optimizer = optimize(
      characterKey,
      calc,
      team.frames,
      10, // TODO: topN
      statFilters,
      [],
      [],
      [],
      lightCones,
      relicsBySlot,
      numWorkers,
      setProgress
    )

    cancelled.then(() => optimizer.terminate('user cancelled'))
    let results: BuildResult<string>[]
    try {
      results = await optimizer.results
    } catch {
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
    characterKey,
    team.frames,
    lightCones,
    relicsBySlot,
    numWorkers,
    database.optConfigs,
    optConfigId,
  ])

  const onCancel = useCallback(() => {
    cancelToken.current()
    setOptimizing(false)
  }, [])

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
        {progress && (
          <ProgressIndicator progress={progress} total={totalPermutations} />
        )}
      </CardContent>
    </CardThemed>
  )
}

function Monospace({ value }: { value: number }): JSX.Element {
  const str = value.toLocaleString()
  return <Box sx={{ fontFamily: 'Monospace', display: 'inline' }}>{str}</Box>
}
function ProgressIndicator(props: { progress: Progress; total: number }) {
  const { t } = useTranslation('optimize')
  const { computed, remaining, skipped } = props.progress
  const unskipped = computed + remaining

  const unskippedRatio = Math.log1p(unskipped) / Math.log1p(props.total)
  const remRatio = (remaining / unskipped) * unskippedRatio
  return (
    <Box>
      <Typography>
        {t('computed')}: <Monospace value={computed} /> /{' '}
        <Monospace value={unskipped} />{' '}
      </Typography>
      <Typography>
        {t('computed + skipped')}: <Monospace value={computed + skipped} /> /{' '}
        <Monospace value={props.total} />
      </Typography>
      <LinearProgress // ideally, it should be | <computed> | <remaining> | <skipped> |
        variant="determinate"
        value={(1 - remRatio) * 100}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  )
}
