import { KeyboardArrowUp } from '@mui/icons-material';
import { Box, Container, Fab, Grid, Skeleton, useScrollTrigger, Zoom } from '@mui/material';
import React, { lazy, Suspense } from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
import './App.scss';
import './Database/Database';
import Footer from './Footer';
import { GlobalSettingsContext, useGlobalSettings } from './GlobalSettings';
import Header from './Header';
import './i18n';

const Home = lazy(() => import('./PageHome/HomeDisplay'))
const ArtifactDisplay = lazy(() => import('./Artifact/ArtifactDisplay'))
const CharacterDisplay = lazy(() => import('./Character/CharacterDisplay'))
const BuildDisplay = lazy(() => import('./Build/BuildDisplay'))
const ToolsDisplay = lazy(() => import('./Tools/ToolsDisplay'))
const TestDisplay = lazy(() => import('./TestPage/TestDisplay'))
const FlexDisplay = lazy(() => import('./FlexPage/FlexDisplay'))
const SettingsDisplay = lazy(() => import('./Settings/SettingsDisplay'))
const WeaponDisplay = lazy(() => import('./Weapon/WeaponDisplay'))
const DocumentationDisplay = lazy(() => import('./DocumentationPage/DocumentationDisplay'))
const ScannerDisplay = lazy(() => import('./ScannerPage/ScannerDisplay'))

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
  const [globalSettings, globalSettingsDispatch] = useGlobalSettings()
  return <HashRouter basename="/">
    <GlobalSettingsContext.Provider value={{ globalSettings, globalSettingsDispatch }}>
      <Grid container direction="column" minHeight="100vh">
        <Grid item >
          <Header anchor="back-to-top-anchor" />
        </Grid>
        <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
          <Suspense fallback={<Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />}>
            <Switch>
              <Route path="/artifact" component={ArtifactDisplay} />
              <Route path="/weapon" component={WeaponDisplay} />
              <Route path="/character" component={CharacterDisplay} />
              <Route path="/build" component={BuildDisplay} />
              <Route path="/tools" component={ToolsDisplay} />
              {process.env.NODE_ENV === "development" && <Route path="/test" component={TestDisplay} />}
              <Route path="/database" component={SettingsDisplay} />
              <Route path="/doc" component={DocumentationDisplay} />
              <Route path="/flex" component={FlexDisplay} />
              <Route path="/scanner" component={ScannerDisplay} />
              <Route path="/" component={Home} />
            </Switch>
          </Suspense>
        </Container>
        {/* make sure footer is always at bottom */}
        <Grid item flexGrow={1} />
        <Grid item >
          <Footer />
        </Grid>
      </Grid>
      <ScrollTop >
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </GlobalSettingsContext.Provider>
  </HashRouter>
}
export default App;
