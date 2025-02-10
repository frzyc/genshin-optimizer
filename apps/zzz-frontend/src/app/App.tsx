import { ScrollTop } from '@genshin-optimizer/common/ui'
import { DatabaseProvider } from '@genshin-optimizer/zzz/db-ui'
import '@genshin-optimizer/zzz/i18n' // import to load translations
import { theme } from '@genshin-optimizer/zzz/theme'
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
import '../styles.scss'
import Header from './Header'
import PageHome from './PageHome'
const PageDiscs = lazy(() => import('@genshin-optimizer/zzz/page-discs'))
const PageOptimize = lazy(() => import('@genshin-optimizer/zzz/page-optimize'))
const PageCharacters = lazy(
  () => import('@genshin-optimizer/zzz/page-characters')
)
const PageWengines = lazy(() => import('@genshin-optimizer/zzz/page-wengines'))
const PageSettings = lazy(() => import('@genshin-optimizer/zzz/page-settings'))

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
            <Route path="/discs" element={<PageDiscs />} />
            <Route path="/optimize" element={<PageOptimize />} />
            <Route path="/characters" element={<PageCharacters />} />
            <Route path="/wengines" element={<PageWengines />} />
            <Route path="/settings" element={<PageSettings />} />
          </Routes>
        </Suspense>
      </Container>
    </Box>
  )
}
