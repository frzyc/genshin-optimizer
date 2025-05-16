import { AdResponsive } from '@genshin-optimizer/common/ad'
import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  DropdownButton,
  InfoTooltip,
  ModalWrapper,
  SqBadge,
  useConstObj,
} from '@genshin-optimizer/common/ui'
import {
  bulkCatTotal,
  notEmpty,
  objKeyMap,
  objPathValue,
  range,
} from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { GeneratedBuild, ICachedArtifact } from '@genshin-optimizer/gi/db'
import { maxBuildsToShowList } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
  useGeneratedBuildList,
  useOptConfig,
  useTeammateArtifactIds,
} from '@genshin-optimizer/gi/db-ui'
import type { OptProblemInput } from '@genshin-optimizer/gi/solver'
import { GOSolver, mergeBuilds, mergePlot } from '@genshin-optimizer/gi/solver'
import { compactArtifacts } from '@genshin-optimizer/gi/solver-tc'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import {
  ArtifactLevelSlider,
  BuildDisplayItem,
  CharacterName,
  DataContext,
  GOAdWrapper,
  GraphContext,
  HitModeToggle,
  NoArtWarning,
  ReactionToggle,
  getTeamData,
  resolveInfo,
  statFilterToNumNode,
  useGlobalError,
  useNumWorkers,
  useTeamData,
} from '@genshin-optimizer/gi/ui'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import { uiDataForTeam } from '@genshin-optimizer/gi/uidata'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { dynamicData, mergeData, optimize } from '@genshin-optimizer/gi/wr'
import {
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  DeleteForever,
  Science,
  TrendingUp,
} from '@mui/icons-material'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
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
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEventHandler, ReactNode } from 'react'
import React, {
  Suspense,
  memo,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import useCompareData from '../../../useCompareData'
import CompareBtn from '../../CompareBtn'
import { CustomMultiTargetButton } from '../../CustomMultiTarget/CustomMultiTargetButton'
import ArtifactSetConfig from './Components/ArtifactSetConfig'
import AssumeFullLevelToggle from './Components/AssumeFullLevelToggle'
import BonusStatsCard from './Components/BonusStatsCard'
import type { BuildStatus } from './Components/BuildAlert'
import BuildAlert from './Components/BuildAlert'
import ChartCard from './Components/ChartCard'
import ExcludeArt from './Components/ExcludeArt'
import MainStatSelectionCard from './Components/MainStatSelectionCard'
import { OptCharacterCard } from './Components/OptCharacterCard'
import OptimizationTargetSelector from './Components/OptimizationTargetSelector'
import StatFilterCard from './Components/StatFilterCard'
import UseEquipped from './Components/UseEquipped'
import { UseTeammateArt } from './Components/UseTeammateArt'
import ScalesWith from './ScalesWith'

const audio = new Audio('assets/notification.mp3')
export default function TabBuild() {
  const { t } = useTranslation('page_character_optimize')
  const {
    loadoutDatum,
    teamCharId,
    teamChar: { optConfigId, key: characterKey },
    teamId,
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { setChartData, graphBuilds, setGraphBuilds } = useContext(GraphContext)
  const { gender } = useDBMeta()

  const activeCharKey = database.teams.getActiveTeamChar(teamId)!.key

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
    testedPerSecond: 0,
    skippedPerSecond: 0,
  } as BuildStatus)
  const generatingBuilds = buildStatus.type !== 'inactive'

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const [maxWorkers, nativeThreads, setMaxWorkers] = useNumWorkers()

  // Clear state when changing characters
  useEffect(() => {
    setBuildStatus({
      type: 'inactive',
      tested: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      testedPerSecond: 0,
      skippedPerSecond: 0,
    })
  }, [characterKey])

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const buildSetting = useOptConfig(optConfigId)!
  const {
    plotBase,
    optimizationTarget: optimizationTargetDb,
    mainStatAssumptionLevel,
    allowPartial,
    maxBuildsToShow,
    levelLow,
    levelHigh,
    generatedBuildListId,
    useTeammateBuild,
  } = buildSetting
  const { builds: buildsDb, buildDate } = useGeneratedBuildList(
    generatedBuildListId ?? ''
  ) ?? { builds: [] as GeneratedBuild[] }

  const builds = useConstObj(buildsDb)
  const optimizationTarget = useConstObj(optimizationTargetDb)
  const { data } = useContext(DataContext)
  const compareData = useCompareData()
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
  const teammateArtifactIds = useTeammateArtifactIds()
  const filteredArts = useMemo(() => {
    const {
      mainStatKeys,
      excludedLocations,
      artExclusion,
      levelLow,
      levelHigh,
      useExcludedArts,
      useTeammateBuild,
    } = deferredArtsDirty && deferredBuildSetting

    return database.arts.values.filter((art) => {
      if (!useExcludedArts && artExclusion.includes(art.id)) return false
      if (!useTeammateBuild && teammateArtifactIds.includes(art.id))
        return false
      if (art.level < levelLow) return false
      if (art.level > levelHigh) return false
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
  }, [
    deferredArtsDirty,
    deferredBuildSetting,
    database,
    teammateArtifactIds,
    characterKey,
  ])

  const filteredArtIdMap = useMemo(
    () =>
      objKeyMap(
        filteredArts.map(({ id }) => id),
        (_) => true
      ),
    [filteredArts]
  )
  const { levelTotal, allowListTotal, excludedTotal, teammateBuildTotal } =
    useMemo(() => {
      const catKeys = {
        levelTotal: ['in'],
        allowListTotal: ['in'],
        excludedTotal: ['in'],
        teammateBuildTotal: ['in'],
      } as const
      return bulkCatTotal(catKeys, (ctMap) =>
        database.arts.entries.forEach(([id, art]) => {
          const { level, location } = art
          const { levelLow, levelHigh, excludedLocations, artExclusion } =
            deferredArtsDirty && deferredBuildSetting
          if (level >= levelLow && level <= levelHigh) {
            ctMap['levelTotal']['in'].total++
            if (filteredArtIdMap[id]) ctMap['levelTotal']['in'].current++
          }
          const locKey = charKeyToLocCharKey(characterKey)
          if (
            location &&
            location !== locKey &&
            !excludedLocations.includes(location)
          ) {
            ctMap['allowListTotal']['in'].total++
            if (filteredArtIdMap[id]) ctMap['allowListTotal']['in'].current++
          }
          if (artExclusion.includes(id)) {
            ctMap['excludedTotal']['in'].total++
            if (filteredArtIdMap[id]) ctMap['excludedTotal']['in'].current++
          }
          if (teammateArtifactIds.includes(id)) {
            ctMap['teammateBuildTotal']['in'].total++
            if (filteredArtIdMap[id])
              ctMap['teammateBuildTotal']['in'].current++
          }
        })
      )
    }, [
      characterKey,
      database,
      deferredArtsDirty,
      deferredBuildSetting,
      filteredArtIdMap,
      teammateArtifactIds,
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
    const workerData = uiDataForTeam(teamData.teamData, gender, activeCharKey)[
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
    const valueFilter = statFilterToNumNode(workerData, statFilters)

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
      testedPerSecond: 0,
      skippedPerSecond: 0,
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
      const weaponId = database.teams.getLoadoutWeapon(loadoutDatum).id
      if (plotBaseNumNode) {
        const plotData = mergePlot(results.map((x) => x.plotData!))
        const solverBuilds = Object.values(plotData)
        const targetNodeinfo = targetNode.info && resolveInfo(targetNode.info)
        const plotBaseNumNodeInfo =
          plotBaseNumNode.info && resolveInfo(plotBaseNumNode.info)
        if (targetNodeinfo?.unit === '%')
          solverBuilds.forEach(
            (dataEntry) =>
              dataEntry && (dataEntry.value = dataEntry.value * 100)
          )
        if (plotBaseNumNodeInfo?.unit === '%')
          solverBuilds.forEach(
            (dataEntry) =>
              dataEntry && (dataEntry.plot = (dataEntry.plot ?? 0) * 100)
          )
        setChartData({
          valueNode: targetNode,
          plotNode: plotBaseNumNode,
          data: solverBuilds
            .filter(notEmpty)
            .map(({ value, plot, artifactIds }) => ({
              artifactIds: objKeyMap(allArtifactSlotKeys, (slotKey) =>
                artifactIds.find(
                  (aId) => database.arts.get(aId)?.slotKey === slotKey
                )
              ),
              weaponId,
              value,
              plot,
            })),
        })
      }
      const builds = mergeBuilds(
        results.map((x) => x.builds),
        maxBuildsToShow
      )
      if (process.env['NODE_ENV'] === 'development')
        console.log('Build Result', builds)

      database.optConfigs.newOrSetGeneratedBuildList(optConfigId, {
        builds: builds.map((build) => ({
          artifactIds: objKeyMap(allArtifactSlotKeys, (slotKey) =>
            build.artifactIds.find(
              (aId) => database.arts.get(aId)?.slotKey === slotKey
            )
          ),
          weaponId,
        })),
        buildDate: Date.now(),
      })

      setTimeout(() => {
        // Using a ref because a user can cancel the notification while the build is going.
        if (results && notificationRef.current) {
          audio.play()
          if (!tabFocused.current)
            setTimeout(() => window.alert(t('buildCompleted')), 1)
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
    buildSetting,
    characterKey,
    filteredArts,
    database,
    teamId,
    teamCharId,
    gender,
    activeCharKey,
    setChartData,
    maxWorkers,
    loadoutDatum,
    optConfigId,
    t,
    throwGlobalError,
  ])

  const characterName = (
    <CharacterName characterKey={characterKey} gender={gender} />
  )

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
      targetSelectorModalProps={{
        excludeSections: ['character', 'bonusStats', 'teamBuff'],
      }}
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

  const buildShowingCount =
    builds.length + (graphBuilds ? graphBuilds.length : 0)

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
          {/* Level Filter */}
          <LevelFilter
            levelTotal={levelTotal['in']}
            levelLow={levelLow}
            levelHigh={levelHigh}
            disabled={generatingBuilds}
            optConfigId={optConfigId}
          />

          {/* Main Stat Filters */}
          <CardThemed bgt="light">
            <CardContent>
              <Typography sx={{ fontWeight: 'bold' }}>
                {t('mainStat.title')}
              </Typography>
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
                      <Typography variant="h6">
                        {t('mainStat.levelAssTooltip.title')}
                      </Typography>
                      <Typography>
                        {t('mainStat.levelAssTooltip.desc')}
                      </Typography>
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
          </CardThemed>

          {/* use excluded */}
          <ExcludeArt
            disabled={generatingBuilds}
            excludedTotal={excludedTotal['in']}
          />
          <UseTeammateArt
            totalTally={teammateBuildTotal['in']}
            useTeammateBuild={useTeammateBuild}
            disabled={generatingBuilds}
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
            {t('allowPartial')}
          </Button>
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

          {/* use equipped */}
          <UseEquipped
            disabled={generatingBuilds}
            allowListTotal={allowListTotal['in']}
          />

          {/*Minimum Final Stat Filter */}
          <StatFilterCard disabled={generatingBuilds} />
          <AdResponsive dataAdSlot="7724855772" bgt="light" Ad={GOAdWrapper} />
        </Grid>
      </Grid>
      {/* Footer */}
      {isSM && targetSelector}
      <ButtonGroup>
        {!isSM && targetSelector}
        <DropdownButton
          disabled={generatingBuilds || !characterKey || !optimizationTarget}
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
          disabled={generatingBuilds || !characterKey || !optimizationTarget}
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
          {range(1, nativeThreads)
            .reverse()
            .map((v) => (
              <MenuItem key={v} onClick={() => setMaxWorkers(v)}>
                <Trans t={t} i18nKey="thread" count={v}>
                  {{ count: v }} Threads
                </Trans>
              </MenuItem>
            ))}
        </DropdownButton>
        <BootstrapTooltip placement="top" title={t('notifyTooltip')}>
          <Box>
            <Button
              sx={{ borderRadius: 0 }}
              color="warning"
              onClick={() => setnotification((n) => !n)}
              disabled={!optimizationTarget}
            >
              {notification ? (
                <NotificationsActiveIcon />
              ) : (
                <NotificationsOffIcon />
              )}
            </Button>
          </Box>
        </BootstrapTooltip>
        <BootstrapTooltip
          placement="top"
          title={!optimizationTarget ? t('selectTargetFirst') : ''}
        >
          <span>
            <Button
              disabled={
                !characterKey || !optimizationTarget || !optimizationTargetNode
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
      <ScalesWith />
      {!!characterKey && (
        <BuildAlert
          {...{ status: buildStatus, characterName, maxBuildsToShow }}
        />
      )}
      {optimizationTarget && (
        <Box>
          <ChartCard
            disabled={generatingBuilds || !optimizationTarget}
            plotBase={plotBase}
            setPlotBase={setPlotBase}
            showTooltip={!optimizationTarget}
          />
        </Box>
      )}
      {optimizationTarget && (
        <CardThemed bgt="light">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography sx={{ flexGrow: 1 }}>
                {builds ? (
                  <span>
                    <Trans
                      t={t}
                      i18nKey="buildShowingNum"
                      count={buildShowingCount}
                    >
                      Showing{' '}
                      <strong>{{ count: buildShowingCount } as any}</strong>{' '}
                      build generated for{' '}
                      <CharacterName
                        characterKey={characterKey}
                        gender={gender}
                      />
                      .
                    </Trans>{' '}
                    {!!buildDate && (
                      <span>
                        {t('generatedOn')}
                        <strong>{new Date(buildDate).toLocaleString()}</strong>
                      </span>
                    )}
                  </span>
                ) : (
                  <span>{t('selectChar')}</span>
                )}
              </Typography>
              <Button
                disabled={!builds.length}
                color="error"
                onClick={() => {
                  setGraphBuilds(undefined)
                  database.optConfigs.newOrSetGeneratedBuildList(optConfigId, {
                    builds: [],
                    buildDate: 0,
                  })
                }}
              >
                {t('clearBuildsBtn')}
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
        </CardThemed>
      )}

      {graphBuilds && (
        <BuildList
          builds={graphBuilds}
          compareData={compareData}
          disabled={!!generatingBuilds}
          getLabel={getGraphBuildLabel}
          setBuilds={setGraphBuilds}
          mainStatAssumptionLevel={mainStatAssumptionLevel}
        />
      )}
      <BuildList
        builds={builds}
        compareData={compareData}
        disabled={!!generatingBuilds}
        getLabel={getNormBuildLabel}
        mainStatAssumptionLevel={mainStatAssumptionLevel}
      />
    </Box>
  )
}

const LevelFilter = memo(function LevelFilter({
  levelTotal,
  levelLow,
  levelHigh,
  disabled,
  optConfigId,
}: {
  levelTotal: string
  levelLow: number
  levelHigh: number
  disabled: boolean
  optConfigId: string
}) {
  const database = useDatabase()
  const { t } = useTranslation('page_character_optimize')
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', gap: 1 }}>
        <Typography sx={{ fontWeight: 'bold' }}>{t('levelFilter')}</Typography>
        <SqBadge color="info">{levelTotal}</SqBadge>
      </CardContent>
      <Divider />
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
        disabled={disabled}
      />
    </CardThemed>
  )
})

const BuildList = memo(function BuildList({
  builds,
  setBuilds,
  compareData,
  disabled,
  getLabel,
  mainStatAssumptionLevel,
}: {
  builds: GeneratedBuild[]
  setBuilds?: (builds: GeneratedBuild[] | undefined) => void
  compareData?: UIData
  disabled: boolean
  getLabel: (index: number) => ReactNode
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
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={600} />}
    >
      {builds?.map((build, index) => (
        <DataContextWrapper
          key={index + Object.values(build.artifactIds).join()}
          characterKey={characterKey}
          build={build}
          compareData={compareData}
          mainStatAssumptionLevel={mainStatAssumptionLevel}
        >
          <BuildItemWrapper
            index={index}
            label={getLabel(index)}
            build={build}
            disabled={disabled}
            deleteBuild={setBuilds ? deleteBuild : undefined}
            mainStatAssumptionLevel={mainStatAssumptionLevel}
          />
        </DataContextWrapper>
      ))}
    </Suspense>
  )
})
const BuildItemWrapper = memo(function BuildItemWrapper({
  index,
  label,
  build,
  disabled,
  deleteBuild,
  mainStatAssumptionLevel,
}: {
  index: number
  label: ReactNode
  build: GeneratedBuild
  disabled: boolean
  deleteBuild?: (index: number) => void
  mainStatAssumptionLevel: number
}) {
  const { t } = useTranslation('page_character_optimize')
  const extraButtonsLeft = useMemo(() => {
    return (
      <>
        <CopyTcButton build={build} />
        <CopyBuildButton build={build} />
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
    )
  }, [build, deleteBuild, index, t])
  return (
    <BuildDisplayItem
      label={label}
      disabled={disabled}
      extraButtonsLeft={extraButtonsLeft}
      mainStatAssumptionLevel={mainStatAssumptionLevel}
    />
  )
})
function CopyTcButton({ build }: { build: GeneratedBuild }) {
  const { t } = useTranslation('build')
  const [name, setName] = useState('')
  const [showTcPrompt, onShowTcPrompt, OnHideTcPrompt] = useBoolState()

  const database = useDatabase()
  const {
    teamCharId,
    loadoutDatum,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)

  const toTc = () => {
    const weaponTypeKey = getCharStat(characterKey).weaponType
    const weapon = database.teams.getLoadoutWeapon(loadoutDatum)
    const buildTcId = database.teamChars.newBuildTcFromBuild(
      teamCharId,
      weaponTypeKey,
      weapon,
      Object.values(build.artifactIds).map((id) => database.arts.get(id))
    )
    if (buildTcId)
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
        {t('createBuildTc.button')}
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      <ModalWrapper open={showTcPrompt} onClose={OnHideTcPrompt}>
        <CardThemed>
          <CardHeader
            title={t('createBuildTc.title')}
            action={
              <IconButton onClick={OnHideTcPrompt}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>{t('createBuildTc.desc')}</Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              margin="dense"
              label={t('createBuildTc.label')}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={OnHideTcPrompt}>
                {t('createBuildTc.cancel')}
              </Button>
              <Button color="success" disabled={!name} onClick={toTc}>
                {t('createBuildTc.create')}
              </Button>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
function CopyBuildButton({
  build: { artifactIds, weaponId },
}: {
  build: GeneratedBuild
}) {
  const { t } = useTranslation('build')
  const [name, setName] = useState('')
  const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()

  const database = useDatabase()
  const { teamCharId } = useContext(TeamCharacterContext)

  const toLoadout: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    database.teamChars.newBuild(teamCharId, {
      name,
      artifactIds,
      weaponId,
    })

    setName('')
    OnHidePrompt()
  }
  return (
    <>
      <Button
        color="info"
        size="small"
        startIcon={<CheckroomIcon />}
        onClick={onShowPrompt}
      >
        {t('createBuildReal.button')}
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      <ModalWrapper
        open={showPrompt}
        onClose={OnHidePrompt}
        disableRestoreFocus
      >
        <CardThemed>
          <CardHeader
            title={t('createBuildReal.title')}
            action={
              <IconButton onClick={OnHidePrompt}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>{t('createBuildReal.desc')}</Typography>
            <form onSubmit={toLoadout}>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                margin="dense"
                label={t('createBuildReal.label')}
                fullWidth
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={OnHidePrompt}>
                  {t('createBuildReal.cancel')}
                </Button>
                <Button type="submit" color="success" disabled={!name}>
                  {t('createBuildReal.create')}
                </Button>
              </Box>
            </form>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}

type Prop = {
  children: React.ReactNode
  characterKey: CharacterKey
  build: GeneratedBuild
  compareData?: UIData
  mainStatAssumptionLevel: number
}
const DataContextWrapper = memo(function DataContextWrapper({
  children,
  characterKey,
  build,
  compareData,
  mainStatAssumptionLevel,
}: Prop) {
  const { artifactIds, weaponId } = build
  const database = useDatabase()
  // Update the build when the build artifacts/weapons are changed.
  const [dirty, setDirty] = useForceUpdate()
  useEffect(() => {
    const unfollowArts = Object.values(artifactIds)
      .filter(notEmpty)
      .map((id) => database.arts.follow(id, () => setDirty()))
    return () => {
      unfollowArts.forEach((unfollow) => unfollow())
    }
  }, [database, artifactIds, setDirty])
  useEffect(
    () =>
      weaponId ? database.weapons.follow(weaponId, () => setDirty()) : () => {},
    [database, weaponId, setDirty]
  )
  const buildsArts = useMemo(
    () =>
      dirty &&
      (Object.values(artifactIds)
        .map((i) => database.arts.get(i))
        .filter((a) => a) as ICachedArtifact[]),
    [dirty, artifactIds, database]
  )
  const buildWeapon = useMemo(
    () => dirty && database.weapons.get(weaponId),
    [dirty, weaponId, database]
  )
  const teamData = useTeamData(mainStatAssumptionLevel, buildsArts, buildWeapon)
  const providerValue = useMemo(() => {
    const tdc = teamData?.[characterKey]
    if (!tdc) return undefined
    return { data: tdc.target, teamData, compareData }
  }, [teamData, compareData, characterKey])
  if (!providerValue) return null
  return (
    <DataContext.Provider value={providerValue}>
      {children}
    </DataContext.Provider>
  )
})
