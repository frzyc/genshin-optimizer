import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import Worker from "worker-loader!./BackgroundWorker";
import Artifact from '../Artifact/Artifact';
import { ArtifactSheet } from '../Artifact/ArtifactSheet_WR';
import CharacterCard from '../Character/CharacterCard';
import ArtifactLevelSlider from '../Components/Artifact/ArtifactLevelSlider';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton';
import CloseButton from '../Components/CloseButton';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import InfoComponent from '../Components/InfoComponent';
import ModalWrapper from '../Components/ModalWrapper';
import SolidToggleButtonGroup from '../Components/SolidToggleButtonGroup';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import { DataContext, dataContextObj, TeamData } from '../DataContext';
import { dataObjForTeam, mergeData } from '../Formula/api';
import { dynamicData, input } from '../Formula/index';
import { optimize } from '../Formula/optimization';
import { NumNode } from '../Formula/type';
import { GlobalSettingsContext } from '../GlobalSettings';
import useCharacter from '../ReactHooks/useCharacter';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import useTeamData, { getTeamData } from '../ReactHooks/useTeamData';
import { ICachedArtifact } from '../Types/artifact';
import { ArtifactsBySlot, BuildSetting } from '../Types/Build';
import { allSlotKeys, CharacterKey } from '../Types/consts';
import { objectFromKeyMap, objectMap, objPathValue } from '../Util/Util';
import { calculateTotalBuildNumber, maxBuildsToShowList } from './Build';
import { initialBuildSettings } from './BuildSetting';
import { compactArtifacts, compactNodes, countBuilds, filterArts, mergeBuilds, mergePlot, pruneOrder, pruneRange, setPermutations } from './Build_WR';
import ChartCard from './ChartCard';
import ArtifactBuildDisplayItem from './Components/ArtifactBuildDisplayItem';
import ArtifactConditionalCard from './Components/ArtifactConditionalCard';
import ArtifactSetPicker from './Components/ArtifactSetPicker';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { warningBuildNumber } from './Components/BuildAlert';
import EnemyEditorCard from './Components/EnemyEditorCard';
import HitModeCard from './Components/HitModeCard';
import MainStatSelectionCard, { artifactsSlotsToSelectMainStats } from './Components/MainStatSelectionCard';
import OptimizationTargetSelector from './Components/OptimizationTargetSelector';
import StatFilterCard from './Components/StatFilterCard';
import TeamBuffCard from './Components/TeamBuffCard';
import { Finalize, FinalizeResult, Request, Setup, WorkerResult } from './Worker';

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('../Character/CharacterDisplayCard'))

function buildSettingsReducer(state: BuildSetting, action): BuildSetting {
  switch (action.type) {
    case 'mainStatKey': {
      const { slotKey, mainStatKey } = action
      const mainStatKeys = { ...state.mainStatKeys }//create a new object to update react dependencies

      if (state.mainStatKeys[slotKey].includes(mainStatKey))
        mainStatKeys[slotKey] = mainStatKeys[slotKey].filter(k => k !== mainStatKey)
      else
        mainStatKeys[slotKey].push(mainStatKey)
      return { ...state, mainStatKeys }
    }
    case 'mainStatKeyReset': {
      const { slotKey } = action
      const mainStatKeys = { ...state.mainStatKeys }//create a new object to update react dependencies
      mainStatKeys[slotKey] = []
      return { ...state, mainStatKeys }
    }
    case `setFilter`: {
      const { index, key, num = 0 } = action
      state.setFilters[index] = { key, num }
      return { ...state, setFilters: [...state.setFilters] }//do this because this is a dependency, so needs to be a "new" array
    }
    default:
      break;
  }
  return { ...state, ...action }
}

const plotMaxPoints = 1500

