import { useDataManagerBaseDirty } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { BuildResult, Progress } from '@genshin-optimizer/game-opt/solver'
import { buildCount } from '@genshin-optimizer/game-opt/solver'
import {
  type DiscSlotKey,
  allDiscSlotKeys,
} from '@genshin-optimizer/zzz/consts'
import { type ICachedDisc, targetTag } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  OptConfigProvider,
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { useZzzCalcContext } from '@genshin-optimizer/zzz/formula-ui'
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
import { StatFilterCard } from './StatFilterCard'
import { WengineFilter } from './WengineFilter'

export default function Optimize() {
  const { key: characterKey } = useCharacterContext()!
  const { optConfigId } = useCharOpt(characterKey)!
  const { database } = useDatabaseContext()
  useEffect(() => {
    if (optConfigId) return
    const newOptConfigId = database.optConfigs.new({
      wEngineTypes: [getCharStat(characterKey).specialty],
    })
    database.charOpts.set(characterKey, {
      optConfigId: newOptConfigId,
    })
  }, [database, optConfigId, characterKey])
  if (!optConfigId) return null
  return (
    <OptConfigProvider optConfigId={optConfigId}>
      <OptimizeWrapper />
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
  const [progress, setProgress] = useState<Progress | undefined>(undefined)
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
  const wengineDirty = useDataManagerBaseDirty(database.wengines)
  const wengines = useMemo(() => {
    return (
      wengineDirty &&
      database.wengines.values.filter(({ key, level, location }) => {
        // only return equipped wengine if not opting for wengine
        if (!optConfig.optWengine) return location === characterKey

        if (level < optConfig.wlevelLow || level > optConfig.wlevelHigh)
          return false
        if (
          location &&
          !optConfig.useEquippedWengine &&
          location !== characterKey
        )
          return false

        const { type } = getWengineStat(key)
        // filter by path
        if (!optConfig.wEngineTypes.includes(type)) return false
        return true
      })
    )
  }, [
    characterKey,
    database.wengines,
    optConfig.wlevelLow,
    optConfig.wlevelHigh,
    optConfig.optWengine,
    optConfig.wEngineTypes,
    optConfig.useEquippedWengine,
    wengineDirty,
  ])

  const totalPermutations = useMemo(
    () => buildCount(Object.values(discsBySlot)) * wengines.length,
    [wengines.length, discsBySlot]
  )

  const [optimizing, setOptimizing] = useState(false)

  // Provides a function to cancel the work
  const cancelToken = useRef(() => {})
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])

  const onOptimize = useCallback(async () => {
    if (!calc || !target) return
    const cancelled = new Promise<void>((r) => (cancelToken.current = r))
    setProgress(undefined)
    setOptimizing(true)

    // Filter out disabled
    const statFilters = (optConfig.statFilters ?? []).filter((s) => !s.disabled)
    const optimizer = optimize(
      characterKey,
      calc,
      [
        {
          tag: targetTag(target),
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
          wengineId: ids[0],
          discIds: objKeyMap(allDiscSlotKeys, (_slot, index) => ids[index + 1]),
          value,
        })),
        buildDate: Date.now(),
      })
  }, [
    calc,
    target,
    optConfig.statFilters,
    optConfig.setFilter2,
    optConfig.setFilter4,
    characterKey,
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
          <WengineFilter wengines={wengines} />
          <DiscFilter discsBySlot={discsBySlot} />
          {progress && (
            <ProgressIndicator progress={progress} total={totalPermutations} />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
            <Button
              disabled={!totalPermutations || !target}
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
