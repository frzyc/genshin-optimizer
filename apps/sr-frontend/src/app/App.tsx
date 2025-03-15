import { ScrollTop } from '@genshin-optimizer/common/ui'
import { isDev } from '@genshin-optimizer/common/util'
import { setDebugMode } from '@genshin-optimizer/pando/engine'
import { DatabaseProvider } from '@genshin-optimizer/sr/db-ui'
import '@genshin-optimizer/sr/i18n' // import to load translations
import { theme } from '@genshin-optimizer/sr/theme'
import {
  Box,
  Container,
  CssBaseline,
  Skeleton,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import { Suspense, lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import PageHome from './PageHome'

const PageRelics = lazy(() => import('@genshin-optimizer/sr/page-relics'))
const PageLightCones = lazy(
  () => import('@genshin-optimizer/sr/page-lightcones'),
)
const PageCharacters = lazy(
  () => import('@genshin-optimizer/sr/page-characters'),
)
const PageTeams = lazy(() => import('@genshin-optimizer/sr/page-teams'))
const PageTeam = lazy(() => import('@genshin-optimizer/sr/page-team'))
const PageSettings = lazy(() => import('@genshin-optimizer/sr/page-settings'))

const PageOptimize = lazy(() => import('@genshin-optimizer/sr/page-optimize'))

// Enable debug mode for Pando calcs
setDebugMode(isDev)

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <DatabaseProvider>
          <HashRouter basename="/">
            <Content />
            <ScrollTop />
          </HashRouter>
        </DatabaseProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

function Content() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      position="relative"
    >
      <Header anchor="back-to-top-anchor" />

      <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1 } }}>
        <Suspense
          fallback={
            <Skeleton
              variant="rectangular"
              sx={{ width: '100%', height: '100%' }}
            />
          }
        >
          <Routes>
            <Route index element={<PageHome />} />
            <Route path="/relics" element={<PageRelics />} />
            <Route path="/lightcones" element={<PageLightCones />} />
            <Route path="/characters" element={<PageCharacters />} />
            <Route path="/teams/*">
              <Route index element={<PageTeams />} />
              <Route path=":teamId/*" element={<PageTeam />} />
            </Route>
            <Route path="/settings" element={<PageSettings />} />
            <Route path="/optimize" element={<PageOptimize />} />
          </Routes>
        </Suspense>
      </Container>
      {/* make sure footer is always at bottom */}
      <Box flexGrow={1} />
      <Footer />
    </Box>
  )
}
