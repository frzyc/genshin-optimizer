import { CardThemed, CustomNumberInput } from '@genshin-optimizer/common/ui'
import { isDev, objMap, toPercent } from '@genshin-optimizer/common/util'
import { artSubstatRollData } from '@genshin-optimizer/gi/consts'
import type { BuildTc } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import type { TCWorkerResult } from '@genshin-optimizer/gi/solver-tc'
import {
  TCWorker,
  getMinSubAndOtherRolls,
} from '@genshin-optimizer/gi/solver-tc'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  BuildAlert,
  DataContext,
  HitModeToggle,
  ReactionToggle,
  StatDisplayComponent,
  getBuildTcArtifactData,
  getBuildTcWeaponData,
  getTeamDataCalc,
  initialBuildStatus,
  optimizeNodesForScaling,
} from '@genshin-optimizer/gi/ui'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import CalculateIcon from '@mui/icons-material/Calculate'
import CloseIcon from '@mui/icons-material/Close'
import { Alert, Box, Button, Grid, Skeleton, Stack } from '@mui/material'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BuildTcContext } from '../../../BuildTcContext'
import CharacterProfileCard from '../../../CharProfileCard'
import useCompareData from '../../../useCompareData'
import BonusStatsModal from '../../BonusStatsModal'
import CompareBtn from '../../CompareBtn'
import { CustomMultiTargetModal } from '../../CustomMultiTarget/CustomMultiTargetModal'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import StatFilterCard from '../TabOptimize/Components/StatFilterCard'
import { ArtifactMainStatAndSetEditor } from './ArtifactMainStatAndSetEditor'
import { ArtifactSubCard } from './ArtifactSubCard'
import GcsimButton from './GcsimButton'
import KQMSButton from './KQMSButton'
import ScalesWith from './ScalesWith'
import { WeaponEditorCard } from './WeaponEditorCard'
export default function TabTheorycraft() {
  const { t } = useTranslation('page_character')
  const database = useDatabase()
  const { gender } = useDBMeta()
  const {
    teamId,
    teamCharId,
    teamChar: { key: characterKey, optConfigId },
  } = useContext(TeamCharacterContext)
  const { buildTc, setBuildTc } = useContext(BuildTcContext)
  const optConfig = useOptConfig(optConfigId)!
  const { optimizationTarget, statFilters } = optConfig

  const weaponTypeKey = getCharStat(characterKey).weaponType

  const dataContextValue = useContext(DataContext)
  const compareData = useCompareData()
  const dataContextValueWithCompare: dataContextObj | undefined =
    useMemo(() => {
      if (!dataContextValue) return undefined
      return {
        ...dataContextValue,
        compareData,
      }
    }, [dataContextValue, compareData])

  const setOptimizationTarget = useCallback(
    (optimizationTarget: string[]) => {
      database.optConfigs.set(optConfigId, { optimizationTarget })
    },
    [database, optConfigId]
  )

  const distributedSubstats = buildTc.optimization.distributedSubstats
  const setDistributedSubstats = useCallback(
    (distributedSubstats: BuildTc['optimization']['distributedSubstats']) => {
      setBuildTc((data_) => {
        data_.optimization.distributedSubstats = distributedSubstats
        return data_
      })
    },
    [setBuildTc]
  )
  const workerRef = useRef<Worker | null>(null)
  if (workerRef.current === null) workerRef.current = TCWorker()

  const [status, setStatus] = useState(initialBuildStatus())
  const solving = status.type === 'active'

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    setStatus(initialBuildStatus())
  }, [])

  const { minSubLines, minOtherRolls } = useMemo(
    () => getMinSubAndOtherRolls(buildTc),
    [buildTc]
  )
  const maxTotalRolls = useMemo(
    () =>
      Object.values(buildTc.artifact.slots).reduce(
        (accu, { level, rarity }) =>
          accu + artSubstatRollData[rarity].high + Math.floor(level / 4),
        0
      ),
    [buildTc]
  )

  const optimizeSubstats = (apply: boolean) => {
    if (!workerRef.current) return
    /**
     * Recalculating teamdata and nodes because the ones in the UI are using deferred,
     * and can cause issue when people click buttons too fast or loiter in inputs
     */
    const tempTeamData = getTeamDataCalc(
      database,
      teamId,
      gender,
      teamCharId,
      0,
      getBuildTcArtifactData(buildTc),
      getBuildTcWeaponData(buildTc)
    )
    if (!tempTeamData) return
    const { nodes, valueFilter } = optimizeNodesForScaling(
      tempTeamData,
      characterKey,
      optimizationTarget,
      statFilters
    )
    if (!nodes || !valueFilter) return
    workerRef.current.postMessage({ buildTc, nodes, valueFilter })
    setStatus((s) => ({
      ...s,
      type: 'active',
      startTime: performance.now(),
      finishTime: undefined,
    }))

    workerRef.current.onmessage = ({ data }: MessageEvent<TCWorkerResult>) => {
      const { resultType } = data
      switch (resultType) {
        case 'total':
          setStatus((s) => ({ ...s, total: data.total }))
          break
        case 'count':
          setStatus((s) => ({
            ...s,
            tested: data.tested,
            failed: data.failed,
          }))
          break
        case 'finalize': {
          const { maxBuffer, distributed, tested, failed, skipped } = data
          setStatus((s) => ({
            ...s,
            type: 'inactive',
            tested,
            failed,
            skipped,
            finishTime: performance.now(),
          }))

          if (!apply) {
            console.log({
              maxBuffer,
              distributed,
              tested,
              failed,
              skipped,
            })
            break
          }

          setBuildTc((buildTc) => {
            buildTc.artifact.substats.stats = objMap(
              buildTc.artifact.substats.stats,
              (v, k) => v + toPercent(maxBuffer![k] ?? 0, k)
            )
            buildTc.optimization.distributedSubstats =
              distributedSubstats - distributed
            return buildTc
          })

          break
        }
      }
    }
  }

  const kqms = useCallback(() => {
    setBuildTc((buildTc) => {
      buildTc.artifact.substats.type = 'mid'

      const {
        artifact: {
          slots,
          substats: { stats, type, rarity },
        },
      } = buildTc
      buildTc.optimization.distributedSubstats =
        20 - (rarity === 5 ? 0 : rarity === 4 ? 10 : 15)
      buildTc.artifact.substats.stats = objMap(stats, (_val, statKey) => {
        const substatValue = getSubstatValue(statKey, rarity, type)
        return substatValue * 2
      })
      buildTc.optimization.maxSubstats = objMap(
        buildTc.optimization.maxSubstats,
        (_val, statKey) => {
          const rollsPerSlot = 2
          const diffSlot = 5
          const sameSlot = Object.entries(slots).filter(
            ([_slotKey, { statKey: mainStatKey }]) => mainStatKey === statKey
          ).length
          // +2 for the inital fixed rolls
          return 2 + (diffSlot - sameSlot) * rollsPerSlot
        }
      )
      return buildTc
    })
  }, [setBuildTc])

  return (
    <Stack spacing={1}>
      <Box>
        <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
          <Grid item xs={8} sm={8} md={3} lg={2.3}>
            <CharacterProfileCard />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={9}
            lg={9.7}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <CardThemed bgt="light" sx={{ flexGrow: 1, p: 1 }}>
              {dataContextValueWithCompare ? (
                <DataContext.Provider value={dataContextValueWithCompare}>
                  <StatDisplayComponent
                    columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                    BonusStatEditor={BonusStatsModal}
                    CustomMTargetEditor={CustomMultiTargetModal}
                  />
                </DataContext.Provider>
              ) : (
                <Skeleton variant="rectangular" width="100%" height={500} />
              )}
            </CardThemed>
          </Grid>
        </Grid>
      </Box>
      <CardThemed bgt="light">
        <Box sx={{ display: 'flex', gap: 1, p: 1, flexWrap: 'wrap' }}>
          <KQMSButton action={kqms} disabled={solving} />
          <GcsimButton disabled={solving} />
          <HitModeToggle size="small" />
          <ReactionToggle size="small" />
          <CompareBtn buttonGroupProps={{ sx: { marginLeft: 'auto' } }} />
        </Box>
      </CardThemed>
      {dataContextValue ? (
        <DataContext.Provider value={dataContextValue}>
          <Box>
            <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
              <Grid item sx={{ flexGrow: -1, maxWidth: '350px' }}>
                <WeaponEditorCard
                  weaponTypeKey={weaponTypeKey}
                  disabled={solving}
                />
                <StatFilterCard disabled={solving} />
              </Grid>
              <Grid item sx={{ flexGrow: -1 }}>
                <ArtifactMainStatAndSetEditor disabled={solving} />
              </Grid>
              <Grid item sx={{ flexGrow: 1 }}>
                <ArtifactSubCard
                  disabled={solving}
                  maxTotalRolls={maxTotalRolls}
                />
              </Grid>
            </Grid>
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            {minOtherRolls > 0 && (
              <Alert severity="warning" variant="filled">
                <Trans
                  t={t}
                  i18nKey="tabTheorycraft.feasibilityAlert"
                  values={{ minSubLines, minOtherRolls }}
                >
                  The current substat distribution requires at least{' '}
                  <strong>{{ minSubLines } as any}</strong> lines of substats.
                  Need to assign <strong>{{ minOtherRolls } as any}</strong>{' '}
                  rolls to other substats for this solution to be feasible.
                </Trans>
              </Alert>
            )}
            <Box display="flex" gap={1}>
              <OptimizationTargetSelector
                disabled={solving}
                optimizationTarget={optimizationTarget}
                setTarget={(target) => setOptimizationTarget(target)}
                targetSelectorModalProps={{
                  excludeSections: ['character', 'bonusStats', 'teamBuff'],
                }}
              />
              <CustomNumberInput
                value={distributedSubstats}
                disabled={!optimizationTarget || solving}
                onChange={(v) => v !== undefined && setDistributedSubstats(v)}
                endAdornment={t('tabTheorycraft.distInput')}
                sx={{
                  borderRadius: 1,
                  px: 1,
                  textWrap: 'nowrap',
                  flexShrink: 1,
                }}
                inputProps={{
                  sx: {
                    textAlign: 'right',
                    px: 1,
                    width: '3em',
                    minWidth: '3em',
                  },
                  min: 0,
                }}
              />
              {!solving ? (
                <Button
                  onClick={() => optimizeSubstats(true)}
                  disabled={
                    !optimizationTarget ||
                    !distributedSubstats ||
                    distributedSubstats > maxTotalRolls
                  }
                  color="success"
                  startIcon={<CalculateIcon />}
                >
                  {t('tabTheorycraft.distribute')}
                </Button>
              ) : (
                <Button
                  onClick={terminateWorker}
                  color="error"
                  startIcon={<CloseIcon />}
                >
                  Cancel
                </Button>
              )}
            </Box>

            {isDev && (
              <Button
                onClick={() => optimizeSubstats(false)}
                disabled={!optimizationTarget || solving}
              >
                Log Optimized Substats
              </Button>
            )}
            <ScalesWith minOtherRolls={minOtherRolls} />
            <BuildAlert
              status={status}
              characterKey={characterKey}
              gender={gender}
            />
          </Box>
        </DataContext.Provider>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={500} />
      )}
    </Stack>
  )
}
