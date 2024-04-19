import { ScrollTop } from '@genshin-optimizer/common/ui'
import {
  CalcProvider,
  CharacterProvider,
  DatabaseProvider,
  LightConeEditor,
  LightConeInventory,
  RelicEditor,
} from '@genshin-optimizer/sr/ui'
import {
  Box,
  Container,
  CssBaseline,
  Skeleton,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import { Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Character from './Character'
import CharacterSelector from './CharacterSelector'
import Database from './Database'
import Header from './Header'
import Optimize from './Optimize'
import PageHome from './PageHome'
import { theme } from './Theme'

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DatabaseProvider>
          <CharacterProvider>
            <CalcProvider>
              <CssBaseline />
              <Stack gap={1} pt={1}>
                <CharacterSelector />
                <Character />
                <LightConeEditor />
                <LightConeInventory />
                <RelicEditor />
                <Optimize />
                <Database />
              </Stack>
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
          </Routes>
        </Suspense>
      </Container>
    </Box>
  )
}
