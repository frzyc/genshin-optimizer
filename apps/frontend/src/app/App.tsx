import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import '@genshin-optimizer/gi/i18n' // import to load translations
import { theme } from '@genshin-optimizer/gi/theme'
import {
  SnowContext,
  useSilly,
  useSnow,
  useTitle,
} from '@genshin-optimizer/gi/ui'
import { SillyContext } from '@genshin-optimizer/gi/uidata'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  Container,
  CssBaseline,
  Fab,
  Grid,
  Skeleton,
  StyledEngineProvider,
  ThemeProvider,
  Zoom,
  useScrollTrigger,
} from '@mui/material'
import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.scss'
import ErrorBoundary from './ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import Snow from './Snow'

const PageHome = lazy(() => import('@genshin-optimizer/gi/page-home'))
const PageArtifacts = lazy(() => import('@genshin-optimizer/gi/page-artifacts'))
const PageTools = lazy(() => import('@genshin-optimizer/gi/page-tools'))
const PageSettings = lazy(() => import('@genshin-optimizer/gi/page-settings'))
const PageWeapons = lazy(() => import('@genshin-optimizer/gi/page-weapons'))
const PageDocumentation = lazy(() => import('@genshin-optimizer/gi/page-doc'))
const PageScanner = lazy(() => import('@genshin-optimizer/gi/page-scanner'))
const PageCharacters = lazy(
  () => import('@genshin-optimizer/gi/page-characters')
)
const PageTeams = lazy(() => import('@genshin-optimizer/gi/page-teams'))
const PageTeam = lazy(() => import('@genshin-optimizer/gi/page-team'))

function ScrollTop({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor')

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 85, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  )
}

function App() {
  const dbIndex = parseInt(localStorage.getItem('dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('GONewTabDetection')
    localStorage.setItem('GONewTabDetection', 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        return new ArtCharDatabase(index, new DBLocalStorage(localStorage))
      } else {
        const dbName = `extraDatabase_${index}`
        const eDB = localStorage.getItem(dbName)
        const dbObj = eDB ? JSON.parse(eDB) : {}
        const db = new ArtCharDatabase(index, new SandboxStorage(dbObj))
        db.toExtraLocalDB()
        return db
      }
    })
  })
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
        <CssBaseline />
        <SillyContext.Provider value={SillyContextObj}>
          <SnowContext.Provider value={SnowContextObj}>
            <DatabaseContext.Provider value={dbContextObj}>
              <ErrorBoundary>
                <HashRouter basename="/">
                  <Content />
                  <ScrollTop>
                    <Fab
                      color="secondary"
                      size="small"
                      aria-label="scroll back to top"
                    >
                      <KeyboardArrowUpIcon />
                    </Fab>
                  </ScrollTop>
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
    <Grid container direction="column" minHeight="100vh" position="relative">
      <Grid item>
        <Header anchor="back-to-top-anchor" />
      </Grid>
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
            <Route path="/artifacts" element={<PageArtifacts />} />
            <Route path="/weapons" element={<PageWeapons />} />
            <Route path="/characters/*" element={<PageCharacters />} />
            <Route path="/teams/*">
              <Route index element={<PageTeams />} />
              <Route path=":teamId/*" element={<PageTeam />} />
            </Route>
            <Route path="/tools" element={<PageTools />} />
            <Route path="/setting" element={<PageSettings />} />
            <Route path="/doc/*" element={<PageDocumentation />} />
            <Route path="/scanner" element={<PageScanner />} />
          </Routes>
        </Suspense>
      </Container>
      {/* make sure footer is always at bottom */}
      <Grid item flexGrow={1} />
      <Snow />
      <Grid item>
        <Footer />
      </Grid>
    </Grid>
  )
}
export default App
