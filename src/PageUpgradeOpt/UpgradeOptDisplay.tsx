import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  Grid,
  Link,
  MenuItem,
  Skeleton,
  ToggleButton,
  Typography
} from '@mui/material';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from '../Components/Character/CharacterDropdownButton';
import StatFilterCard from '../Components/StatFilterCard';
import CharacterSheet from '../Data/Characters/CharacterSheet';
import { DatabaseContext } from '../Database/Database';
import { DataContext, dataContextObj } from '../DataContext';
import { mergeData, uiDataForTeam } from '../Formula/api';
import { uiInput as input } from '../Formula/index';
import { optimize } from '../Formula/optimization';
import { NumNode } from '../Formula/type';
import { UIData } from '../Formula/uiData';
import { initGlobalSettings } from '../GlobalSettings';
import CharacterCard from '../PageCharacter/CharacterCard';
import useCharacter from '../ReactHooks/useCharacter';
import useCharacterReducer, { characterReducerAction } from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useDBState from '../ReactHooks/useDBState';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useTeamData, { getTeamData } from '../ReactHooks/useTeamData';
import { ICachedArtifact, SubstatKey } from '../Types/artifact';
import { BuildSetting } from '../Types/Build';
import { allSlotKeys, ArtifactSetKey, CharacterKey } from '../Types/consts';
import { ICachedCharacter } from '../Types/character';
import { clamp, objPathValue } from '../Util/Util';
import { initialBuildSettings } from '../PageBuild/BuildSetting';
import ArtifactBuildDisplayItem from '../PageBuild/Components/ArtifactBuildDisplayItem';
import OptimizationTargetSelector from '../PageBuild/Components/OptimizationTargetSelector';
import { artSetPerm, compactArtifacts, dynamicData, splitFiltersBySet } from '../PageBuild/foreground';
import { QueryArtifact, QueryBuild, Query, querySetup, evalArtifact, QueryResult } from './artifactQuery'
import Artifact from "../Data/Artifacts/Artifact";
import ArtifactCard from "../PageArtifact/ArtifactCard";
import { useTranslation } from "react-i18next";
import UpgradeOptChartCard from "./UpgradeOptChartCard"
import { HitModeToggle, InfusionAuraDropdown, ReactionToggle } from '../Components/HitModeEditor';
import ArtifactConditionalCard from '../PageBuild/Components/ArtifactConditionalCard';
// import { debug } from './help'
import { Module } from "wasmpack/assembly.js";


// import HitModeCard from '../PageBuild/Components/HitModeCard';

// const InfoDisplay = React.lazy(() => import('../PageBuild/InfoDisplay'));


// const totalShowing = artifactIds.length !== totalArtNum ? `${artifactIds.length}/${totalArtNum}` : `${totalArtNum}`
// const setPage = useCallback(
//     (e, value) => {
//       invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
//       setpageIdex(value - 1);
//     },
//     [setpageIdex, invScrollRef],
// )





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
function initialBuildDisplayState(): {
  characterKey: CharacterKey | ""
} {
  return {
    characterKey: ""
  }
}



