import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { objKeyMap, objPathValue, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { defThreads, maxBuildsToShowList } from '@genshin-optimizer/gi/db'
import {
  useDBMeta,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import {
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  DeleteForever,
  Science,
  TrendingUp,
} from '@mui/icons-material'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import React, {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import ArtifactLevelSlider from '../../../../Components/Artifact/ArtifactLevelSlider'
import BootstrapTooltip from '../../../../Components/BootstrapTooltip'
import CardLight from '../../../../Components/Card/CardLight'
import { CharacterCardEquipmentRow } from '../../../../Components/Character/CharacterCard/CharacterCardEquipmentRow'
import {
  CharacterCardHeader,
  CharacterCardHeaderContent,
} from '../../../../Components/Character/CharacterCard/CharacterCardHeader'
import { CharacterCardStats } from '../../../../Components/Character/CharacterCard/CharacterCardStats'
import CloseButton from '../../../../Components/CloseButton'
import DropdownButton from '../../../../Components/DropdownMenu/DropdownButton'
import {
  HitModeToggle,
  ReactionToggle,
} from '../../../../Components/HitModeEditor'
import InfoTooltip from '../../../../Components/InfoTooltip'
import NoArtWarning from '../../../../Components/NoArtWarning'
import SqBadge from '../../../../Components/SqBadge'
import { CharacterContext } from '../../../../Context/CharacterContext'
import { DataContext } from '../../../../Context/DataContext'
import { GraphContext } from '../../../../Context/GraphContext'
import { OptimizationTargetContext } from '../../../../Context/OptimizationTargetContext'
import { TeamCharacterContext } from '../../../../Context/TeamCharacterContext'
import { mergeData, uiDataForTeam } from '../../../../Formula/api'
import { optimize } from '../../../../Formula/optimization'
import type { NumNode } from '../../../../Formula/type'
import type { UIData } from '../../../../Formula/uiData'
import useGlobalError from '../../../../ReactHooks/useGlobalError'
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData'
import type { OptProblemInput } from '../../../../Solver'
import { GOSolver } from '../../../../Solver/GOSolver/GOSolver'
import type { Build } from '../../../../Solver/common'
import { mergeBuilds, mergePlot } from '../../../../Solver/common'
import { bulkCatTotal } from '../../../../Util/totalUtils'
import useOldData from '../../../useOldData'
import CompareBtn from '../../CompareBtn'
import AllowChar from './Components/AllowChar'
import ArtifactSetConfig from './Components/ArtifactSetConfig'
import AssumeFullLevelToggle from './Components/AssumeFullLevelToggle'
import BonusStatsCard from './Components/BonusStatsCard'
import type { BuildStatus } from './Components/BuildAlert'
import BuildAlert from './Components/BuildAlert'
import BuildDisplayItem from './Components/BuildDisplayItem'
import ChartCard from './Components/ChartCard'
import ExcludeArt from './Components/ExcludeArt'
import MainStatSelectionCard from './Components/MainStatSelectionCard'
import OptimizationTargetSelector from './Components/OptimizationTargetSelector'
import StatFilterCard from './Components/StatFilterCard'
import { compactArtifacts, dynamicData } from './foreground'

const audio = new Audio('assets/notification.mp3')
export default function TabBuild() {
  const { t } = useTranslation('page_character_optimize')
  const {
    teamCharId,
    teamChar: { optConfigId, key: characterKey },
    teamId,
  } = useContext(TeamCharacterContext)
  const { characterSheet } = useContext(CharacterContext)
  const database = useDatabase()
  const { setChartData, graphBuilds, setGraphBuilds } = useContext(GraphContext)
  const { gender } = useDBMeta()

  const [notification, setnotification] = useState(false)
  const notificationRef = useRef(false)
  useEffect(() => {
    notificationRef.current = notification
  }, [notification])

  const [buildStatus, setBuildStatus] = useState({
    type: 'inactive',
    tested: 0,
    failed: 0,
    skipped: 0,
    total: 0,
  } as BuildStatus)
  const generatingBuilds = buildStatus.type !== 'inactive'

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const [{ threads = defThreads }, setDisplayOptimize] = useState(
    database.displayOptimize.get()
  )
  useEffect(
    () => database.displayOptimize.follow((_r, to) => setDisplayOptimize(to)),
    [database, setDisplayOptimize]
  )

  const maxWorkers = threads > defThreads ? defThreads : threads
  const setMaxWorkers = useCallback(
    (threads: number) => database.displayOptimize.set({ threads }),
    [database]
  )

  // Clear state when changing characters
  useEffect(() => {
    setBuildStatus({
      type: 'inactive',
      tested: 0,
      failed: 0,
      skipped: 0,
      total: 0,
    })
  }, [characterKey])

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const buildSetting = useOptConfig(optConfigId)
  const {
    plotBase,
    optimizationTarget,
    mainStatAssumptionLevel,
    allowPartial,
    maxBuildsToShow,
    levelLow,
    levelHigh,
    builds,
    buildDate,
  } = buildSetting
  const { data } = useContext(DataContext)
  const oldData = useOldData()
  const optimizationTargetNode =
    optimizationTarget && objPathValue(data?.getDisplay(), optimizationTarget)
  const isSM = ['xs', 'sm'].includes(useMediaQueryUp())

  //register changes in artifact database
  useEffect(
    () => database.arts.followAny(setArtsDirty),
    [setArtsDirty, database]
  )

  const deferredArtsDirty = useDeferredValue(artsDirty)
  const deferredBuildSetting = useDeferredValue(buildSetting)
  const filteredArts = useMemo(() => {
    const {
      mainStatKeys,
      excludedLocations,
      artExclusion,
      levelLow,
      levelHigh,
      allowLocationsState,
      useExcludedArts,
    } = deferredArtsDirty && deferredBuildSetting

    return database.arts.values.filter((art) => {
      if (!useExcludedArts && artExclusion.includes(art.id)) return false
      if (art.level < levelLow) return false
      if (art.level > levelHigh) return false
      const mainStats = mainStatKeys[art.slotKey]
      if (mainStats?.length && !mainStats.includes(art.mainStatKey))
        return false

      const locKey = charKeyToLocCharKey(characterKey)
      const unequippedStateAndEquippedElsewhere =
        allowLocationsState === 'unequippedOnly' &&
        art.location &&
        art.location !== locKey
      const customListStateAndNotOnList =
        allowLocationsState === 'customList' &&
        art.location &&
        art.location !== locKey &&
        excludedLocations.includes(art.location)
      if (unequippedStateAndEquippedElsewhere || customListStateAndNotOnList)
        return false

      return true
    })
  }, [database, characterKey, deferredArtsDirty, deferredBuildSetting])

  const filteredArtIdMap = useMemo(
    () =>
      objKeyMap(
        filteredArts.map(({ id }) => id),
        (_) => true
      ),
    [filteredArts]
  )
  const { levelTotal, allowListTotal, excludedTotal } = useMemo(() => {
    const catKeys = {
      levelTotal: ['in'],
      allowListTotal: ['in'],
      excludedTotal: ['in'],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      Object.entries(database.arts.data).forEach(([id, art]) => {
        const { level, location } = art
        const {
          levelLow,
          levelHigh,
          excludedLocations,
          allowLocationsState,
          artExclusion,
        } = deferredArtsDirty && deferredBuildSetting
        if (level >= levelLow && level <= levelHigh) {
          ctMap.levelTotal.in.total++
          if (filteredArtIdMap[id]) ctMap.levelTotal.in.current++
        }
        const locKey = charKeyToLocCharKey(characterKey)
        const allStateAndEquippedSomewhereElse =
          allowLocationsState === 'all' && location && location !== locKey
        const customListStateAndNotOnList =
          allowLocationsState === 'customList' &&
          location &&
          location !== locKey &&
          !excludedLocations.includes(location)
        if (allStateAndEquippedSomewhereElse || customListStateAndNotOnList) {
          ctMap.allowListTotal.in.total++
          if (filteredArtIdMap[id]) ctMap.allowListTotal.in.current++
        }
        if (artExclusion.includes(id)) {
          ctMap.excludedTotal.in.total++
          if (filteredArtIdMap[id]) ctMap.excludedTotal.in.current++
        }
      })
    )
  }, [
    characterKey,
    database.arts.data,
    deferredArtsDirty,
    deferredBuildSetting,
    filteredArtIdMap,
  ])

  const tabFocused = useRef(true)
  useEffect(() => {
    const onFocus = () => (tabFocused.current = true)
    const onBlur = () => (tabFocused.current = false)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [tabFocused])

  // Provides a function to cancel the work
  const cancelToken = useRef(() => {})
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])
  const throwGlobalError = useGlobalError()

  const generateBuilds = useCallback(async () => {
    const {
      artSetExclusion,
      plotBase,
      statFilters,
      optimizationTarget,
      mainStatAssumptionLevel,
      allowPartial,
      maxBuildsToShow,
    } = buildSetting
    if (!characterKey || !optimizationTarget) return

    const split = compactArtifacts(
      filteredArts,
      mainStatAssumptionLevel,
      allowPartial
    )

    const teamData = getTeamData(
      database,
      teamId,
      teamCharId,
      mainStatAssumptionLevel,
      []
    )
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, gender, characterKey)[
      characterKey
    ]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const unoptimizedOptimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined
    if (!unoptimizedOptimizationTargetNode) return
    const targetNode = unoptimizedOptimizationTargetNode
    const valueFilter: { value: NumNode; minimum: number }[] = Object.entries(
      statFilters
    )
      .flatMap(([pathStr, settings]) =>
        settings
          .filter((setting) => !setting.disabled)
          .map((setting) => {
            const filterNode: NumNode = objPathValue(
              workerData.display ?? {},
              JSON.parse(pathStr)
            )
            const minimum =
              filterNode.info?.unit === '%'
                ? setting.value / 100
                : setting.value // TODO: Conversion
            return { value: filterNode, minimum: minimum }
          })
      )
      .filter((x) => x.value && x.minimum > -Infinity)

    setChartData(undefined)

    const cancelled = new Promise<void>((r) => (cancelToken.current = r))

    const unoptimizedNodes = [
      ...valueFilter.map((x) => x.value),
      unoptimizedOptimizationTargetNode,
    ]
    const minimum = [...valueFilter.map((x) => x.minimum), -Infinity]
    const plotBaseNumNode: NumNode =
      plotBase && objPathValue(workerData.display ?? {}, plotBase)
    if (plotBaseNumNode) {
      unoptimizedNodes.push(plotBaseNumNode)
      minimum.push(-Infinity)
    }

    const nodes = optimize(
      unoptimizedNodes,
      workerData,
      ({ path: [p] }) => p !== 'dyn'
    )
    const plotBaseNode = plotBaseNumNode ? nodes.pop() : undefined
    const optimizationTargetNode = nodes.pop()!

    const problem: OptProblemInput = {
      arts: split,
      optimizationTarget: optimizationTargetNode,
      exclusion: artSetExclusion,
      constraints: nodes.map((value, i) => ({ value, min: minimum[i] })),

      topN: maxBuildsToShow,
      plotBase: plotBaseNode,
    }
    const status: Omit<BuildStatus, 'type'> = {
      tested: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      startTime: performance.now(),
    }
    const statusUpdateTimer = setInterval(
      () => setBuildStatus({ type: 'active', ...status }),
      100
    )

    const cancellationError = new Error()
    try {
      const solver = new GOSolver(problem, status, maxWorkers)
      cancelled.then(() => solver.cancel(cancellationError))

      const results = await solver.solve()
      solver.cancel() // Done using `solver`

      cancelToken.current = () => {}

      if (plotBaseNumNode) {
        const plotData = mergePlot(results.map((x) => x.plotData!))
        let data = Object.values(plotData)
        if (targetNode.info?.unit === '%')
          data = data.map(({ value, plot, artifactIds }) => ({
            value: value * 100,
            plot,
            artifactIds,
          })) as Build[]
        if (plotBaseNumNode.info?.unit === '%')
          data = data.map(({ value, plot, artifactIds }) => ({
            value,
            plot: (plot ?? 0) * 100,
            artifactIds,
          })) as Build[]
        setChartData({
          valueNode: targetNode,
          plotNode: plotBaseNumNode,
          data,
        })
      }
      const builds = mergeBuilds(
        results.map((x) => x.builds),
        maxBuildsToShow
      )
      if (process.env.NODE_ENV === 'development')
        console.log('Build Result', builds)

      database.optConfigs.set(optConfigId, {
        builds: builds.map((build) => build.artifactIds),
        buildDate: Date.now(),
      })

      setTimeout(() => {
        // Using a ref because a user can cancel the notification while the build is going.
        if (results && notificationRef.current) {
          audio.play()
          if (!tabFocused.current)
            setTimeout(() => window.alert(t`buildCompleted`), 1)
        }
      }, 100)
    } catch (e) {
      // Worker error, cancelled, printer catches on fire, etc.
      if (e !== cancellationError) {
        console.log('Failed to load worker')
        console.log(e)
        if (e instanceof Error) throwGlobalError(e)
      }

      cancelToken.current()
      status.tested = 0
      status.failed = 0
      status.skipped = 0
      status.total = 0
    } finally {
      clearInterval(statusUpdateTimer)
      setBuildStatus({
        type: 'inactive',
        ...status,
        finishTime: performance.now(),
      })
    }
  }, [
    teamCharId,
    teamId,
    buildSetting,
    characterKey,
    filteredArts,
    database,
    gender,
    setChartData,
    maxWorkers,
    optConfigId,
    t,
    throwGlobalError,
  ])

  const characterName = characterSheet?.name ?? 'Character Name'

  const setPlotBase = useCallback(
    (plotBase: string[] | undefined) => {
      database.optConfigs.set(optConfigId, { plotBase })
      setChartData(undefined)
    },
    [database, optConfigId, setChartData]
  )

  const targetSelector = (
    <OptimizationTargetSelector
      optimizationTarget={optimizationTarget}
      setTarget={(target) =>
        database.optConfigs.set(optConfigId, { optimizationTarget: target })
      }
      disabled={!!generatingBuilds}
    />
  )

  const getGraphBuildLabel = useCallback(
    (index: number) => (
      <Trans t={t} i18nKey="graphBuildLabel" count={index + 1}>
        Graph #{{ count: index + 1 }}
      </Trans>
    ),
    [t]
  )
  const getNormBuildLabel = useCallback((index: number) => `#${index + 1}`, [])
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {noArtifact && <NoArtWarning />}
      {/* Build Generator Editor */}
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
          <Box>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={600} />
              }
            >
              <CardThemed bgt="light">
                <CharacterCardHeader characterKey={characterKey}>
                  <CharacterCardHeaderContent characterKey={characterKey} />
                </CharacterCardHeader>
                <Box
                  sx={{
                    p: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <CharacterCardEquipmentRow />
                  <CharacterCardStats />
                </Box>
              </CardThemed>
            </Suspense>
          </Box>
          <BonusStatsCard />
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
          {/* Level Filter */}
          <CardLight>
            <CardContent sx={{ display: 'flex', gap: 1 }}>
              <Typography
                sx={{ fontWeight: 'bold' }}
              >{t`levelFilter`}</Typography>
              <SqBadge color="info">{levelTotal.in}</SqBadge>
            </CardContent>
            <Divider />
            <CardContent>
              <ArtifactLevelSlider
                levelLow={levelLow}
                levelHigh={levelHigh}
                setLow={(levelLow) =>
                  database.optConfigs.set(optConfigId, { levelLow })
                }
                setHigh={(levelHigh) =>
                  database.optConfigs.set(optConfigId, { levelHigh })
                }
                setBoth={(levelLow, levelHigh) =>
                  database.optConfigs.set(optConfigId, {
                    levelLow,
                    levelHigh,
                  })
                }
                disabled={generatingBuilds}
              />
            </CardContent>
          </CardLight>

          {/* Main Stat Filters */}
          <CardLight>
            <CardContent>
              <Typography
                sx={{ fontWeight: 'bold' }}
              >{t`mainStat.title`}</Typography>
            </CardContent>
            <Divider />
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AssumeFullLevelToggle
                  mainStatAssumptionLevel={mainStatAssumptionLevel}
                  setmainStatAssumptionLevel={(
                    mainStatAssumptionLevel: number
                  ) =>
                    database.optConfigs.set(optConfigId, {
                      mainStatAssumptionLevel,
                    })
                  }
                  disabled={generatingBuilds}
                />
                <InfoTooltip
                  title={
                    <Box>
                      <Typography variant="h6">{t`mainStat.levelAssTooltip.title`}</Typography>
                      <Typography>{t`mainStat.levelAssTooltip.desc`}</Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
            {/* main stat selector */}
            <MainStatSelectionCard
              disabled={generatingBuilds}
              filteredArtIdMap={filteredArtIdMap}
            />
          </CardLight>
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
          <ArtifactSetConfig disabled={generatingBuilds} />

          {/* use excluded */}
          <ExcludeArt
            disabled={generatingBuilds}
            excludedTotal={excludedTotal.in}
          />

          <Button
            fullWidth
            startIcon={allowPartial ? <CheckBox /> : <CheckBoxOutlineBlank />}
            color={allowPartial ? 'success' : 'secondary'}
            onClick={() =>
              database.optConfigs.set(optConfigId, {
                allowPartial: !allowPartial,
              })
            }
            disabled={generatingBuilds}
          >
            {t`allowPartial`}
          </Button>

          {/* use equipped */}
          <AllowChar
            disabled={generatingBuilds}
            allowListTotal={allowListTotal.in}
          />

          {/*Minimum Final Stat Filter */}
          <StatFilterCard disabled={generatingBuilds} />
        </Grid>
      </Grid>
      {/* Footer */}
      {isSM && targetSelector}
      <ButtonGroup>
        {!isSM && targetSelector}
        <DropdownButton
          disabled={generatingBuilds || !characterKey}
          title={
            <Trans t={t} i18nKey="build" count={maxBuildsToShow}>
              {{ count: maxBuildsToShow }} Builds
            </Trans>
          }
        >
          <MenuItem>
            <Typography variant="caption" color="info.main">
              {t('buildDropdownDesc')}
            </Typography>
          </MenuItem>
          <Divider />
          {maxBuildsToShowList.map((v) => (
            <MenuItem
              key={v}
              onClick={() =>
                database.optConfigs.set(optConfigId, { maxBuildsToShow: v })
              }
            >
              <Trans t={t} i18nKey="build" count={v}>
                {{ count: v }} Builds
              </Trans>
            </MenuItem>
          ))}
        </DropdownButton>
        <DropdownButton
          disabled={generatingBuilds || !characterKey}
          sx={{ borderRadius: '4px 0px 0px 4px' }}
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
          <Divider />
          {range(1, defThreads)
            .reverse()
            .map((v) => (
              <MenuItem key={v} onClick={() => setMaxWorkers(v)}>
                <Trans t={t} i18nKey="thread" count={v}>
                  {{ count: v }} Threads
                </Trans>
              </MenuItem>
            ))}
        </DropdownButton>
        <BootstrapTooltip placement="top" title={t`notifyTooltip`}>
          <Button
            sx={{ borderRadius: 0 }}
            color="warning"
            onClick={() => setnotification((n) => !n)}
          >
            {notification ? (
              <NotificationsActiveIcon />
            ) : (
              <NotificationsOffIcon />
            )}
          </Button>
        </BootstrapTooltip>
        <BootstrapTooltip
          placement="top"
          title={!optimizationTarget ? t('selectTargetFirst') : ''}
        >
          <span>
            <Button
              disabled={
                !characterKey ||
                !optimizationTarget ||
                !optimizationTargetNode ||
                optimizationTargetNode.isEmpty
              }
              color={generatingBuilds ? 'error' : 'success'}
              onClick={
                generatingBuilds ? () => cancelToken.current() : generateBuilds
              }
              startIcon={generatingBuilds ? <Close /> : <TrendingUp />}
              sx={{ borderRadius: '0px 4px 4px 0px' }}
            >
              {generatingBuilds
                ? t('generateButton.cancel')
                : t('generateButton.generateBuilds')}
            </Button>
          </span>
        </BootstrapTooltip>
      </ButtonGroup>
      {!!characterKey && (
        <BuildAlert
          {...{ status: buildStatus, characterName, maxBuildsToShow }}
        />
      )}
      <Box>
        <ChartCard
          disabled={generatingBuilds || !optimizationTarget}
          plotBase={plotBase}
          setPlotBase={setPlotBase}
          showTooltip={!optimizationTarget}
        />
      </Box>
      <CardLight>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography sx={{ flexGrow: 1 }}>
              {builds ? (
                <span>
                  Showing{' '}
                  <strong>
                    {builds.length + (graphBuilds ? graphBuilds.length : 0)}
                  </strong>{' '}
                  build generated for {characterName}.{' '}
                  {!!buildDate && (
                    <span>
                      Build generated on:{' '}
                      <strong>{new Date(buildDate).toLocaleString()}</strong>
                    </span>
                  )}
                </span>
              ) : (
                <span>Select a character to generate builds.</span>
              )}
            </Typography>
            <Button
              disabled={!builds.length}
              color="error"
              onClick={() => {
                setGraphBuilds(undefined)
                database.optConfigs.set(optConfigId, {
                  builds: [],
                  buildDate: 0,
                })
              }}
            >
              Clear Builds
            </Button>
          </Box>
          <Grid container display="flex" spacing={1}>
            <Grid item>
              <HitModeToggle size="small" />
            </Grid>
            <Grid item>
              <ReactionToggle size="small" />
            </Grid>
            <Grid item flexGrow={1} />
            <Grid item>
              <CompareBtn />
            </Grid>
          </Grid>
        </CardContent>
      </CardLight>

      <OptimizationTargetContext.Provider value={optimizationTarget}>
        {graphBuilds && (
          <BuildList
            builds={graphBuilds}
            oldData={oldData}
            disabled={!!generatingBuilds}
            getLabel={getGraphBuildLabel}
            setBuilds={setGraphBuilds}
            mainStatAssumptionLevel={mainStatAssumptionLevel}
          />
        )}
        <BuildList
          builds={builds}
          oldData={oldData}
          disabled={!!generatingBuilds}
          getLabel={getNormBuildLabel}
          mainStatAssumptionLevel={mainStatAssumptionLevel}
        />
      </OptimizationTargetContext.Provider>
    </Box>
  )
}

function BuildList({
  builds,
  setBuilds,
  oldData,
  disabled,
  getLabel,
  mainStatAssumptionLevel,
}: {
  builds: string[][]
  setBuilds?: (builds: string[][] | undefined) => void
  oldData?: UIData
  disabled: boolean
  getLabel: (index: number) => Displayable
  mainStatAssumptionLevel: number
}) {
  const deleteBuild = useCallback(
    (index: number) => {
      if (setBuilds) {
        const builds_ = [...builds]
        builds_.splice(index, 1)
        setBuilds(builds_)
      }
    },
    [builds, setBuilds]
  )
  // retrive this value because inner calcs depends on this
  const teamCharacterContextValue = useContext(TeamCharacterContext)
  const {
    teamChar: { key: characterKey },
  } = teamCharacterContextValue
  // Memoize the build list because calculating/rendering the build list is actually very expensive, which will cause longer optimization times.
  const list = useMemo(
    () =>
      !!teamCharacterContextValue && (
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={600} />
          }
        >
          {builds?.map((build, index) => (
            <DataContextWrapper
              key={index + build.join()}
              characterKey={characterKey}
              build={build}
              oldData={oldData}
              mainStatAssumptionLevel={mainStatAssumptionLevel}
            >
              <BuildItemWrapper
                index={index}
                label={getLabel(index)}
                build={build}
                disabled={disabled}
                deleteBuild={setBuilds ? deleteBuild : undefined}
              />
            </DataContextWrapper>
          ))}
        </Suspense>
      ),
    [
      teamCharacterContextValue,
      builds,
      characterKey,
      oldData,
      disabled,
      getLabel,
      deleteBuild,
      setBuilds,
      mainStatAssumptionLevel,
    ]
  )
  return list
}
function BuildItemWrapper({
  index,
  label,
  build,
  disabled,
  deleteBuild,
}: {
  index: number
  label: Displayable
  build: string[]
  disabled: boolean
  deleteBuild?: (index: number) => void
}) {
  const { t } = useTranslation('page_character_optimize')

  return (
    <BuildDisplayItem
      label={label}
      disabled={disabled}
      extraButtonsLeft={
        <>
          <CopyTcButton build={build} />
          <CopyLoadoutButton build={build} />
          {deleteBuild && (
            <Button
              color="error"
              size="small"
              startIcon={<DeleteForever />}
              onClick={() => deleteBuild(index)}
            >
              {t('removeBuildButton')}
            </Button>
          )}
        </>
      }
    />
  )
}
function CopyTcButton({ build }: { build: string[] }) {
  const { t } = useTranslation('page_character_optimize')
  const [name, setName] = useState('')
  const [showTcPrompt, onShowTcPrompt, OnHideTcPrompt] = useBoolState()

  const database = useDatabase()
  const {
    teamCharId,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)

  const toTc = () => {
    const weaponTypeKey = getCharData(characterKey).weaponType
    const weapon = database.teamChars.getLoadoutWeapon(teamCharId)
    const buildTcId = database.teamChars.newBuildTcFromBuild(
      teamCharId,
      weaponTypeKey,
      weapon,
      build.map((id) => database.arts.get(id))
    )
    database.buildTcs.set(buildTcId, {
      name,
    })

    setName('')
    OnHideTcPrompt()
  }
  return (
    <>
      <Button
        color="info"
        size="small"
        startIcon={<Science />}
        onClick={onShowTcPrompt}
      >
        {t('theorycraftButton')}
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      {/* TODO: Translation */}
      <ModalWrapper open={showTcPrompt} onClose={OnHideTcPrompt}>
        <CardThemed>
          <CardHeader
            title="New Theorycraft Build"
            action={<CloseButton onClick={OnHideTcPrompt} />}
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Copy over this build to a new TC Build</Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              margin="dense"
              label="TC Loadout Name"
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={OnHideTcPrompt}>Cancel</Button>
              <Button color="success" disabled={!name} onClick={toTc}>
                Create
              </Button>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
function CopyLoadoutButton({ build }: { build: string[] }) {
  const [name, setName] = useState('')
  const [showTcPrompt, onShowTcPrompt, OnHideTcPrompt] = useBoolState()

  const database = useDatabase()
  const { teamCharId } = useContext(TeamCharacterContext)

  const toLoadout = () => {
    const weapon = database.teamChars.getLoadoutWeapon(teamCharId)
    const artifactIds = objKeyMap(allArtifactSlotKeys, () => undefined)
    build.forEach((id) => {
      const art = database.arts.get(id)
      artifactIds[art.slotKey] = id
    })
    database.teamChars.newBuild(teamCharId, {
      name,
      weaponId: weapon.id,
      artifactIds,
    })

    setName('')
    OnHideTcPrompt()
  }
  return (
    <>
      <Button
        color="info"
        size="small"
        startIcon={<CheckroomIcon />}
        onClick={onShowTcPrompt}
      >
        Loadout
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      {/* TODO: Translation */}
      <ModalWrapper open={showTcPrompt} onClose={OnHideTcPrompt}>
        <CardThemed>
          <CardHeader
            title="New Build Loadout"
            action={<CloseButton onClick={OnHideTcPrompt} />}
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Copy over this build to a new Loadout Build</Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              margin="dense"
              label="Loadout Name"
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={OnHideTcPrompt}>Cancel</Button>
              <Button color="success" disabled={!name} onClick={toLoadout}>
                Create
              </Button>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

type Prop = {
  children: React.ReactNode
  characterKey: CharacterKey
  build: string[]
  oldData: UIData
  mainStatAssumptionLevel: number
}
function DataContextWrapper({
  children,
  characterKey,
  build,
  oldData,
  mainStatAssumptionLevel,
}: Prop) {
  const database = useDatabase()
  // Update the build when the build artifacts are changed.
  const [dirty, setDirty] = useForceUpdate()
  useEffect(
    () => database.arts.followAny((id) => build.includes(id) && setDirty()),
    [database, build, setDirty]
  )
  const buildsArts = useMemo(
    () =>
      dirty &&
      (build
        .map((i) => database.arts.get(i))
        .filter((a) => a) as ICachedArtifact[]),
    [dirty, build, database]
  )
  const teamData = useTeamData(mainStatAssumptionLevel, buildsArts)
  const providerValue = useMemo(() => {
    const tdc = teamData?.[characterKey]
    if (!tdc) return undefined
    return { data: tdc.target, teamData, oldData }
  }, [teamData, oldData, characterKey])
  if (!providerValue) return null
  return (
    <DataContext.Provider value={providerValue}>
      {children}
    </DataContext.Provider>
  )
}
