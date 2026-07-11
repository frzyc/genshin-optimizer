import { useForceUpdate } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  DropdownButton,
  InfoTooltip,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  clamp,
  filterFunction,
  notEmpty,
  objKeyMap,
  objPathValue,
  range,
} from '@genshin-optimizer/common/util'
import type { CharacterKey, MainStatKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allSubstatKeys,
  artSlotMainKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ArtSetExclusionKey } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
  useLoadoutArtifacts,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import {
  type FilterOption,
  initialFilterOption,
} from '@genshin-optimizer/gi/schema'
import type { OptProblemInput, SolverBuild } from '@genshin-optimizer/gi/solver'
import { GOSolver } from '@genshin-optimizer/gi/solver'
import { compactArtifacts } from '@genshin-optimizer/gi/solver-tc'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  AddArtInfo,
  ArtifactEditor,
  ArtifactSetMultiAutocomplete,
  ArtifactSlotToggle,
  CharacterName,
  DataContext,
  HitModeToggle,
  NoArtWarning,
  ReactionToggle,
  getTeamData,
  resolveInfo,
  useGlobalError,
  useNumWorkers,
  useTeamData,
} from '@genshin-optimizer/gi/ui'
import { uiDataForTeam } from '@genshin-optimizer/gi/uidata'
import {
  artifactFilterConfigs,
  setKeysByRarities,
} from '@genshin-optimizer/gi/util'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { dynamicData, mergeData, optimize } from '@genshin-optimizer/gi/wr'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Alert,
  Box,
  ButtonGroup,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Pagination,
  Skeleton,
  Typography,
} from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'
import Button from '@mui/material/Button'
import { Stack } from '@mui/system'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CustomMultiTargetButton } from '../../CustomMultiTarget/CustomMultiTargetButton'
import ArtifactSetConfig from '../TabOptimize/Components/ArtifactSetConfig'
import BonusStatsCard from '../TabOptimize/Components/BonusStatsCard'
import BuildAlert, {
  type BuildStatus,
} from '../TabOptimize/Components/BuildAlert'
import MainStatSelectionCard from '../TabOptimize/Components/MainStatSelectionCard'
import { OptCharacterCard } from '../TabOptimize/Components/OptCharacterCard'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import StatFilterCard from '../TabOptimize/Components/StatFilterCard'
import { LevelFilter } from './LevelFilter'
import UpgradeOptChartCard from './UpgradeOptChartCard'
import { UpOptCalculatorV2, canReshape } from './upOpt'

// artifact button gets its own type so multiple translations can be used
type AddArtifactButtonProps = Omit<ButtonProps, 'onClick'> & {
  onClick: () => void
}

function AddArtifactButton({ onClick }: AddArtifactButtonProps) {
  const { t } = useTranslation(['artifact', 'ui'])
  return (
    <Button fullWidth onClick={onClick} color="info" startIcon={<AddIcon />}>
      {t('addNew')}
    </Button>
  )
}