export default function BuildDisplay({ location: { characterKey: propCharacterKey } }) {
  const { globalSettings: { tcMode } } = useContext(GlobalSettingsContext)
  const database = useContext(DatabaseContext)
  const [characterKey, setcharacterKey] = useState(() => {
    let { characterKey = "" } = dbStorage.get("BuildsDisplay.state") ?? {}
    //NOTE that propCharacterKey can override the selected character.
    characterKey = propCharacterKey ?? characterKey
    if (characterKey && !database._getChar(characterKey))
      characterKey = ""
    return characterKey
  })

  const [modalBuildIndex, setmodalBuildIndex] = useState(-1) // the index of the newBuild that is being displayed in the character modal,

  const [generatingBuilds, setgeneratingBuilds] = useState(false)
  const [generationProgress, setgenerationProgress] = useState(0)
  const [generationDuration, setgenerationDuration] = useState(0)//in ms
  const [generationSkipped, setgenerationSkipped] = useState(0)

  const [chartData, setchartData] = useState(undefined as any)

  const artifactSheets = usePromise(ArtifactSheet.getAll, [])

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const setCharacter = useCharSelectionCallback()
  const characterDispatch = useCharacterReducer(characterKey)
  const character = useCharacter(characterKey)
  const buildSettings = character?.buildSettings ?? initialBuildSettings()
  const { plotBase, setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow, levelLow, levelHigh } = buildSettings
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey] ?? {}

  const [teamDataBuilds, setTeamDataBuilds] = useState([] as TeamData[])

  const compareData = character?.compareData ?? false

  const noCharacter = useMemo(() => !database._getCharKeys().length, [database])
  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const buildSettingsDispatch = useCallback((action) =>
    characterDispatch && characterDispatch({ buildSettings: buildSettingsReducer(buildSettings, action) })
    , [characterDispatch, buildSettings])

  useEffect(() => ReactGA.pageview('/build'), [])

  //select a new character Key
  const selectCharacter = useCallback((cKey = "") => {
    if (characterKey === cKey) return
    setcharacterKey(cKey)
    setchartData(undefined)
  }, [setcharacterKey, characterKey])

  //register changes in artifact database
  useEffect(() =>
    database.followAnyArt(setArtsDirty),
    [setArtsDirty, database])

  //save to BuildsDisplay.state on change
  useEffect(() => {
    dbStorage.set("BuildsDisplay.state", { characterKey })
  }, [characterKey])

  const { split, totBuildNumber } = useMemo(() => {
    if (!characterKey) // Make sure we have all slotKeys
      return { split: objectFromKeyMap(allSlotKeys, () => []) as ArtifactsBySlot, totBuildNumber: 0 }
    const artifactDatabase = database._getArts().filter(art => {
      if (art.level < levelLow) return false
      if (art.level > levelHigh) return false
      // If its equipped on the selected character, bypass the check
      if (art.location === characterKey) return true

      if (art.exclude && !useExcludedArts) return false
      if (art.location && !useEquippedArts) return false
      return true
    })
    const split = Artifact.splitArtifactsBySlot(artifactDatabase);
    // Filter the split slots on the mainstats selected.
    artifactsSlotsToSelectMainStats.forEach(slotKey =>
      mainStatKeys[slotKey].length && (split[slotKey] = split[slotKey]?.filter((art) => mainStatKeys[slotKey].includes(art.mainStatKey))))
    const totBuildNumber = calculateTotalBuildNumber(split, setFilters)
    return artsDirty && { split, totBuildNumber }
  }, [characterKey, useExcludedArts, useEquippedArts, mainStatKeys, setFilters, levelLow, levelHigh, artsDirty, database])

  // Reset the Alert by setting progress to zero.
  useEffect(() => {
    setgenerationProgress(0)
  }, [totBuildNumber])

  // Provides a function to cancel the work
  const cancelToken = useRef(() => { })
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])
  const generateBuilds = useCallback(async () => {
    if (!optimizationTarget) return
    const teamData = await getTeamData(database, characterKey, mainStatAssumptionLevel, [])
    if (!teamData) return
    const workerData = dataObjForTeam(teamData.teamData)[characterKey as CharacterKey]?.target.data![0]
    if (!workerData) return
    Object.entries(mergeData([workerData, dynamicData])).forEach(([key, value]) =>
      workerData[key] = value as any) // Mark art fields as dynamic
    const optimizationTargetNode = objPathValue(workerData.display ?? {}, optimizationTarget) as NumNode | undefined
    if (!optimizationTargetNode) return
    const valueFilter: { value: NumNode, minimum: number }[] = [] // TODO: Connect to statFilter

    const t1 = performance.now()
    setgeneratingBuilds(true)
    setchartData(undefined)
    setgenerationDuration(0)
    setgenerationProgress(0)
    setgenerationSkipped(0)

    let cancelled = false
    const workerkillers = [] as (() => void)[]
    cancelToken.current = () => {
      cancelled = true
      workerkillers.forEach(w => w())
    }

    let nodes = optimize([optimizationTargetNode, ...valueFilter.map(x => x.value)], workerData, ({ path: [p] }) => p !== "dyn")
    let affine: NumNode[]
    const minimum = [-Infinity, ...valueFilter.map(x => x.minimum)]
    {
      const compact = compactNodes(nodes)
      nodes = compact.nodes
      affine = compact.affine
    }
    let { artifactsBySlot, base } = compactArtifacts(database, affine, workerData, mainStatAssumptionLevel)
    const origCount = countBuilds(artifactsBySlot)

    while (true) {
      const newArts = pruneRange(nodes, artifactsBySlot, base, minimum)
      if (newArts === artifactsBySlot)
        break
      artifactsBySlot = newArts
    }
    artifactsBySlot = pruneOrder(artifactsBySlot, maxBuildsToShow)

    let buildCount = 0, failedCount = 0, skippedCount = origCount - countBuilds(artifactsBySlot)
    let threshold = -Infinity

    const setPerm = setPermutations(Object.fromEntries(setFilters.map(({ key, num }) => [key, num]).filter(x => x[1])))[Symbol.iterator]()

    function fetchWork(): Request | undefined {
      const next = setPerm.next()
      if (next.done) return
      const filter = next.value

      const filtered = filterArts(artifactsBySlot, filter)
      const count = countBuilds(filtered)

      // TODO: Break down filter when `count` is too high
      return {
        command: "request",
        threshold, filter,
      }
    }

    const maxWorkers = navigator.hardwareConcurrency || 4
    const workers: Worker[] = [], finalized: Promise<FinalizeResult>[] = []
    for (let i = 0; i < maxWorkers; i++) {
      const worker = new Worker()

      const setup: Setup = {
        command: "setup",
        id: `${i}`,
        affineBase: base,
        artifactsBySlot,
        optimizationTarget: nodes[0],
        plotBase: input.total[plotBase],
        maxBuildsToShow,
        filters: nodes
          .map((value, i) => ({ value, min: minimum[i] }))
          .filter(x => x.min > -Infinity)
      }
      worker.postMessage(setup, undefined)

      let finalize: (_: FinalizeResult) => void
      const finalizePromise = new Promise<FinalizeResult>(r => finalize = r)
      worker.onmessage = async ({ data }: { data: WorkerResult }) => {
        switch (data.command) {
          case "interim":
            buildCount += data.buildCount
            failedCount += data.failedCount
            skippedCount += data.skippedCount
            if (threshold < data.threshold) threshold = data.threshold
            break
          case "request":
            const work = fetchWork()
            if (work) {
              worker.postMessage(work)
            } else {
              const finalize: Finalize = { command: "finalize" }
              worker.postMessage(finalize)
            }
            break
          case "finalize": finalize(data); break
          default: console.log("DEBUG", data)
        }
      }

      workers.push(worker)
      workerkillers.push(() => worker.terminate())
      finalized.push(finalizePromise)
    }

    const buildTimer = setInterval(() => {
      setgenerationProgress(buildCount)
      setgenerationDuration(performance.now() - t1)
    }, 100)
    const results = await Promise.all(finalized)
    workerkillers.forEach(x => x())
    clearInterval(buildTimer)
    cancelToken.current = () => { }

    // TODO Check below that the data are sent to the UI & DB properly

    if (cancelled) {
      setgenerationDuration(0)
      setgenerationProgress(0)
      setgenerationSkipped(0)
    } else {
      if (plotBase) {
        const plotData = mergePlot(results.map(x => x.plotData!))
        setchartData(plotData)
      }
      const builds = mergeBuilds(results.map(x => x.builds), maxBuildsToShow)
      setTeamDataBuilds(await Promise.all(builds.map(async ({ artifactIds: b }) => {
        const { teamData, teamBundle } = (await getTeamData(database, characterKey, mainStatAssumptionLevel, Object.values(b).filter(a => a).map(a => database._getArt(a as any)) as ICachedArtifact[])) as any
        const calcData = dataObjForTeam(teamData)
        const data = objectMap(calcData as any, (obj: object, ck) => {
          const { data: _, ...rest } = teamBundle[ck]
          return { ...obj, ...rest }
        })
        return data
      })))
      buildSettingsDispatch({ builds: builds.map(build => build.artifactIds), buildDate: Date.now() })
      const totalDuration = performance.now() - t1

      setgenerationProgress(buildCount)
      setgenerationDuration(totalDuration)

      ReactGA.timing({
        category: "Build Generation",
        variable: "timing",
        value: totalDuration,
        label: totBuildNumber.toString()
      })
    }
    setgeneratingBuilds(false)
  }, [data, database, artifactSheets, split, totBuildNumber, mainStatAssumptionLevel, maxBuildsToShow, optimizationTarget, setFilters, statFilters, plotBase, tcMode, buildSettingsDispatch])

  const characterName = characterSheet?.name ?? "Character Name"

  const closeBuildModal = useCallback(() => setmodalBuildIndex(-1), [setmodalBuildIndex])
  const setPlotBase = useCallback(plotBase => {
    buildSettingsDispatch({ plotBase })
    setchartData(undefined)
  }, [buildSettingsDispatch])
  const dataContext: dataContextObj | undefined = data && characterSheet && character && {
    data,
    characterSheet,
    character,
    mainStatAssumptionLevel,
    characterDispatch
  }
  return <Box display="flex" flexDirection="column" gap={1} sx={{ my: 1 }}>
    <InfoComponent
      pageKey="buildPage"
      modalTitle="Character Management Page Guide"
      text={["For self-infused attacks, like Noelle's Sweeping Time, enable the skill in the character talent page.",
        "You can compare the difference between equipped artifacts and generated builds.",
        "Rainbow builds can sometimes be \"optimal\". Good substat combinations can sometimes surpass set effects.",
        "The more complex the formula, the longer the generation time.",]}
    ><InfoDisplay /></InfoComponent>
    <BuildModal teamData={teamDataBuilds[modalBuildIndex]} characterKey={characterKey} onClose={closeBuildModal} />
    {noCharacter && <Alert severity="error" variant="filled"> Opps! It looks like you haven't added a character to GO yet! You should go to the <Link component={RouterLink} to="/character">Characters</Link> page and add some!</Alert>}
    {noArtifact && <Alert severity="warning" variant="filled"> Opps! It looks like you haven't added any artifacts to GO yet! You should go to the <Link component={RouterLink} to="/artifact">Artifacts</Link> page and add some!</Alert>}
    {/* Build Generator Editor */}
    {!dataContext && <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Typography variant="h6">Build Generator</Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <CardLight>
          <CardContent>
            <CharacterDropdownButton fullWidth value={characterKey} onChange={selectCharacter} disabled={generatingBuilds} />
          </CardContent>
        </CardLight>
      </CardContent>
    </CardDark>}
    {dataContext && <DataContext.Provider value={dataContext}>
      <CardDark>
        <CardContent sx={{ py: 1 }}>
          <Typography variant="h6">Build Generator</Typography>
        </CardContent>
        <Divider />
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Grid container spacing={1} >
            {/* Left half */}
            <Grid item xs={12} md={6} lg={5} display="flex" flexDirection="column" gap={1}>
              <CardLight>
                <CardContent>
                  <CharacterDropdownButton fullWidth value={characterKey} onChange={selectCharacter} disabled={generatingBuilds} />
                </CardContent>
              </CardLight>
              {/* character card */}
              <Box><CharacterCard characterKey={characterKey} onClick={generatingBuilds ? undefined : setCharacter} /></Box>

              <BonusStatsCard />
              <TeamBuffCard />
              {/* Enemy Editor */}
              <EnemyEditorCard />
              {/*Minimum Final Stat Filter */}
              <StatFilterCard statFilters={statFilters} setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} disabled={generatingBuilds} />
              {/* Hit mode options */}
              <HitModeCard disabled={generatingBuilds} />
            </Grid>

            {/* Right half */}
            <Grid item xs={12} md={6} lg={7} display="flex" flexDirection="column" gap={1}>
              <ArtifactConditionalCard disabled={generatingBuilds} />

              {/* Artifact set pickers */}
              {setFilters.map((setFilter, index) => (index <= setFilters.filter(s => s.key).length) && <ArtifactSetPicker key={index} index={index} setFilters={setFilters}
                disabled={generatingBuilds} onChange={(index, key, num) => buildSettingsDispatch({ type: 'setFilter', index, key, num })} />)}

              {/* use equipped/excluded */}
              {characterKey && <CardLight><CardContent>
                <Grid container spacing={1}>
                  <Grid item flexGrow={1}>
                    <Button fullWidth onClick={() => buildSettingsDispatch({ useEquippedArts: !useEquippedArts })} disabled={generatingBuilds} startIcon={useEquippedArts ? <CheckBox /> : <CheckBoxOutlineBlank />}>
                      Use Equipped Artifacts
                    </Button>
                  </Grid>
                  <Grid item flexGrow={1}>
                    <Button fullWidth onClick={() => buildSettingsDispatch({ useExcludedArts: !useExcludedArts })} disabled={generatingBuilds} startIcon={useExcludedArts ? <CheckBox /> : <CheckBoxOutlineBlank />}>
                      Use Excluded Artifacts
                    </Button>
                  </Grid>
                </Grid>
              </CardContent></CardLight>}

              { /* Level Filter */}
              {characterKey && <CardLight>
                <CardContent sx={{ py: 1 }}>
                  Artifact Level Filter
                </CardContent>
                <Divider />
                <CardContent>
                  <ArtifactLevelSlider levelLow={levelLow} levelHigh={levelHigh} dark
                    setLow={levelLow => buildSettingsDispatch({ levelLow })}
                    setHigh={levelHigh => buildSettingsDispatch({ levelHigh })}
                    setBoth={(levelLow, levelHigh) => buildSettingsDispatch({ levelLow, levelHigh })} />
                </CardContent>
              </CardLight>}
              {/* main stat selector */}
              {characterKey && <MainStatSelectionCard
                mainStatAssumptionLevel={mainStatAssumptionLevel}
                mainStatKeys={mainStatKeys}
                onChangeMainStatKey={(slotKey, mainStatKey = undefined) => {
                  if (mainStatKey === undefined)
                    buildSettingsDispatch({ type: "mainStatKeyReset", slotKey })
                  else
                    buildSettingsDispatch({ type: "mainStatKey", slotKey, mainStatKey })
                }}
                onChangeAssLevel={mainStatAssumptionLevel => buildSettingsDispatch({ mainStatAssumptionLevel })}
                disabled={generatingBuilds}
              />}
            </Grid>
          </Grid>
          {/* Footer */}
          <Grid container spacing={1}>
            <Grid item flexGrow={1} >
              <ButtonGroup>
                <Button
                  disabled={!characterKey || generatingBuilds || !optimizationTarget || !totBuildNumber}
                  color={(characterKey && totBuildNumber <= warningBuildNumber) ? "success" : "warning"}
                  onClick={generateBuilds}
                  startIcon={<FontAwesomeIcon icon={faCalculator} />}
                >Generate</Button>
                {/* <Tooltip title={<Typography></Typography>} placement="top" arrow> */}
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
                {/* </Tooltip> */}
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
            <ChartCard disabled={generatingBuilds} plotData={chartData} plotBase={plotBase} setPlotBase={setPlotBase} />
          </Box>}
        </CardContent>
      </CardDark>
      <CardDark>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" >
            <Typography>
              {teamDataBuilds ? <span>Showing <strong>{teamDataBuilds.length}</strong> Builds generated for {characterName}. {!!buildDate && <span>Build generated on: <strong>{(new Date(buildDate)).toLocaleString()}</strong></span>}</span>
                : <span>Select a character to generate builds.</span>}
            </Typography>
            <SolidToggleButtonGroup exclusive value={compareData} onChange={(e, v) => characterDispatch({ compareData: v })} size="small">
              <ToggleButton value={false} disabled={!compareData}>
                <small>Show New artifact Stats</small>
              </ToggleButton>
              <ToggleButton value={true} disabled={compareData}>
                <small>Compare against equipped artifacts</small>
              </ToggleButton>
            </SolidToggleButtonGroup>
          </Box>
        </CardContent>
      </CardDark>
      <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
        {/* Build List */}
        {teamDataBuilds?.map((teamData, index) => <DataContext.Provider key={index} value={{ ...dataContext, data: teamData[characterKey].target, teamData, oldData: data }}>
          <ArtifactBuildDisplayItem index={index} key={index} onClick={() => setmodalBuildIndex(index)} compareBuild={compareData} disabled={!!generatingBuilds} />
        </DataContext.Provider>
        )}
      </Suspense>
    </DataContext.Provider>}
  </Box>
}

function BuildModal({ teamData, characterKey, onClose }: { teamData: TeamData, characterKey: CharacterKey, onClose: () => void }) {
  return <ModalWrapper open={!!teamData} onClose={onClose} containerProps={{ maxWidth: "xl" }}>
    <CharacterDisplayCard
      characterKey={characterKey}
      newteamData={teamData}
      onClose={onClose}
      footer={<CloseButton large onClick={onClose} />} />
  </ModalWrapper>
}
