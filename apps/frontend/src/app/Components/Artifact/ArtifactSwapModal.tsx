import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { clamp, filterFunction } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import ArtifactCard from '../../PageArtifact/ArtifactCard'
import type { FilterOption } from '../../PageArtifact/ArtifactSort'
import {
  artifactFilterConfigs,
  initialFilterOption,
} from '../../PageArtifact/ArtifactSort'
import CardDark from '../Card/CardDark'
import CloseButton from '../CloseButton'
import CompareBuildButton from '../CompareBuildButton'
import ImgIcon from '../Image/ImgIcon'
import ModalWrapper from '../ModalWrapper'
import PageAndSortOptionSelect from '../PageAndSortOptionSelect'

const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }
const ArtifactEditor = lazy(() => import('../../PageArtifact/ArtifactEditor'))
const ArtifactFilterDisplay = lazy(() => import('./ArtifactFilterDisplay'))

export default function ArtifactSwapModal({
  onChangeId,
  slotKey,
  show,
  onClose,
}: {
  onChangeId: (id: string) => void
  slotKey: ArtifactSlotKey
  show: boolean
  onClose: () => void
}) {
  const { t } = useTranslation(['page_character', 'artifact'])
  const database = useDatabase()
  const clickHandler = useCallback(
    (id) => {
      onChangeId(id)
      onClose()
    },
    [onChangeId, onClose]
  )
  const filterOptionReducer = useCallback(
    (state, action) => ({ ...state, ...action, slotKeys: [slotKey] }),
    [slotKey]
  )

  const [showEditor, onShowEditor, onHideEditor] = useBoolState(false)

  const [filterOption, filterOptionDispatch]: [
    FilterOption,
    (action: any) => void
  ] = useReducer(filterOptionReducer, {
    ...initialFilterOption(),
    slotKeys: [slotKey],
  })

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => {
    return database.arts.followAny(forceUpdate)
  }, [database, forceUpdate])

  const brPt = useMediaQueryUp()
  const maxNumArtifactsToDisplay = numToShowMap[brPt]

  const [pageIdex, setpageIdex] = useState(0)
  const invScrollRef = useRef<HTMLDivElement>(null)

  const filterConfigs = useMemo(() => artifactFilterConfigs(), [])
  const totalArtNum = database.arts.values.filter(
    (s) => s.slotKey === filterOption.slotKeys[0]
  ).length
  const artIdList = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    return (
      dbDirty && database.arts.values.filter(filterFunc).map((art) => art.id)
    )
  }, [dbDirty, database, filterConfigs, filterOption])

  const { artifactIdsToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(artIdList.length / maxNumArtifactsToDisplay)
    const currentPageIndex = clamp(pageIdex, 0, numPages - 1)
    return {
      artifactIdsToShow: artIdList.slice(
        currentPageIndex * maxNumArtifactsToDisplay,
        (currentPageIndex + 1) * maxNumArtifactsToDisplay
      ),
      numPages,
      currentPageIndex,
    }
  }, [artIdList, pageIdex, maxNumArtifactsToDisplay])

  // for pagination
  const totalShowing =
    artIdList.length !== totalArtNum
      ? `${artIdList.length}/${totalArtNum}`
      : `${totalArtNum}`
  const setPage = useCallback(
    (e, value) => {
      invScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      setpageIdex(value - 1)
    },
    [setpageIdex, invScrollRef]
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

  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardDark>
        <Suspense fallback={false}>
          <ArtifactEditor
            artifactIdToEdit={showEditor ? 'new' : ''}
            cancelEdit={onHideEditor}
            allowUpload
            allowEmpty
            fixedSlotKey={filterOption.slotKeys[0]}
          />
        </Suspense>
        <CardContent
          sx={{
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            {slotKey ? <ImgIcon src={imgAssets.slot[slotKey]} /> : null}{' '}
            {t`tabEquip.swapArt`}
          </Typography>
          <CloseButton onClick={onClose} />
        </CardContent>
        <Divider />
        <CardContent>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={200} />
            }
          >
            <ArtifactFilterDisplay
              filterOption={filterOption}
              filterOptionDispatch={filterOptionDispatch}
              filteredIds={artIdList}
              disableSlotFilter
            />
          </Suspense>
        </CardContent>
        <Divider />
        <CardContent>
          <Box
            pb={1}
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            flexWrap="wrap"
          >
            <PageAndSortOptionSelect
              paginationProps={paginationProps}
              showingTextProps={showingTextProps}
            />
          </Box>
          <Button
            fullWidth
            onClick={onShowEditor}
            color="info"
            startIcon={<Add />}
          >
            {t('artifact:addNew')}
          </Button>
          <Box mt={1}>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
                {artifactIdsToShow.map((id) => (
                  <Grid item key={id} xs={1}>
                    <ArtifactCard
                      artifactId={id}
                      extraButtons={<CompareBuildButton artId={id} />}
                      onClick={clickHandler}
                    />
                  </Grid>
                ))}
              </Grid>
            </Suspense>
          </Box>
          {numPages > 1 && (
            <Box
              pt={2}
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
          )}
        </CardContent>
      </CardDark>
    </ModalWrapper>
  )
}
