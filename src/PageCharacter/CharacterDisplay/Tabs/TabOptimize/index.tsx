import { CheckBox, CheckBoxOutlineBlank, Close, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { CharacterContext } from '../../../../Context/CharacterContext';
import { DataContext, dataContextObj } from '../../../../Context/DataContext';
import { OptimizationTargetContext } from '../../../../Context/OptimizationTargetContext';
import { DatabaseContext } from '../../../../Database/Database';
import { mergeData, uiDataForTeam } from '../../../../Formula/api';
import { uiInput as input } from '../../../../Formula/index';
import { optimize } from '../../../../Formula/optimization';
import { NumNode } from '../../../../Formula/type';
import { UIData } from '../../../../Formula/uiData';
import KeyMap from '../../../../KeyMap';
import useCharacterReducer from '../../../../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../../../../ReactHooks/useCharSelectionCallback';
import useDBState from '../../../../ReactHooks/useDBState';
import useForceUpdate from '../../../../ReactHooks/useForceUpdate';
import useTeamData, { getTeamData } from '../../../../ReactHooks/useTeamData';
import { initGlobalSettings } from '../../../../stateInit';
import { ICachedArtifact } from '../../../../Types/artifact';
import { CharacterKey } from '../../../../Types/consts';
import { objPathValue, range } from '../../../../Util/Util';
import { FinalizeResult, Setup, WorkerCommand, WorkerResult } from './BackgroundWorker';
import { maxBuildsToShowList } from './Build';
import { addArtRange, ArtifactBuildData, artSetPerm, Build, computeArtRange, computeNodeRange, DynStat, filterFeasiblePerm, mergeBuilds, mergePlot, pruneAll, RequestFilter } from './common';
import ArtifactSetConfig from './Components/ArtifactSetConfig';
import AssumeFullLevelToggle from './Components/AssumeFullLevelToggle';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { BuildStatus } from './Components/BuildAlert';
import BuildDisplayItem from './Components/BuildDisplayItem';
import ChartCard, { ChartData } from './Components/ChartCard';
import MainStatSelectionCard from './Components/MainStatSelectionCard';
import OptimizationTargetSelector from './Components/OptimizationTargetSelector';
import StatFilterCard from './Components/StatFilterCard';
import UseEquipped from './Components/UseEquipped';
import UseExcluded from './Components/UseExcluded';
import { defThreads, useOptimizeDBState } from './DBState';
import { compactArtifacts, dynamicData } from './foreground';
import useBuildSetting from './useBuildSetting';

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

  const noArtifact = useMemo(() => !database.arts.values.length, [database])

  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey)
  const { plotBase, optimizationTarget, mainStatAssumptionLevel, allowPartial, builds, buildDate, maxBuildsToShow, levelLow, levelHigh } = buildSetting
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}
  const buildsArts = useMemo(() => builds.map(build => build.map(i => database.arts.get(i)!)), [builds, database])

  //register changes in artifact database
  useEffect(() =>
    database.arts.followAny(setArtsDirty),
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
    const filteredArts = database.arts.values.filter(art => {
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
    const setPerms = filterFeasiblePerm(artSetPerm(artSetExclusion, Object.values(split.values).flatMap(x => x.map(x => x.set!))), split)

    const minimum = [...valueFilter.map(x => x.minimum), -Infinity]
    const status: Omit<BuildStatus, "type"> = { tested: 0, failed: 0, skipped: 0, total: NaN, startTime: performance.now() }
    if (plotBase) {
      nodes.push(input.total[plotBase])
      minimum.push(-Infinity)
    }

    const prepruneArts = arts
    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    ({ nodes, arts } = pruneAll(nodes, minimum, arts, maxBuildsToShow, artSetExclusion, {
      reaffine: true, pruneArtRange: true, pruneNodeRange: true, pruneOrder: true
    }))
    nodes = optimize(nodes, {}, _ => false)

    const mk = (b: DynStat) => {
      const g = (f: NumNode) => {
        const { operation } = f
        switch (operation) {
          case "const": return "" + f.value
          case "read":
            const bs = b[f.path[1]] !== 0 ? `${b[f.path[1]]} + ` : ""
            return `(${bs}s.reduce((a, b)=> a + b.values["${f.path[1]}"], 0) )`
          case "min": case "max":
            return `Math.${f.operation}( ${f.operands.map(g).join(", ")} )`
          case "add": return `( ${f.operands.map(g).join(" + ")} )`
          case "mul": return `( ${f.operands.map(g).join(" * ")} )`
          case "sum_frac":
            const [x, c] = f.operands.map(g)
            return `( ${x} / ( ${x} + ${c} ) )`
          case "threshold":
            const [value, threshold, pass, fail] = f.operands.map(g)
            return `( ${value} >= ${threshold} ? ${pass} : ${fail} )`
          case "res":
            const res = g(f.operands[0])
            return `res(${res})`
          default: throw new Error(`Unsupported ${operation} node`)
        }
      };
      return g
    }

    const cN: { (s: ArtifactBuildData[]): number; }[] = nodes.map((n) => new (Function as any)('s', `"use strict";\nconst res = (res) => ( (res < 0) ? (1 - res / 2) : (res >= 0.75) ? (1 / (res * 4 + 1)) : (1 - res) )\nreturn ${mk(arts.base)(n)}`))
    const pCN = plotBase ? cN.pop() : undefined
    let s = 0 / 0
    let min = 0 / 0
    if (plotBase) {
      const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, { min: x, max: x }]))
      const reads = addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))])
      const nodeRange = computeNodeRange(nodes, reads)
      const r = nodeRange.get(nodes[nodes.length - 1])!
      s = 4096 / (r.max - r.min)
      min = r.min
    }
    const tCN = cN.pop()!

    const m = new Float64Array(maxBuildsToShow);
    const mI = Array(maxBuildsToShow)
    const pA = new Float32Array(4096)
    const pAI = new Array(4096)
    function p(as) {
      const acc = new Array(as.length);
      return (function f(i) {
        if (i + 1 === as.length) {
          for (const x of as[i]) {
            acc[i] = x
            if (cN.every((n, i) => n(acc) > minimum[i])) {
              const t = tCN(acc)
              if (t >= m[0]) {
                l: do {
                  let i = 0
                  for (; i < m.length - 1; i++) {
                    if (t >= m[i]) {
                      m[i] = m[i + 1]
                      mI[i] = mI[i + 1]
                    } else {
                      m[i] = t
                      mI[i] = acc.slice()
                      break l
                    }
                  }
                  if (!(t >= m[i])) {
                    i = i - 1
                  }
                  m[i] = t
                  mI[i] = acc.slice()
                } while (0);
              }
              if (pCN) {
                const p = pCN(acc)
                const i = (s * (p - min)) | 0
                if (t > pA[i]) {
                  pA[i] = t
                  pAI[i] = acc.slice()
                }
              }
            }
          }
          return
        }
        for (const x of as[i]) {
          acc[i] = x
          f(i + 1)
        }
      })(0)
    }

    status.total = Object.values(arts.values).reduce((a, x) => a * x.length, 1)
    setBuildStatus({ type: "active", ...status })
    p(Object.values(arts.values))
    const plotBaseNode = plotBase ? nodes.pop() : undefined
    optimizationTargetNode = nodes.pop()!

    if (plotBase) {
      let data: Build[] = Object.entries(pAI).map(([i, value]) => (
        {
          value: pA[+i | 0],
          plot: +i / s + min,
          artifactIds: (value as any[]).map(v => v.id)
        }
      ))
      const plotBaseNode = input.total[plotBase] as NumNode
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

    const builds = Object.entries(mI).map(([i, value]) => (
      {
        value: m[+i | 0],
        artifactIds: (value as any[]).map(v => v.id)
      }
    )).slice(0, maxBuildsToShow)
    if (process.env.NODE_ENV === "development") console.log("Build Result", builds)
    buildSettingDispatch({ builds: builds.map(build => build.artifactIds), buildDate: Date.now() })

    status.tested = status.total
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
            <CardContent>Artifact Level Filter</CardContent>
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
              startIcon={<TrendingUp />}
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
      <OptimizationTargetContext.Provider value={optimizationTarget}>
        <BuildList buildsArts={buildsArts} characterKey={characterKey} data={data} compareData={compareData} disabled={!!generatingBuilds} />
      </OptimizationTargetContext.Provider>
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
