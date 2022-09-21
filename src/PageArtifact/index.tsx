import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Replay } from '@mui/icons-material';
import { Alert, Box, Button, CardContent, Grid, Link, Pagination, Skeleton, Typography } from '@mui/material';
import React, { Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga4';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import SubstatToggle from '../Components/Artifact/SubstatToggle';
import CardDark from '../Components/Card/CardDark';
import InfoComponent from '../Components/InfoComponent';
import SortByButton from '../Components/SortByButton';
import { DatabaseContext } from '../Database/Database';
import useDBState from '../ReactHooks/useDBState';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp';
import { allSubstatKeys, SubstatKey } from '../Types/artifact';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import { clamp } from '../Util/Util';
import ArtifactCard from './ArtifactCard';
import ArtifactFilter, { ArtifactRedButtons } from './ArtifactFilter';
import { artifactFilterConfigs, artifactSortConfigs, artifactSortKeys, artifactSortMap, initialArtifactSortFilter } from './ArtifactSort';
import ProbabilityFilter from './ProbabilityFilter';
import { probability } from './RollProbability';

//lazy load the weapon display
const ArtifactEditor = React.lazy(() => import('./ArtifactEditor'))

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10 - 1, sm: 12 - 1, md: 24 - 1, lg: 24 - 1, xl: 24 - 1 }
function initialState() {
  return {
    ...initialArtifactSortFilter(),
    effFilter: [...allSubstatKeys] as SubstatKey[],
    probabilityFilter: {} as Dict<SubstatKey, number>,
  }
}
export default function PageArtifact() {
  const { t } = useTranslation(["artifact", "ui"]);
  const { database } = useContext(DatabaseContext)
  const [artifactDisplayState, setArtifactDisplayState] = useDBState("ArtifactDisplay", initialState)
  const stateDispatch = useCallback(action => {
    if (action.type === "reset") setArtifactDisplayState(initialArtifactSortFilter())
    else setArtifactDisplayState(action)
  }, [setArtifactDisplayState])
  const brPt = useMediaQueryUp()
  const maxNumArtifactsToDisplay = numToShowMap[brPt]

  const { effFilter, filterOption, ascending, probabilityFilter } = artifactDisplayState
  let { sortType } = artifactDisplayState
  const showProbability = sortType === "probability"

  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const effFilterSet = useMemo(() => new Set(effFilter), [effFilter]) as Set<SubstatKey>
  const deleteArtifact = useCallback((id: string) => database.arts.remove(id), [database])

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: '/artifact' })
    return database.arts.followAny(() => forceUpdate())
  }, [database, forceUpdate])

  const filterOptionDispatch = useCallback((action) => {
    stateDispatch({
      filterOption: {
        ...filterOption,
        ...action
      }
    })
  }, [stateDispatch, filterOption])

  const setProbabilityFilter = useCallback(probabilityFilter => stateDispatch({ probabilityFilter }), [stateDispatch],)

  const noArtifact = useMemo(() => !database.arts.values.length, [database])
  const sortConfigs = useMemo(() => artifactSortConfigs(effFilterSet, probabilityFilter), [effFilterSet, probabilityFilter])
  const filterConfigs = useMemo(() => artifactFilterConfigs(effFilterSet), [effFilterSet])
  const deferredArtifactDisplayState = useDeferredValue(artifactDisplayState)
  const deferredProbabilityFilter = useDeferredValue(probabilityFilter)
  useEffect(() => {
    if (!showProbability) return
    database.arts.values.forEach(art => database.arts.setProbability(art.id, probability(art, deferredProbabilityFilter)))
    return () => database.arts.values.forEach(art => database.arts.setProbability(art.id, -1))
  }, [database, showProbability, deferredProbabilityFilter])

  const { artifactIds, totalArtNum } = useMemo(() => {
    const { sortType = artifactSortKeys[0], ascending = false, filterOption } = deferredArtifactDisplayState
    let allArtifacts = database.arts.values
    //in probability mode, filter out the artifacts that already reach criteria
    if (showProbability) allArtifacts = allArtifacts.filter(art => art.probability && art.probability !== 1)
    const artifactIds = allArtifacts
      .filter(filterFunction(filterOption, filterConfigs))
      .sort(sortFunction(artifactSortMap[sortType] ?? [], ascending, sortConfigs))
      .map(art => art.id)
    return { artifactIds, totalArtNum: allArtifacts.length, ...dbDirty }//use dbDirty to shoo away warnings!
  }, [deferredArtifactDisplayState, dbDirty, database, sortConfigs, filterConfigs, showProbability])


  const { artifactIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artifactIds.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { artifactIdsToShow: artifactIds.slice(currentPageIndex * maxNumArtifactsToDisplay, (currentPageIndex + 1) * maxNumArtifactsToDisplay), numPages, currentPageIndex }
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

  return <Box display="flex" flexDirection="column" gap={1} my={1}>
    <InfoComponent
      pageKey="artifactPage"
      modalTitle={t`info.title`}
      text={t("tipsOfTheDay", { returnObjects: true }) as string[]}
    >
      <InfoDisplay />
    </InfoComponent>

    {noArtifact && <Alert severity="info" variant="filled">Looks like you haven't added any artifacts yet. If you want, there are <Link color="warning.main" component={RouterLink} to="/scanner">automatic scanners</Link> that can speed up the import process!</Alert>}

    <ArtifactFilter filterOption={filterOption} filterOptionDispatch={filterOptionDispatch} filterDispatch={stateDispatch}
      numShowing={artifactIds.length} total={totalArtNum} />
    <CardDark ref={invScrollRef}>
      <CardContent>
        <Grid container sx={{ mb: 1 }}>
          <Grid item flexGrow={1}><span><Trans t={t} i18nKey="efficiencyFilter.title">Substats to use in efficiency calculation</Trans></span></Grid>
          <Grid item>
            <Button size="small" color="error" onClick={() => stateDispatch({ effFilter: [...allSubstatKeys] })} startIcon={<Replay />}><Trans t={t} i18nKey="ui:reset" /></Button>
          </Grid>
        </Grid>
        <SubstatToggle selectedKeys={effFilter} onChange={n => stateDispatch({ effFilter: n })} />
      </CardContent>
    </CardDark>
    <CardDark ><CardContent>
      <Grid container alignItems="center" sx={{ pb: 2 }}>
        <Grid item flexGrow={1}>
          <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        </Grid>
        <Grid item flexGrow={1}>
          <ShowingArt numShowing={artifactIdsToShow.length} total={totalShowing} t={t} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={4} xl={3} display="flex">
          <Box flexGrow={1} />
          <SortByButton sortKeys={[...artifactSortKeys]}
            value={sortType} onChange={sortType => stateDispatch({ sortType })}
            ascending={ascending} onChangeAsc={ascending => stateDispatch({ ascending })}
          />
        </Grid>
      </Grid>
      <ArtifactRedButtons artifactIds={artifactIds} />
    </CardContent></CardDark>
    {showProbability && <ProbabilityFilter probabilityFilter={probabilityFilter} setProbabilityFilter={setProbabilityFilter} />}
    <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} />}>
      <Grid container spacing={1} columns={columns} >
        <Grid item xs={1} >
          <NewArtifactCard />
        </Grid>
        {artifactIdsToShow.map(artId =>
          <Grid item key={artId} xs={1}  >
            <ArtifactCard
              artifactId={artId}
              effFilter={effFilterSet}
              onDelete={deleteArtifact}
              editor
              canExclude
              canEquip
            />
          </Grid>
        )}
      </Grid>
    </Suspense>
    {numPages > 1 && <CardDark ><CardContent>
      <Grid container>
        <Grid item flexGrow={1}>
          <Pagination count={numPages} page={currentPageIndex + 1} onChange={setPage} />
        </Grid>
        <Grid item>
          <ShowingArt numShowing={artifactIdsToShow.length} total={totalShowing} t={t} />
        </Grid>
      </Grid>
    </CardContent></CardDark>}
  </Box >
}
function NewArtifactCard() {
  const [show, setshow] = useState(false)
  const onShow = useCallback(() => setshow(true), [setshow])
  const onHide = useCallback(() => setshow(false), [setshow])

  return <CardDark sx={{ height: "100%", width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>
    <Suspense fallback={false}><ArtifactEditor
      artifactIdToEdit={show ? "new" : ""}
      cancelEdit={onHide}
      allowUpload
      allowEmpty
    /></Suspense>
    <CardContent>
      <Typography sx={{ textAlign: "center" }}>Add New Artifact</Typography>
    </CardContent>
    <Box sx={{
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
    >
      <Button onClick={onShow} color="info" sx={{ borderRadius: "1em" }}>
        <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>
      </Button>
    </Box>
  </CardDark>
}

function ShowingArt({ numShowing, total, t }) {
  return <Typography color="text.secondary">
    <Trans t={t} i18nKey="showingNum" count={numShowing} value={total} >
      Showing <b>{{ count: numShowing }}</b> out of {{ value: total }} Artifacts
    </Trans>
  </Typography>
}
