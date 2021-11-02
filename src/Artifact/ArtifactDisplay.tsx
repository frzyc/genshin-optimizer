import { Replay } from '@mui/icons-material';
import { Alert, Box, Button, CardContent, Grid, Link, Pagination, Skeleton, ToggleButton, Typography } from '@mui/material';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import CardDark from '../Components/Card/CardDark';
import InfoComponent from '../Components/InfoComponent';
import SolidToggleButtonGroup from '../Components/SolidToggleButtonGroup';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import Stat from '../Stat';
import { allSubstats, SubstatKey } from '../Types/artifact';
import { artifactFilterConfigs, artifactSortConfigs, initialArtifactSortFilter, artifactSortKeys } from './ArtifactSort';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';
import ArtifactCard from './ArtifactCard';
import ArtifactEditor from './ArtifactEditor';
import ArtifactFilter from './ArtifactFilter';
import ProbabilityFilter from './ProbabilityFilter';
import { GlobalSettingsContext } from '../GlobalSettings';
import { probability } from './RollProbability';

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));
function intialState() {
  return {
    ...initialArtifactSortFilter(),
    maxNumArtifactsToDisplay: 50,
    effFilter: [...allSubstats] as SubstatKey[],
    probabilityFilter: {} as Partial<Record<SubstatKey, number>>
  }
}

type State = ReturnType<typeof intialState>

function filterReducer(state: State, action: Partial<State>): State {
  return { ...state, ...action }
}
function filterInit(): State {
  return { ...intialState(), ...(dbStorage.get("ArtifactDisplay.state") ?? {}) }
}
export default function ArtifactDisplay(props) {
  const { globalSettings: { tcMode } } = useContext(GlobalSettingsContext)
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useContext(DatabaseContext)
  const [state, stateDispatch] = useReducer(filterReducer, undefined, filterInit)

  const { effFilter, filterOption, ascending, probabilityFilter, maxNumArtifactsToDisplay } = state
  let { sortType } = state
  const showProbability = tcMode && sortType === "probability"
  //force the sortType back to a normal value after exiting TC mode
  if (sortType === "probability" && !tcMode) stateDispatch({ sortType: artifactSortKeys[0] })

  const [artToEditId, setartToEditId] = useState(props?.location?.artToEditId)
  const [pageIdex, setpageIdex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const effFilterSet = useMemo(() => new Set(effFilter), [effFilter]) as Set<SubstatKey>
  const deleteArtifact = useCallback((id: string) => database.removeArt(id), [database])
  const editArtifact = useCallback(id => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" })
    setartToEditId(id);
  }, [])
  const cancelEditArtifact = useCallback(() => setartToEditId(null), [])

  useEffect(() => {
    ReactGA.pageview('/artifact')
    return database.followAnyArt(forceUpdate)
  }, [database, forceUpdate])

  useEffect(() => {
    dbStorage.set("ArtifactDisplay.state", state)
  }, [state])

  const filterOptionDispatch = useCallback((action) => {
    stateDispatch({
      filterOption: {
        ...filterOption,
        ...action
      }
    })
  }, [stateDispatch, filterOption])

  const setProbabilityFilter = useCallback(probabilityFilter => stateDispatch({ probabilityFilter }), [stateDispatch],)

  const noArtifact = useMemo(() => !database._getArts().length, [database])
  const sortConfigs = useMemo(() => artifactSortConfigs(effFilterSet, probabilityFilter), [effFilterSet, probabilityFilter])
  const filterConfigs = useMemo(() => artifactFilterConfigs(), [])
  const { artifactIds, totalArtNum } = useMemo(() => {
    const { sortType = artifactSortKeys[0], ascending = false, filterOption } = state
    let allArtifacts = database._getArts()
    const filterFunc = filterFunction(filterOption, filterConfigs)
    const sortFunc = sortFunction(sortType, ascending, sortConfigs)
    //in probability mode, filter out the artifacts that already reach criteria
    if (showProbability) {
      allArtifacts.forEach(art => (art as any).prop = probability(art, probabilityFilter))
      allArtifacts = allArtifacts.filter(art => (art as any).prop !== 1)
    }
    const artifactIds = allArtifacts.filter(filterFunc).sort(sortFunc).map(art => art.id)
    return { artifactIds, totalArtNum: allArtifacts.length, ...dbDirty }//use dbDirty to shoo away warnings!
  }, [state, dbDirty, database, sortConfigs, filterConfigs, probabilityFilter, showProbability])


  const { artifactsToShow: artifactIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artifactIds.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { artifactsToShow: artifactIds.slice(currentPageIndex * maxNumArtifactsToDisplay, (currentPageIndex + 1) * maxNumArtifactsToDisplay), numPages, currentPageIndex }
  }, [artifactIds, pageIdex, maxNumArtifactsToDisplay])

  //for pagination
  const totalShowing = artifactIds.length !== totalArtNum ? `${artifactIds.length}/${totalArtNum}` : `${totalArtNum}`
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      setpageIdex(value - 1);
    },
    [setpageIdex, invScrollRef],
  )

  return <Box sx={{
    mt: 1,
    "> div": { mb: 1 },
  }}>
    <InfoComponent
      pageKey="artifactPage"
      modalTitle={t`info.title`}
      text={t("tipsOfTheDay", { returnObjects: true }) as string[]}
    >
      <InfoDisplay />
    </InfoComponent>

    {noArtifact && <Alert severity="info" variant="filled">Looks like you haven't added any artifacts yet. If you want, there are <Link color="warning.main" component={RouterLink} to="/scanner">automatic scanners</Link> that can speed up the import process!</Alert>}

    <Box ref={scrollRef} >
      <ArtifactEditor
        artifactIdToEdit={artToEditId}
        cancelEdit={cancelEditArtifact}
      />
    </Box>
    <ArtifactFilter artifactIds={artifactIds} filterOption={filterOption} filterOptionDispatch={filterOptionDispatch} filterDispatch={stateDispatch} sortType={sortType} ascending={ascending} />
    {showProbability && <ProbabilityFilter probabilityFilter={probabilityFilter} setProbabilityFilter={setProbabilityFilter} />}
    <CardDark ref={invScrollRef}>
      <CardContent>
        <Grid container sx={{ mb: 1 }}>
          <Grid item flexGrow={1}><span><Trans t={t} i18nKey="efficiencyFilter.title">Substats to use in efficiency calculation</Trans></span></Grid>
          <Grid item>
            <Button size="small" color="error" onClick={() => stateDispatch({ effFilter: [...allSubstats] })} startIcon={<Replay />}><Trans t={t} i18nKey="ui:reset" /></Button>
          </Grid>
        </Grid>
        <EfficiencyFilter selectedKeys={effFilter} onChange={n => stateDispatch({ effFilter: n })} />
      </CardContent>
    </CardDark>
    <PaginationCard count={numPages} page={currentPageIndex + 1} onChange={setPage} numShowing={artifactIdsToShow.length} total={totalShowing} t={t} />
    <Grid container spacing={1} >
      <Suspense fallback={<Grid item xs={12}><Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} /></Grid>}>
        {artifactIdsToShow.map((art, i) =>
          <Grid item key={i} xs={12} sm={6} md={4} lg={4} xl={3} >
            <ArtifactCard
              artifactId={art}
              effFilter={effFilterSet}
              onDelete={deleteArtifact}
              onEdit={editArtifact}
              probabilityFilter={showProbability ? probabilityFilter : undefined}
            />
          </Grid>
        )}
      </Suspense>
    </Grid>
    {numPages > 1 && <PaginationCard count={numPages} page={currentPageIndex + 1} onChange={setPage} numShowing={artifactIdsToShow.length} total={totalShowing} t={t} />}
  </Box >
}

