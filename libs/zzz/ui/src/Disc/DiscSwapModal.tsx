import {
  useBoolState,
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  ShowingAndSortOptionSelect,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import type { DiscFilterOption } from '@genshin-optimizer/zzz/util'
import {
  discFilterConfigs,
  initialDiscFilterOption,
} from '@genshin-optimizer/zzz/util'
import { IDisc } from '@genshin-optimizer/zzz/zood'
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
import { DiscCard } from './DiscCard'
import { DiscEditor } from './DiscEditor'
import { DiscFilterDisplay } from './DiscFilterDisplay'
const numToShowMap = { xs: 2 * 3, sm: 2 * 3, md: 3 * 3, lg: 4 * 3, xl: 4 * 3 }

export function DiscSwapModal({
  disc,
  onChangeId,
  slotKey,
  show,
  onClose,
}: {
  disc: ICachedDisc | undefined
  onChangeId: (id: string | null) => void
  slotKey: DiscSlotKey
  show: boolean
  onClose: () => void
}) {
  const { t } = useTranslation(['page_character', 'disc'])
  const { database } = useDatabaseContext()
  const discId = disc?.id

  const filterOptionReducer = useCallback(
    (state, action) => ({ ...state, ...action, slotKeys: [slotKey] }),
    [slotKey]
  )

  const [showEditor, onShowEditor, onHideEditor] = useBoolState(false)

  const [filterOption, filterOptionDispatch]: [
    DiscFilterOption,
    (action: any) => void
  ] = useReducer(filterOptionReducer, {
    ...initialDiscFilterOption(),
    slotKeys: [slotKey],
  })

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => {
    return database.discs.followAny(forceUpdate)
  }, [database, forceUpdate])

  const brPt = useMediaQueryUp()

  const filterConfigs = useMemo(() => discFilterConfigs(), [])
  const totalDiscNum = database.discs.values.filter(
    (s) => s.slotKey === filterOption.slotKeys[0]
  ).length

  const discsIds = useMemo(() => {
    const filterFunc = filterFunction(filterOption, filterConfigs)
    let discsIds = database.discs.values
      .filter(filterFunc)
      .map((disc) => disc.id)
    if (discId && database.discs.get(discId)) {
      // always show discId first if it exists
      discsIds = discsIds.filter((id) => id !== discId) // remove
      discsIds.unshift(discId) // add to beginnig
    }
    return dbDirty && discsIds
  }, [filterOption, filterConfigs, database.discs, discId, dbDirty])

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    discsIds.length
  )

  const discIdsToShow = useMemo(
    () => discsIds.slice(0, numShow),
    [discsIds, numShow]
  )

  const totalShowing =
    discsIds.length !== totalDiscNum
      ? `${discsIds.length}/${totalDiscNum}`
      : `${totalDiscNum}`

  const showingTextProps = {
    numShowing: discIdsToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'disc',
  }
  const [swapDiscId, setSwapDiscId] = useState<string | DiscSlotKey>('')

  //TODO: This should be replaced with ComapreBuildWrapper
  if (allDiscSlotKeys.includes(swapDiscId as DiscSlotKey)) {
    onChangeId(null)
    setSwapDiscId('')
    onClose()
  } else if (swapDiscId) {
    onChangeId(swapDiscId)
    setSwapDiscId('')
    onClose()
  }

  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardThemed>
        <Suspense fallback={false}>
          <DiscEditor
            disc={{}}
            show={showEditor}
            onShow={onShowEditor}
            onClose={onHideEditor}
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
          <Typography variant="h6">{t('tabEquip.swapDisc')}</Typography>
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
            <DiscFilterDisplay
              filterOption={filterOption}
              filterOptionDispatch={filterOptionDispatch}
              filteredIds={discsIds}
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
            {t('disc:addNew')}
          </Button>
          <Box mt={1}>
            <Suspense
              fallback={
                <Skeleton variant="rectangular" width="100%" height={300} />
              }
            >
              <Grid container spacing={1} columns={{ xs: 2, md: 3, lg: 4 }}>
                {/* only show "unequip" when an artifact is equipped */}
                {discId && (
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
                        onClick={() => setSwapDiscId(slotKey)}
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
                            {t('disc:button.unequipDisc')}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </CardThemed>
                  </Grid>
                )}
                {discIdsToShow.map((id) => (
                  <Grid
                    item
                    key={id}
                    xs={1}
                    sx={(theme) => ({
                      ...(discId === id && {
                        '> .MuiCard-root': {
                          outline: `solid ${theme.palette.warning.main}`,
                        },
                      }),
                    })}
                  >
                    <DiscCard
                      disc={database.discs.get(id) as IDisc}
                      onClick={
                        discId === id ? undefined : () => setSwapDiscId(id)
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Suspense>
          </Box>
          {discsIds.length !== discIdsToShow.length && (
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
