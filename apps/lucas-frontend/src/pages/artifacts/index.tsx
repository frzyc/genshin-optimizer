// Personal copy of libs/gi/page-artifacts with a compact filter bar instead of the full filter panel.
// Filtering/sorting logic and state stay upstream (displayArtifact + gi/util configs).
import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import {
  useBoolState,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  SortByButton,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { useDatabase, useDisplayArtifact } from '@genshin-optimizer/gi/db-ui'
import {
  type ArtifactSortKey,
  artifactSortKeys,
} from '@genshin-optimizer/gi/schema'
import {
  AddArtInfo,
  ArtifactCard,
  ArtifactEditor,
  InfoComponent,
} from '@genshin-optimizer/gi/ui'
import {
  artifactFilterConfigs,
  artifactSortConfigs,
  artifactSortMap,
} from '@genshin-optimizer/gi/util'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArtifactActionsMenu } from './ArtifactActionsMenu'
import { ArtifactFilterBar } from './ArtifactFilterBar'
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

  const effFilterSet = useMemo(
    () => new Set(effFilter),
    [effFilter]
  ) as Set<SubstatKey>
  const noArtifact = !database.arts.values.length
  const sortConfigs = useMemo(
    () => artifactSortConfigs(effFilterSet),
    [effFilterSet]
  )
  const filterConfigs = useMemo(
    () => artifactFilterConfigs({ effFilterSet }),
    [effFilterSet]
  )
  const deferredArtifactDisplayState = useDeferredValue(artifactDisplayState)
  const allArts = useDataManagerValues(database.arts)
  const totalArtNum = allArts.length

  const filteredArtIds = useMemo(() => {
    const {
      sortType = artifactSortKeys[0],
      ascending = false,
      filterOption,
    } = deferredArtifactDisplayState
    return allArts
      .filter(filterFunction(filterOption, filterConfigs))
      .sort(
        sortFunction(artifactSortMap[sortType] ?? [], ascending, sortConfigs)
      )
      .map((art) => art.id)
  }, [deferredArtifactDisplayState, allArts, filterConfigs, sortConfigs])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    filteredArtIds.length
  )
  const artifactIdsToShow = useMemo(
    () => filteredArtIds.slice(0, numShow),
    [filteredArtIds, numShow]
  )

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

      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Typography variant="h6" fontWeight={700}>
              {t('ui:tabs.artifacts')}
            </Typography>
            <Typography color="text.secondary">
              {filteredArtIds.length !== totalArtNum ? (
                <>
                  <strong>{filteredArtIds.length}</strong> de {totalArtNum}{' '}
                  artefatos
                </>
              ) : (
                <>{totalArtNum} artefatos</>
              )}
            </Typography>
            <Box flexGrow={1} />
            <SortByButton
              size="small"
              sortKeys={[...artifactSortKeys]}
              value={sortType}
              onChange={(sortType: ArtifactSortKey) =>
                database.displayArtifact.set({ sortType })
              }
              ascending={ascending}
              onChangeAsc={(ascending: boolean) =>
                database.displayArtifact.set({ ascending })
              }
            />
            <ArtifactActionsMenu
              artifactIds={filteredArtIds}
              onShowDup={onShowDup}
            />
            <Button
              startIcon={<AddIcon />}
              onClick={() => setArtifactIdToEdit('new')}
            >
              Adicionar
            </Button>
          </Box>
          <Suspense
            fallback={<Skeleton variant="rectangular" height={40} />}
          >
            <ArtifactFilterBar filteredIds={filteredArtIds} />
          </Suspense>
        </CardContent>
      </CardThemed>

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
        {filteredArtIds.length !== artifactIdsToShow.length && (
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
