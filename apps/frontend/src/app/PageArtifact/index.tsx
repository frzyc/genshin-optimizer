import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  clamp,
  filterFunction,
  sortFunction,
} from '@genshin-optimizer/common/util'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Add } from '@mui/icons-material'
import DifferenceIcon from '@mui/icons-material/Difference'
import { Box, Button, CardContent, Grid, Skeleton } from '@mui/material'
import React, {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import AddArtInfo from '../Components/AddArtInfo'
import SubstatToggle from '../Components/Artifact/SubstatToggle'
import BootstrapTooltip from '../Components/BootstrapTooltip'
import CardDark from '../Components/Card/CardDark'
import InfoComponent from '../Components/InfoComponent'
import PageAndSortOptionSelect from '../Components/PageAndSortOptionSelect'
import useDisplayArtifact from '../ReactHooks/useDisplayArtifact'
import ArtifactCard from './ArtifactCard'
import ArtifactFilter, { ArtifactRedButtons } from './ArtifactFilter'
import {
  artifactFilterConfigs,
  artifactSortConfigs,
  artifactSortKeys,
  artifactSortMap,
} from './ArtifactSort'
import DupModal from './DupModal'
import ProbabilityFilter from './ProbabilityFilter'
import { probability } from './RollProbability'

//lazy load the weapon display
const ArtifactEditor = React.lazy(() => import('./ArtifactEditor'))

const InfoDisplay = React.lazy(() => import('./InfoDisplay'))

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export default function PageArtifact() {
  const { t } = useTranslation(['artifact', 'ui'])
  const database = useDatabase()
  const artifactDisplayState = useDisplayArtifact()

  const [showEditor, onShowEditor, onHideEditor] = useBoolState(false)

  const [showDup, onShowDup, onHideDup] = useBoolState(false)

  const brPt = useMediaQueryUp()
  const maxNumArtifactsToDisplay = numToShowMap[brPt]

  const { sortType, effFilter, ascending, probabilityFilter } =
    artifactDisplayState
  const showProbability = sortType === 'probability'

  const [pageIndex, setpageIndex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)
  const effFilterSet = useMemo(
    () => new Set(effFilter),
    [effFilter]
  ) as Set<SubstatKey>
  const deleteArtifact = useCallback(
    (id: string) => database.arts.remove(id),
    [database]
  )

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: '/artifact' })
    return database.arts.followAny(() => forceUpdate())
  }, [database, forceUpdate])

  const setProbabilityFilter = useCallback(
    (probabilityFilter) => database.displayArtifact.set({ probabilityFilter }),
    [database]
  )

  const noArtifact = useMemo(() => !database.arts.values.length, [database])
  const sortConfigs = useMemo(
    () => artifactSortConfigs(effFilterSet, probabilityFilter),
    [effFilterSet, probabilityFilter]
  )
  const filterConfigs = useMemo(
    () => artifactFilterConfigs(effFilterSet),
    [effFilterSet]
  )
  const deferredArtifactDisplayState = useDeferredValue(artifactDisplayState)
  const deferredProbabilityFilter = useDeferredValue(probabilityFilter)
  useEffect(() => {
    if (!showProbability) return undefined
    database.arts.values.forEach((art) =>
      database.arts.setProbability(
        art.id,
        probability(art, deferredProbabilityFilter)
      )
    )
    return () =>
      database.arts.values.forEach((art) =>
        database.arts.setProbability(art.id, -1)
      )
  }, [database, showProbability, deferredProbabilityFilter])

  const { artifactIds, totalArtNum } = useMemo(() => {
    const {
      sortType = artifactSortKeys[0],
      ascending = false,
      filterOption,
    } = deferredArtifactDisplayState
    let allArtifacts = database.arts.values
    //in probability mode, filter out the artifacts that already reach criteria
    if (showProbability)
      allArtifacts = allArtifacts.filter(
        (art) => art.probability && art.probability !== 1
      )
    const artifactIds = allArtifacts
      .filter(filterFunction(filterOption, filterConfigs))
      .sort(
        sortFunction(artifactSortMap[sortType] ?? [], ascending, sortConfigs)
      )
      .map((art) => art.id)
    return { artifactIds, totalArtNum: allArtifacts.length, ...dbDirtyDeferred } //use dbDirty to shoo away warnings!
  }, [
    deferredArtifactDisplayState,
    dbDirtyDeferred,
    database,
    sortConfigs,
    filterConfigs,
    showProbability,
  ])

  const { artifactIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artifactIds.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIndex, 0, numPages - 1)
    return {
      artifactIdsToShow: artifactIds.slice(
        currentPageIndex * maxNumArtifactsToDisplay,
        (currentPageIndex + 1) * maxNumArtifactsToDisplay
      ),
      numPages,
      currentPageIndex,
    }
  }, [artifactIds, pageIndex, maxNumArtifactsToDisplay])

  //for pagination
  const totalShowing =
    artifactIds.length !== totalArtNum
      ? `${artifactIds.length}/${totalArtNum}`
      : `${totalArtNum}`
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      setpageIndex(value - 1)
    },
    [setpageIndex, invScrollRef]
  )

  const paginationProps = {
    count: numPages,
    page: currentPageIndex + 1,
    onChange: setPage,
  }

  const showingTextProps = {
    numShowing: artifactIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'artifact',
  }

  const sortByButtonProps = {
    sortKeys: [...artifactSortKeys],
    value: sortType,
    onChange: (sortType) => database.displayArtifact.set({ sortType }),
    ascending: ascending,
    onChangeAsc: (ascending) => database.displayArtifact.set({ ascending }),
  }

  return (
    <Box display="flex" flexDirection="column" gap={1} my={1}>
      <Suspense fallback={false}>
        <ArtifactEditor
          artifactIdToEdit={showEditor ? 'new' : ''}
          cancelEdit={onHideEditor}
          allowUpload
          allowEmpty
        />
      </Suspense>
      <Suspense fallback={false}>
        <DupModal show={showDup} onHide={onHideDup} />
      </Suspense>
      <InfoComponent
        pageKey="artifactPage"
        modalTitle={t`info.title`}
        text={t('tipsOfTheDay', { returnObjects: true }) as string[]}
      >
        <InfoDisplay />
      </InfoComponent>

      {noArtifact && <AddArtInfo />}

      <ArtifactFilter
        numShowing={artifactIds.length}
        total={totalArtNum}
        artifactIds={artifactIds}
      />
      <CardDark ref={invScrollRef}>
        <CardContent>
          <BootstrapTooltip
            placement="top"
            title={
              <Trans t={t} i18nKey="efficiencyFilter.title">
                Substats to use in efficiency calculation
              </Trans>
            }
          >
            <Box>
              <SubstatToggle
                selectedKeys={effFilter}
                onChange={(n) => database.displayArtifact.set({ effFilter: n })}
              />
            </Box>
          </BootstrapTooltip>
        </CardContent>
      </CardDark>
      <CardDark>
        <CardContent>
          <Box
            pb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <PageAndSortOptionSelect
              paginationProps={paginationProps}
              showingTextProps={showingTextProps}
              displaySort={true}
              sortByButtonProps={sortByButtonProps}
            />
          </Box>
          <ArtifactRedButtons artifactIds={artifactIds} />
        </CardContent>
      </CardDark>
      {showProbability && (
        <ProbabilityFilter
          probabilityFilter={probabilityFilter}
          setProbabilityFilter={setProbabilityFilter}
        />
      )}
      <Grid container columns={columns} spacing={1}>
        <Grid item xs>
          <Button
            fullWidth
            onClick={onShowEditor}
            color="info"
            startIcon={<Add />}
          >{t`addNew`}</Button>
        </Grid>
        <Grid item xs={1}>
          <Button
            fullWidth
            onClick={onShowDup}
            color="info"
            startIcon={<DifferenceIcon />}
          >{t`showDup`}</Button>
        </Grid>
      </Grid>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {artifactIdsToShow.map((artId) => (
            <Grid item key={artId} xs={1}>
              <ArtifactCard
                artifactId={artId}
                effFilter={effFilterSet}
                onDelete={deleteArtifact}
                editorProps={{}}
                canEquip
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
      {numPages > 1 && (
        <CardDark>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
            >
              <PageAndSortOptionSelect
                paginationProps={paginationProps}
                showingTextProps={showingTextProps}
              />
            </Box>
          </CardContent>
        </CardDark>
      )}
    </Box>
  )
}
