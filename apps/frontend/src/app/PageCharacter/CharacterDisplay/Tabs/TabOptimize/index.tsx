import { CharacterKey, charKeyToLocCharKey, LocationCharacterKey } from '@genshin-optimizer/consts';
import { CheckBox, CheckBoxOutlineBlank, Close, DeleteForever, Science, TrendingUp } from '@mui/icons-material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import ArtifactLevelSlider from '../../../../Components/Artifact/ArtifactLevelSlider';
import BootstrapTooltip from '../../../../Components/BootstrapTooltip';
import CardLight from '../../../../Components/Card/CardLight';
import CharacterCard from '../../../../Components/Character/CharacterCard';
import DropdownButton from '../../../../Components/DropdownMenu/DropdownButton';
import { HitModeToggle, ReactionToggle } from '../../../../Components/HitModeEditor';
import InfoTooltip from '../../../../Components/InfoTooltip';
import SolidToggleButtonGroup from '../../../../Components/SolidToggleButtonGroup';
import SqBadge from '../../../../Components/SqBadge';
import { CharacterContext } from '../../../../Context/CharacterContext';
import { DataContext, dataContextObj } from '../../../../Context/DataContext';
import { GraphContext } from '../../../../Context/GraphContext';
import { OptimizationTargetContext } from '../../../../Context/OptimizationTargetContext';
import { DatabaseContext } from '../../../../Database/Database';
import { defThreads } from '../../../../Database/DataEntries/DisplayOptimizeEntry';
import { mergeData, uiDataForTeam } from '../../../../Formula/api';
import { optimize } from '../../../../Formula/optimization';
import { NumNode } from '../../../../Formula/type';
import { UIData } from '../../../../Formula/uiData';
import useCharacterReducer from '../../../../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../../../../ReactHooks/useCharSelectionCallback';
import useDBMeta from '../../../../ReactHooks/useDBMeta';
import useForceUpdate from '../../../../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../../../../ReactHooks/useMediaQueryUp';
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData';
import { OptProblemInput } from '../../../../Solver';
import { Build, mergeBuilds, mergePlot } from '../../../../Solver/common';
import { GOSolver } from '../../../../Solver/GOSolver/GOSolver';
import { objectKeyMap, objPathValue, range } from '../../../../Util/Util';
import { maxBuildsToShowList } from './Build';
import ArtifactSetConfig from './Components/ArtifactSetConfig';
import AssumeFullLevelToggle from './Components/AssumeFullLevelToggle';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { BuildStatus } from './Components/BuildAlert';
import BuildDisplayItem from './Components/BuildDisplayItem';
import ChartCard from './Components/ChartCard';
import MainStatSelectionCard from './Components/MainStatSelectionCard';
import OptimizationTargetSelector from './Components/OptimizationTargetSelector';
import StatFilterCard from './Components/StatFilterCard';
import UseEquipped from './Components/UseEquipped';
import UseExcluded from './Components/UseExcluded';
import WorkerErr from './Components/WorkerErr';
import { compactArtifacts, dynamicData } from './foreground';
import useBuildResult from './useBuildResult';
import useBuildSetting from './useBuildSetting';

