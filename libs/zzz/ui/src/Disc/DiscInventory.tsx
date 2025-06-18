import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { filterFunction } from '@genshin-optimizer/common/util'
import {
  useDatabaseContext,
  useDisplayDisc,
} from '@genshin-optimizer/zzz/db-ui'
import { discFilterConfigs } from '@genshin-optimizer/zzz/util'
import AddIcon from '@mui/icons-material/Add'
import DifferenceIcon from '@mui/icons-material/Difference'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DiscCard } from './DiscCard'
import DiscFilter from './DiscFilter'

const columns = { xs: 2, sm: 3, md: 4, lg: 4, xl: 6 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export type DiscInventoryProps = {
  onAdd?: () => void
  onEdit?: (id: string) => void
  onShowDup?: () => void
}

export function DiscInventory({
  onAdd,
  onEdit,
  onShowDup,
}: DiscInventoryProps) {
  const { t } = useTranslation('disc')
  const { database } = useDatabaseContext()
  const discDisplayState = useDisplayDisc()
  const filterConfigs = useMemo(() => discFilterConfigs(), [])
  const deferredDiscDisplayState = useDeferredValue(discDisplayState)
  const allDiscs = useDataManagerValues(database.discs)
  const totalDiscsNum = allDiscs.length
  const { filterOption } = deferredDiscDisplayState
  const discIds = useMemo(
    () =>
      allDiscs
        .filter(filterFunction(filterOption, filterConfigs))
        .map((disc) => disc.id),
    [allDiscs, filterOption, filterConfigs]
  )

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
        <Grid item xs={1}>
          <Button
            fullWidth
            onClick={onShowDup}
            color="info"
            startIcon={<DifferenceIcon />}
          >
            {t('showDupes')}
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
        <Box>
          <Grid container columns={columns} spacing={1}>
            {discsIdsToShow.map((discId) => (
              <Grid item key={discId} xs={1}>
                <DiscCard key={discId} discId={discId} onEdit={onEdit} />
              </Grid>
            ))}
          </Grid>
        </Box>
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
