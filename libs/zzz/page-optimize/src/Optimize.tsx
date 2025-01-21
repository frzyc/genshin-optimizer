import {
  CardThemed,
  DropdownButton,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { objMap, toDecimal, toggleInArr } from '@genshin-optimizer/common/util'
import type { DiscMainStatKey, DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  discSlotToMainStatKeys,
  type DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import type {
  BaseStats,
  BuildResult,
  Constraints,
  FormulaKey,
  ProgressResult,
} from '@genshin-optimizer/zzz/solver'
import {
  allFormulaKeys,
  MAX_BUILDS,
  Solver,
} from '@genshin-optimizer/zzz/solver'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  MenuItem,
  Typography,
} from '@mui/material'
import { Stack } from '@mui/system'
import type { Dispatch, SetStateAction } from 'react'
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
  const [formulaKey, setFormulaKey] = useState<FormulaKey>(allFormulaKeys[0])
  const [constraints, setConstraints] = useState<Constraints>({})
  const [slot4, setSlot4] = useState([...discSlotToMainStatKeys['4']])
  const [slot5, setSlot5] = useState([...discSlotToMainStatKeys['5']])
  const [slot6, setSlot6] = useState([...discSlotToMainStatKeys['6']])

  const discsBySlot = useMemo(
    () =>
      database.discs.values.reduce(
        (discsBySlot, disc) => {
          if (
            (disc.slotKey === '4' && !slot4.includes(disc.mainStatKey)) ||
            (disc.slotKey === '5' && !slot5.includes(disc.mainStatKey)) ||
            (disc.slotKey === '6' && !slot6.includes(disc.mainStatKey))
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
      ),
    [database.discs.values, slot4, slot5, slot6]
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
      formulaKey,
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
  }, [baseStats, constraints, discsBySlot, formulaKey, numWorkers, setResults])

  const onCancel = useCallback(() => {
    cancelToken.current()
    setOptimizing(false)
  }, [cancelToken])
  const discTypo = (key: DiscSlotKey) => (
    <Typography>
      Disc {key} <SqBadge>{discsBySlot[key].length}</SqBadge>
    </Typography>
  )
  const discSlotBtns = (slotKey: '4' | '5' | '6') => {
    const keysMap = {
      '4': slot4,
      '5': slot5,
      '6': slot6,
    } as Record<'4' | '5' | '6', DiscMainStatKey[]>
    const funcMap = {
      '4': setSlot4,
      '5': setSlot5,
      '6': setSlot6,
    } as Record<'4' | '5' | '6', Dispatch<SetStateAction<DiscMainStatKey[]>>>
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {discSlotToMainStatKeys[slotKey].map((key) => (
          <Button
            key={key}
            variant={keysMap[slotKey].includes(key) ? 'contained' : 'outlined'}
            onClick={() => funcMap[slotKey]((s) => toggleInArr([...s], key))}
          >
            {key}
          </Button>
        ))}
      </Box>
    )
  }
  return (
    <CardThemed>
      <CardHeader title={t('optimize')} />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          <CardThemed bgt="light">
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {discTypo('1')}
                  {discTypo('2')}
                  {discTypo('3')}
                </Box>
                {discTypo('4')}
                {discSlotBtns('4')}
                {discTypo('5')}
                {discSlotBtns('5')}
                {discTypo('6')}
                {discSlotBtns('6')}
              </Stack>
            </CardContent>
          </CardThemed>
          <StatFilterCard
            constraints={constraints}
            setConstraints={setConstraints}
          />
          <Set4Selector
            constraints={constraints}
            setConstraints={setConstraints}
          />
          <Typography>
            NOTE: the solver currently accounts for 2-set effects only.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <OptimizeTargetSelector
              formulaKey={formulaKey}
              setFormulaKey={setFormulaKey}
            />
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
            <Button
              onClick={optimizing ? onCancel : onOptimize}
              color={optimizing ? 'error' : 'success'}
              startIcon={optimizing ? <CloseIcon /> : <TrendingUpIcon />}
              disabled={!totalPermutations}
            >
              {optimizing ? t('cancel') : t('optimize')}
            </Button>
          </Box>
          {progress && (
            <ProgressIndicator
              progress={progress}
              totalPermutations={totalPermutations}
            />
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
function OptimizeTargetSelector({
  formulaKey,
  setFormulaKey,
}: {
  formulaKey: FormulaKey
  setFormulaKey: (key: FormulaKey) => void
}) {
  return (
    <DropdownButton
      title={
        <span>
          Optimize Target: <strong>{formulaKeyTextMap[formulaKey]}</strong>
        </span>
      }
      sx={{ flexGrow: 1 }}
    >
      {allFormulaKeys.map((fk) => (
        <MenuItem key={fk} onClick={() => setFormulaKey(fk)}>
          {formulaKeyTextMap[fk]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
const formulaKeyTextMap: Record<FormulaKey, string> = {
  electric_dmg_: 'Eletrical Damage',
  fire_dmg_: 'Fire Damage',
  ice_dmg_: 'Ice Damage',
  physical_dmg_: 'Physical Damage',
  ether_dmg_: 'Ether Damage',
  burn: 'Burn Anomaly',
  shock: 'Shock Anomaly',
  corruption: 'Corruption Anomaly',
  shatter: 'Shatter Anomaly',
  assault: 'Assault Anomaly',
}

function Set4Selector({
  constraints,
  setConstraints,
}: {
  constraints: Constraints
  setConstraints: (c: Constraints) => void
}) {
  const set = Object.keys(constraints).find((k) =>
    allDiscSetKeys.includes(k as DiscSetKey)
  )
  return (
    <DropdownButton
      title={
        set ? (
          <span>
            Force 4-Set: <strong>{set}</strong>
          </span>
        ) : (
          'Select to force 4-Set'
        )
      }
      sx={{ flexGrow: 1 }}
    >
      {allDiscSetKeys.map((d) => (
        <MenuItem
          key={d}
          onClick={() =>
            setConstraints({
              ...Object.fromEntries(
                Object.entries(constraints).filter(
                  ([k]) => !allDiscSetKeys.includes(k as DiscSetKey)
                )
              ),
              [d]: { value: 4, isMax: false },
            })
          }
        >
          {d}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
