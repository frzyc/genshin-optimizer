import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ShowingAndSortOptionSelect,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { useDatabase, useDisplayArtifact } from '@genshin-optimizer/gi/db-ui'
import {
  AddArtInfo,
  ArtifactCard,
  ArtifactEditor,
  InfoComponent,
} from '@genshin-optimizer/gi/ui'
import {
  artifactFilterConfigs,
  artifactSortConfigs,
  artifactSortKeys,
  artifactSortMap,
} from '@genshin-optimizer/gi/util'
import AddIcon from '@mui/icons-material/Add'
import DifferenceIcon from '@mui/icons-material/Difference'
import { Box, Button, CardContent, Grid, Skeleton } from '@mui/material'
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from 'react'
import ReactGA from 'react-ga4'
import { useTranslation } from 'react-i18next'
import ArtifactFilter, { ArtifactRedButtons } from './ArtifactFilter'
import DupModal from './DupModal'
import ArtifactInfoDisplay from './InfoDisplay'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 5, sm: 6, md: 12, lg: 12, xl: 12 }

export default function PageArtifact() {
  const { t } = useTranslation(['artifact', 'ui'])
  const database = useDatabase()
  const artifactDisplayState = useDisplayArtifact()

  const [artifactIdToEdit, setArtifactIdToEdit] = useState<string | undefined>()

  const [showDup, onShowDup, onHideDup] = useBoolState(false)

  const brPt = useMediaQueryUp()

  const { sortType, effFilter, ascending } = artifactDisplayState

  const [dbDirty, forceUpdate] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dbDirty)
  const effFilterSet = useMemo(
    () => new Set(effFilter),
    [effFilter]
  ) as Set<SubstatKey>

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: '/artifact' })
    return database.arts.followAny(() => forceUpdate())
  }, [database, forceUpdate])

  const noArtifact = useMemo(() => !database.arts.values.length, [database])
  const sortConfigs = useMemo(
    () => artifactSortConfigs(effFilterSet),
    [effFilterSet]
  )
  const filterConfigs = useMemo(
    () => artifactFilterConfigs({ effFilterSet: effFilterSet }),
    [effFilterSet]
  )
  const deferredArtifactDisplayState = useDeferredValue(artifactDisplayState)

  const { artifactIds, totalArtNum } = useMemo(() => {
    const {
      sortType = artifactSortKeys[0],
      ascending = false,
      filterOption,
    } = deferredArtifactDisplayState
    const allArtifacts = database.arts.values
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
  ])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    artifactIds.length
  )
  const artifactIdsToShow = useMemo(
    () => artifactIds.slice(0, numShow),
    [artifactIds, numShow]
  )
  //for pagination
  const totalShowing =
    artifactIds.length !== totalArtNum
      ? `${artifactIds.length}/${totalArtNum}`
      : `${totalArtNum}`
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
    <Box display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={false}>
        <ArtifactEditor
          artifactIdToEdit={artifactIdToEdit}
          cancelEdit={() => setArtifactIdToEdit(undefined)}
          allowUpload
          allowEmpty
        />
      </Suspense>
      <Suspense fallback={false}>
        <DupModal
          show={showDup}
          onHide={onHideDup}
          setArtifactIdToEdit={setArtifactIdToEdit}
        />
      </Suspense>
      <InfoComponent
        pageKey="artifactPage"
        modalTitle={t('info.title')}
        text={t('tipsOfTheDay', { returnObjects: true }) as string[]}
      >
        <ArtifactInfoDisplay />
      </InfoComponent>

      {noArtifact && <AddArtInfo />}

      <ArtifactFilter
        numShowing={artifactIds.length}
        total={totalArtNum}
        artifactIds={artifactIds}
      />
      <CardThemed>
        <CardContent>
          <Box
            pb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <ShowingAndSortOptionSelect
              showingTextProps={showingTextProps}
              sortByButtonProps={sortByButtonProps}
            />
          </Box>
          <ArtifactRedButtons artifactIds={artifactIds} />
        </CardContent>
      </CardThemed>
      <Grid container columns={columns} spacing={1}>
        <Grid item xs>
          <Button
            fullWidth
            onClick={() => setArtifactIdToEdit('new')}
            color="info"
            startIcon={<AddIcon />}
          >
            {t('addNew')}
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button
            fullWidth
            onClick={onShowDup}
            color="info"
            startIcon={<DifferenceIcon />}
          >
            {t('showDup')}
          </Button>
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
                onDelete={() => database.arts.remove(artId)}
                onEdit={() => setArtifactIdToEdit(artId)}
                setLocation={(location) =>
                  database.arts.set(artId, { location })
                }
                onLockToggle={() =>
                  database.arts.set(artId, ({ lock }) => ({ lock: !lock }))
                }
              />
            </Grid>
          ))}
        </Grid>
        {artifactIds.length !== artifactIdsToShow.length && (
          <Skeleton
            ref={(node) => {
              if (!node) return
              setTriggerElement(node)
            }}
            sx={{ borderRadius: 1 }}
            variant="rectangular"
            width="100%"
            height={100}
          />
        )}
      </Suspense>
    </Box>
  )
}
