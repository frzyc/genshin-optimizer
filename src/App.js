import { faDiscord, faPatreon, faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy, Suspense } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import ReactGA from 'react-ga';
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { version } from "../package.json";
import './App.scss';
import './Assets/Image.scss';

const Home = lazy(() => import('./Home/HomeDisplay'))
const ArtifactDisplay = lazy(() => import('./Artifact/ArtifactDisplay'))
const CharacterDisplay = lazy(() => import('./Character/CharacterDisplay'))
const BuildDisplay = lazy(() => import('./Build/BuildDisplay'))
const Planner = lazy(() => import('./Planner/PlannerDisplay'))
const TestDisplay = lazy(() => import('./TestPage/TestDisplay'))
const SettingsDisplay = lazy(() => import('./Settings/SettingsDisplay'))
function App() {
  return (
    <HashRouter>
      <div className="h-100 d-flex flex-column">
        <div id="content" className="flex-grow-1">
          <Navbar bg="dark" variant="dark" expand="md">
            <Navbar.Brand as={Link} to="/">Genshin Optimizer</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link as={Link} to="/artifact">
                  Artifacts</Nav.Link>
                <Nav.Link as={Link} to="/character">Characters</Nav.Link>
                <Nav.Link as={Link} to="/build">Builds</Nav.Link>
                <Nav.Link as={Link} to="/tools">Tools</Nav.Link>
                {process.env.NODE_ENV === "development" && <Nav.Link as={Link} to="/test">TEST</Nav.Link>}
              </Nav>
              <Nav>
                <Nav.Link href={process.env.REACT_APP_PAYPAL_LINK} target="_blank" rel="noreferrer" onClick={() => ReactGA.outboundLink({ label: "patreon" }, () => { })}>
                  <span><FontAwesomeIcon icon={faPaypal} className="fa-fw" /> PayPal</span>
                </Nav.Link>
                <Nav.Link href={process.env.REACT_APP_PATREON_LINK} target="_blank" rel="noreferrer" onClick={() => ReactGA.outboundLink({ label: "patreon" }, () => { })}>
                  <span><FontAwesomeIcon icon={faPatreon} className="fa-fw" /> Patreon</span>
                </Nav.Link>
                <Nav.Link href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer" onClick={() => ReactGA.outboundLink({ label: "discord" }, () => { })}>
                  <span><FontAwesomeIcon icon={faDiscord} className="fa-fw" /> Discord</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/setting"><FontAwesomeIcon icon={faCog} /></Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Suspense fallback={<Container>
            <Card bg="darkcontent" text="lightfont" className="mt-2">
              <Card.Body>
                <h3 className="text-center">Loading... <Spinner animation="border" variant="primary" /></h3>
              </Card.Body>
            </Card></Container>}>
            <Switch>
              <Route path="/artifact" component={ArtifactDisplay} />
              <Route path="/character" component={CharacterDisplay} />
              <Route path="/build" component={BuildDisplay} />
              <Route path="/tools" component={Planner} />
              {process.env.NODE_ENV === "development" && <Route path="/test" component={TestDisplay} />}
              <Route path="/setting" component={SettingsDisplay} />
              <Route path="/" component={Home} />
              {/* <Route exact path="/" component={Home} /> */}
            </Switch>
          </Suspense>
        </div>
        <Nav id="footer" className="bg-dark">
          <Row className="w-100 ml-0 mr-0 mb-2 text-light d-flex justify-content-between">
            <Col xs={"auto"}>
              <span > <small>Genshin Optimizer is not affiliated with or endorsed by miHoYo. </small></span>
            </Col>
            <Col xs={"auto"}>
              <span  ><small > Genshin Optimizer Ver:{version} </small></span>
            </Col>
          </Row>
        </Nav>
      </div>
    </HashRouter>
  );
}

export default App;