// { location: { characterKey: propCharacterKey } }
export default function UpgradeOptDisplay() {

  useEffect(
    () => {
      console.log('begin');
      let m = new Module.VectorD();
      m.push_back(0);
      let x = new Module.VectorD();
      x.push_back(0);
      let c = new Module.VectorD();
      c.push_back(1);
      var mvn = new Module.MVNHandle(1, x, m, c);
      console.log('this', mvn.value)

      m.push_back(0);
      x.push_back(.1);

      c.push_back(-.5);
      c.push_back(-.5);
      c.push_back(2);
      var mvn2 = new Module.MVNHandle(2, x, m, c);
      console.log('that', mvn2.value)
    }, []);


  const [{tcMode}] = useDBState("GlobalSettings", initGlobalSettings)
  const {database} = useContext(DatabaseContext)
  const [{characterKey}, setBuildSettings] = useDBState("BuildDisplay", initialBuildDisplayState)
  const setcharacterKey = useCallback(characterKey => {
    if (characterKey && database._getChar(characterKey)) setBuildSettings({ characterKey })
    else setBuildSettings({ characterKey: "" })
  }, [setBuildSettings, database])

  // propCharacterKey can override the selected character, on initial load. This is intended to run on component startup.
  // useEffect(() => {
  //   if (propCharacterKey && propCharacterKey !== characterKey)
  //     setcharacterKey(propCharacterKey)
  //   // eslint-disable-next-line
  // }, [])
  const { t } = useTranslation(["artifact", "ui"]);

  const [artsDirty, setArtsDirty] = useForceUpdate()

  const setCharacter = useCharSelectionCallback()
  const characterDispatch = useCharacterReducer(characterKey)
  const character = useCharacter(characterKey)
  const buildSettings = character?.buildSettings ?? initialBuildSettings()
  const { plotBase, setFilters, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel, useExcludedArts, useEquippedArts, builds, buildDate, maxBuildsToShow, levelLow, levelHigh } = buildSettings
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}
  const compareData = character?.compareData ?? false

  const noCharacter = useMemo(() => !database._getCharKeys().length, [database])
  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const buildSettingsDispatch = useCallback((action) =>
    characterDispatch && characterDispatch({ buildSettings: buildSettingsReducer(buildSettings, action) }), [characterDispatch, buildSettings])

  const [pageIdex, setpageIdex] = useState(0)

  const [artifactUpgradeOpts, setArtifactUpgradeOpts] = useState([] as QueryResult[])

  const maxNumArtifactsToDisplay = 5;
  const { artifactsToShow: artifactsToShow, numPages, currentPageIndex, minObj0, maxObj0 } = useMemo(() => {
    const numPages = Math.ceil(artifactUpgradeOpts.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    const toShow = artifactUpgradeOpts.slice(currentPageIndex * maxNumArtifactsToDisplay, (currentPageIndex + 1) * maxNumArtifactsToDisplay)
    const thr = toShow.length > 0 ? toShow[0].thresholds[0] : 0

    return {
      artifactsToShow: toShow, numPages, currentPageIndex,
      minObj0: toShow.reduce((a, b) => Math.min(b.distr.lower, a), thr),
      maxObj0: toShow.reduce((a, b) => Math.max(b.distr.upper, a), thr)
    }
  }, [artifactUpgradeOpts, pageIdex])

  useEffect(() => ReactGA.pageview('/build'), [])

  //select a new character Key
  const selectCharacter = useCallback((cKey = "") => {
    if (characterKey === cKey) return
    setcharacterKey(cKey)
  }, [setcharacterKey, characterKey])

  //register changes in artifact database
  useEffect(() =>
    database.followAnyArt(setArtsDirty),
    [setArtsDirty, database])

  // const { split, setPerms, totBuildNumber } = useMemo(() => {
  //   if (!characterKey) // Make sure we have all slotKeys
  //     return { totBuildNumber: 0 }
  //   // const arts = database._getArts().filter(art => {
  //   //   if (art.level < levelLow) return false
  //   //   if (art.level > levelHigh) return false
  //   //   const mainStats = mainStatKeys[art.slotKey]
  //   //   if (mainStats?.length && !mainStats.includes(art.mainStatKey)) return false

  //   //   // If its equipped on the selected character, bypass the check
  //   //   if (art.location === characterKey) return true

  //   //   if (art.exclude && !useExcludedArts) return false
  //   //   if (art.location && !useEquippedArts) return false
  //   //   return true
  //   // })
  //   // const split = compactArtifacts(arts, mainStatAssumptionLevel)
  //   const setPerms = [...artSetPerm([setFilters])]
  //   // const totBuildNumber = [...setPerms].map(perm => countBuilds(filterArts(split, perm))).reduce((a, b) => a + b, 0)
  //   return artsDirty && { split, setPerms, totBuildNumber }
  // }, [characterKey, useExcludedArts, useEquippedArts, mainStatKeys, setFilters, levelLow, levelHigh, artsDirty, database, mainStatAssumptionLevel])

  // Provides a function to cancel the work
  const cancelToken = useRef(() => { })
  //terminate worker when component unmounts
  useEffect(() => () => cancelToken.current(), [])
  const generateBuilds = useCallback(async () => {
    if (!characterKey || !optimizationTarget) return
    const teamData = await getTeamData(database, characterKey, mainStatAssumptionLevel, [])
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, characterKey)[characterKey as CharacterKey]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    let optimizationTargetNode = objPathValue(workerData.display ?? {}, optimizationTarget) as NumNode | undefined
    if (!optimizationTargetNode) return

    const valueFilter: { value: NumNode, minimum: number }[] = Object.entries(statFilters).map(([key, value]) => {
      if (key.endsWith("_")) value = value / 100 // TODO: Conversion
      return { value: input.total[key], minimum: value }
    }).filter(x => x.value && x.minimum > -Infinity)

    const queryArts: QueryArtifact[] = database._getArts().filter(art => art.rarity == 5).map(art => {
      const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, 20)  // 5* only
      const buildData = {
        id: art.id, slot: art.slotKey, level: art.level, rarity: art.rarity,
        values: {
          [art.setKey]: 1,
          [art.mainStatKey]: art.mainStatKey.endsWith('_') ? mainStatVal / 100 : mainStatVal,
          ...Object.fromEntries(art.substats.map(substat =>
            [substat.key, substat.key.endsWith('_') ? substat.accurateValue / 100 : substat.accurateValue]))
        },
        subs: art.substats.reduce((sub: SubstatKey[], x) => {
          if (x.key != "") sub.push(x.key)
          return sub
        }, [])
      }
      delete buildData.values[""]
      return buildData
    })

    let curEquip: QueryBuild = Object.assign({}, ...allSlotKeys.map(slotKey => {
      const art = database._getArt(data?.get(input.art[slotKey].id).value ?? "")
      if (!art) return { [slotKey]: undefined }

      const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, art.level)
      const buildData: QueryArtifact = {
        id: art.id, slot: slotKey, level: art.level, rarity: art.rarity,
        values: {
          [art.setKey]: 1,
          [art.mainStatKey]: art.mainStatKey.endsWith('_') ? mainStatVal / 100 : mainStatVal,
          ...Object.fromEntries(art.substats.map(substat =>
            [substat.key, substat.key.endsWith('_') ? substat.accurateValue / 100 : substat.accurateValue]))
        },
        subs: art.substats.reduce((sub: SubstatKey[], x) => {
          if (x.key != "") sub.push(x.key)
          return sub
        }, [])
      }
      delete buildData.values[""]
      return { [slotKey]: buildData }
    }))
    let qaLookup: Dict<string, QueryArtifact> = {};
    queryArts.forEach(art => qaLookup[art.id] = art)

    // CTRL-F: asdfasdf
    let nodes = [optimizationTargetNode, ...valueFilter.map(x => x.value)]
    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    const query = querySetup(nodes, valueFilter.map(x => x.minimum), curEquip, data);
    let artUpOpt = queryArts.map(art => evalArtifact(query, art, false))
    artUpOpt = artUpOpt.sort((a, b) => b.prob * b.upAvg - a.prob * a.upAvg)

    // Re-sort & slow eval
    const kk = 10;  // expand the top `kk` artifacts; repeat until we're reasonably confident top 5(page lim) are in correct positions
    let i = 0;
    do {
      for (; i < kk; i++) {
        let arti = qaLookup[artUpOpt[i].id]
        if (arti) artUpOpt[i] = evalArtifact(query, arti, true);
      }
      artUpOpt = artUpOpt.sort((a, b) => b.prob * b.upAvg - a.prob * a.upAvg)
      for (i = 0; i < kk; i++) {
        if (artUpOpt[i].evalMode == 'fast') break;
      }
    } while (i < kk);

    setArtifactUpgradeOpts(artUpOpt);
  }, [characterKey, database, mainStatAssumptionLevel, maxBuildsToShow, optimizationTarget, plotBase, buildSettingsDispatch, setFilters, statFilters])

  const characterName = characterSheet?.name ?? "Character Name"

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

  return <Box display="flex" flexDirection="column" gap={1} sx={{ my: 1 }}>
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
            <CharacterDropdownButton fullWidth value={characterKey} onChange={selectCharacter} />
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
            <Grid item xs={12} md={4} lg={3} display="flex" flexDirection="column" gap={1} style={{ position: "sticky" }}>
              <CardLight>
                <CardContent>
                  <CharacterDropdownButton fullWidth value={characterKey} onChange={selectCharacter} />
                </CardContent>
              </CardLight>
              {/* character card */}
              <Box><CharacterCard characterKey={characterKey} onClick={setCharacter} /></Box>
            </Grid>

            {/* Right half */}
            <Grid item xs={12} md={8} lg={9} display="flex" flexDirection="column" gap={1}>
              {/* Block 1 */}
              <Grid container>
                <Grid container lg={8}>
                  {/* Optimization Target Selector */}
                  <Grid item>
                    <span>Optimization Target: </span>
                    {<OptimizationTargetSelector
                      optimizationTarget={optimizationTarget}
                      setTarget={target => buildSettingsDispatch({ optimizationTarget: target })}
                      disabled={false}
                    />}
                  </Grid>

                  {/* Hit mode options */}
                  <Grid container spacing={1}>
                    <Grid item><HitModeToggle size="small" /></Grid>
                    {/* <Grid item><InfusionAuraDropdown /></Grid> */}
                    <Grid item><ReactionToggle size="small" /></Grid>
                  </Grid>

                  {/* <HitModeCard disabled={false} /> */}
                </Grid>
                <Grid container lg={4}>
                  {/*Minimum Final Stat Filter */}
                  {/* TODO */}
                  <StatFilterCard statFilters={statFilters} setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} disabled={false} />
                  <ArtifactConditionalCard disabled={false} />
                </Grid>
              </Grid>

              {/* <Grid container gap={1}> */}
              {/* <Grid item xs={4} md={4} lg={4} display="flex" flexDirection="column" gap={1}>
                  <TeamBuffCard />
                  <BonusStatsCard />
                  Enemy Editor
                  <EnemyEditorCard />
                </Grid> */}
              {/* <Grid item xs={4} md={4} lg={3} display="flex" flexDirection="column" gap={1}>
                  <ArtifactConditionalCard disabled={generatingBuilds} />

                  Artifact set pickers
                  {setFilters.map((setFilter, index) => (index <= setFilters.filter(s => s.key).length) && <ArtifactSetPicker key={index} index={index} setFilters={setFilters}
                    disabled={generatingBuilds} onChange={(index, key, num) => buildSettingsDispatch({ type: 'setFilter', index, key, num })} />)}

                  use equipped/excluded
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
                </Grid> */}
              {/* </Grid> */}

              {/* Generate Builds button */}
              <Grid container spacing={1}>
                <Grid item flexGrow={1} >
                  <ButtonGroup>
                    <Button
                      disabled={!characterKey || !optimizationTarget || !objPathValue(data?.getDisplay(), optimizationTarget)}
                      color={(characterKey) ? "success" : "warning"}
                      onClick={generateBuilds}
                      startIcon={<FontAwesomeIcon icon={faCalculator} />}
                    >Calc Upgrade Priority</Button>
                  </ButtonGroup>
                </Grid>
              </Grid>

              <Box display="flex" flexDirection="column" gap={1} my={1}>
                {/* <InfoComponent
                  pageKey="artifactPage"
                  modalTitle={t`info.title`}
                  text={t("tipsOfTheDay", { returnObjects: true }) as string[]}
                >
                  <InfoDisplay />
                </InfoComponent> */}

                {noArtifact && <Alert severity="info" variant="filled">Looks like you haven't added any artifacts yet. If you want, there are <Link color="warning.main" component={RouterLink} to="/scanner">automatic scanners</Link> that can speed up the import process!</Alert>}

                <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} />}>
                  {/* <Grid container gap={1} > */}
                  {/*<Grid item xs={12} sm={6} md={4} lg={4} xl={3}>*/}
                  {/*  <CardDark sx={{ height: "100%", width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>*/}
                  {/*    /!*<CardContent>*!/*x1/}
                    {/*    /!*  <Typography sx={{ textAlign: "center" }}>Add New Artifact</Typography>*!/*/}
                  {/*    /!*</CardContent>*!/*/}
                  {/*    <Box sx={{*/}
                  {/*      flexGrow: 1,*/}
                  {/*      display: "flex",*/}
                  {/*      justifyContent: "center",*/}
                  {/*      alignItems: "center"*/}
                  {/*    }}*/}
                  {/*    >*/}
                  {/*      /!*<Button onClick={() => editArtifact("new")} sx={{*!/*/}
                  {/*      /!*  borderRadius: "1em"*!/*/}
                  {/*      /!*}}>*!/*/}
                  {/*      /!*  <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>*!/*/}
                  {/*      /!*</Button>*!/*/}
                  {/*    </Box>*/}
                  {/*  </CardDark>*/}
                  {/*</Grid>*/}
                  {artifactsToShow.map(art =>
                    <Grid container key={art.id} gap={1} wrap="nowrap">
                      <Grid item xs={5} sm={4} md={4} lg={3} xl={3} >
                        <ArtifactCard artifactId={art.id} />
                      </Grid>
                      <Grid item xs={7} sm={8} md={8} lg={9} xl={9}>
                        <UpgradeOptChartCard upgradeOpt={art} objMax={maxObj0} objMin={minObj0} />
                      </Grid>
                    </Grid>
                  )}
                  {/* </Grid> */}
                </Suspense>
                {numPages > 1 && <CardDark ><CardContent>
                  <Grid container>
                    {/*<Grid item flexGrow={1}>*/}
                    {/*  <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />*/}
                    {/*</Grid>*/}
                    {/*<Grid item>*/}
                    {/*  <ShowingArt count={numPages} page={currentPageIndex + 1} onChange={setPage} numShowing={artifactIdsToShow.length} total={totalShowing} t={t} />*/}
                    {/*</Grid>*/}
                  </Grid>
                </CardContent></CardDark>}
              </Box >

              {/* Builds display */}
              {/* <CardDark>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} >
                    <Typography sx={{ flexGrow: 1 }}>
                      {builds ? <span>Showing <strong>{builds.length}</strong> Builds generated for {characterName}. {!!buildDate && <span>Build generated on: <strong>{(new Date(buildDate)).toLocaleString()}</strong></span>}</span>
                        : <span>Select a character to generate builds.</span>}
                    </Typography>
                    <Button disabled={!builds.length} color="error" onClick={() => buildSettingsDispatch({ builds: [], buildDate: 0 })} >Clear Builds</Button>
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
              <BuildList {...{ buildsArts, character, characterKey, characterSheet, data, compareData, mainStatAssumptionLevel, characterDispatch, disabled: false }} /> */}

            </Grid>
          </Grid>

        </CardContent>
      </CardDark>

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
  // Memoize the build list because calculating/rendering the build list is actually very expensive, which will cause longer builder times.
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
      <ArtifactBuildDisplayItem index={index} compareBuild={compareData} disabled={disabled} />
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
