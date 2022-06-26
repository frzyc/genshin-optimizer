import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import Worker from "worker-loader!./BackgroundWorker";
import { CharacterContext } from '../../../../CharacterContext';
import ArtifactLevelSlider from '../../../../Components/Artifact/ArtifactLevelSlider';
import BootstrapTooltip from '../../../../Components/BootstrapTooltip';
import CardLight from '../../../../Components/Card/CardLight';
import CharacterCard from '../../../../Components/Character/CharacterCard';
import DropdownButton from '../../../../Components/DropdownMenu/DropdownButton';
import { HitModeToggle, ReactionToggle } from '../../../../Components/HitModeEditor';
import SolidToggleButtonGroup from '../../../../Components/SolidToggleButtonGroup';
import StatFilterCard from '../../../../Components/StatFilterCard';
import { DatabaseContext } from '../../../../Database/Database';
import { DataContext, dataContextObj } from '../../../../DataContext';
import { thresholdExclusions } from '../../../../Formula/addedUtils';
import { mergeData, uiDataForTeam } from '../../../../Formula/api';
import { expandPoly } from '../../../../Formula/expandPoly';
import { uiInput as input } from '../../../../Formula/index';
import { optimize } from '../../../../Formula/optimization';
import { elimLinDepStats, thresholdToConstBranches } from '../../../../Formula/optimize2';
import { NumNode } from '../../../../Formula/type';
import { UIData } from '../../../../Formula/uiData';
import { initGlobalSettings } from '../../../../GlobalSettings';
import KeyMap from '../../../../KeyMap';
import useCharacterReducer from '../../../../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../../../../ReactHooks/useCharSelectionCallback';
import useDBState from '../../../../ReactHooks/useDBState';
import useForceUpdate from '../../../../ReactHooks/useForceUpdate';
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData';
import { ICachedArtifact } from '../../../../Types/artifact';
import { CharacterKey } from '../../../../Types/consts';
import { objectKeyValueMap, objPathValue, range } from '../../../../Util/Util';
import { FinalizeResult, Setup, SubProblem, WorkerCommand, WorkerResult } from './BackgroundWorker';
import { maxBuildsToShowList } from './Build';
import useBuildSetting from './BuildSetting';
import { Build, countBuilds, emptyfilter, filterArts, mergeBuilds, mergePlot, pruneAll } from './common';
import ArtifactSetConfig from './Components/ArtifactSetConfig';
import AssumeFullLevelToggle from './Components/AssumeFullLevelToggle';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { BuildStatus } from './Components/BuildAlert';
import BuildDisplayItem from './Components/BuildDisplayItem';
import ChartCard, { ChartData } from './Components/ChartCard';
import MainStatSelectionCard from './Components/MainStatSelectionCard';
import OptimizationTargetSelector from './Components/OptimizationTargetSelector';
import UseEquipped from './Components/UseEquipped';
import UseExcluded from './Components/UseExcluded';
import { defThreads, useOptimizeDBState } from './DBState';
import { compactArtifacts, dynamicData } from './foreground';

