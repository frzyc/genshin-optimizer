import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import {
  useDatabaseContext,
  useDisplayDisc,
} from '@genshin-optimizer/zzz/db-ui'
import { discFilterConfigs } from '@genshin-optimizer/zzz/util'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useDeferredValue, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DiscCard } from './DiscCard'
import DiscFilter from './DiscFilter'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export type DiscInventoryProps = {
  onAdd?: () => void
  onEdit?: (id: string) => void
}

export function DiscInventory({ onAdd, onEdit }: DiscInventoryProps) {
  const { t } = useTranslation('disc')
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()
  const dbDirtyDeferred = useDeferredValue(dirtyDatabase)
  const discDisplayState = useDisplayDisc()
  const filterConfigs = useMemo(() => discFilterConfigs(), [])
  const deferredDiscDisplayState = useDeferredValue(discDisplayState)

  useEffect(
    () => database.discs.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const { discIds, totalDiscsNum } = useMemo(() => {
    const { filterOption } = deferredDiscDisplayState
    const allDiscs = database.discs.values
    const allDiscids = allDiscs
      .filter(filterFunction(filterOption, filterConfigs))
      .map((disc) => disc.id)
    return {
      discIds: allDiscids,
      totalDiscsNum: allDiscs.length,
      ...dbDirtyDeferred,
    } //use dbDirty to shoo away warnings!
  }, [
    database.discs.values,
    dbDirtyDeferred,
    deferredDiscDisplayState,
    filterConfigs,
  ])

  const brPt = useMediaQueryUp()
  const totalShowing =
    discIds.length !== totalDiscsNum
      ? `${discIds.length}/${totalDiscsNum}`
      : totalDiscsNum
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    discIds.length
  )

  const discsIdsToShow = useMemo(
    () => discIds.slice(0, numShow),
    [discIds, numShow]
  )
  const showingTextProps = {
    numShowing: discsIdsToShow.length,
    totalShowing: totalShowing,
  }

  return (
    <>
      <DiscFilter
        numShowing={totalDiscsNum}
        total={totalDiscsNum}
        discIds={discIds}
      ></DiscFilter>
      <CardThemed bgt="dark">
        <CardContent>
          <Box
            pb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography color="text.secondary">
              Showing <b>{showingTextProps.numShowing}</b> out of{' '}
              {showingTextProps.totalShowing} Items
            </Typography>
          </Box>
        </CardContent>
      </CardThemed>
      <Grid container columns={columns} spacing={1}>
        <Grid item xs>
          <Button
            fullWidth
            onClick={onAdd}
            color="info"
            startIcon={<AddIcon />}
          >
            {t('addNew')}
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
        <Grid container columns={columns} spacing={1}>
          {discsIdsToShow.map((discId) => (
            <Grid item key={discId} xs={1}>
              <DiscCard
                disc={database.discs.get(discId)!}
                onEdit={() => onEdit?.(discId)}
                onDelete={() => database.discs.remove(discId)}
                setLocation={(location) =>
                  database.discs.set(discId, { location })
                }
                onLockToggle={() =>
                  database.discs.set(discId, ({ lock }) => ({ lock: !lock }))
                }
              />
            </Grid>
          ))}
        </Grid>
        {discIds.length !== discsIdsToShow.length && (
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
    </>
  )
}
