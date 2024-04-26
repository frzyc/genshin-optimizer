import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { Box, CardContent, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import { RelicCard } from './RelicCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export function RelicInventory() {
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()

  useEffect(
    () => database.relics.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const { relicIds, totalRelicsNum } = useMemo(() => {
    const relics = database.relics.values
    const totalRelicsNum = relics.length
    const relicIds = relics.map((r) => r.id)
    return dirtyDatabase && { relicIds, totalRelicsNum }
  }, [database, dirtyDatabase])

  const brPt = useMediaQueryUp()
  const totalShowing =
    relicIds.length !== totalRelicsNum
      ? `${relicIds.length}/${totalRelicsNum}`
      : totalRelicsNum
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    relicIds.length
  )

  const relicsIdsToShow = useMemo(
    () => relicIds.slice(0, numShow),
    [relicIds, numShow]
  )
  const showingTextProps = {
    numShowing: relicsIdsToShow.length,
    totalShowing: totalShowing,
  }

  return (
    <>
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
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {relicsIdsToShow.map((relicId) => (
            <Grid item key={relicId} xs={1}>
              <RelicCard relic={database.relics.get(relicId)!} />
            </Grid>
          ))}
        </Grid>
        {relicIds.length !== relicsIdsToShow.length && (
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
