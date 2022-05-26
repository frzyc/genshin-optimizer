import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import Worker from "worker-loader!./BackgroundWorker";
import ArtifactLevelSlider from '../../../../Components/Artifact/ArtifactLevelSlider';
import BootstrapTooltip from '../../../../Components/BootstrapTooltip';
import CardLight from '../../../../Components/Card/CardLight';
import CharacterCard from '../../../../Components/Character/CharacterCard';
import DropdownButton from '../../../../Components/DropdownMenu/DropdownButton';
import { HitModeToggle, ReactionToggle } from '../../../../Components/HitModeEditor';
import SolidToggleButtonGroup from '../../../../Components/SolidToggleButtonGroup';
import StatFilterCard from '../../../../Components/StatFilterCard';
import CharacterSheet from '../../../../Data/Characters/CharacterSheet';
import { DatabaseContext } from '../../../../Database/Database';
import { DataContext, dataContextObj } from '../../../../DataContext';
import { mergeData, uiDataForTeam } from '../../../../Formula/api';
import { uiInput as input } from '../../../../Formula/index';
import { optimize } from '../../../../Formula/optimization';
import { NumNode } from '../../../../Formula/type';
import { UIData } from '../../../../Formula/uiData';
import { initGlobalSettings } from '../../../../GlobalSettings';
import KeyMap from '../../../../KeyMap';
import useCharacterReducer, { characterReducerAction } from '../../../../ReactHooks/useCharacterReducer';
import useDBState from '../../../../ReactHooks/useDBState';
import useForceUpdate from '../../../../ReactHooks/useForceUpdate';
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData';
import { ICachedArtifact, MainStatKey } from '../../../../Types/artifact';
import { ICachedCharacter } from '../../../../Types/character';
import { ArtifactSetKey, CharacterKey, SlotKey } from '../../../../Types/consts';
import { objPathValue, range } from '../../../../Util/Util';
import { Build, ChartData, Finalize, FinalizeResult, Request, Setup, WorkerResult } from './background';
import { maxBuildsToShowList } from './Build';
import { buildSettingsReducer, initialBuildSettings } from './BuildSetting';
import { countBuilds, filterArts, mergeBuilds, mergePlot, pruneAll } from './common';
import ArtifactSetConditional from './Components/ArtifactSetConditional';
import ArtifactSetPicker from './Components/ArtifactSetPicker';
import AssumeFullLevelToggle from './Components/AssumeFullLevelToggle';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { warningBuildNumber } from './Components/BuildAlert';
import BuildDisplayItem from './Components/BuildDisplayItem';
import ChartCard from './Components/ChartCard';
import MainStatSelectionCard from './Components/MainStatSelectionCard';
import OptimizationTargetSelector from './Components/OptimizationTargetSelector';
import UseEquipped from './Components/UseEquipped';
import UseExcluded from './Components/UseExcluded';
import { defThreads, useOptimizeDBState } from './DBState';
import { artSetPerm, compactArtifacts, dynamicData, splitFiltersBySet } from './foreground';

