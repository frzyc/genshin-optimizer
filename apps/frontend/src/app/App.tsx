import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import { SillyContext, theme, useSilly } from '@genshin-optimizer/gi/ui'
import { KeyboardArrowUp } from '@mui/icons-material'
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
import { useTranslation } from 'react-i18next'
import { HashRouter, Route, Routes, useMatch } from 'react-router-dom'
import './App.scss'
import { SnowContext, useSnow } from './Context/SnowContext'
import ErrorBoundary from './ErrorBoundary'
import Footer from './Footer'
import Header from './Header'
import useTitle from './ReactHooks/useTitle'
import Snow from './Snow'
import './i18n'

const PageHome = lazy(() => import('./PageHome'))
const PageArtifact = lazy(() => import('./PageArtifact'))
const PageTools = lazy(() => import('./PageTools'))
const PageSettings = lazy(() => import('./PageSettings'))
const PageWeapon = lazy(() => import('./PageWeapon'))
const PageDocumentation = lazy(() => import('./PageDocumentation'))
const PageScanner = lazy(() => import('./PageScanner'))
const PageCharacter = lazy(() => import('./PageCharacter'))
const PageTeams = lazy(() => import('./PageTeams'))
const PageTeam = lazy(() => import('./PageTeam'))

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
                  <Suspense fallback={null}>
                    <MatchTitle />
                  </Suspense>
                  <Content />
                  <ScrollTop>
                    <Fab
                      color="secondary"
                      size="small"
                      aria-label="scroll back to top"
                    >
                      <KeyboardArrowUp />
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
  return (
    <Grid container direction="column" minHeight="100vh" position="relative">
      <Grid item>
        <Header anchor="back-to-top-anchor" />
      </Grid>
      <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
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
            <Route path="/artifacts" element={<PageArtifact />} />
            <Route path="/weapons" element={<PageWeapon />} />
            <Route path="/characters/*" element={<PageCharacter />} />
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
function MatchTitle() {
  const { t } = useTranslation('ui')
  const {
    params: { page = '' },
  } = useMatch({ path: '/:page/*' }) ?? { params: { page: '' } }
  useTitle(useMemo(() => page && t(`tabs.${page}`), [page, t]))
  return null
}
export default App
