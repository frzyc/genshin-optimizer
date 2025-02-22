import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  ShowingAndSortOptionSelect,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import {
  allArtifactSlotKeys,
  type ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { ArtifactFilterOption } from '@genshin-optimizer/gi/util'
import {
  artifactFilterConfigs,
  initialArtifactFilterOption,
} from '@genshin-optimizer/gi/util'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CompareBuildWrapper } from '../build/CompareBuildWrapper'
import { ArtifactCard } from './ArtifactCard'
import { ArtifactFilterDisplay } from './ArtifactFilterDisplay'
import { ArtifactEditor } from './editor'
const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }

export function ArtifactSwapModal({
  artId,
  onChangeId,
  slotKey,
  show,
  onClose,
}: {
  artId: string
  onChangeId: (id: string | null) => void
  slotKey: ArtifactSlotKey
  show: boolean
  onClose: () => void
}) {
  const { t } = useTranslation(['page_character', 'artifact'])
  const database = useDatabase()

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
    let artifactIds = database.arts.values
      .filter(filterFunc)
      .map((art) => art.id)
    if (artId && database.arts.get(artId)) {
      // always show artId first if it exists
      artifactIds = artifactIds.filter((id) => id !== artId) // remove
      artifactIds.unshift(artId) // add to beginnig
    }
    return dbDirty && artifactIds
  }, [filterOption, filterConfigs, database, artId, dbDirty])

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
  const [swapArtId, setSwapArtId] = useState<string | ArtifactSlotKey>('')
  const clickHandler = useCallback(() => {
    if (
      !swapArtId ||
      allArtifactSlotKeys.includes(swapArtId as ArtifactSlotKey)
    ) {
      onChangeId(null)
    } else onChangeId(swapArtId)
    setSwapArtId('')
    onClose()
  }, [onChangeId, onClose, swapArtId])
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
            {t('tabEquip.swapArt')}
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
              <CompareBuildWrapper
                artIdOrSlot={swapArtId}
                onHide={() => setSwapArtId('')}
                onEquip={clickHandler}
              />
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
                {/* only show "unequip" when an artifact is equipped */}
                {artId && (
                  <Grid item xs={1}>
                    <CardThemed
                      bgt="light"
                      sx={{ width: '100%', height: '100%' }}
                    >
                      <CardActionArea
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onClick={() => setSwapArtId(slotKey)}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <RemoveCircleIcon sx={{ fontSize: '10em' }} />
                          <Typography>
                            {t('artifact:button.unequipArtifact')}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </CardThemed>
                  </Grid>
                )}
                {artifactIdsToShow.map((id) => (
                  <Grid
                    item
                    key={id}
                    xs={1}
                    sx={(theme) => ({
                      ...(artId === id && {
                        '> .MuiCard-root': {
                          outline: `solid ${theme.palette.warning.main}`,
                        },
                      }),
                    })}
                  >
                    <ArtifactCard
                      artifactId={id}
                      onClick={
                        artId === id ? undefined : () => setSwapArtId(id)
                      }
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
