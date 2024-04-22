import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import { useInfScroll } from '@genshin-optimizer/common/ui'
import { Box, Container, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useEffect, useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import { LightConeCard } from './LightConeCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export function LightConeInventory() {
  const { database } = useDatabaseContext()
  const [dirtyDatabase, setDirtyDatabase] = useForceUpdate()

  useEffect(
    () => database.lightCones.followAny(setDirtyDatabase),
    [database, setDirtyDatabase]
  )

  const { lightConeIds, totalLightConeNum } = useMemo(() => {
    const lightCones = database.lightCones.values
    const totalLightConeNum = lightCones.length
    const lightConeIds = database.lightCones.keys
    return dirtyDatabase && { lightConeIds, totalLightConeNum }
  }, [database, dirtyDatabase])

  const brPt = useMediaQueryUp()

  const totalShowing =
    lightConeIds.length !== totalLightConeNum
      ? `${lightConeIds.length}/${totalLightConeNum}`
      : `${totalLightConeNum}`

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    lightConeIds.length
  )
  const lightConeIdsToShow = useMemo(
    () => lightConeIds.slice(0, numShow),
    [lightConeIds, numShow]
  )

  const showingTextProps = {
    numShowing: lightConeIdsToShow.length,
    total: totalShowing,
  }

  return (
    <Container>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 300 }}
          />
        }
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography color="text.secondary">
            Showing <b>{showingTextProps.numShowing}</b> out of{' '}
            {showingTextProps.total} Items
          </Typography>
        </Box>
        <Box my={1} display="flex" flexDirection="column" gap={1}>
          <Grid container spacing={1} columns={columns}>
            {lightConeIdsToShow
              // extremely basic sort by db string ID/db insert order for now
              // due to hard refresh of page changing db state and shuffling card order
              // will be replaced later with actual sortFilters in follow-up PR
              .sort((lightConeId1, lightConeId2) =>
                lightConeId1.localeCompare(lightConeId2)
              )
              .map((lightConeId) => (
                <Grid item key={lightConeId} xs={1}>
                  <LightConeCard lightConeId={lightConeId} />
                </Grid>
              ))}
          </Grid>

          {lightConeIds.length !== lightConeIdsToShow.length && (
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
        </Box>
      </Suspense>
    </Container>
  )
}