const audio = new Audio("notification.mp3")
export default function TabBuild() {
  const { t } = useTranslation("page_character_optimize")
  const { character: { key: characterKey, compareData } } = useContext(CharacterContext)
  const { database } = useContext(DatabaseContext)
  const { setChartData, graphBuilds, setGraphBuilds } = useContext(GraphContext)
  const { gender } = useDBMeta()

  const [notification, setnotification] = useState(false)
  const notificationRef = useRef(false)
  useEffect(() => { notificationRef.current = notification }, [notification])


  const [buildStatus, setBuildStatus] = useState({ type: "inactive", tested: 0, failed: 0, skipped: 0, total: 0 } as BuildStatus)
  const generatingBuilds = buildStatus.type !== "inactive"

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const [{ equipmentPriority, threads = defThreads }, setDisplayOptimize] = useState(database.displayOptimize.get())
  useEffect(() => database.displayOptimize.follow((_r, to) => setDisplayOptimize(to)), [database, setDisplayOptimize])

  const maxWorkers = threads > defThreads ? defThreads : threads
  const setMaxWorkers = useCallback((threads: number) => database.displayOptimize.set({ threads }), [database],)

  const characterDispatch = useCharacterReducer(characterKey)
  const onClickTeammate = useCharSelectionCallback()

  // Clear state when changing characters
  useEffect(() => {
    setBuildStatus({ type: "inactive", tested: 0, failed: 0, skipped: 0, total: 0 })
  }, [characterKey])

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey)
  const { plotBase, optimizationTarget, mainStatAssumptionLevel, allowPartial, maxBuildsToShow, levelLow, levelHigh } = buildSetting
  const { buildResult: { builds, buildDate }, buildResultDispatch } = useBuildResult(characterKey)
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}
  const optimizationTargetNode = optimizationTarget && objPathValue(data?.getDisplay(), optimizationTarget)
  const isSM = ["xs", "sm"].includes(useMediaQueryUp())

  //register changes in artifact database
  useEffect(() =>
    database.arts.followAny(setArtsDirty),
    [setArtsDirty, database])

  const deferredArtsDirty = useDeferredValue(artsDirty)
  const deferredBuildSetting = useDeferredValue(buildSetting)
  const { filteredArts, numExcludedUsed, numEquippedUsed } = useMemo(() => {
    const { mainStatKeys, useExcludedArts, useEquippedArts, levelLow, levelHigh } = deferredArtsDirty && deferredBuildSetting
    const cantTakeList: Set<LocationCharacterKey> = new Set()
    if (useEquippedArts) {
      const index = equipmentPriority.indexOf(characterKey)
      if (index < 0) equipmentPriority.forEach(ek => cantTakeList.add(charKeyToLocCharKey(ek)))
      else equipmentPriority.slice(0, index).forEach(ek => cantTakeList.add(charKeyToLocCharKey(ek)))
    }
    let numExcludedUsed = 0, numEquippedUsed = 0
    const filteredArts = database.arts.values.filter(art => {
      if (art.level < levelLow) return false
      if (art.level > levelHigh) return false
      const mainStats = mainStatKeys[art.slotKey]
      if (mainStats?.length && !mainStats.includes(art.mainStatKey)) return false

      // If its equipped on the selected character, bypass the check
      const locKey = charKeyToLocCharKey(characterKey)
      if (art.location !== locKey) {
        if (art.location && !useEquippedArts) return false
        if (art.location && useEquippedArts && cantTakeList.has(art.location)) return false
      }

      if (art.exclude) {
        numExcludedUsed++
        if (!useExcludedArts) return false
      }

      if (art.location && art.location !== locKey) numEquippedUsed++
      return true
    })

    return { filteredArts, numExcludedUsed, numEquippedUsed }
  }, [database, characterKey, equipmentPriority, deferredArtsDirty, deferredBuildSetting])

  const filteredArtIdMap = useMemo(() => objectKeyMap(filteredArts.map(({ id }) => id), _ => true), [filteredArts])
  const levelTotal = useMemo(() => {
    const { levelLow, levelHigh } = deferredBuildSetting
    let total = 0, current = 0
    Object.entries(database.arts.data).forEach(([id, art]) => {
      if (art.level >= levelLow && art.level <= levelHigh) {
        total++
        if (filteredArtIdMap[id]) current++
      }
    })
    return `${current}/${total}`
  }, [deferredBuildSetting, filteredArtIdMap, database])

  const tabFocused = useRef(true)
  useEffect(() => {
    const onFocus = () => tabFocused.current = true
    const onBlur = () => tabFocused.current = false
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [tabFocused])

  // Provides a function to cancel the work
  const cancelToken = useRef(() => { })
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])
  const [workerErr, setWorkerErr] = useState(false)
  const generateBuilds = useCallback(async () => {
    const { artSetExclusion, plotBase, statFilters, optimizationTarget, mainStatAssumptionLevel, allowPartial, maxBuildsToShow } = buildSetting
    if (!characterKey || !optimizationTarget) return

    const split = compactArtifacts(filteredArts, mainStatAssumptionLevel, allowPartial)

    const teamData = getTeamData(database, characterKey, mainStatAssumptionLevel, [])
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, gender, characterKey)[characterKey]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const unoptimizedOptimizationTargetNode = objPathValue(workerData.display ?? {}, optimizationTarget) as NumNode | undefined
    if (!unoptimizedOptimizationTargetNode) return
    const targetNode = unoptimizedOptimizationTargetNode
    const valueFilter: { value: NumNode, minimum: number }[] = Object.entries(statFilters)
      .flatMap(([pathStr, settings]) =>
        settings
          .filter(setting => !setting.disabled)
          .map(setting => {
            const filterNode: NumNode = objPathValue(workerData.display ?? {}, JSON.parse(pathStr))
            const minimum = filterNode.info?.unit === "%" ? setting.value / 100 : setting.value // TODO: Conversion
            return { value: filterNode, minimum: minimum }
          })
      )
      .filter(x => x.value && x.minimum > -Infinity)

    setChartData(undefined)

    const cancelled = new Promise<void>(r => cancelToken.current = r)
    setWorkerErr(false)

    const unoptimizedNodes = [...valueFilter.map(x => x.value), unoptimizedOptimizationTargetNode]
    const minimum = [...valueFilter.map(x => x.minimum), -Infinity]
    const plotBaseNumNode: NumNode = plotBase && objPathValue(workerData.display ?? {}, plotBase)
    if (plotBaseNumNode) {
      unoptimizedNodes.push(plotBaseNumNode)
      minimum.push(-Infinity)
    }

    const nodes = optimize(unoptimizedNodes, workerData, ({ path: [p] }) => p !== "dyn")
    const plotBaseNode = plotBaseNumNode ? nodes.pop() : undefined
    const optimizationTargetNode = nodes.pop()!

    const problem: OptProblemInput = {
      arts: split, optimizationTarget: optimizationTargetNode,
      exclusion: artSetExclusion, constraints: nodes.map((value, i) => ({ value, min: minimum[i] })),

      topN: maxBuildsToShow, plotBase: plotBaseNode
    }
    const status: Omit<BuildStatus, 'type'> = { tested: 0, failed: 0, skipped: 0, total: 0, startTime: performance.now() }
    const statusUpdateTimer = setInterval(() => setBuildStatus({ type: "active", ...status }), 100)

    const cancellationError = new Error()
    try {
      const solver = new GOSolver(problem, status, maxWorkers)
      cancelled.then(() => solver.cancel(cancellationError))

      const results = await solver.solve()
      solver.cancel() // Done using `solver`

      cancelToken.current = () => { }

      if (plotBaseNumNode) {
        const plotData = mergePlot(results.map(x => x.plotData!))
        let data = Object.values(plotData)
        if (targetNode.info?.unit === "%")
          data = data.map(({ value, plot, artifactIds }) => ({ value: value * 100, plot, artifactIds })) as Build[]
        if (plotBaseNumNode.info?.unit === "%")
          data = data.map(({ value, plot, artifactIds }) => ({ value, plot: (plot ?? 0) * 100, artifactIds })) as Build[]
        setChartData({
          valueNode: targetNode,
          plotNode: plotBaseNumNode,
          data
        })
      }
      const builds = mergeBuilds(results.map(x => x.builds), maxBuildsToShow)
      if (process.env.NODE_ENV === "development") console.log("Build Result", builds)

      buildResultDispatch({ builds: builds.map(build => build.artifactIds), buildDate: Date.now() })

      setTimeout(() => {
        // Using a ref because a user can cancel the notification while the build is going.
        if (results && notificationRef.current) {
          audio.play()
          if (!tabFocused.current) setTimeout(() => window.alert(t`buildCompleted`), 1)
        }
      }, 100)
    } catch (e) {
      // Worker error, cancelled, printer catches on fire, etc.
      if (e !== cancellationError) {
        console.log('Failed to load worker')
        console.log(e)
        setWorkerErr(true)
      }

      cancelToken.current()
      status.tested = 0
      status.failed = 0
      status.skipped = 0
      status.total = 0
    } finally {
      clearInterval(statusUpdateTimer)
      setBuildStatus({ type: "inactive", ...status, finishTime: performance.now() })
    }
  }, [t, characterKey, filteredArts, database, buildResultDispatch, maxWorkers, buildSetting, notificationRef, setChartData, gender])

  const characterName = characterSheet?.name ?? "Character Name"

  const setPlotBase = useCallback((plotBase: string[] | undefined) => {
    buildSettingDispatch({ plotBase })
    setChartData(undefined)
  }, [buildSettingDispatch, setChartData])
  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && teamData && { data, teamData }
  }, [data, teamData])

  const targetSelector = <OptimizationTargetSelector
    optimizationTarget={optimizationTarget}
    setTarget={target => buildSettingDispatch({ optimizationTarget: target })}
    disabled={!!generatingBuilds}
  />

  const getGraphBuildLabel = useCallback((index: number) => <Trans t={t} i18nKey="graphBuildLabel" count={index + 1}>Graph #{{ count: index + 1 }}</Trans>, [t])
  const getNormBuildLabel = useCallback((index: number) => `#${index + 1}`, [])
  return <Box display="flex" flexDirection="column" gap={1}>
    {noArtifact && <Alert severity="warning" variant="filled"><Trans t={t} i18nKey="noArtis">Oops! It looks like you haven't added any artifacts to GO yet! You should go to the <Link component={RouterLink} to="/artifacts">Artifacts</Link> page and add some!</Trans></Alert>}
    {/* Build Generator Editor */}
    {dataContext && <DataContext.Provider value={dataContext}>

      <Grid container spacing={1} >
        {/* 1*/}
        <Grid item xs={12} sm={6} lg={3} display="flex" flexDirection="column" gap={1}>
          {/* character card */}
          <Box><CharacterCard characterKey={characterKey} onClickTeammate={onClickTeammate} /></Box>
        </Grid>

        {/* 2 */}
        <Grid item xs={12} sm={6} lg={4} display="flex" flexDirection="column" gap={1}>
          <CardLight>
            <CardContent  >
              <Box display="flex" alignItems="center" gap={1}>
                <AssumeFullLevelToggle mainStatAssumptionLevel={mainStatAssumptionLevel} setmainStatAssumptionLevel={(mainStatAssumptionLevel: number) => buildSettingDispatch({ mainStatAssumptionLevel })} disabled={generatingBuilds} />
                <InfoTooltip title={<Box>
                  <Typography variant="h6">{t`mainStat.levelAssTooltip.title`}</Typography>
                  <Typography>{t`mainStat.levelAssTooltip.desc`}</Typography>
                </Box>} />
              </Box>
            </CardContent>
            {/* main stat selector */}
            <MainStatSelectionCard disabled={generatingBuilds} filteredArtIdMap={filteredArtIdMap} />
          </CardLight>
          <BonusStatsCard />
        </Grid>

        {/* 3 */}
        <Grid item xs={12} sm={6} lg={5} display="flex" flexDirection="column" gap={1}>
          <ArtifactSetConfig disabled={generatingBuilds} />

          {/* use excluded */}
          <UseExcluded disabled={generatingBuilds} numExcludedArt={numExcludedUsed} />

          {/* use equipped */}
          <UseEquipped disabled={generatingBuilds} numArtsEquippedUsed={numEquippedUsed} />

          <Button
            fullWidth
            startIcon={allowPartial ? <CheckBox /> : <CheckBoxOutlineBlank />}
            color={allowPartial ? "success" : "secondary"}
            onClick={() => buildSettingDispatch({ allowPartial: !allowPartial })}
            disabled={generatingBuilds}
          >
            {t`allowPartial`}
          </Button>
          { /* Level Filter */}
          <CardLight>
            <CardContent>{t`levelFilter`} <SqBadge color="info">{levelTotal}</SqBadge></CardContent>
            <ArtifactLevelSlider levelLow={levelLow} levelHigh={levelHigh}
              setLow={levelLow => buildSettingDispatch({ levelLow })}
              setHigh={levelHigh => buildSettingDispatch({ levelHigh })}
              setBoth={(levelLow, levelHigh) => buildSettingDispatch({ levelLow, levelHigh })}
              disabled={generatingBuilds}
            />
          </CardLight>

          {/*Minimum Final Stat Filter */}
          <StatFilterCard disabled={generatingBuilds} />

        </Grid>
      </Grid>
      {/* Footer */}
      {isSM && targetSelector}
      <ButtonGroup>
        {!isSM && targetSelector}
        <DropdownButton disabled={generatingBuilds || !characterKey}
          title={<Trans t={t} i18nKey="build" count={maxBuildsToShow}>
            {{ count: maxBuildsToShow }} Builds
          </Trans>}>
          <MenuItem>
            <Typography variant="caption" color="info.main">
              {t("buildDropdownDesc")}
            </Typography>
          </MenuItem>
          <Divider />
          {maxBuildsToShowList.map(v => <MenuItem key={v}
            onClick={() => buildSettingDispatch({ maxBuildsToShow: v })}>
            <Trans t={t} i18nKey="build" count={v}>
              {{ count: v }} Builds
            </Trans>
          </MenuItem>)}
        </DropdownButton>
        <DropdownButton disabled={generatingBuilds || !characterKey}
          sx={{ borderRadius: "4px 0px 0px 4px" }}
          title={<Trans t={t} i18nKey="thread" count={maxWorkers}>
            {{ count: maxWorkers }} Threads
          </Trans>}>
          <MenuItem>
            <Typography variant="caption" color="info.main">
              {t("threadDropdownDesc")}
            </Typography>
          </MenuItem>
          <Divider />
          {range(1, defThreads).reverse().map(v => <MenuItem key={v}
            onClick={() => setMaxWorkers(v)}>
            <Trans t={t} i18nKey="thread" count={v}>
              {{ count: v }} Threads
            </Trans>
          </MenuItem>)}
        </DropdownButton>
        <BootstrapTooltip placement="top" title={t`notifyTooltip`}>
          <Button sx={{ borderRadius: 0 }} color='warning' onClick={() => setnotification(n => !n)} >
            {notification ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
          </Button>
        </BootstrapTooltip>
        <BootstrapTooltip placement="top" title={!optimizationTarget ? t("selectTargetFirst") : ""}>
          <span>
            <Button
              disabled={!characterKey || !optimizationTarget || !optimizationTargetNode || optimizationTargetNode.isEmpty}
              color={generatingBuilds ? "error" : "success"}
              onClick={generatingBuilds ? () => cancelToken.current() : generateBuilds}
              startIcon={generatingBuilds ? <Close /> : <TrendingUp />}
              sx={{ borderRadius: "0px 4px 4px 0px" }}
            >{generatingBuilds ? t("generateButton.cancel") : t("generateButton.generateBuilds")}</Button>
          </span>
        </BootstrapTooltip>
      </ButtonGroup>
      {workerErr && <WorkerErr />}
      {!!characterKey && <BuildAlert {...{ status: buildStatus, characterName, maxBuildsToShow }} />}
      <Box >
        <ChartCard disabled={generatingBuilds || !optimizationTarget} plotBase={plotBase} setPlotBase={setPlotBase} showTooltip={!optimizationTarget} />
      </Box>
      <CardLight>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1} >
            <Typography sx={{ flexGrow: 1 }}>
              {builds ? <span>Showing <strong>{builds.length + (graphBuilds ? graphBuilds.length : 0)}</strong> build generated for {characterName}. {!!buildDate && <span>Build generated on: <strong>{(new Date(buildDate)).toLocaleString()}</strong></span>}</span>
                : <span>Select a character to generate builds.</span>}
            </Typography>
            <Button disabled={!builds.length} color="error" onClick={() => { setGraphBuilds(undefined); buildResultDispatch({ builds: [], buildDate: 0 }) }} >Clear Builds</Button>
          </Box>
          <Grid container display="flex" spacing={1}>
            <Grid item><HitModeToggle size="small" /></Grid>
            <Grid item><ReactionToggle size="small" /></Grid>
            <Grid item flexGrow={1} />
            <Grid item><SolidToggleButtonGroup exclusive value={compareData} onChange={(_e, v) => characterDispatch({ compareData: v })} size="small">
              <ToggleButton value={false} disabled={!compareData}>Show new builds</ToggleButton>
              <ToggleButton value={true} disabled={compareData}>Compare vs. equipped</ToggleButton>
            </SolidToggleButtonGroup></Grid>
          </Grid>
        </CardContent>
      </CardLight>
      <OptimizationTargetContext.Provider value={optimizationTarget}>
        {graphBuilds && <BuildList builds={graphBuilds} characterKey={characterKey} data={data} compareData={compareData} disabled={!!generatingBuilds} getLabel={getGraphBuildLabel} setBuilds={setGraphBuilds} />}
        <BuildList builds={builds} characterKey={characterKey} data={data} compareData={compareData} disabled={!!generatingBuilds} getLabel={getNormBuildLabel} />
      </OptimizationTargetContext.Provider>
    </DataContext.Provider>}
  </Box>
}
function BuildList({ builds, setBuilds, characterKey, data, compareData, disabled, getLabel }: {
  builds: string[][]
  setBuilds?: (builds: string[][] | undefined) => void
  characterKey?: "" | CharacterKey
  data?: UIData
  compareData: boolean
  disabled: boolean
  getLabel: (index: number) => Displayable
}) {
  const deleteBuild = useCallback((index: number) => {
    if (setBuilds) {
      const builds_ = [...builds]
      builds_.splice(index, 1)
      setBuilds(builds_)
    }
  },
    [builds, setBuilds])
  // Memoize the build list because calculating/rendering the build list is actually very expensive, which will cause longer optimization times.
  const list = useMemo(() => <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
    {builds?.map((build, index) => characterKey && data && <DataContextWrapper
      key={index + build.join()}
      characterKey={characterKey}
      build={build}
      oldData={data}
    >
      <BuildItemWrapper index={index} label={getLabel(index)} build={build} compareData={compareData} disabled={disabled} deleteBuild={setBuilds ? deleteBuild : undefined} />
    </DataContextWrapper>
    )}
  </Suspense>, [builds, characterKey, data, compareData, disabled, getLabel, deleteBuild, setBuilds])
  return list
}
function BuildItemWrapper({ index, label, build, compareData, disabled, deleteBuild }: {
  index: number
  label: Displayable
  build: string[]
  compareData: boolean
  disabled: boolean
  deleteBuild?: (index: number) => void
}) {
  const { t } = useTranslation("page_character_optimize")
  const location = useLocation()
  const navigate = useNavigate()
  const toTC = useCallback(() => {
    const paths = location.pathname.split("/")
    paths.pop()
    navigate(`${paths.join("/")}/theorycraft`, { state: { build } })
  }, [navigate, build, location.pathname])

  return <BuildDisplayItem label={label} compareBuild={compareData} disabled={disabled}
    extraButtonsLeft={<>
      <Button color="info" size="small" startIcon={<Science />} onClick={toTC}>{t("theorycraftButton")}</Button>
      {deleteBuild && <Button color="error" size="small" startIcon={<DeleteForever />} onClick={() => deleteBuild(index)}>{t("removeBuildButton")}</Button>}
    </>}
  />
}

type Prop = {
  children: React.ReactNode
  characterKey: CharacterKey,
  build: string[],
  oldData: UIData,
}
function DataContextWrapper({ children, characterKey, build, oldData }: Prop) {
  const { database } = useContext(DatabaseContext)
  const { buildSetting: { mainStatAssumptionLevel } } = useBuildSetting(characterKey)
  // Update the build when the build artifacts are changed.
  const [dirty, setDirty] = useForceUpdate()
  useEffect(() => database.arts.followAny((id) => build.includes(id) && setDirty()), [database, build, setDirty])
  const buildsArts = useMemo(() => dirty && build.map(i => database.arts.get(i)!), [dirty, build, database])
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel, buildsArts)
  const providerValue = useMemo(() => teamData && ({ data: teamData[characterKey]!.target, teamData, oldData }), [teamData, oldData, characterKey])
  if (!providerValue) return null
  return <DataContext.Provider value={providerValue}>
    {children}
  </DataContext.Provider>
}
