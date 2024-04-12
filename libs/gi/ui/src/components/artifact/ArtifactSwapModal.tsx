import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { ArtifactFilterOption } from '@genshin-optimizer/gi/util'
import {
  artifactFilterConfigs,
  initialArtifactFilterOption,
} from '@genshin-optimizer/gi/util'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useEffect, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { CompareBuildButton } from '../CompareBuildButton'
import { ShowingAndSortOptionSelect } from '../ShowingAndSortOptionSelect'
import { ArtifactCard } from './ArtifactCard'
import { ArtifactFilterDisplay } from './ArtifactFilterDisplay'
import { ArtifactEditor } from './editor'

const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }

export function ArtifactSwapModal({
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
    ArtifactFilterOption,
    (action: any) => void
  ] = useReducer(filterOptionReducer, {
    ...initialArtifactFilterOption(),
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

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    artifactIds.length
  )

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
      <CardThemed>
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
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            {slotKey ? <ImgIcon src={imgAssets.slot[slotKey]} /> : null}{' '}
            {t`tabEquip.swapArt`}
          </Typography>
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <CloseIcon />
          </IconButton>
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
            startIcon={<AddIcon />}
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
                setTriggerElement(node)
              }}
              sx={{ borderRadius: 1, mt: 1 }}
              variant="rectangular"
              width="100%"
              height={100}
            />
          )}
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
