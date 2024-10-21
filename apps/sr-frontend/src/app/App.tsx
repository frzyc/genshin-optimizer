import { ScrollTop } from '@genshin-optimizer/common/ui'
import '@genshin-optimizer/sr/i18n' // import to load translations
import { theme } from '@genshin-optimizer/sr/theme'
import { DatabaseProvider } from '@genshin-optimizer/sr/ui'
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
import Header from './Header'
import PageHome from './PageHome'

const PageRelics = lazy(() => import('@genshin-optimizer/sr/page-relics'))
const PageLightCones = lazy(
  () => import('@genshin-optimizer/sr/page-lightcones')
)
const PageCharacters = lazy(
  () => import('@genshin-optimizer/sr/page-characters')
)
const PageTeams = lazy(() => import('@genshin-optimizer/sr/page-teams'))
const PageTeam = lazy(() => import('@genshin-optimizer/sr/page-team'))
const PageCombos = lazy(() => import('@genshin-optimizer/sr/page-combos'))
const PageCombo = lazy(() => import('@genshin-optimizer/sr/page-combo'))
const PageSettings = lazy(() => import('@genshin-optimizer/sr/page-settings'))

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
            <Route path="/combos/*">
              <Route index element={<PageCombos />} />
              <Route path=":teamId/*" element={<PageCombo />} />
            </Route>
            <Route path="/settings" element={<PageSettings />} />
          </Routes>
        </Suspense>
      </Container>
    </Box>
  )
}
