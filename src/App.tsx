import { faDiscord, faPatreon, faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faBook, faCalculator, faCog, faGavel, faIdCard, faTools } from '@fortawesome/free-solid-svg-icons';
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
import { artifactSlotIcon } from './Artifact/Component/SlotNameWIthIcon';
import './Assets/Image.scss';
import LoadingCard from './Components/LoadingCard';
import './Database/Database';
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
const WeaponDisplay = lazy(() => import('./Weapon/WeaponDisplay'))
const DocumentationDisplay = lazy(() => import('./DocumentationPage/DocumentationDisplay'))

function App() {
  return <Suspense fallback={<Container><LoadingCard /></Container>}>
    <AppInner />
  </Suspense>
}
function AppInner() {
  const { t } = useTranslation("ui")
  return <HashRouter basename="/">
    <div className="h-100 d-flex flex-column" id="mainContainer">
      <div id="content" className="flex-grow-1">
        <Navbar bg="dark" variant="dark" expand="md">
          <Navbar.Brand as={Link} to="/"><Trans t={t} i18nKey="pageTitle">Genshin Optimizer</Trans></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/artifact">{artifactSlotIcon("flower")} <Trans t={t} i18nKey="ui:tabs.artifacts">Artifacts</Trans></Nav.Link>
              <Nav.Link as={Link} to="/weapon"><FontAwesomeIcon icon={faGavel} className="fa-fw" /> <Trans t={t} i18nKey="ui:tabs.weapons">Weapons</Trans></Nav.Link>
              <Nav.Link as={Link} to="/character"><FontAwesomeIcon icon={faIdCard} className="fa-fw" /> <Trans t={t} i18nKey="ui:tabs.characters">Character</Trans></Nav.Link>
              <Nav.Link as={Link} to="/build"><FontAwesomeIcon icon={faCalculator} className="fa-fw" /> <Trans t={t} i18nKey="ui:tabs.builds">Builds</Trans></Nav.Link>
              <Nav.Link as={Link} to="/tools"><FontAwesomeIcon icon={faTools} className="fa-fw" /> <Trans t={t} i18nKey="ui:tabs.tools">Tools</Trans></Nav.Link>
              <Nav.Link as={Link} to="/database"><FontAwesomeIcon icon={faCog} /> <Trans t={t} i18nKey="ui:tabs.database">Database</Trans></Nav.Link>
              <Nav.Link as={Link} to="/doc"><FontAwesomeIcon icon={faBook} /> <Trans t={t} i18nKey="ui:tabs.doc">Documentation</Trans></Nav.Link>
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
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Suspense fallback={<Container><LoadingCard /></Container>}>
          <Switch>
            <Route path="/artifact" component={ArtifactDisplay} />
            <Route path="/weapon" component={WeaponDisplay} />
            <Route path="/character" component={CharacterDisplay} />
            <Route path="/build" component={BuildDisplay} />
            <Route path="/tools" component={Planner} />
            {process.env.NODE_ENV === "development" && <Route path="/test" component={TestDisplay} />}
            <Route path="/database" component={SettingsDisplay} />
            <Route path="/doc" component={DocumentationDisplay} />
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
