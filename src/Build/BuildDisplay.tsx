import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { Alert, Box, Button, ButtonGroup, CardContent, Divider, Grid, Link, MenuItem, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import Worker from "worker-loader!./BuildWorker";
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
import { DataContext, dataContextObj } from '../DataContext';
import { GlobalSettingsContext } from '../GlobalSettings';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useCharUIData from '../ReactHooks/useCharUIData';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { ArtifactsBySlot, BuildSetting } from '../Types/Build';
import { allSlotKeys } from '../Types/consts';
import { objectFromKeyMap } from '../Util/Util';
import { calculateTotalBuildNumber, maxBuildsToShowList } from './Build';
import { initialBuildSettings } from './BuildSetting';
import ArtifactConditionalCard from './Components/ArtifactConditionalCard';
import ArtifactSetPicker from './Components/ArtifactSetPicker';
import BonusStatsCard from './Components/BonusStatsCard';
import BuildAlert, { warningBuildNumber } from './Components/BuildAlert';
import EnemyEditorCard from './Components/EnemyEditorCard';
import HitModeCard from './Components/HitModeCard';
import MainStatSelectionCard, { artifactsSlotsToSelectMainStats } from './Components/MainStatSelectionCard';
import StatFilterCard from './Components/StatFilterCard';
import TeamBuffCard from './Components/TeamBuffCard';
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

  const { data, character, characterSheet, weapon, weaponSheet, dataWoArt } = useCharUIData(characterKey) ?? {}
  const compareData = character?.compareData ?? false
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

  const buildSettings = character?.buildSettings ?? initialBuildSettings()
  const { plotBase, setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow, levelLow, levelHigh } = buildSettings


  // const buildStats = useMemo(() => {
  //   if (!initialStats || !artifactSheets) return []
  //   return builds.map(build => {
  //     const arts = Object.fromEntries(build.map(id => database._getArt(id)).map(art => [art?.slotKey, art]))
  //     const stats = Character.calculateBuildwithArtifact(deepCloneStats(initialStats), arts, artifactSheets)
  //     return finalStatProcess(stats)
  //   }).filter(build => build)
  // }, [builds, database, initialStats, artifactSheets])

  const noCharacter = useMemo(() => !database._getCharKeys().length, [database])
  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const buildSettingsDispatch = useCallback((action) =>
    character && characterDispatch({ buildSettings: buildSettingsReducer(buildSettings, action) })
    , [character, characterDispatch, buildSettings])

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

  //validate optimizationTarget
  // useEffect(() => {
  //   if (!optimizationTarget) return
  //   if (!statsDisplayKeys) return
  //   if (!Array.isArray(optimizationTarget)) return
  //   for (const sectionKey in statsDisplayKeys) {
  //     const section = statsDisplayKeys[sectionKey]
  //     for (const keys of section)
  //       if (JSON.stringify(keys) === JSON.stringify(optimizationTarget)) return
  //   }
  //   buildSettingsDispatch({ optimizationTarget: initialBuildSettings().optimizationTarget })
  // }, [optimizationTarget, statsDisplayKeys, buildSettingsDispatch])

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
    // const t1 = performance.now()
    // if (!initialStats || !artifactSheets) return
    // let canceled = false
    // const workerkillers = [] as Array<() => void>
    // cancelToken.current = () => {
    //   canceled = true
    //   workerkillers.forEach(w => w())
    // }
    // setgeneratingBuilds(true)
    // setchartData(undefined)
    // setgenerationDuration(0)
    // setgenerationProgress(0)
    // setgenerationSkipped(0)
    // //get the formula for this target

    // const artifactSetEffects = undefined Artifact.setEffectsObjs(artifactSheets, initialStats)
    // const splitArtifacts = deepClone(split) as ArtifactsBySlot
    // //add mainStatVal to each artifact
    // Object.values(splitArtifacts).forEach(artArr => {
    //   artArr!.forEach(art => {
    //     art.mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level)) ?? 0;
    //   })
    // })

    // let targetKeys: string[]
    // if (typeof optimizationTarget === "string") {
    //   targetKeys = [optimizationTarget]
    // } else {
    //   const targetFormula = await Formula.get(optimizationTarget)
    //   if (typeof targetFormula === "function")
    //     [, targetKeys] = targetFormula(initialStats)
    //   else
    //     return setgeneratingBuilds(false)
    // }

    // const artifactSetBySlot = Object.fromEntries(Object.entries(splitArtifacts).map(([key, artifacts]) =>
    //   [key, new Set(artifacts.map(artifact => artifact.setKey))]
    // ))
    // function canApply(set: ArtifactSetKey, num: SetNum, setBySlot: Dict<SlotKey, Set<ArtifactSetKey>>, filters: SetFilter): boolean {
    //   const otherNum = filters.reduce((accu, { key, num }) => key === set ? accu : accu + num, 0)
    //   const artNum = Object.values(setBySlot).filter(sets => sets.has(set)).length
    //   return otherNum + num <= 5 && num <= artNum
    // }
    // // modifierStats contains all modifiers that are applicable to the current build
    // const modifierStats: BonusStats = {}
    // Object.entries(artifactSetEffects).forEach(([set, effects]) =>
    //   Object.entries(effects).filter(([setNum, stats]) =>
    //     ("modifiers" in stats) && canApply(set, parseInt(setNum) as SetNum, artifactSetBySlot, setFilters)
    //   ).forEach(bonus => mergeStats(modifierStats, bonus[1]))
    // )
    // mergeStats(modifierStats, { modifiers: initialStats.modifiers ?? {} })
    // const dependencies = GetDependencies(initialStats, modifierStats.modifiers, [...targetKeys, ...Object.keys(statFilters), ...(tcMode && plotBase ? [plotBase] : [])]) as StatKey[]
    // const oldCount = calculateTotalBuildNumber(splitArtifacts, setFilters)

    // let prunedArtifacts = splitArtifacts, newCount = oldCount

    // { // Prune artifact with strictly inferior (relevant) stats.
    //   // Don't prune artifact sets that are filtered
    //   const alwaysAccepted = setFilters.map(set => set.key) as any

    //   prunedArtifacts = Object.fromEntries(Object.entries(splitArtifacts).map(([key, values]) =>
    //     [key, pruneArtifacts(values, artifactSetEffects, new Set(dependencies), initialStats, maxBuildsToShow, new Set(alwaysAccepted))]))
    //   newCount = calculateTotalBuildNumber(prunedArtifacts, setFilters)
    // }
    // setgenerationSkipped(oldCount - newCount)
    // let buildCount = 0, workersTime = 0
    // let builds: Build[] = []
    // const plotDataMap: Dict<string, number> = {}
    // let bucketSize = 0.01

    // const cleanupBuilds = () => {
    //   builds.sort((a, b) => (b.buildFilterVal - a.buildFilterVal))
    //   builds.splice(maxBuildsToShow)
    // }

    // const cleanupPlots = () => {
    //   let entries = Object.entries(plotDataMap)
    //   while (entries.length > plotMaxPoints) {
    //     const multiplier = Math.pow(2, Math.ceil(Math.log2(entries.length / plotMaxPoints)))
    //     bucketSize *= multiplier
    //     for (const [x, y] of entries) {
    //       delete plotDataMap[x]
    //       const index = Math.round(parseInt(x) / multiplier)
    //       plotDataMap[index] = Math.max(plotDataMap[index] ?? -Infinity, y)
    //     }
    //     entries = Object.entries(plotDataMap)
    //   }
    // }

    // const maxWorkers = navigator.hardwareConcurrency || 4
    // /**
    //  * Find the slot in the pruned artifacts with the lowest number of artifacts that are >= maxWorkers.
    //  * This makes sure that it wont have a case where there is only one artifact of a slot, that ultimately makes this single-threaded.
    //  */
    // const leastSlot = Object.entries(prunedArtifacts).reduce((lowestKey, [key, arr]) =>
    //   (arr.length >= maxWorkers && arr.length < prunedArtifacts[lowestKey].length) ? key : lowestKey
    //   , "flower") as unknown as SlotKey

    // let workIndex = 0

    // /**
    //  * Rudimentary thread pool implementation.
    //  * Only create the worker is there is actual work to do.
    //  * Once a worker finished one "workerIndex", it tries to move onto another one.
    //  */
    // function WorkerWorker(worker: Worker | null, workerIndex: number) {
    //   return new Promise<Worker | null>((resolve) => {
    //     const localWorkIndex = workIndex
    //     if (canceled || localWorkIndex >= prunedArtifacts[leastSlot]!.length) {
    //       // console.log(workerIndex, "completed", performance.now() - t1);
    //       return resolve(worker)
    //     }
    //     const workInSlot = prunedArtifacts[leastSlot]![localWorkIndex]!
    //     const workPrunedArtifacts = { ...prunedArtifacts, [leastSlot]: [workInSlot] }
    //     const data = { dependencies, initialStats, maxBuildsToShow, minFilters: statFilters, optimizationTarget, plotBase, prunedArtifacts: workPrunedArtifacts, setFilters, artifactSetEffects } as BuildRequest
    //     if (!worker) {
    //       worker = new Worker()
    //       workerkillers.push(() => resolve(worker))
    //     }
    //     worker.onmessage = async ({ data }) => {
    //       if (data.buildCount) {
    //         const { buildCount: workerCount, builds: workerbuilds } = data
    //         buildCount += workerCount
    //         if (workerbuilds.length) builds = builds.concat(workerbuilds)
    //       }
    //       if (data.plotDataMap) {
    //         const { plotDataMap: workerPlotDataMap } = data
    //         Object.entries(workerPlotDataMap as object).forEach(([index, value]) =>
    //           plotDataMap[index] = Math.max(value, plotDataMap[index] ?? -Infinity))
    //       }
    //       if (data.timing)
    //         workersTime += data.timing
    //       if (data.finished) {
    //         // console.log("WORKER", workerIndex, "finished", localWorkIndex)
    //         resolve(await WorkerWorker(worker, workerIndex))
    //       }
    //     }
    //     // console.log("WORKER", workerIndex, "starting on", localWorkIndex)
    //     worker.postMessage(data)
    //     workIndex++
    //   })
    // }

    // const workersPromises = [...Array(maxWorkers).keys()].map(i => WorkerWorker(null, i))
    // const buildTimer = setInterval(() => {
    //   setgenerationProgress(buildCount)
    //   setgenerationDuration(performance.now() - t1)
    // }, 100)
    // const finWorkers = await Promise.all(workersPromises)
    // finWorkers.forEach(w => w?.terminate())
    // clearInterval(buildTimer)
    // cancelToken.current = () => { }
    // if (canceled) {
    //   setgenerationDuration(0)
    //   setgenerationProgress(0)
    //   setgenerationSkipped(0)
    // } else {
    //   cleanupBuilds()
    //   cleanupPlots()

    //   const plotData = plotBase
    //     ? Object.entries(plotDataMap)
    //       .map(([plotBase, optimizationTarget]) => ({ plotBase: parseInt(plotBase) * bucketSize, optimizationTarget }))
    //       .sort((a, b) => a.plotBase - b.plotBase)
    //     : undefined
    //   setchartData(plotData)
    //   const totalDuration = performance.now() - t1
    //   setgenerationProgress(buildCount)
    //   setgenerationDuration(totalDuration)
    //   ReactGA.timing({
    //     category: "Build Generation",
    //     variable: "timing",
    //     value: workersTime,
    //     label: totBuildNumber.toString()
    //   })
    //   const finalBuilds = (builds as Build[]).map(b => Object.values(b.artifacts).map(a => a.id))
    //   buildSettingsDispatch({ builds: finalBuilds, buildDate: Date.now() })
    // }
    // setgeneratingBuilds(false)
  }, [artifactSheets, split, totBuildNumber, mainStatAssumptionLevel, maxBuildsToShow, optimizationTarget, setFilters, statFilters, plotBase, tcMode, buildSettingsDispatch])

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
    {/* <BuildModal build={buildStats[modalBuildIndex]} characterKey={characterKey} onClose={closeBuildModal} compareBuild={compareBuild} /> */}
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

              {!!character && <BonusStatsCard character={character} />}
              <TeamBuffCard />
              {/* Enemy Editor */}
              {!!character && <EnemyEditorCard />}
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
                  disabled={!characterKey || generatingBuilds}
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
              {/* {statsDisplayKeys && sheets && initialStats && <OptimizationTargetSelector
              optimizationTarget={optimizationTarget}
              setTarget={target => buildSettingsDispatch({ optimizationTarget: target })}
              disabled={!!generatingBuilds}
              sheets={sheets} initialStats={initialStats} statsDisplayKeys={statsDisplayKeys}
            />} */}
            </Grid>
          </Grid>

          {!!characterKey && <Box >
            <BuildAlert {...{ totBuildNumber, generatingBuilds, generationSkipped, generationProgress, generationDuration, characterName, maxBuildsToShow }} />
          </Box>}
          {/* {tcMode && statsDisplayKeys && <Box >
          <ChartCard disabled={generatingBuilds} data={chartData} plotBase={plotBase} setPlotBase={setPlotBase} statKeys={statsDisplayKeys?.basicKeys} />
        </Box>} */}
        </CardContent>
      </CardDark>
      <CardDark>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" >
            <Typography>
              {/* {buildStats ? <span>Showing <strong>{buildStats.length}</strong> Builds generated for {characterName}. {!!buildDate && <span>Build generated on: <strong>{(new Date(buildDate)).toLocaleString()}</strong></span>}</span>
              : <span>Select a character to generate builds.</span>} */}
            </Typography>
            <SolidToggleButtonGroup exclusive value={compareData} onChange={(e, v) => buildSettingsDispatch({ compareData: v })} size="small">
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
        {/* {buildStats?.map((build, index) =>
        sheets && equippedBuild && <ArtifactBuildDisplayItem sheets={sheets} equippedBuild={equippedBuild} newBuild={build} characterKey={characterKey as CharacterKey} index={index} key={Object.values(build.equippedArtifacts ?? {}).join()}
          statsDisplayKeys={statsDisplayKeys} onClick={() => setmodalBuildIndex(index)} compareBuild={compareData} disabled={!!generatingBuilds} />
      )} */}
      </Suspense>
    </DataContext.Provider>}
  </Box>
}

function BuildModal({ build, characterKey, onClose }) {
  return <ModalWrapper open={!!build} onClose={onClose} containerProps={{ maxWidth: "xl" }}>
    <CharacterDisplayCard
      characterKey={characterKey}
      newBuild={build}
      onClose={onClose}
      footer={<CloseButton large onClick={onClose} />} />
  </ModalWrapper>
}
