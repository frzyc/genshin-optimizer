import { faDiscord, faPatreon, faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy, Suspense } from 'react';
import { Container } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import ReactGA from 'react-ga';
import { Trans, useTranslation } from 'react-i18next';
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { version } from "../package.json";
import './App.scss';
import './Assets/Image.scss';
import LoadingCard from './Components/LoadingCard';
import { DatabaseInitAndVerify } from './Database/DatabaseUtil';
import './i18n';
import { LanguageDropdown } from './Settings/SettingsDisplay';

const Home = lazy(() => import('./Home/HomeDisplay'))
const ArtifactDisplay = lazy(() => import('./Artifact/ArtifactDisplay'))
const CharacterDisplay = lazy(() => import('./Character/CharacterDisplay'))
const BuildDisplay = lazy(() => import('./Build/BuildDisplay'))
const Planner = lazy(() => import('./Planner/PlannerDisplay'))
const TestDisplay = lazy(() => import('./TestPage/TestDisplay'))
const FlexDisplay = lazy(() => import('./FlexPage/FlexDisplay'))
const SettingsDisplay = lazy(() => import('./Settings/SettingsDisplay'))
DatabaseInitAndVerify()
function App() {
  return <Suspense fallback={<Container><LoadingCard /></Container>}>
    <AppInner />
  </Suspense>
}
function AppInner() {
  const { t } = useTranslation("ui")
  return <HashRouter>
    <div className="h-100 d-flex flex-column" id="mainContainer">
      <div id="content" className="flex-grow-1">
        <Navbar bg="dark" variant="dark" expand="md">
          <Navbar.Brand as={Link} to="/"><Trans t={t} i18nKey="pageTitle">Genshin Optimizer</Trans></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/artifact"><Trans t={t} i18nKey="ui:tabs.artifacts">Artifacts</Trans></Nav.Link>
              <Nav.Link as={Link} to="/character"><Trans t={t} i18nKey="ui:tabs.characters">Character</Trans></Nav.Link>
              <Nav.Link as={Link} to="/build"><Trans t={t} i18nKey="ui:tabs.builds">Builds</Trans></Nav.Link>
              <Nav.Link as={Link} to="/tools"><Trans t={t} i18nKey="ui:tabs.tools">Tools</Trans></Nav.Link>
              {process.env.NODE_ENV === "development" && <Nav.Link as={Link} to="/test">TEST</Nav.Link>}
            </Nav>
            <Nav>
              {process.env.NODE_ENV === "development" && <LanguageDropdown />}
              <Nav.Link href={process.env.REACT_APP_PAYPAL_LINK} target="_blank" rel="noreferrer" onClick={() => ReactGA.outboundLink({ label: "patreon" }, () => { })}>
                <span><FontAwesomeIcon icon={faPaypal} className="fa-fw" /> <Trans t={t} i18nKey="ui:social.paypal">PayPal</Trans></span>
              </Nav.Link>
              <Nav.Link href={process.env.REACT_APP_PATREON_LINK} target="_blank" rel="noreferrer" onClick={() => ReactGA.outboundLink({ label: "patreon" }, () => { })}>
                <span><FontAwesomeIcon icon={faPatreon} className="fa-fw" /> <Trans t={t} i18nKey="ui:social.patreon">Patreon</Trans></span>
              </Nav.Link>
              <Nav.Link href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer" onClick={() => ReactGA.outboundLink({ label: "discord" }, () => { })}>
                <span><FontAwesomeIcon icon={faDiscord} className="fa-fw" /> <Trans t={t} i18nKey="ui:social.discord">Discord</Trans></span>
              </Nav.Link>
              <Nav.Link as={Link} to="/setting"><FontAwesomeIcon icon={faCog} /></Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Suspense fallback={<Container><LoadingCard /></Container>}>
          <Switch>
            <Route path="/artifact" component={ArtifactDisplay} />
            <Route path="/character" component={CharacterDisplay} />
            <Route path="/build" component={BuildDisplay} />
            <Route path="/tools" component={Planner} />
            {process.env.NODE_ENV === "development" && <Route path="/test" component={TestDisplay} />}
            <Route path="/setting" component={SettingsDisplay} />
            <Route path="/flex" component={FlexDisplay} />
            <Route path="/" component={Home} />
          </Switch>
        </Suspense>
      </div>
      <Nav id="footer" className="bg-dark">
        <Row className="w-100 ml-0 mr-0 mb-2 text-light d-flex justify-content-between">
          <Col xs={"auto"}>
            <span><small><Trans t={t} i18nKey="ui:rightsDisclaimer">Genshin Optimizer is not affiliated with or endorsed by miHoYo.</Trans></small></span>
          </Col>
          <Col xs={"auto"}>
            <span><small ><Trans t={t} i18nKey="ui:appVersion" values={{ version: version }}>Genshin Optimizer Version: {{ version }}</Trans></small></span>
          </Col>
        </Row>
      </Nav>
    </div>
  </HashRouter>
}
export default App;