const filterOptionReducer = (
  state: Partial<FilterOption>,
  action: Partial<FilterOption>
) => ({ ...state, ...action })
function initBuildStatus(): BuildStatus {
  return {
    type: 'inactive',
    tested: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    testedPerSecond: 0,
    skippedPerSecond: 0,
  }
}
export default function TabUpopt() {
  const { t } = useTranslation('page_character_optimize')
  const { t: tk } = useTranslation('statKey_gen')
  const substatLabel = (key: string) =>
    `${tk(key)}${['atk_', 'def_', 'hp_'].includes(key) ? '%' : ''}`

  const {
    teamId,
    teamCharId,
    teamChar: { optConfigId, key: characterKey },
    loadoutDatum,
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()
  const [filterOption, filterOptionDispatch] = useReducer(
    filterOptionReducer,
    initialFilterOption()
  )

  const [artifactIdToEdit, setArtifactIdToEdit] = useState<string | undefined>()

  const activeCharKey = database.teams.getActiveTeamChar(teamId)!.key

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const optConfig = useOptConfig(optConfigId)!
  const {
    optimizationTarget,
    upOptLevelLow,
    upOptLevelHigh,
    upOptReshape,
    upOptReshapeRolls,
    upOptDefine,
    upOptDefineSubstats,
  } = optConfig
  const teamData = useTeamData()
  const { target: data } = teamData?.[characterKey as CharacterKey] ?? {}

  const [artsDirty, setArtsDirty] = useForceUpdate()
  /**
   * Any artifact change can alter an artifact's best complementary build, so
   * invalidate both the build search and the candidate calculations.
   */
  useEffect(
    () => database.arts.followAny(() => setArtsDirty()),
    [setArtsDirty, database]
  )
  const filteredArts = useMemo(() => {
    const {
      mainStatKeys,
      excludedLocations,
      artExclusion,
      upOptLevelLow,
      upOptLevelHigh,
      upOptReshape,
      useExcludedArts,
    } = optConfig
    const filterFunc = filterFunction(filterOption, artifactFilterConfigs())

    return (
      artsDirty &&
      database.arts.values
        .filter((art) => {
          const reshapeCandidate = upOptReshape && canReshape(art)
          if (!useExcludedArts && artExclusion.includes(art.id)) return false
          if (!reshapeCandidate) {
            if (art.level < upOptLevelLow) return false
            if (art.level > upOptLevelHigh) return false
          }
          if (art.slotKey === 'flower' || art.slotKey === 'plume') return true

          const mainStats = mainStatKeys[art.slotKey]
          if (mainStats?.length && !mainStats.includes(art.mainStatKey))
            return false

          const locKey = charKeyToLocCharKey(characterKey)
          if (
            art.location &&
            art.location !== locKey &&
            excludedLocations.includes(art.location)
          )
            return false

          return true
        })
        .filter(filterFunc)
    )
  }, [optConfig, artsDirty, database, characterKey, filterOption])
  const filteredArtIdMap = useMemo(
    () =>
      objKeyMap(
        filteredArts.map(({ id }) => id),
        (_) => true
      ),
    [filteredArts]
  )
  const reshapeCandidateCount = useMemo(() => {
    void artsDirty
    return database.arts.values.filter(
      (art) =>
        canReshape(art) &&
        (art.slotKey === 'flower' ||
          art.slotKey === 'plume' ||
          !optConfig.mainStatKeys[art.slotKey]?.length ||
          optConfig.mainStatKeys[art.slotKey]?.includes(art.mainStatKey))
    ).length
  }, [artsDirty, database, optConfig.mainStatKeys])

  const { artSetKeys = [], slotKeys = [] } = filterOption

  const { levelTotal, setTotal, slotTotal } = useMemo(() => {
    const catKeys = {
      levelTotal: ['in'],
      setTotal: allArtifactSetKeys,
      slotTotal: allArtifactSlotKeys,
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      database.arts.entries.forEach(([id, art]) => {
        const { level, setKey, slotKey } = art
        const { upOptLevelLow, upOptLevelHigh, upOptReshape } = optConfig
        const reshapeCandidate = upOptReshape && canReshape(art)
        if (
          reshapeCandidate ||
          (level >= upOptLevelLow && level <= upOptLevelHigh)
        ) {
          ctMap['levelTotal']['in'].total++
          if (filteredArtIdMap[id]) ctMap['levelTotal']['in'].current++
        }
        ctMap['setTotal'][setKey].total++
        ctMap['slotTotal'][slotKey].total++
        if (filteredArtIdMap[id]) {
          ctMap['setTotal'][setKey].current++
          ctMap['slotTotal'][slotKey].current++
        }
      })
    )
  }, [database, optConfig, filteredArtIdMap])

  const [maxWorkers, nativeThreads, setMaxWorkers] = useNumWorkers()
  const equippedArts = useLoadoutArtifacts(loadoutDatum)
  const [upOptCalc, setUpOptCalc] = useState<UpOptCalculatorV2>()
  const [hasGenerated, setHasGenerated] = useState(false)
  const [buildStatus, setBuildStatus] = useState(initBuildStatus)
  const throwGlobalError = useGlobalError()

  const upOptInput = useMemo(() => {
    const {
      statFilters,
      optimizationTarget,
      mainStatKeys,
      upOptLevelLow,
      upOptLevelHigh,
      upOptReshape,
      upOptReshapeRolls,
      upOptDefine,
      upOptDefineSubstats,
      artSetExclusion,
      allowPartial,
      useExcludedArts,
      artExclusion,
      excludedLocations,
    } = optConfig

    if (!optimizationTarget) return
    // FIXME: Use teamData here because teamData recalcs upon dependency update. Its kind of jank since there are some redundant calcs
    const teamDataLocal =
      teamData && getTeamData(database, teamId, teamCharId, 0, [])
    if (!teamDataLocal) return
    const workerData = uiDataForTeam(
      teamDataLocal.teamData,
      gender,
      activeCharKey
    )[characterKey]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const optimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined
    if (!optimizationTargetNode) return

    const valueFilter: { value: NumNode; minimum: number }[] = Object.entries(
      statFilters
    ).flatMap(([pathStr, settings]) =>
      settings
        .filter((setting) => !setting.disabled)
        .map((setting) => {
          const filterNode: NumNode = objPathValue(
            workerData.display ?? {},
            JSON.parse(pathStr)
          )
          const infoResolved = filterNode?.info && resolveInfo(filterNode.info)
          const minimum =
            infoResolved?.unit === '%' ? setting.value / 100 : setting.value // TODO: Conversion
          return { value: filterNode, minimum }
        })
    )

    const artifactsToConsider = filteredArts
      // retrieve the artifacts again, just incase there is an update that is not captured by UpgradeOptChartCard
      .map((art) => database.arts.get(art.id))
      .filter(notEmpty)
      .filter((art) => art.rarity === 5)
      .filter(
        (art) =>
          art.slotKey === 'flower' ||
          art.slotKey === 'plume' ||
          !mainStatKeys[art.slotKey]?.length ||
          mainStatKeys[art.slotKey]?.includes(art.mainStatKey)
      )
      .filter(
        (art) =>
          (upOptReshape && canReshape(art)) ||
          (upOptLevelLow <= art.level && art.level <= upOptLevelHigh)
      )

    const mainStatsForDefine = allArtifactSlotKeys.flatMap((slotKey) => {
      if (slotKey === 'flower' || slotKey === 'plume')
        return artSlotMainKeys[slotKey]
      const selected = mainStatKeys[slotKey]
      return selected.length ? selected : artSlotMainKeys[slotKey]
    })
    const defineConfig = {
      enabled: upOptDefine && upOptDefineSubstats.length >= 2,
      setKeys: setKeysByRarities[5].filter((setKey) => {
        const excluded = artSetExclusion[setKey as ArtSetExclusionKey] ?? []
        return !excluded.includes(2) || !excluded.includes(4)
      }),
      slotKeys: slotKeys.length ? slotKeys : [...allArtifactSlotKeys],
      mainStats: [...new Set<MainStatKey>(mainStatsForDefine)],
      substats: upOptDefineSubstats,
    }

    if (!artifactsToConsider.length && !defineConfig.enabled) return
    const nodes = optimize(
      [optimizationTargetNode, ...valueFilter.map((x) => x.value)],
      workerData,
      ({ path: [p] }) => p !== 'dyn'
    )

    const locKey = charKeyToLocCharKey(characterKey)
    const equippableArts = database.arts.values.filter((art) => {
      if (art.rarity !== 5) return false
      if (!useExcludedArts && artExclusion.includes(art.id)) return false
      if (
        art.location &&
        art.location !== locKey &&
        excludedLocations.includes(art.location)
      )
        return false
      return (
        art.slotKey === 'flower' ||
        art.slotKey === 'plume' ||
        !mainStatKeys[art.slotKey]?.length ||
        mainStatKeys[art.slotKey]?.includes(art.mainStatKey)
      )
    })
    const problem: OptProblemInput = {
      arts: compactArtifacts(equippableArts, 0, allowPartial),
      optimizationTarget: nodes[0],
      constraints: nodes.slice(1).map((value, i) => ({
        value,
        min: valueFilter[i].minimum,
      })),
      exclusion: artSetExclusion,
      topN: 1,
      keepBestPerArtifact: true,
    }

    return {
      nodes,
      thresholds: [-Infinity, ...valueFilter.map((x) => x.minimum)],
      artifactsToConsider,
      reshapeConfig: {
        enabled: upOptReshape,
        minTotal: upOptReshapeRolls as 2 | 3 | 4,
      },
      defineConfig,
      problem,
    }
    /**
     * WARNING:
     * Due to the violatile nature of the calculations above,
     * the dependency for this useMemo needs to be updated within the same render cycle as LoadoutDatum,
     * or crashes may occur when swapping charA upOpt -> charB upOpt
     */
  }, [
    optConfig,
    teamData,
    database,
    teamId,
    teamCharId,
    gender,
    activeCharKey,
    characterKey,
    filteredArts,
    slotKeys,
  ])

  const solveId = useRef(0)
  const cancelToken = useRef(() => {})
  const generateBuilds = useCallback(() => {
    const id = ++solveId.current
    setUpOptCalc(undefined)
    setHasGenerated(false)
    if (!upOptInput) return
    const { problem } = upOptInput
    if (Object.values(problem.arts.values).some((arts) => !arts.length)) {
      setHasGenerated(true)
      return
    }

    const status: Omit<BuildStatus, 'type'> = {
      tested: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      testedPerSecond: 0,
      skippedPerSecond: 0,
      startTime: performance.now(),
    }
    setBuildStatus({ type: 'active', ...status })
    const timer = setInterval(
      () => setBuildStatus({ type: 'active', ...status }),
      100
    )
    const solver = new GOSolver(problem, status, maxWorkers)
    let cancelled = false
    cancelToken.current = () => {
      if (cancelled) return
      cancelled = true
      ++solveId.current
      clearInterval(timer)
      solver.cancel(new Error('Artifact Upgrader search cancelled'))
      setBuildStatus({
        type: 'inactive',
        ...status,
        finishTime: performance.now(),
      })
    }

    solver
      .solve()
      .then((results) => {
        if (id !== solveId.current) return
        const bestByArtifact = new Map<string, SolverBuild>()
        for (const build of results.flatMap((result) => result.builds))
          for (const artifactId of build.artifactIds) {
            const old = bestByArtifact.get(artifactId)
            if (!old || old.value < build.value)
              bestByArtifact.set(artifactId, build)
          }
        const best = results
          .map(({ bestBuild }) => bestBuild)
          .filter(notEmpty)
          .reduce<SolverBuild | undefined>(
            (old, build) => (!old || old.value < build.value ? build : old),
            undefined
          )
        if (!best) return
        const toBuild = (build: SolverBuild) =>
          objKeyMap(allArtifactSlotKeys, (slotKey) =>
            build.artifactIds
              .map((artifactId) => database.arts.get(artifactId))
              .find((art) => art?.slotKey === slotKey)
          )
        const builds = new Map(
          [...bestByArtifact].map(([artifactId, build]) => [
            artifactId,
            toBuild(build),
          ])
        )
        setUpOptCalc(
          new UpOptCalculatorV2(
            upOptInput.nodes,
            upOptInput.thresholds,
            toBuild(best),
            equippedArts,
            builds,
            upOptInput.artifactsToConsider,
            upOptInput.reshapeConfig,
            upOptInput.defineConfig
          )
        )
        setHasGenerated(true)
      })
      .catch((error) => {
        if (!cancelled && id === solveId.current) throwGlobalError(error)
      })
      .finally(() => {
        if (id !== solveId.current) return
        clearInterval(timer)
        setHasGenerated(true)
        setBuildStatus({
          type: 'inactive',
          ...status,
          finishTime: performance.now(),
        })
        cancelToken.current = () => {}
      })
  }, [upOptInput, maxWorkers, database, throwGlobalError, equippedArts])

  useEffect(() => {
    cancelToken.current()
    setUpOptCalc(undefined)
    setHasGenerated(false)
    setBuildStatus(initBuildStatus())
  }, [upOptInput])
  useEffect(() => () => cancelToken.current(), [])

  // Paging logic
  const [pageIdex, setpageIdex] = useState(0)

  useEffect(() => {
    // reset paging on new upOptCalc
    setpageIdex(0)
  }, [upOptCalc])

  const artifactsToDisplayPerPage = 5
  const { indexes, numPages, currentPageIndex, minObj0, maxObj0 } =
    useMemo(() => {
      if (!upOptCalc)
        return {
          indexes: [],
          numPages: 0,
          currentPageIndex: 0,
          minObj0: 0,
          maxObj0: 0,
        }

      const numPages = Math.ceil(
        upOptCalc.candidates.length / artifactsToDisplayPerPage
      )

      const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
      const toShow = upOptCalc.candidates.slice(
        currentPageIndex * artifactsToDisplayPerPage,
        (currentPageIndex + 1) * artifactsToDisplayPerPage
      )
      const thr = upOptCalc.obj.threshold[0]

      return {
        indexes: range(
          currentPageIndex * artifactsToDisplayPerPage,
          Math.min(
            (currentPageIndex + 1) * artifactsToDisplayPerPage - 1,
            upOptCalc.candidates.length - 1
          )
        ),
        numPages,
        currentPageIndex,
        minObj0: toShow.reduce((a, b) => Math.min(b.result.lower, a), thr),
        maxObj0: toShow.reduce((a, b) => Math.max(b.result.upper, a), thr),
      }
    }, [pageIdex, upOptCalc])
  const setPage = useCallback(
    (e: React.ChangeEvent<unknown>, value: number) => {
      if (!upOptCalc) return
      const end = value * artifactsToDisplayPerPage
      upOptCalc.calcSlowToIndex(end)
      setpageIdex(value - 1)
    },
    [upOptCalc]
  )

  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && teamData && { data, teamData }
  }, [data, teamData])

  const pagination = numPages > 1 && (
    <CardThemed bgt="light">
      <CardContent>
        <Grid container>
          <Grid item flexGrow={1}>
            <Pagination
              count={numPages}
              page={currentPageIndex + 1}
              onChange={setPage}
            />
          </Grid>
          <Grid item>
            <ShowingArt
              numShowing={indexes.length}
              total={upOptCalc?.candidates.length ?? 0}
            />
          </Grid>
        </Grid>
      </CardContent>
    </CardThemed>
  )

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {noArtifact && <NoArtWarning />}
      {/* Build Generator Editor */}
      {dataContext && (
        <DataContext.Provider value={dataContext}>
          <Stack spacing={1}>
            <Box>
              <Grid container spacing={1}>
                {/* 1*/}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={3}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  {/* character card */}
                  <OptCharacterCard characterKey={characterKey} />
                  <BonusStatsCard />
                  <CustomMultiTargetButton />
                </Grid>

                {/* 2 */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <LevelFilter
                    levelTotal={levelTotal['in']}
                    upOptLevelLow={upOptLevelLow}
                    upOptLevelHigh={upOptLevelHigh}
                    optConfigId={optConfigId}
                  />
                  <ArtifactSlotToggle
                    onChange={(slotKeys) => {
                      filterOptionDispatch({ slotKeys })
                    }}
                    totals={slotTotal}
                    value={slotKeys}
                  />
                  <ArtifactSetMultiAutocomplete
                    // Only show 5-star artifacts sets as they are filtered out of this page
                    allowRarities={[5]}
                    totals={setTotal}
                    artSetKeys={artSetKeys}
                    setArtSetKeys={(artSetKeys) =>
                      filterOptionDispatch({ artSetKeys })
                    }
                  />
                  <CardThemed bgt="light">
                    <MainStatSelectionCard
                      disabled={false}
                      filteredArtIdMap={filteredArtIdMap}
                    />
                  </CardThemed>
                </Grid>
                {/* 3 */}
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={5}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <ArtifactSetConfig disabled={false} />
                  <AddArtifactButton
                    onClick={() => setArtifactIdToEdit('new')}
                  />
                  <StatFilterCard disabled={false} />
                  <CardThemed bgt="light">
                    <CardContent>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={upOptReshape}
                                onChange={(_, upOptReshape) =>
                                  database.optConfigs.set(optConfigId, {
                                    upOptReshape,
                                  })
                                }
                              />
                            }
                            label={t('upOptReshape.label')}
                          />
                          <SqBadge color="info" sx={{ mr: 2 }}>
                            {reshapeCandidateCount}
                          </SqBadge>
                          <InfoTooltip
                            title={
                              <Typography>
                                <Trans t={t} i18nKey="upOptReshape.tooltip">
                                  Evaluate level 20 artifacts as reshape
                                  candidates. Each eligible artifact is scored
                                  once per substat pair, for 6 total
                                  combinations.
                                  <br />
                                  Note: This requires importing your data using{' '}
                                  <Link href="/#/scanner">Irminsul</Link>
                                </Trans>
                              </Typography>
                            }
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('upOptReshape.rolls')}
                          </Typography>
                          <ButtonGroup size="small" sx={{ mt: 0.5 }}>
                            {[2, 3, 4].map((rolls) => (
                              <Button
                                key={rolls}
                                color={
                                  upOptReshapeRolls === rolls
                                    ? 'success'
                                    : 'secondary'
                                }
                                variant="contained"
                                onClick={() =>
                                  database.optConfigs.set(optConfigId, {
                                    upOptReshapeRolls: rolls,
                                  })
                                }
                              >
                                {t('upOptReshape.rollOption', { count: rolls })}
                              </Button>
                            ))}
                          </ButtonGroup>
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardThemed>
                  <CardThemed bgt="light">
                    <CardContent>
                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={upOptDefine}
                                onChange={(_, upOptDefine) =>
                                  database.optConfigs.set(optConfigId, {
                                    upOptDefine,
                                  })
                                }
                              />
                            }
                            label={t('upOptDefine.label')}
                          />
                          <InfoTooltip
                            title={
                              <Typography>
                                {t('upOptDefine.tooltip')}
                              </Typography>
                            }
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('upOptDefine.substats')}
                            <SqBadge color="info" sx={{ ml: 1 }}>
                              {upOptDefineSubstats.length}
                            </SqBadge>
                          </Typography>
                          <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                            {allSubstatKeys.map((key) => {
                              const selected = upOptDefineSubstats.includes(key)
                              return (
                                <Grid item key={key}>
                                  <Button
                                    size="small"
                                    color={selected ? 'success' : 'secondary'}
                                    variant="contained"
                                    startIcon={<StatIcon statKey={key} />}
                                    onClick={() => {
                                      const next = selected
                                        ? upOptDefineSubstats.filter(
                                            (k) => k !== key
                                          )
                                        : [...upOptDefineSubstats, key]
                                      database.optConfigs.set(optConfigId, {
                                        upOptDefineSubstats: next,
                                      })
                                    }}
                                  >
                                    {substatLabel(key)}
                                  </Button>
                                </Grid>
                              )
                            })}
                          </Grid>
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardThemed>
                </Grid>
              </Grid>
            </Box>
            <ButtonGroup>
              <OptimizationTargetSelector
                optimizationTarget={optimizationTarget}
                setTarget={(target) =>
                  database.optConfigs.set(optConfigId, {
                    optimizationTarget: target,
                  })
                }
                disabled={buildStatus.type === 'active'}
                targetSelectorModalProps={{
                  excludeSections: ['character', 'bonusStats', 'teamBuff'],
                }}
              />
              <DropdownButton
                disabled={buildStatus.type === 'active'}
                title={
                  <Trans t={t} i18nKey="thread" count={maxWorkers}>
                    {{ count: maxWorkers }} Threads
                  </Trans>
                }
              >
                <MenuItem>
                  <Typography variant="caption" color="info.main">
                    {t('threadDropdownDesc')}
                  </Typography>
                </MenuItem>
                {range(1, nativeThreads)
                  .reverse()
                  .map((workerCount) => (
                    <MenuItem
                      key={workerCount}
                      onClick={() => setMaxWorkers(workerCount)}
                    >
                      <Trans t={t} i18nKey="thread" count={workerCount}>
                        {{ count: workerCount }} Threads
                      </Trans>
                    </MenuItem>
                  ))}
              </DropdownButton>
              <BootstrapTooltip
                placement="top"
                title={!optimizationTarget ? t('selectTargetFirst') : ''}
              >
                <span>
                  <Button
                    disabled={buildStatus.type === 'inactive' && !upOptInput}
                    color={buildStatus.type === 'active' ? 'error' : 'success'}
                    onClick={
                      buildStatus.type === 'active'
                        ? () => cancelToken.current()
                        : generateBuilds
                    }
                    startIcon={
                      buildStatus.type === 'active' ? (
                        <CloseIcon />
                      ) : (
                        <TrendingUpIcon />
                      )
                    }
                    sx={{ borderRadius: '0px 4px 4px 0px' }}
                  >
                    {buildStatus.type === 'active'
                      ? t('generateButton.cancel')
                      : t('generateButton.generateBuilds')}
                  </Button>
                </span>
              </BootstrapTooltip>
            </ButtonGroup>
            <Alert severity="info">
              <Trans t={t} i18nKey={'upOptInfo'}>
                The Artifact Upgrader identifies artifacts with high potential
                to boost the Optimization Target's value, guiding you to
                artifacts worth leveling up.
                <br />
                Each candidate is evaluated with its best equippable build.
              </Trans>
            </Alert>
            <BuildAlert
              status={buildStatus}
              characterName={
                <CharacterName characterKey={characterKey} gender={gender} />
              }
            />
            <CardThemed bgt="light">
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item></Grid>
                  <Grid item>
                    <HitModeToggle size="small" />
                  </Grid>
                  <Grid item>
                    <ReactionToggle size="small" />
                  </Grid>
                </Grid>
              </CardContent>
            </CardThemed>
            {pagination}
            {noArtifact && <AddArtInfo />}
            <Suspense fallback={false}>
              <ArtifactEditor
                artifactIdToEdit={artifactIdToEdit}
                cancelEdit={() => setArtifactIdToEdit(undefined)}
                allowUpload
              />
            </Suspense>
            {hasGenerated &&
              buildStatus.type === 'inactive' &&
              !upOptCalc?.candidates.length && (
                <Alert severity="warning">{t('upOptNoResults')}</Alert>
              )}
            <Suspense
              fallback={
                <Skeleton
                  variant="rectangular"
                  sx={{ width: '100%', height: 600, minHeight: 5000 }}
                />
              }
            >
              {!!upOptCalc &&
                indexes.map(
                  (i) =>
                    upOptCalc.candidates[i] && (
                      <UpgradeOptChartCard
                        key={`${i}+${upOptCalc.candidates[i].id}`}
                        upOptCalc={upOptCalc}
                        ix={i}
                        setArtifactIdToEdit={setArtifactIdToEdit}
                        thresholds={upOptCalc.obj.threshold ?? []}
                        objMax={maxObj0}
                        objMin={minObj0}
                      />
                    )
                )}
            </Suspense>
            {pagination}
          </Stack>
        </DataContext.Provider>
      )}
    </Box>
  )
}

function ShowingArt({
  numShowing,
  total,
}: {
  numShowing: number
  total: number
}) {
  const { t } = useTranslation('page_character_optimize')
  return (
    <Typography color="text.secondary">
      <Trans t={t} i18nKey="upOptShowingNum" count={numShowing} value={total}>
        Showing {{ count: numShowing }} out of {{ value: total }} Artifacts
      </Trans>
    </Typography>
  )
}
