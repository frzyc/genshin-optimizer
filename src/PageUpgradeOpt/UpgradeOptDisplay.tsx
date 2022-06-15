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
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useCharacter from '../ReactHooks/useCharacter';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback, { initialCharacter } from '../ReactHooks/useCharSelectionCallback';
import useDBState from '../ReactHooks/useDBState';
import useTeamData, { getTeamData } from '../ReactHooks/useTeamData';
import { buildSettingsReducer, initialBuildSettings } from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/BuildSetting';
import { allSlotKeys, CharacterKey, SlotKey } from '../Types/consts';
import { clamp, objPathValue } from '../Util/Util';
import OptimizationTargetSelector from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/OptimizationTargetSelector';
import { dynamicData } from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/foreground';
import { Query, QueryArtifact, QueryBuild, querySetup, evalArtifact, toQueryArtifact, cmpQ, UpgradeOptResult } from './artifactQuery'
import ArtifactCard from "../PageArtifact/ArtifactCard";
import { Trans, useTranslation } from "react-i18next";
import UpgradeOptChartCard from "./UpgradeOptChartCard"
import { HitModeToggle, ReactionToggle } from '../Components/HitModeEditor';
import ArtifactSetConfig from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/Components/ArtifactSetConfig';
import useBuildSetting from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/BuildSetting';
import { defThreads, useOptimizeDBState } from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/DBState';
import { debugMVN } from './mvncdf'
import { ICachedCharacter } from '../Types/character';
import { useNavigate, useMatch } from "react-router";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { defaultInitialWeapon } from "../Util/WeaponUtil";

function HackyGetAroun() {
  const { database } = useContext(DatabaseContext)
  const navigate = useNavigate()
  // Used to maintain the previous tab, if there is one
  let { params: { tab = "" } } = useMatch({ path: "/characters/:charKey/:tab", end: false }) ?? { params: { tab: "" } }
  const cb = useCallback(
    async (characterKey: CharacterKey) => {
      const character = database._getChar(characterKey)
      let navTab = tab
      // Create a new character + weapon, with linking if char isnt in db.
      if (!character) {
        const newChar = initialCharacter(characterKey)
        database.updateChar(newChar)
        const characterSheet = await CharacterSheet.get(characterKey)
        if (!characterSheet) return
        const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
        const weaponId = database.createWeapon(weapon)
        database.setWeaponLocation(weaponId, characterKey)
        // If we are navigating to a new character,
        // redirect to Overview, regardless of previous tab.
        // Trying to enforce a certain UI flow when building new characters
        navTab = "upgradeOpt"
      }
      navigate(`/characters/${characterKey}/upgradeOpt`)
    },
    [navigate, database, tab],
  )
  return cb
}