export default function TabBuild() {
  const { character, character: { key: characterKey } } = useContext(DataContext)
  const [{ tcMode }] = useDBState("GlobalSettings", initGlobalSettings)
  const { database } = useContext(DatabaseContext)

  const [generatingBuilds, setgeneratingBuilds] = useState(false)
  const [generationProgress, setgenerationProgress] = useState(0)
  const [generationDuration, setgenerationDuration] = useState(0)//in ms
  const [generationSkipped, setgenerationSkipped] = useState(0)

  const [chartData, setchartData] = useState(undefined as ChartData | undefined)

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const [{ equipmentPriority, threads = defThreads }, setOptimizeDBState] = useOptimizeDBState()
  const maxWorkers = threads > defThreads ? defThreads : threads
  const setMaxWorkers = useCallback(threads => setOptimizeDBState({ threads }), [setOptimizeDBState],)

  const characterDispatch = useCharacterReducer(characterKey)
  const buildSettings = character?.buildSettings ?? initialBuildSettings()
  const { plotBase, setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow, levelLow, levelHigh } = buildSettings
  const buildsArts = useMemo(() => builds.map(build => build.map(i => database._getArt(i)!)), [builds, database])
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}
  const compareData = character?.compareData ?? false

  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const buildSettingsDispatch = useCallback((action) =>
    characterDispatch && characterDispatch({ buildSettings: buildSettingsReducer(buildSettings, action) })
    , [characterDispatch, buildSettings])

  const onChangeMainStatKey = useCallback((slotKey: SlotKey, mainStatKey?: MainStatKey) => {
    if (mainStatKey === undefined) buildSettingsDispatch({ type: "mainStatKeyReset", slotKey })
    else buildSettingsDispatch({ type: "mainStatKey", slotKey, mainStatKey })
  }, [buildSettingsDispatch])

  //register changes in artifact database
  useEffect(() =>
    database.followAnyArt(setArtsDirty),
    [setArtsDirty, database])

  const { split, setPerms, totBuildNumber } = useMemo(() => {
    if (!characterKey) // Make sure we have all slotKeys
      return { totBuildNumber: 0 }
    let cantTakeList: CharacterKey[] = []
    if (useEquippedArts) {
      const index = equipmentPriority.indexOf(characterKey)
      if (index < 0) cantTakeList = [...equipmentPriority]
      else cantTakeList = equipmentPriority.slice(0, index)
    }
    const arts = database._getArts().filter(art => {
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
    const split = compactArtifacts(arts, mainStatAssumptionLevel)
    const setPerms = [...artSetPerm([setFilters.map(({ key, num }) => ({ key, min: num }))])]
    const totBuildNumber = [...setPerms].map(perm => countBuilds(filterArts(split, perm))).reduce((a, b) => a + b, 0)
    return artsDirty && { split, setPerms, totBuildNumber }
  }, [characterKey, useExcludedArts, useEquippedArts, equipmentPriority, mainStatKeys, setFilters, levelLow, levelHigh, artsDirty, database, mainStatAssumptionLevel])

  // Reset the Alert by setting progress to zero.
  useEffect(() => {
    setgenerationProgress(0)
  }, [totBuildNumber])

  // Provides a function to cancel the work
  const cancelToken = useRef(() => { })
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])
  const generateBuilds = useCallback(async () => {
    if (!characterKey || !optimizationTarget || !split || !setPerms) return
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

    const t1 = performance.now()
    setgeneratingBuilds(true)
    setchartData(undefined)
    setgenerationDuration(0)
    setgenerationProgress(0)
    setgenerationSkipped(0)

    const cancelled = new Promise<void>(r => cancelToken.current = r)

    let nodes = [...valueFilter.map(x => x.value), optimizationTargetNode], arts = split!
    const origCount = totBuildNumber, minimum = [...valueFilter.map(x => x.minimum), -Infinity]
    if (plotBase) {
      nodes.push(input.total[plotBase])
      minimum.push(-Infinity)
    }

    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    ({ nodes, arts } = pruneAll(nodes, minimum, arts, maxBuildsToShow,
      new Set(setFilters.map(x => x.key as ArtifactSetKey)), {
      reaffine: true, pruneArtRange: true, pruneNodeRange: true, pruneOrder: true
    }))

    const plotBaseNode = plotBase ? nodes.pop() : undefined
    optimizationTargetNode = nodes.pop()!

    let wrap = {
      buildCount: 0, failedCount: 0, skippedCount: origCount,
      buildValues: Array(maxBuildsToShow).fill(0).map(_ => -Infinity)
    }
    setPerms.forEach(filter => wrap.skippedCount -= countBuilds(filterArts(arts, filter)))

    const setPerm = splitFiltersBySet(arts, setPerms,
      maxWorkers === 1
        // Don't split for single worker
        ? Infinity
        // 8 perms / worker, up to 1M builds / perm
        : Math.min(origCount / maxWorkers / 4, 1_000_000))[Symbol.iterator]()

    function fetchWork(): Request | undefined {
      const { done, value } = setPerm.next()
      return done ? undefined : {
        command: "request",
        threshold: wrap.buildValues[maxBuildsToShow - 1], filter: value,
      }
    }

    const filters = nodes
      .map((value, i) => ({ value, min: minimum[i] }))
      .filter(x => x.min > -Infinity)

    const finalizedList: Promise<FinalizeResult>[] = []
    for (let i = 0; i < maxWorkers; i++) {
      const worker = new Worker()

      const setup: Setup = {
        command: "setup",
        id: `${i}`,
        arts,
        optimizationTarget: optimizationTargetNode,
        plotBase: plotBaseNode,
        maxBuilds: maxBuildsToShow,
        filters
      }
      worker.postMessage(setup, undefined)
      let finalize: (_: FinalizeResult) => void
      const finalized = new Promise<FinalizeResult>(r => finalize = r)
      worker.onmessage = async ({ data }: { data: WorkerResult }) => {
        switch (data.command) {
          case "interim":
            wrap.buildCount += data.buildCount
            wrap.failedCount += data.failedCount
            wrap.skippedCount += data.skippedCount
            if (data.buildValues) {
              wrap.buildValues.push(...data.buildValues)
              wrap.buildValues.sort((a, b) => b - a).splice(maxBuildsToShow)
            }
            break
          case "request":
            const work = fetchWork()
            if (work) {
              worker.postMessage(work)
            } else {
              const finalizeCommand: Finalize = { command: "finalize" }
              worker.postMessage(finalizeCommand)
            }
            break
          case "finalize":
            worker.terminate()
            finalize(data);
            break
          default: console.log("DEBUG", data)
        }
      }

      cancelled.then(() => worker.terminate())
      finalizedList.push(finalized)
    }

    const buildTimer = setInterval(() => {
      setgenerationProgress(wrap.buildCount)
      setgenerationSkipped(wrap.skippedCount)
      setgenerationDuration(performance.now() - t1)
    }, 100)
    const results = await Promise.any([Promise.all(finalizedList), cancelled])
    clearInterval(buildTimer)
    cancelToken.current = () => { }

    if (!results) {
      setgenerationDuration(0)
      setgenerationProgress(0)
      setgenerationSkipped(0)
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
      buildSettingsDispatch({ builds: builds.map(build => build.artifactIds), buildDate: Date.now() })
      const totalDuration = performance.now() - t1

      setgenerationProgress(wrap.buildCount)
      setgenerationSkipped(wrap.skippedCount)
      setgenerationDuration(totalDuration)
    }
    setgeneratingBuilds(false)
  }, [characterKey, database, totBuildNumber, mainStatAssumptionLevel, maxBuildsToShow, optimizationTarget, plotBase, setPerms, split, buildSettingsDispatch, setFilters, statFilters, maxWorkers])

  const characterName = characterSheet?.name ?? "Character Name"

  const setPlotBase = useCallback(plotBase => {
    buildSettingsDispatch({ plotBase })
    setchartData(undefined)
  }, [buildSettingsDispatch])
  const dataContext: dataContextObj | undefined = useMemo(() => {
    return data && characterSheet && character && teamData && {
      data,
      characterSheet,
      character,
      mainStatAssumptionLevel,
      teamData,
      characterDispatch
    }
  }, [data, characterSheet, character, teamData, characterDispatch, mainStatAssumptionLevel])

  return <Box display="flex" flexDirection="column" gap={1}>
    {noArtifact && <Alert severity="warning" variant="filled"> Opps! It looks like you haven't added any artifacts to GO yet! You should go to the <Link component={RouterLink} to="/artifact">Artifacts</Link> page and add some!</Alert>}
    {/* Build Generator Editor */}
    {dataContext && <DataContext.Provider value={dataContext}>

      <Grid container spacing={1} >
        {/* 1*/}
        <Grid item xs={12} sm={6} lg={3} display="flex" flexDirection="column" gap={1}>
          {/* character card */}
          <Box><CharacterCard characterKey={characterKey} /></Box>
        </Grid>

        {/* 2 */}
        <Grid item xs={12} sm={6} lg={3}>
          <CardLight>
            <CardContent  >
              <Typography gutterBottom>Main Stat</Typography>
              <BootstrapTooltip placement="top" title={<Typography><strong>Level Assumption</strong> changes mainstat value to be at least a specific level. Does not change substats.</Typography>}>
                <Box>
                  <AssumeFullLevelToggle mainStatAssumptionLevel={mainStatAssumptionLevel} setmainStatAssumptionLevel={mainStatAssumptionLevel => buildSettingsDispatch({ mainStatAssumptionLevel })} disabled={generatingBuilds} />
                </Box>
              </BootstrapTooltip>
            </CardContent>
            {/* main stat selector */}
            <MainStatSelectionCard
              mainStatKeys={mainStatKeys}
              onChangeMainStatKey={onChangeMainStatKey}
              disabled={generatingBuilds}
            />
          </CardLight>
        </Grid>

        {/* 3 */}
        <Grid item xs={12} sm={6} lg={3} display="flex" flexDirection="column" gap={1}>

          {/*Minimum Final Stat Filter */}
          <StatFilterCard statFilters={statFilters} setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} disabled={generatingBuilds} />

          <BonusStatsCard />

          {/* use excluded */}
          <UseExcluded disabled={generatingBuilds} useExcludedArts={useExcludedArts} buildSettingsDispatch={buildSettingsDispatch} artsDirty={artsDirty} />

          {/* use equipped */}
          <UseEquipped disabled={generatingBuilds} useEquippedArts={useEquippedArts} buildSettingsDispatch={buildSettingsDispatch} />

          { /* Level Filter */}
          <CardLight>
            <CardContent sx={{ py: 1 }}>
              Artifact Level Filter
            </CardContent>
            <ArtifactLevelSlider levelLow={levelLow} levelHigh={levelHigh}
              setLow={levelLow => buildSettingsDispatch({ levelLow })}
              setHigh={levelHigh => buildSettingsDispatch({ levelHigh })}
              setBoth={(levelLow, levelHigh) => buildSettingsDispatch({ levelLow, levelHigh })}
              disabled={generatingBuilds}
            />
          </CardLight>
        </Grid>

        {/* 4 */}
        <Grid item xs={12} sm={6} lg={3} display="flex" flexDirection="column" gap={1}>
          <ArtifactSetConditional disabled={generatingBuilds} />

          {/* Artifact set pickers */}
          {setFilters.map((setFilter, index) => (index <= setFilters.filter(s => s.key).length) && <ArtifactSetPicker key={index} index={index} setFilters={setFilters}
            disabled={generatingBuilds} onChange={(index, key, num) => buildSettingsDispatch({ type: 'setFilter', index, key, num })} />)}
        </Grid>

      </Grid>
      {/* Footer */}
      <Grid container spacing={1}>
        <Grid item flexGrow={1} >
          <ButtonGroup>
            <Button
              disabled={!characterKey || generatingBuilds || !optimizationTarget || !totBuildNumber || !objPathValue(data?.getDisplay(), optimizationTarget)}
              color={(characterKey && totBuildNumber <= warningBuildNumber) ? "success" : "warning"}
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
                onClick={() => buildSettingsDispatch({ maxBuildsToShow: v })}>{v} {v === 1 ? "Build" : "Builds"}</MenuItem>)}
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
            setTarget={target => buildSettingsDispatch({ optimizationTarget: target })}
            disabled={!!generatingBuilds}
          />}
        </Grid>
      </Grid>

      {!!characterKey && <Box >
        <BuildAlert {...{ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }} />
      </Box>}
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
            <Button disabled={!builds.length} color="error" onClick={() => buildSettingsDispatch({ builds: [], buildDate: 0 })} >Clear Builds</Button>
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
      <BuildList {...{ buildsArts, character, characterKey, characterSheet, data, compareData, mainStatAssumptionLevel, characterDispatch, disabled: !!generatingBuilds }} />
    </DataContext.Provider>}
  </Box>
}
function BuildList({ buildsArts, character, characterKey, characterSheet, data, compareData, mainStatAssumptionLevel, characterDispatch, disabled }: {
  buildsArts: ICachedArtifact[][],
  character?: ICachedCharacter,
  characterKey?: "" | CharacterKey,
  characterSheet?: CharacterSheet,
  data?: UIData,
  compareData: boolean,
  mainStatAssumptionLevel: number,
  characterDispatch: (action: characterReducerAction) => void
  disabled: boolean,
}) {
  // Memoize the build list because calculating/rendering the build list is actually very expensive, which will cause longer optimization times.
  const list = useMemo(() => <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
    {buildsArts?.map((build, index) => character && characterKey && characterSheet && data && <DataContextWrapper
      key={index + build.join()}
      characterKey={characterKey}
      character={character}
      build={build}
      characterSheet={characterSheet}
      oldData={data}
      mainStatAssumptionLevel={mainStatAssumptionLevel}
      characterDispatch={characterDispatch} >
      <BuildDisplayItem index={index} compareBuild={compareData} disabled={disabled} />
    </DataContextWrapper>
    )}
  </Suspense>, [buildsArts, character, characterKey, characterSheet, data, compareData, mainStatAssumptionLevel, characterDispatch, disabled])
  return list
}

type Prop = {
  children: React.ReactNode
  characterKey: CharacterKey,
  character: ICachedCharacter,
  build: ICachedArtifact[],
  mainStatAssumptionLevel?: number, characterSheet: CharacterSheet, oldData: UIData,
  characterDispatch: (action: characterReducerAction) => void
}
function DataContextWrapper({ children, characterKey, character, build, characterDispatch, mainStatAssumptionLevel = 0, characterSheet, oldData }: Prop) {
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel, build)
  if (!teamData) return null
  return <DataContext.Provider value={{ characterSheet, character, characterDispatch, mainStatAssumptionLevel, data: teamData[characterKey]!.target, teamData, oldData }}>
    {children}
  </DataContext.Provider>
}
