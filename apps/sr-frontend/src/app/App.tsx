import { ScrollTop } from '@genshin-optimizer/common/ui'
import {
  CalcProvider,
  CharacterProvider,
  DatabaseProvider,
} from '@genshin-optimizer/sr/ui'
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
import { theme } from './Theme'

const PageRelics = lazy(() => import('@genshin-optimizer/sr/page-relics'))
const PageLightCones = lazy(
  () => import('@genshin-optimizer/sr/page-lightcones')
)
const PageCharacters = lazy(
  () => import('@genshin-optimizer/sr/page-characters')
)
const PageTeams = lazy(() => import('@genshin-optimizer/sr/page-teams'))

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <DatabaseProvider>
          <CharacterProvider>
            <CalcProvider>
              <HashRouter basename="/">
                <Content />
                <ScrollTop />
              </HashRouter>
            </CalcProvider>
          </CharacterProvider>
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
            <Route path="/teams" element={<PageTeams />} />
          </Routes>
        </Suspense>
      </Container>
    </Box>
  )
}