export default function TabBuild() {
  const { t } = useTranslation("page_character")
  const { character: { key: characterKey, compareData } } = useContext(CharacterContext)
  const [{ tcMode }] = useDBState("GlobalSettings", initGlobalSettings)
  const { database } = useContext(DatabaseContext)

  const [buildStatus, setBuildStatus] = useState({ type: "inactive", tested: 0, failed: 0, skipped: 0, total: 0 } as BuildStatus)
  const generatingBuilds = buildStatus.type !== "inactive"

  const [chartData, setchartData] = useState(undefined as ChartData | undefined)

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const [{ equipmentPriority, threads = defThreads }, setOptimizeDBState] = useOptimizeDBState()
  const maxWorkers = threads > defThreads ? defThreads : threads
  const setMaxWorkers = useCallback(threads => setOptimizeDBState({ threads }), [setOptimizeDBState],)

  const characterDispatch = useCharacterReducer(characterKey)
  const onClickTeammate = useCharSelectionCallback()

  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey)
  const { plotBase, optimizationTarget, mainStatAssumptionLevel, allowPartial, builds, buildDate, maxBuildsToShow, levelLow, levelHigh } = buildSetting
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}
  const buildsArts = useMemo(() => builds.map(build => build.map(i => database._getArt(i)!)), [builds, database])

  //register changes in artifact database
  useEffect(() =>
    database.followAnyArt(setArtsDirty),
    [setArtsDirty, database])

  // Provides a function to cancel the work
  const cancelToken = useRef(() => { })
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])
  const generateBuilds = useCallback(async () => {
    const { artSetExclusion, plotBase, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, allowPartial, maxBuildsToShow, levelLow, levelHigh } = buildSetting
    if (!characterKey || !optimizationTarget) return

    let cantTakeList: CharacterKey[] = []
    if (useEquippedArts) {
      const index = equipmentPriority.indexOf(characterKey)
      if (index < 0) cantTakeList = [...equipmentPriority]
      else cantTakeList = equipmentPriority.slice(0, index)
    }
    const filteredArts = database._getArts().filter(art => {
      if (art.level < levelLow) return false
      if (art.level > levelHigh) return false
      const mainStats = mainStatKeys[art.slotKey]
      if (mainStats?.length && !mainStats.includes(art.mainStatKey)) return false

      // If its equipped on the selected character, bypass the check
      if (art.location === characterKey) return true

      if (art.exclude && !useExcludedArts) return false
      if (art.location && !useEquippedArts) return false
      if (art.location && useEquippedArts && cantTakeList.includes(art.location)) return false
      return true
    })
    const split = compactArtifacts(filteredArts, mainStatAssumptionLevel, allowPartial)

    const teamData = await getTeamData(database, characterKey, mainStatAssumptionLevel, [])
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, characterKey)[characterKey as CharacterKey]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    let optimizationTargetNode = objPathValue(workerData.display ?? {}, optimizationTarget) as NumNode | undefined
    if (!optimizationTargetNode) return
    const targetNode = optimizationTargetNode
    const valueFilter: { value: NumNode, minimum: number }[] = Object.entries(statFilters).map(([key, value]) => {
      if (key.endsWith("_")) value = value / 100 // TODO: Conversion
      return { value: input.total[key], minimum: value }
    }).filter(x => x.value && x.minimum > -Infinity)

    setchartData(undefined)

    const cancelled = new Promise<void>(r => cancelToken.current = r)

    let nodes = [...valueFilter.map(x => x.value), optimizationTargetNode], arts = split!
    // const setPerms = filterFeasiblePerm(artSetPerm(artSetExclusion, Object.values(split.values).flatMap(x => x.map(x => x.set!))), split)

    const minimum = [...valueFilter.map(x => x.minimum), -Infinity]
    const status: Omit<BuildStatus, "type"> = { tested: 0, failed: 0, skipped: 0, total: NaN, startTime: performance.now() }
    if (plotBase) {
      nodes.push(input.total[plotBase])
      minimum.push(-Infinity)
    }

    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    ({ nodes, arts } = pruneAll(nodes, minimum, arts, maxBuildsToShow, artSetExclusion, {
      reaffine: true, pruneArtRange: true, pruneNodeRange: true, pruneOrder: true
    }))
    // Can be further folded after pruning
    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    nodes = thresholdExclusions(nodes, artSetExclusion);
    nodes = thresholdToConstBranches(nodes);
    ({ a: arts, nodes } = elimLinDepStats(arts, nodes));
    nodes = optimize(nodes, {}, _ => false)

    const plotBaseNode = plotBase ? nodes.pop() : undefined
    optimizationTargetNode = nodes.pop()!

    // var outcnt = 0
    // forEachNodes([optimizationTargetNode], _ => { }, n => outcnt++)
    // console.log('Original count', outcnt)
    // debugHorny(expandPoly(optimizationTargetNode))
    // debugMe(optimizationTargetNode, arts)
    // console.log('artSetExclusion', artSetExclusion)

    const artSetExclFull = objectKeyValueMap(Object.entries(artSetExclusion), ([setKey, v]) => {
      if (setKey === 'rainbow') return ['uniqueKey', v.map(v => v + 1)]
      return [setKey, v.flatMap(v => (v === 2) ? [2, 3] : [4, 5])]
    })
    console.log({ artSetExclFull })
    const filters = nodes
      .map((value, i) => ({ value, min: minimum[i] }))
      .filter(x => x.min > -Infinity)
    const filtersEP = nodes
      .map((value, i) => ({ value: expandPoly(value), min: minimum[i] }))
      .filter(x => x.min > -Infinity)
    const initialProblem: SubProblem = {
      cache: false,
      optimizationTarget: expandPoly(optimizationTargetNode),
      constraints: filtersEP,
      artSetExclusion: artSetExclFull,

      filter: emptyfilter,
      depth: 0,
    }

    const masterInfo = { id: -1, ready: true }
    const maxSplitIters = 10
    const minFilterCount = 2_000 // Don't split for single worker
    const maxRequestFilterInFlight = maxWorkers * 4
    const workQueue: SubProblem[] = [initialProblem]
    const idleWorkers = new Set<number>()  // Currently idle workers
    const busyWorkerIDs = new Set<number>()  // Workers with pending work in SplitWorker()
    const workers: Worker[] = []

    const wrap = { buildValues: Array(maxBuildsToShow).fill(0).map(_ => -Infinity) }

    function fetchContinueWork(): WorkerCommand {
      return { command: "split", minCount: minFilterCount, maxIter: maxSplitIters, threshold: wrap.buildValues[maxBuildsToShow - 1] }
    }
    function fetchWork(): WorkerCommand | undefined {
      const subproblem = workQueue.shift()
      if (!subproblem) return undefined
      let numBuild = countBuilds(filterArts(arts, subproblem.filter))

      if (numBuild <= minFilterCount) return { command: 'iterate', threshold: wrap.buildValues[maxBuildsToShow - 1], subproblem }
      return { command: 'split', threshold: wrap.buildValues[maxBuildsToShow - 1], minCount: minFilterCount, maxIter: maxSplitIters, subproblem }
    }
    function requestShareWork(sender: number): WorkerCommand {
      return { command: 'share', sender }
    }

    status.total = Object.values(arts.values).reduce((prod, arts) => prod * arts.length, 1)
    const finalizedList: Promise<FinalizeResult>[] = []
    for (let i = 0; i < maxWorkers; i++) {
      const worker = new Worker()
      workers.push(worker)

      const setup: Setup = {
        command: "setup",
        id: i, arts,
        optimizationTarget: optimizationTargetNode,
        artSetExclusion: artSetExclusion,
        plotBase: plotBaseNode,
        maxBuilds: maxBuildsToShow,
        filters
      }
      worker.postMessage(setup, undefined)
      // if (i === 0) {
      //   const countCommand: WorkerCommand = { command: "count", exclusion: artSetExclusion, arts: [arts, prepruneArts] }
      //   worker.postMessage(countCommand, undefined)
      // }
      let finalize: (_: FinalizeResult) => void
      const finalized = new Promise<FinalizeResult>(r => finalize = r)
      worker.onmessage = async ({ data }: { data: { id: number } & WorkerResult }) => {
        switch (data.command) {
          case "interim":
            status.tested += data.tested
            status.failed += data.failed
            status.skipped += data.skipped
            if (data.buildValues) {
              wrap.buildValues.push(...data.buildValues)
              wrap.buildValues.sort((a, b) => b - a).splice(maxBuildsToShow)
            }
            return
          case "split":
            workQueue.push(...data.subproblems)
            if (data.ready && data.id === masterInfo.id) masterInfo.ready = true
            if (data.ready) {
              busyWorkerIDs.delete(data.id)
            }
            else busyWorkerIDs.add(data.id)
            idleWorkers.add(data.id)
            break
          case "iterate":
            idleWorkers.add(data.id)
            break
          case "finalize":
            worker.terminate()
            finalize(data);
            return
          case "share":
            if (data.subproblem) {
              const splitCommand = { command: 'split', threshold: wrap.buildValues[maxBuildsToShow - 1], minCount: minFilterCount, maxIter: maxSplitIters, subproblem: data.subproblem }
              workers[data.sender].postMessage(splitCommand)
              busyWorkerIDs.add(data.sender)
            }
            else idleWorkers.add(data.sender)
            break
          case "count":
            const [pruned, prepruned] = data.counts
            status.total = prepruned
            status.skipped += prepruned - pruned
            return
          default: console.log("DEBUG", data)
        }

        const toLoop = [...idleWorkers]
        for (const id of toLoop) {
          const worker = workers[id]
          let work: WorkerCommand | undefined

          if (workQueue.length >= maxRequestFilterInFlight) work = fetchWork()
          else if (busyWorkerIDs.has(id)) work = fetchContinueWork()
          if (!work) work = fetchWork()
          if (masterInfo.id < 0) {
            masterInfo.id = id
            masterInfo.ready = false
          }

          if (work) {
            idleWorkers.delete(id)
            worker.postMessage(work)
          }
          else if (!masterInfo.ready) {
            idleWorkers.delete(id)
            workers[masterInfo.id].postMessage(requestShareWork(id))
          }
        }

        if (busyWorkerIDs.size === 0 && idleWorkers.size === maxWorkers) {
          workers.forEach(worker => worker.postMessage({ command: 'finalize' }))
        }
      }

      cancelled.then(() => worker.terminate())
      finalizedList.push(finalized)
    }

    const buildTimer = setInterval(() => setBuildStatus({ type: "active", ...status }), 100)
    const results = await Promise.any([Promise.all(finalizedList), cancelled])
    clearInterval(buildTimer)
    cancelToken.current = () => { }

    if (!results) {
      status.tested = 0
      status.failed = 0
      status.skipped = 0
      status.total = 0
    } else {
      if (plotBase) {
        const plotData = mergePlot(results.map(x => x.plotData!))
        const plotBaseNode = input.total[plotBase] as NumNode
        let data = Object.values(plotData)
        if (KeyMap.unit(targetNode.info?.key) === "%")
          data = data.map(({ value, plot }) => ({ value: value * 100, plot })) as Build[]
        if (KeyMap.unit(plotBaseNode!.info?.key) === "%")
          data = data.map(({ value, plot }) => ({ value, plot: (plot ?? 0) * 100 })) as Build[]
        setchartData({
          valueNode: targetNode,
          plotNode: plotBaseNode,
          data
        })
      }
      const builds = mergeBuilds(results.map(x => x.builds), maxBuildsToShow)
      if (process.env.NODE_ENV === "development") console.log("Build Result", builds)
      buildSettingDispatch({ builds: builds.map(build => build.artifactIds), buildDate: Date.now() })
    }
    setBuildStatus({ ...status, type: "inactive", finishTime: performance.now() })
  }, [characterKey, database, buildSettingDispatch, maxWorkers, buildSetting, equipmentPriority])

  const characterName = characterSheet?.name ?? "Character Name"

  const setPlotBase = useCallback(plotBase => {
    buildSettingDispatch({ plotBase })
    setchartData(undefined)
  }, [buildSettingDispatch])
  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && teamData && { data, teamData }
  }, [data, teamData])

  return <Box display="flex" flexDirection="column" gap={1}>
    {noArtifact && <Alert severity="warning" variant="filled"> Opps! It looks like you haven't added any artifacts to GO yet! You should go to the <Link component={RouterLink} to="/artifact">Artifacts</Link> page and add some!</Alert>}
    {/* Build Generator Editor */}
    {dataContext && <DataContext.Provider value={dataContext}>

      <Grid container spacing={1} >
        {/* 1*/}
        <Grid item xs={12} sm={6} lg={3} display="flex" flexDirection="column" gap={1}>
          {/* character card */}
          <Box><CharacterCard characterKey={characterKey} onClickTeammate={onClickTeammate} /></Box>
        </Grid>

        {/* 2 */}
        <Grid item xs={12} sm={6} lg={3} display="flex" flexDirection="column" gap={1}>
          <CardLight>
            <CardContent  >
              <Typography gutterBottom>Main Stat</Typography>
              <BootstrapTooltip placement="top" title={<Typography><strong>Level Assumption</strong> changes mainstat value to be at least a specific level. Does not change substats.</Typography>}>
                <Box>
                  <AssumeFullLevelToggle mainStatAssumptionLevel={mainStatAssumptionLevel} setmainStatAssumptionLevel={mainStatAssumptionLevel => buildSettingDispatch({ mainStatAssumptionLevel })} disabled={generatingBuilds} />
                </Box>
              </BootstrapTooltip>
            </CardContent>
            {/* main stat selector */}
            <MainStatSelectionCard disabled={generatingBuilds} />
          </CardLight>
          <BonusStatsCard />
        </Grid>

        {/* 3 */}
        <Grid item xs={12} sm={6} lg={6} display="flex" flexDirection="column" gap={1}>
          <ArtifactSetConfig disabled={generatingBuilds} />

          {/* use excluded */}
          <UseExcluded disabled={generatingBuilds} artsDirty={artsDirty} />

          {/* use equipped */}
          <UseEquipped disabled={generatingBuilds} />

          <Button fullWidth startIcon={allowPartial ? <CheckBox /> : <CheckBoxOutlineBlank />} color={allowPartial ? "success" : "secondary"} onClick={() => buildSettingDispatch({ allowPartial: !allowPartial })}>{t`tabOptimize.allowPartial`}</Button>
          { /* Level Filter */}
          <CardLight>
            <CardContent sx={{ py: 1 }}>
              Artifact Level Filter
            </CardContent>
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
      <Grid container spacing={1}>
        <Grid item flexGrow={1} >
          <ButtonGroup>
            <Button
              disabled={!characterKey || generatingBuilds || !optimizationTarget || !objPathValue(data?.getDisplay(), optimizationTarget)}
              color={characterKey ? "success" : "warning"}
              onClick={generateBuilds}
              startIcon={<FontAwesomeIcon icon={faCalculator} />}
            >Generate Builds</Button>
            <DropdownButton disabled={generatingBuilds || !characterKey}
              title={<span><b>{maxBuildsToShow}</b> {maxBuildsToShow === 1 ? "Build" : "Builds"}</span>}>
              <MenuItem>
                <Typography variant="caption" color="info.main">
                  Decreasing the number of generated build will decrease build calculation time for large number of builds.
                </Typography>
              </MenuItem>
              <Divider />
              {maxBuildsToShowList.map(v => <MenuItem key={v}
                onClick={() => buildSettingDispatch({ maxBuildsToShow: v })}>{v} {v === 1 ? "Build" : "Builds"}</MenuItem>)}
            </DropdownButton>
            <DropdownButton disabled={generatingBuilds || !characterKey}
              title={<span><b>{maxWorkers}</b> {maxWorkers === 1 ? "Thread" : "Threads"}</span>}>
              <MenuItem>
                <Typography variant="caption" color="info.main">
                  Increasing the number of threads will speed up build time, but will use more CPU power.
                </Typography>
              </MenuItem>
              <Divider />
              {range(1, defThreads).reverse().map(v => <MenuItem key={v}
                onClick={() => setMaxWorkers(v)}>{v} {v === 1 ? "Thread" : "Threads"}</MenuItem>)}
            </DropdownButton>
            <Button
              disabled={!generatingBuilds}
              color="error"
              onClick={() => cancelToken.current()}
              startIcon={<Close />}
            >Cancel</Button>
          </ButtonGroup>
        </Grid>
        <Grid item>
          <span>Optimization Target: </span>
          {<OptimizationTargetSelector
            optimizationTarget={optimizationTarget}
            setTarget={target => buildSettingDispatch({ optimizationTarget: target })}
            disabled={!!generatingBuilds}
          />}
        </Grid>
      </Grid>

      {!!characterKey && <BuildAlert {...{ status: buildStatus, characterName, maxBuildsToShow }} />}
      {tcMode && <Box >
        <ChartCard disabled={generatingBuilds} chartData={chartData} plotBase={plotBase} setPlotBase={setPlotBase} />
      </Box>}
      <CardLight>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1} >
            <Typography sx={{ flexGrow: 1 }}>
              {builds ? <span>Showing <strong>{builds.length}</strong> Builds generated for {characterName}. {!!buildDate && <span>Build generated on: <strong>{(new Date(buildDate)).toLocaleString()}</strong></span>}</span>
                : <span>Select a character to generate builds.</span>}
            </Typography>
            <Button disabled={!builds.length} color="error" onClick={() => buildSettingDispatch({ builds: [], buildDate: 0 })} >Clear Builds</Button>
          </Box>
          <Grid container display="flex" spacing={1}>
            <Grid item><HitModeToggle size="small" /></Grid>
            <Grid item><ReactionToggle size="small" /></Grid>
            <Grid item flexGrow={1} />
            <Grid item><SolidToggleButtonGroup exclusive value={compareData} onChange={(e, v) => characterDispatch({ compareData: v })} size="small">
              <ToggleButton value={false} disabled={!compareData}>
                <small>Show New artifact Stats</small>
              </ToggleButton>
              <ToggleButton value={true} disabled={compareData}>
                <small>Compare against equipped artifacts</small>
              </ToggleButton>
            </SolidToggleButtonGroup></Grid>
          </Grid>
        </CardContent>
      </CardLight>
      <BuildList buildsArts={buildsArts} characterKey={characterKey} data={data} compareData={compareData} disabled={!!generatingBuilds} />
    </DataContext.Provider>}
  </Box>
}
function BuildList({ buildsArts, characterKey, data, compareData, disabled }: {
  buildsArts: ICachedArtifact[][],
  characterKey?: "" | CharacterKey,
  data?: UIData,
  compareData: boolean,
  disabled: boolean,
}) {
  // Memoize the build list because calculating/rendering the build list is actually very expensive, which will cause longer optimization times.
  const list = useMemo(() => <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
    {buildsArts?.map((build, index) => characterKey && data && <DataContextWrapper
      key={index + build.join()}
      characterKey={characterKey}
      build={build}
      oldData={data}
    >
      <BuildDisplayItem index={index} compareBuild={compareData} disabled={disabled} />
    </DataContextWrapper>
    )}
  </Suspense>, [buildsArts, characterKey, data, compareData, disabled])
  return list
}

type Prop = {
  children: React.ReactNode
  characterKey: CharacterKey,
  build: ICachedArtifact[],
  oldData: UIData,
}
function DataContextWrapper({ children, characterKey, build, oldData }: Prop) {
  const { buildSetting: { mainStatAssumptionLevel } } = useBuildSetting(characterKey)
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel, build)
  const providerValue = useMemo(() => teamData && ({ data: teamData[characterKey]!.target, teamData, oldData }), [teamData, oldData, characterKey])
  if (!providerValue) return null
  return <DataContext.Provider value={providerValue}>
    {children}
  </DataContext.Provider>
}
