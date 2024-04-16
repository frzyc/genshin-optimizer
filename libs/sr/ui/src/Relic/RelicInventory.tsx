import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import { CardThemed, useInfScroll } from '@genshin-optimizer/common/ui'
import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useMemo } from 'react'
import { useDatabaseContext } from '../Context'
import { RelicCard } from './RelicCard'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
const numToShowMap = { xs: 10, sm: 12, md: 24, lg: 24, xl: 24 }

export function RelicInventory() {
  const { database } = useDatabaseContext()

  const { relicsIds, totalRelicsNum } = useMemo(() => {
    const relicsIds = database.relics.keys
    const totalRelicsNum = relicsIds.length
    return { relicsIds, totalRelicsNum }
  }, [database])

  const brPt = useMediaQueryUp()
  const totalShowing =
    relicsIds.length !== totalRelicsNum
      ? `${relicsIds.length}/${totalRelicsNum}`
      : totalRelicsNum
  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    relicsIds.length
  )

  const relicsIdsToShow = useMemo(
    () => relicsIds.slice(0, numShow),
    [relicsIds, numShow]
  )
  const showingTextProps = {
    numShowing: relicsIdsToShow.length,
    totalShowing: totalShowing,
  }

  return (
    <Container>
      <CardThemed bgt='dark'>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            Relics
          </AccordionSummary>
          <AccordionDetails>
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
                {relicsIdsToShow.length > 0 && (
                  <Typography color="text.secondary">
                    Showing <b>{showingTextProps.numShowing}</b> out of{' '}
                    {showingTextProps.totalShowing} Items
                  </Typography>
                )}
              </Box>
              <Box my={1} display="flex" flexDirection="column" gap={1}>
                <Grid container spacing={1} columns={columns}>
                  {relicsIdsToShow.map((relicId) => (
                    <Grid item key={relicId} xs={1}>
                      <RelicCard relic={database.relics.get(relicId)!} />
                    </Grid>
                  ))}
                </Grid>
                {relicsIds.length !== relicsIdsToShow.length && (
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
          </AccordionDetails>
        </Accordion>
      </CardThemed>
    </Container>
  )
}
