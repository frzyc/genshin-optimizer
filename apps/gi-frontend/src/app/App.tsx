import { useDatabases } from '@genshin-optimizer/common/database-ui'
import { ScrollTop, useTitle } from '@genshin-optimizer/common/ui'
import { isDev } from '@genshin-optimizer/common/util'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import '@genshin-optimizer/gi/i18n'
import { theme } from '@genshin-optimizer/gi/theme'
import { SillyContext, useSilly } from '@genshin-optimizer/gi/ui'
import { setDebugMode } from '@genshin-optimizer/pando/engine'
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
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.scss'
import Footer from './Footer'
import Header from './Header'

const PageOptimize = lazy(
  () =>
    import('@genshin-optimizer/gi/pando-page-optimize') as unknown as Promise<{
      default: ComponentType<any>
    }>
)
const PageSettings = lazy(
  () =>
    import('@genshin-optimizer/gi/pando-page-settings') as unknown as Promise<{
      default: ComponentType<any>
    }>
)

setDebugMode(isDev)

export default function App() {
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
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <SillyContext.Provider value={SillyContextObj}>
          <DatabaseContext.Provider value={dbContextObj}>
            <HashRouter basename="/">
              <Content />
              <ScrollTop />
            </HashRouter>
          </DatabaseContext.Provider>
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
            <Route index element={<Navigate to="/optimize" replace />} />
            <Route path="/optimize" element={<PageOptimize />} />
            <Route path="/settings" element={<PageSettings />} />
          </Routes>
        </Suspense>
      </Container>
      <Box flexGrow={1} />
      <Footer />
    </Box>
  )
}
