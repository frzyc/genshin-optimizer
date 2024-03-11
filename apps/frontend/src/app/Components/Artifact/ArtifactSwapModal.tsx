import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { useOnScreen } from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
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
import ShowingAndSortOptionSelect from '../ShowingAndSortOptionSelect'

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

  const filterConfigs = useMemo(() => artifactFilterConfigs(), [])
  const totalArtNum = database.arts.values.filter(
    (s) => s.slotKey === filterOption.slotKeys[0]
  ).length

  const artifactIds = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    return (
      dbDirty && database.arts.values.filter(filterFunc).map((art) => art.id)
    )
  }, [dbDirty, database, filterConfigs, filterOption])

  const [numShow, setNumShow] = useState(numToShowMap[brPt])
  // reset the numShow when artifactIds changes
  useEffect(() => {
    artifactIds && setNumShow(numToShowMap[brPt])
  }, [artifactIds, brPt])

  const [element, setElement] = useState<HTMLElement | undefined>()
  const trigger = useOnScreen(element)
  const shouldIncrease = trigger && numShow < artifactIds.length
  useEffect(() => {
    if (!shouldIncrease) return
    setNumShow((num) => num + numToShowMap[brPt])
  }, [shouldIncrease, brPt])

  const artifactIdsToShow = useMemo(
    () => artifactIds.slice(0, numShow),
    [artifactIds, numShow]
  )

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
              filteredIds={artifactIds}
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
            <ShowingAndSortOptionSelect showingTextProps={showingTextProps} />
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
          {artifactIds.length !== artifactIdsToShow.length && (
            <Skeleton
              ref={(node) => {
                if (!node) return
                setElement(node)
              }}
              sx={{ borderRadius: 1, mt: 1 }}
              variant="rectangular"
              width="100%"
              height={100}
            />
          )}
        </CardContent>
      </CardDark>
    </ModalWrapper>
  )
}