function PaginationCard({ count, page, onChange, numShowing, total, t }) {
  return <CardDark >
    <CardContent>
      <Grid container sx={{ alignItems: "center" }}>
        <Grid item flexGrow={1}>
          <Pagination count={count} page={page} onChange={onChange} />
        </Grid>
        <Grid item>
          <Typography color="text.secondary">
            <Trans t={t} i18nKey="showingNum" count={numShowing} value={total} >
              Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Artifacts
            </Trans>
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}

function EfficiencyFilter({ selectedKeys, onChange }) {
  const keys1 = allSubstats.slice(0, 6)
  const keys2 = allSubstats.slice(6)
  const selKeys1 = selectedKeys.filter(k => keys1.includes(k))
  const selKeys2 = selectedKeys.filter(k => keys2.includes(k))
  return <Grid container spacing={1}>
    <Grid item xs={12} md={6}>
      <SolidToggleButtonGroup fullWidth value={selKeys1} onChange={(e, arr) => onChange([...selKeys2, ...arr])} sx={{ height: "100%" }}>
        {keys1.map(key => <ToggleButton size="small" key={key} value={key}>
          {Stat.getStatNameWithPercent(key)}
        </ToggleButton>)}
      </SolidToggleButtonGroup>
    </Grid>
    <Grid item xs={12} md={6}>
      <SolidToggleButtonGroup fullWidth value={selKeys2} onChange={(e, arr) => onChange([...selKeys1, ...arr])} sx={{ height: "100%" }}>
        {keys2.map(key => <ToggleButton size="small" key={key} value={key}>
          {Stat.getStatNameWithPercent(key)}
        </ToggleButton>)}
      </SolidToggleButtonGroup>
    </Grid>
  </Grid>
}