export default function UpgradeOptDisplay() {
  const [{ tcMode }] = useDBState("GlobalSettings", initGlobalSettings)
  const { database } = useContext(DatabaseContext)
  // const [characterKey, setcharacterKey] = useState('Diona' as CharacterKey | '')
  // const character = useCharacter('Diona')
  // const characterKey2 =  characterKey === '' ? 'Diona' : characterKey

  // const { character, characterDispatch } = useContext(DataContext)
  const characterKey = ''
  const characterKey2 = 'Diona'
  const character = database._getChar(characterKey) as ICachedCharacter

  // console.log('char', character, characterKey)


  // const [buildStatus, setBuildStatus] = useState({ type: "inactive", tested: 0, failed: 0, skipped: 0, total: 0 } as BuildStatus)
  // const generatingBuilds = buildStatus.type !== "inactive"

  // const [chartData, setchartData] = useState(undefined as ChartData | undefined)

  // const [artsDirty, setArtsDirty] = useForceUpdate()

  // const [{ equipmentPriority, threads = defThreads }, setOptimizeDBState] = useOptimizeDBState()
  // const maxWorkers = threads > defThreads ? defThreads : threads
  // const setMaxWorkers = useCallback(threads => setOptimizeDBState({ threads }), [setOptimizeDBState],)

  const characterDispatch = useCharacterReducer(characterKey)
  // const onClickTeammate = useCharSelectionCallback()
  // const compareData = character?.compareData ?? false

  const noCharacter = useMemo(() => !database._getCharKeys().length, [database])
  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey2)
  const { optimizationTarget, mainStatAssumptionLevel } = buildSetting ?? {}
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}
  // const buildsArts = useMemo(() => builds.map(build => build.map(i => database._getArt(i)!)), [builds, database])

  //register changes in artifact database
  // useEffect(() =>
  //   database.followAnyArt(setArtsDirty),
  //   [setArtsDirty, database])

  const onClickTeammate = HackyGetAroun()


  const selectCharacter = useCallback((cKey = "") => {
    onClickTeammate(cKey as CharacterKey)
  }, [onClickTeammate])



  const [artifactUpgradeOpts, setArtifactUpgradeOpts] = useState(undefined as UpgradeOptResult | undefined)

  //select a new character Key
  const setcharacterKey = useCallback(characterKey => {
    console.log('cKey', characterKey)
    if (characterKey && database._getChar(characterKey)) console.log(characterKey)
    else {
      buildSettingDispatch({ characterKey: "" })
      console.log('cKey2', characterKey)
    }
  }, [buildSettingDispatch, database])
  const setCharacter = useCharSelectionCallback()





  // const [{ tcMode }] = useDBState("GlobalSettings", initGlobalSettings)
  // const { database } = useContext(DatabaseContext)
  // const [{ characterKey }, setBuildSettings] = useDBState("BuildDisplay", hackyGetAroun)

  // const characterDispatch = useCharacterReducer(characterKey)
  // // const buildSettings = character?.buildSettings ?? initialBuildSettings()
  // const { buildSetting: buildSettings, buildSettingDispatch } = useBuildSetting(characterKey)
  // const { plotBase, setFilters, statFilters, optimizationTarget, mainStatAssumptionLevel, maxBuildsToShow } = buildSettings
  // const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  // const { characterSheet, target: data } = teamData?.[characterKey as CharacterKey] ?? {}

  // const noArtifact = useMemo(() => !database._getArts().length, [database])

  // const buildSettingsDispatch = useCallback((action) =>
  //   characterDispatch && characterDispatch({ buildSettings: buildSettingsReducer(buildSettings, action) }), [characterDispatch, buildSettings])

  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)
  // const { t } = useTranslation(["artifact", "ui"]);

  const artifactsToDisplayPerPage = 5;
  const { artifactsToShow, numPages, currentPageIndex, minObj0, maxObj0 } = useMemo(() => {
    if (!artifactUpgradeOpts) return { artifactsToShow: [], numPages: 0, toShow: 0, minObj0: 0, maxObj0: 0 }
    const numPages = Math.ceil(artifactUpgradeOpts.arts.length / artifactsToDisplayPerPage)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    const toShow = artifactUpgradeOpts.arts.slice(currentPageIndex * artifactsToDisplayPerPage, (currentPageIndex + 1) * artifactsToDisplayPerPage)
    const thr = toShow.length > 0 ? toShow[0].thresholds[0] : 0

    return {
      artifactsToShow: toShow, numPages, currentPageIndex,
      minObj0: toShow.reduce((a, b) => Math.min(b.distr.lower, a), thr),
      maxObj0: toShow.reduce((a, b) => Math.max(b.distr.upper, a), thr)
    }
  }, [artifactUpgradeOpts, artifactsToDisplayPerPage, pageIdex])

  // Because upgradeOpt is a two-stage estimation method, we want to expand (slow-estimate) our artifacts lazily as they are needed.
  // Lazy method means we need to take care to never 'lift' any artifacts past the current page, since that may cause a user to miss artifacts
  //  that are lifted in the middle of an expansion. Increase lookahead to mitigate this issue.
  const upgradeOptExpandSink = useCallback(({ query, arts }: UpgradeOptResult, start: number, expandTo: number): UpgradeOptResult => {
    const lookahead = 5
    // if (querySaved === undefined) return upOpt
    const queryArts: QueryArtifact[] = database._getArts()
      .filter(art => art.rarity === 5)
      .map(art => toQueryArtifact(art, 20))

    let qaLookup: Dict<string, QueryArtifact> = {};
    queryArts.forEach(art => qaLookup[art.id] = art)

    const fixedList = arts.slice(0, start)
    let arr = arts.slice(start)

    let i = 0
    const end = Math.min(expandTo - start + lookahead, arr.length);
    do {
      for (; i < end; i++) {
        let arti = qaLookup[arr[i].id]
        if (arti) arr[i] = evalArtifact(query, arti, true);
      }

      // sort on only bottom half to prevent lifting
      arr.sort(cmpQ)
      for (i = 0; i < end; i++) {
        if (arr[i].evalMode === 'fast') break
      }
    } while (i < end)

    return { query, arts: [...fixedList, ...arr] }
  }, [database])

  //for pagination
  const setPage = useCallback(
    (e, value) => {
      if (!artifactUpgradeOpts) return
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
    const { artSetExclusion, plotBase, statFilters, mainStatKeys, optimizationTarget, mainStatAssumptionLevel } = buildSetting

    console.log('no char/opt target', characterKey, optimizationTarget)
    if (!characterKey || !optimizationTarget) return
    const teamData = await getTeamData(database, characterKey, mainStatAssumptionLevel, [])
    console.log('no team data')
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, characterKey)[characterKey as CharacterKey]?.target.data![0]
    console.log('no worker data')
    if (!workerData) return
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    let optimizationTargetNode = objPathValue(workerData.display ?? {}, optimizationTarget) as NumNode | undefined
    if (!optimizationTargetNode) return

    console.log('am I passing?')

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

    let nodes = [optimizationTargetNode, ...valueFilter.map(x => x.value)]
    nodes = optimize(nodes, workerData, ({ path: [p] }) => p !== "dyn");
    const query = querySetup(nodes, valueFilter.map(x => x.minimum), curEquip, data);
    let artUpOpt = queryArts.map(art => evalArtifact(query, art, false))
    artUpOpt = artUpOpt.sort((a, b) => b.prob * b.upAvg - a.prob * a.upAvg)

    let upOpt = { query: query, arts: artUpOpt }

    // Re-sort & slow eval
    upOpt = upgradeOptExpandSink(upOpt, 0, 5)
    setArtifactUpgradeOpts(upOpt);

    console.log('emd of the line')
  }, [characterKey, database, setArtifactUpgradeOpts])

  const characterName = characterSheet?.name ?? "Character Name"

  const dataContext: dataContextObj | undefined = useMemo(() => {
    // if (characterKey === '') return undefined
    return character && data && characterSheet && teamData && {
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
  </Box>
}

function ShowingArt({ numShowing, total }) {
  return <Typography color="text.secondary">
    <Trans i18nKey="showingNum" count={numShowing} value={total} >
      Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Artifacts
    </Trans>
  </Typography>
}
