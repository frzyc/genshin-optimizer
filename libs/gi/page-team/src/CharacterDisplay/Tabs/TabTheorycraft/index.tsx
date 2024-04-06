import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { CardThemed, CustomNumberInput } from '@genshin-optimizer/common/ui'
import { isDev, objMap, toPercent } from '@genshin-optimizer/common/util'
import {
  artSubstatRollData,
  type SubstatKey,
} from '@genshin-optimizer/gi/consts'
import type { BuildTc } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useBuildTc,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  ArtifactStatWithUnit,
  BuildAlert,
  DataContext,
  HitModeToggle,
  OptimizationTargetContext,
  ReactionToggle,
  StatDisplayComponent,
  getBuildTcArtifactData,
  getBuildTcWeaponData,
  getTeamDataCalc,
  initialBuildStatus,
} from '@genshin-optimizer/gi/ui'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import CalculateIcon from '@mui/icons-material/Calculate'
import CloseIcon from '@mui/icons-material/Close'
import { Alert, Box, Button, Grid, Skeleton, Stack } from '@mui/material'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import CharacterProfileCard from '../../../CharProfileCard'
import useCompareData from '../../../useCompareData'
import CompareBtn from '../../CompareBtn'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import { ArtifactMainStatAndSetEditor } from './ArtifactMainStatAndSetEditor'
import { ArtifactSubCard } from './ArtifactSubCard'
import { BuildConstaintCard } from './BuildConstaintCard'
import type { SetBuildTcAction } from './BuildTcContext'
import { BuildTcContext } from './BuildTcContext'
import GcsimButton from './GcsimButton'
import KQMSButton from './KQMSButton'
import { WeaponEditorCard } from './WeaponEditorCard'
import type { TCWorkerResult } from './optimizeTc'
import {
  getMinSubAndOtherRolls,
  getScalesWith,
  optimizeTcGetNodes,
} from './optimizeTc'
export default function TabTheorycraft() {
  const { t } = useTranslation('page_character')
  const database = useDatabase()
  const { gender } = useDBMeta()
  const {
    teamId,
    teamCharId,
    loadoutDatum,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const buildTc = useBuildTc(loadoutDatum.buildTcId)!
  const setBuildTc = useCallback(
    (data: SetBuildTcAction) => {
      database.buildTcs.set(loadoutDatum.buildTcId, data)
    },
    [loadoutDatum, database]
  )
  const buildTCContextObj = useMemo(
    () => ({ buildTc, setBuildTc }),
    [buildTc, setBuildTc]
  )
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

  const optimizationTarget = buildTc.optimization.target
  const setOptimizationTarget = useCallback(
    (optimizationTarget: BuildTc['optimization']['target']) => {
      const data_ = structuredClone(buildTc)
      data_.optimization.target = optimizationTarget
      setBuildTc(data_)
    },
    [buildTc, setBuildTc]
  )

  const distributedSubstats = buildTc.optimization.distributedSubstats
  const setDistributedSubstats = useCallback(
    (distributedSubstats: BuildTc['optimization']['distributedSubstats']) => {
      setBuildTc((data_) => {
        data_.optimization.distributedSubstats = distributedSubstats
      })
    },
    [setBuildTc]
  )
  const workerRef = useRef<Worker | null>(null)
  if (workerRef.current === null)
    workerRef.current = new Worker(
      new URL('./optimizeTcWorker.ts', import.meta.url),
      {
        type: 'module',
      }
    )

  const [status, setStatus] = useState(initialBuildStatus())
  const solving = status.type === 'active'

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    setStatus(initialBuildStatus())
  }, [workerRef])

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

  const { scalesWith } = useMemo(() => {
    const { nodes } = optimizeTcGetNodes(
      dataContextValue.teamData,
      characterKey,
      buildTc
    )
    const scalesWith = nodes ? getScalesWith(nodes) : new Set<SubstatKey>()
    return {
      nodes,
      scalesWith,
    }
  }, [dataContextValue.teamData, characterKey, buildTc])

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
    const { nodes } = optimizeTcGetNodes(tempTeamData, characterKey, buildTc)
    workerRef.current.postMessage({ buildTc, nodes })
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
      buildTc.artifact.substats.stats = objMap(stats, (val, statKey) => {
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
    })
  }, [setBuildTc])

  return (
    <BuildTcContext.Provider value={buildTCContextObj}>
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
                <OptimizationTargetContext.Provider value={optimizationTarget}>
                  {dataContextValueWithCompare ? (
                    <DataContext.Provider value={dataContextValueWithCompare}>
                      <StatDisplayComponent
                        columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
                      />
                    </DataContext.Provider>
                  ) : (
                    <Skeleton variant="rectangular" width="100%" height={500} />
                  )}
                </OptimizationTargetContext.Provider>
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
                  <BuildConstaintCard disabled={solving} />
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
                />
                <CustomNumberInput
                  value={distributedSubstats}
                  disabled={!optimizationTarget || solving}
                  onChange={(v) => v !== undefined && setDistributedSubstats(v)}
                  endAdornment={'Substats'}
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
                    {t`tabTheorycraft.distribute`}
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
              {!!scalesWith.size && (
                <Alert severity="info" variant="filled">
                  <Trans t={t} i18nKey="tabTheorycraft.optAlert.scalesWith">
                    The selected Optimization target and constraints scales
                    with:{' '}
                  </Trans>
                  {[...scalesWith]
                    .map((k) => (
                      <strong key={k}>
                        <StatIcon statKey={k} iconProps={iconInlineProps} />
                        <ArtifactStatWithUnit statKey={k} />
                      </strong>
                    ))
                    .flatMap((value, index, array) => {
                      if (index === array.length - 2)
                        return [value, <span key="and">, and </span>]
                      if (index === array.length - 1) return value
                      return [value, <span key={index}>, </span>]
                    })}
                  <Trans t={t} i18nKey="tabTheorycraft.optAlert.distribute">
                    . The solver will only distribute stats to these substats.
                  </Trans>{' '}
                  {minOtherRolls > 0 && (
                    <Trans t={t} i18nKey="tabTheorycraft.optAlert.feasibilty">
                      There may be additional leftover substats that should be
                      distributed to non-scaling stats to ensure the solution is
                      feasible.
                    </Trans>
                  )}
                </Alert>
              )}
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
    </BuildTcContext.Provider>
  )
}
