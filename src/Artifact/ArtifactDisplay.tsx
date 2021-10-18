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
import { allSubstats, ICachedArtifact, SubstatKey } from '../Types/artifact';
import { clamp } from '../Util/Util';
import Artifact from './Artifact';
import ArtifactCard from './ArtifactCard';
import ArtifactEditor from './ArtifactEditor';
import ArtifactFilter from './ArtifactFilter';
import { initialFilter, sortKeys } from './ArtifactFilterUtil';

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

function filterReducer(state, action) {
  //reset all except the efficiency filter, since its a separate UI with its own reset
  if (action.type === "reset") return { ...initialFilter(), effFilter: state.effFilter }
  return { ...state, ...action }
}
function filterInit(initial = initialFilter()) {
  return { ...initial, ...(dbStorage.get("ArtifactDisplay.state") ?? {}) }
}
export default function ArtifactDisplay(props) {
  const { t } = useTranslation(["artifact", "ui"]);
  const database = useContext(DatabaseContext)
  const [filters, filterDispatch] = useReducer(filterReducer, initialFilter(), filterInit)
  const { effFilter } = filters
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
    dbStorage.set("ArtifactDisplay.state", filters)
  }, [filters])

  const noArtifact = useMemo(() => !database._getArts().length, [database])

  const { artifacts, totalArtNum } = useMemo(() => {
    const { filterArtSetKey, filterSlotKey, filterMainStatKey, filterStars, filterLevelLow, filterLevelHigh,
      filterSubstats = initialFilter().filterSubstats, filterLocation = "",
      filterExcluded = "", sortType = sortKeys[0], ascending = false } = filters
    const allArtifacts = database._getArts()
    const artifacts: ICachedArtifact[] = allArtifacts.filter(art => {
      if (filterExcluded) {
        if (filterExcluded === "excluded" && !art.exclude) return false
        if (filterExcluded === "included" && art.exclude) return false
      }
      if (filterLocation === "Inventory") {
        if (art.location) return false;
      } else if (filterLocation === "Equipped") {
        if (!art.location) return false;
      } else if (filterLocation && filterLocation !== art.location) return false;

      if (filterArtSetKey && filterArtSetKey !== art.setKey) return false;
      if (filterSlotKey && filterSlotKey !== art.slotKey) return false
      if (filterMainStatKey && filterMainStatKey !== art.mainStatKey) return false
      if (art.level < filterLevelLow || art.level > filterLevelHigh) return false;
      if (!filterStars.includes(art.rarity)) return false;
      for (const filterKey of filterSubstats)
        if (filterKey && !art.substats.some(substat => substat.key === filterKey)) return false;
      return true
    }).map((art) => {
      switch (sortType) {
        case "quality": return { value: [art.rarity], art }
        case "level": return { value: [art.level, art.rarity], art }
        case "efficiency": return { value: [Artifact.getArtifactEfficiency(art, effFilterSet).currentEfficiency], art }
        case "mefficiency": return { value: [Artifact.getArtifactEfficiency(art, effFilterSet).maxEfficiency], art }
      }
      return { value: [0], art }
    }).sort((a, b) => {
      for (let i = 0; i < a.value.length; i++) {
        if (a.value[i] !== b.value[i])
          return (a.value[i] - b.value[i]) * (ascending ? 1 : -1)
      }
      return 0
    }).map(item => item.art)

    return { artifacts, totalArtNum: allArtifacts.length, ...dbDirty }//use dbDirty to shoo away warnings!
  }, [filters, dbDirty, effFilterSet, database])

  const { maxNumArtifactsToDisplay } = filters

  const { artifactsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artifacts.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return { artifactsToShow: artifacts.slice(currentPageIndex * maxNumArtifactsToDisplay, (currentPageIndex + 1) * maxNumArtifactsToDisplay), numPages, currentPageIndex }
  }, [artifacts, pageIdex, maxNumArtifactsToDisplay])

  //for pagination
  const totalShowing = artifacts.length !== totalArtNum ? `${artifacts.length}/${totalArtNum}` : `${totalArtNum}`
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
    <ArtifactFilter artifacts={artifacts} filters={filters} filterDispatch={filterDispatch} />
    <CardDark ref={invScrollRef}>
      <CardContent>
        <Grid container sx={{ mb: 1 }}>
          <Grid item flexGrow={1}><span><Trans t={t} i18nKey="efficiencyFilter.title">Substats to use in efficiency calculation</Trans></span></Grid>
          <Grid item>
            <Button size="small" color="error" onClick={() => filterDispatch({ effFilter: [...allSubstats] })} startIcon={<Replay />}><Trans t={t} i18nKey="ui:reset" /></Button>
          </Grid>
        </Grid>
        <EfficiencyFilter selectedKeys={effFilter} onChange={n => filterDispatch({ effFilter: n })} />
      </CardContent>
    </CardDark>
    <PaginationCard count={numPages} page={currentPageIndex + 1} onChange={setPage} numShowing={artifactsToShow.length} total={totalShowing} t={t} />
    <Grid container spacing={1} >
      <Suspense fallback={<Grid item xs={12}><Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} /></Grid>}>
        {artifactsToShow.map((art, i) =>
          <Grid item key={i} xs={12} sm={6} md={4} lg={4} xl={3} >
            <ArtifactCard
              artifactId={art.id}
              effFilter={effFilterSet}
              onDelete={deleteArtifact}
              onEdit={editArtifact}
            />
          </Grid>
        )}
      </Suspense>
    </Grid>
    {numPages > 1 && <PaginationCard count={numPages} page={currentPageIndex + 1} onChange={setPage} numShowing={artifactsToShow.length} total={totalShowing} t={t} />}
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