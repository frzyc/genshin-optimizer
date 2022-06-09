import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  Grid,
  Link,
  Skeleton,
  Typography,
  Pagination
} from '@mui/material';
import { Suspense, useCallback, useContext, useMemo, useRef, useState } from 'react';
// import ReactGA from 'react-ga';
import { Link as RouterLink } from 'react-router-dom';
// eslint-disable-next-line
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from './stopBreakingMe';
import StatFilterCard from '../Components/StatFilterCard';
import { DatabaseContext } from '../Database/Database';
import { DataContext, dataContextObj } from '../DataContext';
import { mergeData, uiDataForTeam } from '../Formula/api';
import { uiInput as input } from '../Formula/index';
import { optimize } from '../Formula/optimization';
import { NumNode } from '../Formula/type';
import { initGlobalSettings } from '../GlobalSettings';
import CharacterCard from '../Components/Character/CharacterCard';
import useCharacter from '../ReactHooks/useCharacter';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useDBState from '../ReactHooks/useDBState';
import useTeamData, { getTeamData } from '../ReactHooks/useTeamData';
import { buildSettingsReducer, initialBuildSettings } from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/BuildSetting';
import { allSlotKeys, CharacterKey, SlotKey } from '../Types/consts';
import { clamp, objPathValue } from '../Util/Util';
import OptimizationTargetSelector from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/OptimizationTargetSelector';
import { dynamicData } from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/foreground';
import { Query, QueryArtifact, QueryBuild, querySetup, evalArtifact, QueryResult, toQueryArtifact, cmpQ } from './artifactQuery'
import ArtifactCard from "../PageArtifact/ArtifactCard";
import { Trans, useTranslation } from "react-i18next";
import UpgradeOptChartCard from "./UpgradeOptChartCard"
import { HitModeToggle, ReactionToggle } from '../Components/HitModeEditor';
import ArtifactSetConditional from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ArtifactSetConditional';
import { debugMVN } from './mvncdf'

function hackyGetAroun(): { characterKey: CharacterKey | "" } {
  return { characterKey: '' }
}

