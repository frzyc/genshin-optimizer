import { KeyboardArrowUp } from '@mui/icons-material';
import { Box, Container, CssBaseline, Fab, Grid, Skeleton, StyledEngineProvider, ThemeProvider, useScrollTrigger, Zoom } from '@mui/material';
import React, { lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, Route, Routes, useMatch } from "react-router-dom";
import './App.scss';
import './Database/Database';
import { ArtCharDatabase, DatabaseContext } from './Database/Database';
import { DBLocalStorage } from './Database/DBStorage';
import Footer from './Footer';
import Header from './Header';
import './i18n';
import './index.css';
import useTitle from './ReactHooks/useTitle';
import { theme } from './Theme';

const PageHome = lazy(() => import('./PageHome'))
const PageArtifact = lazy(() => import('./PageArtifact'))
const PageTools = lazy(() => import('./PageTools'))
const PageSettings = lazy(() => import('./PageSettings'))
const PageWeapon = lazy(() => import('./PageWeapon'))
const PageDocumentation = lazy(() => import('./PageDocumentation'))
const PageScanner = lazy(() => import('./PageScanner'))
const PageCharacter = lazy(() => import('./PageCharacter'))
const CharacterDisplay = lazy(() => import('./PageCharacter/CharacterDisplay'))

function ScrollTop({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

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
  );
}

function App() {
  const [database, setDatabase] = useState(() => new ArtCharDatabase(new DBLocalStorage(localStorage)))
  const dbContextObj = useMemo(() => ({ database, setDatabase }), [database, setDatabase])
  return <StyledEngineProvider injectFirst>{/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DatabaseContext.Provider value={dbContextObj}>
        <HashRouter basename="/">
          <Suspense fallback={null}>
            <MatchTitle />
          </Suspense>
          <Content />
          <ScrollTop >
            <Fab color="secondary" size="small" aria-label="scroll back to top">
              <KeyboardArrowUp />
            </Fab>
          </ScrollTop>
        </HashRouter>
      </DatabaseContext.Provider>
    </ThemeProvider>
  </StyledEngineProvider>
}
function Content() {
  return <Grid container direction="column" minHeight="100vh">
    <Grid item >
      <Header anchor="back-to-top-anchor" />
    </Grid>
    <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
      <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />}>
        <Routes>
          <Route index element={<PageHome />} />
          <Route path="/artifacts" element={<PageArtifact />} />
          <Route path="/weapons" element={<PageWeapon />} />
          <Route path="/characters/*"  >
            <Route index element={<PageCharacter />} />
            <Route path=":characterKey/*" element={<CharacterDisplay />} />
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
    <Grid item >
      <Footer />
    </Grid>
  </Grid>
}
function MatchTitle() {
  const { t } = useTranslation("ui")
  let { params: { page = "" } } = useMatch({ path: "/:page" }) ?? { params: { page: "" } }
  useTitle(useMemo(() => page && t(`tabs.${page}`), [page, t]))
  return null
}
export default App;
