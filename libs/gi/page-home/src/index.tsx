import { Box, Grid, useMediaQuery, useTheme } from '@mui/material'
import ReactGA from 'react-ga4'
import InventoryCard from './InventoryCard'
import QuickLinksCard from './QuickLinksCard'
import ResinCard from './ResinCard'
import VidGuideCard from './VidGuideCard'

export default function PageHome() {
  const theme = useTheme()
  const lg = useMediaQuery(theme.breakpoints.up('lg'))
  ReactGA.send({ hitType: 'pageview', page: '/home' })
  if (lg)
    return (
      <Grid container spacing={2} direction={'row-reverse'}>
        <Grid
          item
          xs={12}
          lg={5}
          xl={4}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <QuickLinksCard />
          <ResinCard />
        </Grid>
        <Grid
          item
          xs={12}
          lg={7}
          xl={8}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <InventoryCard />
          <VidGuideCard />
        </Grid>
      </Grid>
    )
  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <QuickLinksCard />
      <InventoryCard />
      <ResinCard />
      <VidGuideCard />
    </Box>
  )
}
