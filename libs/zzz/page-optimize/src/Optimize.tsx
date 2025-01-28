import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { objMap, toDecimal, toggleInArr } from '@genshin-optimizer/common/util'
import type {
  DiscMainStatKey,
  DiscSetKey,
  FormulaKey,
  LocationKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allDiscSetKeys,
  discSlotToMainStatKeys,
  type DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import type { Constraints, ICachedDisc, Stats } from '@genshin-optimizer/zzz/db'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import type { BuildResult, ProgressResult } from '@genshin-optimizer/zzz/solver'
import { MAX_BUILDS, Solver } from '@genshin-optimizer/zzz/solver'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatFilterCard } from './StatFilterCard'
import { WorkerSelector } from './WorkerSelector'

export default function OptimizeWrapper({
  formulaKey,
  location,
  baseStats,
  setResults,
}: {
  formulaKey: FormulaKey
  location: LocationKey
  baseStats: Stats
  setResults: (builds: BuildResult[]) => void
}) {
  const { t } = useTranslation('optimize')
  const { database } = useDatabaseContext()

  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<ProgressResult | undefined>(
    undefined
  )
  const character = useCharacter(location)
  useEffect(() => {
    setProgress(undefined)
  }, [character])
  const setConstraints = useCallback(
    (constraints: Constraints) => {
      character && database.chars.set(character.key, { constraints })
    },
    [database, character]
  )
  const [discsDirty, setDiscsDirty] = useForceUpdate()
  useEffect(
    () => database.discs.followAny(setDiscsDirty),
    [database.discs, setDiscsDirty]
  )

  const discsBySlot = useMemo(
    () =>
      discsDirty &&
      database.discs.values.reduce(
        (discsBySlot, disc) => {
          if (!character) return discsBySlot
          if (
            disc.location &&
            !character.useEquipped &&
            disc.location !== location
          )
            return discsBySlot
          if (
            (disc.slotKey === '4' &&
              !character.slot4.includes(disc.mainStatKey)) ||
            (disc.slotKey === '5' &&
              !character.slot5.includes(disc.mainStatKey)) ||
            (disc.slotKey === '6' &&
              !character.slot6.includes(disc.mainStatKey))
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
    [discsDirty, database.discs.values, location, character]
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
    if (!character) return
    const cancelled = new Promise<void>((r) => (cancelToken.current = r))
    setResults([])
    setProgress(undefined)
    setOptimizing(true)

    const optimizer = new Solver(
      formulaKey,
      baseStats,
      objMap(character.constraints, (c, k) => ({
        ...c,
        value: toDecimal(c.value, k),
      })),
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
  }, [baseStats, character, discsBySlot, formulaKey, numWorkers, setResults])

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
      '4': character?.slot4 ?? [],
      '5': character?.slot5 ?? [],
      '6': character?.slot6 ?? [],
    } as Record<'4' | '5' | '6', DiscMainStatKey[]>
    const funcMap = {
      '4': (slot4: DiscMainStatKey[]) =>
        character && database.chars.set(character.key, { slot4 }),
      '5': (slot5: DiscMainStatKey[]) =>
        character && database.chars.set(character.key, { slot5 }),
      '6': (slot6: DiscMainStatKey[]) =>
        character && database.chars.set(character.key, { slot6 }),
    } as Record<'4' | '5' | '6', (slots: DiscMainStatKey[]) => void>
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {discSlotToMainStatKeys[slotKey].map((key) => (
          <Button
            disabled={!character}
            key={key}
            variant={keysMap[slotKey].includes(key) ? 'contained' : 'outlined'}
            onClick={() =>
              funcMap[slotKey](toggleInArr([...keysMap[slotKey]], key))
            }
          >
            <StatDisplay statKey={key} showPercent />
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
            disabled={!character}
            constraints={character?.constraints ?? {}}
            setConstraints={setConstraints}
          />
          <Set4Selector
            disabled={!character}
            constraints={character?.constraints ?? {}}
            setConstraints={setConstraints}
          />
          <Typography>
            NOTE: the solver currently accounts for 2-set effects only.
          </Typography>
          <Button
            disabled={!character}
            onClick={() =>
              character &&
              database.chars.set(character.key, {
                useEquipped: !character.useEquipped,
              })
            }
            variant={character?.useEquipped ? 'contained' : 'outlined'}
          >
            Use equipped Discs
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
            <Button
              sx={{ flexGrow: 1 }}
              onClick={optimizing ? onCancel : onOptimize}
              color={optimizing ? 'error' : 'success'}
              startIcon={optimizing ? <CloseIcon /> : <TrendingUpIcon />}
              disabled={!totalPermutations || !location}
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

function Set4Selector({
  disabled = false,
  constraints,
  setConstraints,
}: {
  disabled?: boolean
  constraints: Constraints
  setConstraints: (c: Constraints) => void
}) {
  const set4 = Object.entries(constraints).find(
    ([k, { value }]) => allDiscSetKeys.includes(k as DiscSetKey) && value === 4
  )?.[0]
  const set2 = Object.entries(constraints).find(
    ([k, { value }]) => allDiscSetKeys.includes(k as DiscSetKey) && value === 2
  )?.[0]
  return (
    <>
      <DropdownButton
        disabled={disabled}
        title={
          set4 ? (
            <span>
              Force 4-Set: <strong>{set4}</strong>
            </span>
          ) : (
            'Select to force 4-Set'
          )
        }
        sx={{ flexGrow: 1 }}
      >
        <MenuItem
          onClick={() =>
            setConstraints(
              Object.fromEntries(
                Object.entries(constraints).filter(
                  ([k, { value }]) =>
                    !(allDiscSetKeys.includes(k as DiscSetKey) && value === 4)
                )
              )
            )
          }
        >
          No 4-Set
        </MenuItem>

        {allDiscSetKeys.map((d) => (
          <MenuItem
            key={d}
            onClick={() =>
              setConstraints({
                ...Object.fromEntries(
                  Object.entries(constraints).filter(
                    ([k, { value }]) =>
                      !(allDiscSetKeys.includes(k as DiscSetKey) && value === 4)
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
      <DropdownButton
        disabled={disabled}
        title={
          set2 ? (
            <span>
              Force 2-Set: <strong>{set2}</strong>
            </span>
          ) : (
            'Select to force 2-Set'
          )
        }
        sx={{ flexGrow: 1 }}
      >
        <MenuItem
          onClick={() =>
            setConstraints(
              Object.fromEntries(
                Object.entries(constraints).filter(
                  ([k, { value }]) =>
                    !(allDiscSetKeys.includes(k as DiscSetKey) && value === 2)
                )
              )
            )
          }
        >
          No 2-Set
        </MenuItem>
        {allDiscSetKeys.map((d) => (
          <MenuItem
            key={d}
            onClick={() =>
              setConstraints({
                ...Object.fromEntries(
                  Object.entries(constraints).filter(
                    ([k, { value }]) =>
                      !(allDiscSetKeys.includes(k as DiscSetKey) && value === 2)
                  )
                ),
                [d]: { value: 2, isMax: false },
              })
            }
          >
            {d}
          </MenuItem>
        ))}
      </DropdownButton>
    </>
  )
}
