import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import { useInfScroll } from '@genshin-optimizer/common/ui'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import { LightConeCard } from './LightConeCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export function LightConeInventory() {
  const { database } = useDatabaseContext()
  const { lightConeIds, totalLightConeNum } = useMemo(() => {
    const lightCones = database.lightCones.values
    const totalLightConeNum = lightCones.length
    const lightConeIds = database.lightCones.keys
    return { lightConeIds, totalLightConeNum }
  }, [database])

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
          {lightConeIdsToShow.map((lightConeId) => (
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
  )
}
