import { ScrollTop, useTitle } from '@genshin-optimizer/common/ui'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import '@genshin-optimizer/gi/i18n' // import to load translations
import {
  SillyContext,
  SnowContext,
  useSilly,
  useSnow,
} from '@genshin-optimizer/gi/ui'
import {
  Box,
  Container,
  CssBaseline,
  Skeleton,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import type { ComponentType } from 'react'
import { lazy, Suspense, useCallback, useMemo } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.scss'
import { useDatabases } from '@genshin-optimizer/common/database-ui'
import { theme } from '../theme/celestia'
import ErrorBoundary from './ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import Snow from './Snow'

const PageHome = lazy(
  () =>
    import('@genshin-optimizer/gi/page-home') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageArtifacts = lazy(
  () =>
    import('@genshin-optimizer/gi/page-artifacts') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageTools = lazy(
  () =>
    import('@genshin-optimizer/gi/page-tools') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageSettings = lazy(
  () =>
    import('@genshin-optimizer/gi/page-settings') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageWeapons = lazy(
  () =>
    import('@genshin-optimizer/gi/page-weapons') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageArchive = lazy(
  () =>
    import('@genshin-optimizer/gi/page-archive') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageDocumentation = lazy(
  () =>
    import('@genshin-optimizer/gi/page-doc') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageScanner = lazy(
  () =>
    import('@genshin-optimizer/gi/page-scanner') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageCharacters = lazy(
  () =>
    import('@genshin-optimizer/gi/page-characters') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageTeams = lazy(
  () =>
    import('@genshin-optimizer/gi/page-teams') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageTeam = lazy(
  () =>
    import('@genshin-optimizer/gi/page-team') as unknown as Promise<{
      default: ComponentType<any>
    }>
)

function App() {
  const dbIndex = Number.parseInt(localStorage.getItem('dbIndex') || '1')
  const [databases, setDatabases] = useDatabases(
    ArtCharDatabase,
    dbIndex,
    'GONewTabDetection'
  )
  const setDatabase = useCallback(
    (index: number, db: ArtCharDatabase) => {
      const dbs = [...databases]
      dbs[index] = db
      setDatabases(dbs)
    },
    [databases, setDatabases]
  )

  const database = databases[dbIndex - 1]
  const dbContextObj = useMemo(
    () => ({ databases, setDatabases, database, setDatabase }),
    [databases, setDatabases, database, setDatabase]
  )
  const SillyContextObj = useSilly()
  const SnowContextObj = useSnow()
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <SillyContext.Provider value={SillyContextObj}>
          <SnowContext.Provider value={SnowContextObj}>
            <DatabaseContext.Provider value={dbContextObj}>
              <ErrorBoundary>
                <HashRouter basename="/">
                  <Content />
                  <ScrollTop />
                </HashRouter>
              </ErrorBoundary>
            </DatabaseContext.Provider>
          </SnowContext.Provider>
        </SillyContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
function Content() {
  useTitle()
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      position="relative"
      sx={{ bgcolor: 'background.default' }}
    >
      <Header anchor="back-to-top-anchor" />
      {/* Main content */}
      <Box display="flex" justifyContent="center" alignItems="flex-start">
        {/* Content */}
        <Container
          maxWidth="xl"
          sx={{ px: { xs: 0.5, sm: 1 }, flexGrow: 1, mx: 0 }}
        >
          <Suspense
            fallback={
              <Skeleton
                variant="rectangular"
                sx={{ width: '100%', height: 1000 }}
              />
            }
          >
            <Routes>
              <Route index element={<PageHome />} />
              <Route path="/artifacts" element={<PageArtifacts />} />
              <Route path="/weapons" element={<PageWeapons />} />
              <Route path="/characters/*" element={<PageCharacters />} />
              <Route path="/teams/*">
                <Route index element={<PageTeams />} />
                <Route path=":teamId/*" element={<PageTeam />} />
              </Route>
              <Route path="/archive/*" element={<PageArchive />} />
              <Route path="/tools" element={<PageTools />} />
              <Route path="/setting" element={<PageSettings />} />
              <Route path="/doc/*" element={<PageDocumentation />} />
              <Route path="/scanner" element={<PageScanner />} />
            </Routes>
          </Suspense>
        </Container>
      </Box>

      {/* make sure footer is always at bottom */}
      <Box flexGrow={1} />
      <Snow />
      <Footer />
    </Box>
  )
}
export default App