export default function UpgradeOptDisplay() {
  // useEffect(
  //   () => {
  //     console.log('begin');
  //     let m = new Module.VectorD();
  //     m.push_back(0);
  //     let x = new Module.VectorD();
  //     x.push_back(0);
  //     let c = new Module.VectorD();
  //     c.push_back(1);
  //     var mvn = new Module.MVNHandle(1, x, m, c);
  //     console.log('this', mvn.value)

  //     m.push_back(0);
  //     x.push_back(.1);

  //     c.push_back(-.5);
  //     c.push_back(-.5);
  //     c.push_back(2);
  //     var mvn2 = new Module.MVNHandle(2, x, m, c);
  //     console.log('that', mvn2.value)
  //   }, []);


  const [{ tcMode }] = useDBState("GlobalSettings", initGlobalSettings)
  const { database } = useContext(DatabaseContext)
  const [{ characterKey }, setBuildSettings] = useDBState("BuildDisplay", hackyGetAroun)
  const setcharacterKey = useCallback(characterKey => {
    if (characterKey && database._getChar(characterKey)) setBuildSettings({ characterKey })
    else setBuildSettings({ characterKey: "" })
  }, [setBuildSettings, database])

  const setCharacter = useCharSelectionCallback()
  const characterDispatch = useCharacterReducer(characterKey)
  const character = useCharacter(characterKey)
  const buildSettings = character?.buildSettings ?? initialBuildSettings()
  const { plotBase, setFilters, statFilters, optimizationTarget, mainStatAssumptionLevel, maxBuildsToShow } = buildSettings
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}

  const noCharacter = useMemo(() => !database._getCharKeys().length, [database])
  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const buildSettingsDispatch = useCallback((action) =>
    characterDispatch && characterDispatch({ buildSettings: buildSettingsReducer(buildSettings, action) }), [characterDispatch, buildSettings])

  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation(["artifact", "ui"]);

  const [artifactUpgradeOpts, setArtifactUpgradeOpts] = useState([] as QueryResult[])
  const [qs2, setQuery] = useState(undefined as Query | undefined)
  let querySaved = qs2

  const artifactsToDisplayPerPage = 5;
  const { artifactsToShow, numPages, currentPageIndex, minObj0, maxObj0 } = useMemo(() => {
    const numPages = Math.ceil(artifactUpgradeOpts.length / artifactsToDisplayPerPage)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    const toShow = artifactUpgradeOpts.slice(currentPageIndex * artifactsToDisplayPerPage, (currentPageIndex + 1) * artifactsToDisplayPerPage)
    const thr = toShow.length > 0 ? toShow[0].thresholds[0] : 0

    return {
      artifactsToShow: toShow, numPages, currentPageIndex,
      minObj0: toShow.reduce((a, b) => Math.min(b.distr.lower, a), thr),
      maxObj0: toShow.reduce((a, b) => Math.max(b.distr.upper, a), thr)
    }
  }, [artifactUpgradeOpts, artifactsToDisplayPerPage, pageIdex])

  //select a new character Key
  const selectCharacter = useCallback((cKey = "") => {
    if (characterKey === cKey) return
    setcharacterKey(cKey)
  }, [setcharacterKey, characterKey])

  // Because upgradeOpt is a two-stage estimation method, we want to expand (slow-estimate) our artifacts lazily as they are needed.
  // Lazy method means we need to take care to never 'lift' any artifacts past the current page, since that may cause a user to miss artifacts
  //  that are lifted in the middle of an expansion. Increase lookahead to mitigate this issue.
  const upgradeOptExpandSink = useCallback((upOpt: QueryResult[], start: number, expandTo: number) => {
    const lookahead = 5
    if (querySaved === undefined) return upOpt
    const queryArts: QueryArtifact[] = database._getArts()
      .filter(art => art.rarity === 5)
      .map(art => toQueryArtifact(art, 20))

    let qaLookup: Dict<string, QueryArtifact> = {};
    queryArts.forEach(art => qaLookup[art.id] = art)

    const fixedList = upOpt.slice(0, start)
    let arr = upOpt.slice(start)

    let i = 0
    const end = Math.min(expandTo - start + lookahead, arr.length);
    do {
      for (; i < end; i++) {
        let arti = qaLookup[arr[i].id]
        if (arti) arr[i] = evalArtifact(querySaved, arti, true);
      }

      // sort on only bottom half to prevent lifting
      arr.sort(cmpQ)
      for (i = 0; i < end; i++) {
        if (arr[i].evalMode === 'fast') break
      }
    } while (i < end)

    return [...fixedList, ...arr]
  }, [database, querySaved])

  //for pagination
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      let start = (currentPageIndex + 1) * artifactsToDisplayPerPage
      let end = value * artifactsToDisplayPerPage
      let zz = upgradeOptExpandSink(artifactUpgradeOpts, start, end)
      setArtifactUpgradeOpts(zz)
      setpageIdex(value - 1);
    },
    [setpageIdex, setArtifactUpgradeOpts, invScrollRef, currentPageIndex, artifactsToDisplayPerPage, artifactUpgradeOpts, upgradeOptExpandSink],
  )

  const generateBuilds = useCallback(async () => {
    debugMVN();

    if (!characterKey || !optimizationTarget) return
    const teamData = await getTeamData(database, characterKey, mainStatAssumptionLevel, [])
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, characterKey)[characterKey as CharacterKey]?.target.data![0]
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    let optimizationTargetNode = objPathValue(workerData.display ?? {}, optimizationTarget) as NumNode | undefined
    if (!optimizationTargetNode) return

    const valueFilter: { value: NumNode, minimum: number }[] = Object.entries(statFilters).map(([key, value]) => {
      if (key.endsWith("_")) value = value / 100
      return { value: input.total[key], minimum: value }
    }).filter(x => x.value && x.minimum > -Infinity)

    const queryArts: QueryArtifact[] = database._getArts()
      .filter(art => art.rarity === 5)
      .map(art => toQueryArtifact(art, 20))

    const equippedArts = database._getChar(characterKey)?.equippedArtifacts ?? {} as StrictDict<SlotKey, string>
    let curEquip: QueryBuild = Object.assign({}, ...allSlotKeys.map(slotKey => {
      const art = database._getArt(equippedArts[slotKey] ?? "")
      if (!art) return { [slotKey]: undefined }
      return { [slotKey]: toQueryArtifact(art) }
    }))
    let qaLookup: Dict<string, QueryArtifact> = {};
    queryArts.forEach(art => qaLookup[art.id] = art)
    console.log(curEquip, input)
    console.log(database._getChar(characterKey))

    let nodes = [optimizationTargetNode, ...valueFilter.map(x => x.value)]
    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    const query = querySetup(nodes, valueFilter.map(x => x.minimum), curEquip, data);
    let artUpOpt = queryArts.map(art => evalArtifact(query, art, false))
    artUpOpt = artUpOpt.sort((a, b) => b.prob * b.upAvg - a.prob * a.upAvg)

    // Re-sort & slow eval
    querySaved = query
    artUpOpt = upgradeOptExpandSink(artUpOpt, 0, 5)

    setArtifactUpgradeOpts(artUpOpt);
    setQuery(query);
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
              <Grid container spacing={1}>
                {/* Optimization Target Selector */}
                <Grid item lg={8}>
                  <CardLight><CardContent>
                    <span>Optimization Target: </span>
                    {<OptimizationTargetSelector
                      optimizationTarget={optimizationTarget}
                      setTarget={target => buildSettingsDispatch({ optimizationTarget: target })}
                      disabled={false}
                    />}
                    <br />
                    {/* Hit mode options */}
                    <HitModeToggle size="small" />
                    <br />
                    <ReactionToggle size="small" />
                  </CardContent></CardLight>
                </Grid>
                <Grid item lg={4}>
                  {/*Minimum Final Stat Filter */}
                  <StatFilterCard statFilters={statFilters} setStatFilters={sFs => buildSettingsDispatch({ statFilters: sFs })} disabled={false} />

                  <ArtifactSetConditional disabled={false} />
                </Grid>
              </Grid>

              {/* Generate Builds button */}
              <ButtonGroup>
                <Button
                  disabled={!characterKey || !optimizationTarget || !objPathValue(data?.getDisplay(), optimizationTarget)}
                  color={(characterKey) ? "success" : "warning"}
                  onClick={generateBuilds}
                  startIcon={<FontAwesomeIcon icon={faCalculator} />}
                >Calc Upgrade Priority</Button>
              </ButtonGroup>

              {numPages > 1 && <CardDark ><CardContent>
                <Grid container>
                  <Grid item flexGrow={1}>
                    <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
                  </Grid>
                  <Grid item>
                    <ShowingArt numShowing={artifactsToShow.length} total={artifactUpgradeOpts.length} t={t} />
                  </Grid>
                </Grid>
              </CardContent></CardDark>}

              <Box display="flex" flexDirection="column" gap={1} my={1}>
                {noArtifact && <Alert severity="info" variant="filled">Looks like you haven't added any artifacts yet. If you want, there are <Link color="warning.main" component={RouterLink} to="/scanner">automatic scanners</Link> that can speed up the import process!</Alert>}
                <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} />}>
                  {artifactsToShow.map(art =>
                    <Grid container key={art.id + 'asdfsf'} gap={1} wrap="nowrap">
                      <Grid item xs={5} sm={4} md={4} lg={3} xl={3} >
                        <ArtifactCard artifactId={art.id} editor />
                      </Grid>
                      <Grid item xs={7} sm={8} md={8} lg={9} xl={9}>
                        <UpgradeOptChartCard upgradeOpt={art} objMax={maxObj0} objMin={minObj0} />
                      </Grid>
                    </Grid>
                  )}
                </Suspense>
                {numPages > 1 && <CardDark ><CardContent>
                  <Grid container>
                    <Grid item flexGrow={1}>
                      <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
                    </Grid>
                    <Grid item>
                      <ShowingArt numShowing={artifactsToShow.length} total={artifactUpgradeOpts.length} t={t} />
                    </Grid>
                  </Grid>
                </CardContent></CardDark>}
              </Box >

            </Grid>
          </Grid>

        </CardContent>
      </CardDark>

    </DataContext.Provider>}
  </Box>
}

function ShowingArt({ numShowing, total, t }) {
  return <Typography color="text.secondary">
    <Trans t={t} i18nKey="showingNum" count={numShowing} value={total} >
      Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Artifacts
    </Trans>
  </Typography>
}
