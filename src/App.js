import React from 'react';
import './App.scss';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import ArtifactDisplay from './Artifact/ArtifactDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import CharacterDisplay from './Character/CharacterDisplay';
import BuildDisplay from './Build/BuildDisplay';

function App() {
  return (
    <div id="root">
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand href="/">Genshin Optimizer</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="/artifact">Artifacts</Nav.Link>
          <Nav.Link href="/character">Characters</Nav.Link>
          {process.env.NODE_ENV === "development" && <Nav.Link href="/build">Builds</Nav.Link>}
        </Nav>
        <Nav><Nav.Link href={process.env.REACT_APP_DISCORD_LINK} target="_blank" ><FontAwesomeIcon icon={faDiscord} />Discord</Nav.Link></Nav>
      </Navbar>

      <Router>
        <Switch>
          <Route path="/artifact">
            <ArtifactDisplay />
          </Route>
          <Route path="/character">
            <CharacterDisplay />
          </Route>
          {process.env.NODE_ENV === "development" && (<Route path="/build">
            <BuildDisplay />
          </Route>)}
          <Route path="/">
            <ArtifactDisplay />
          </Route>
        </Switch>

      </Router>

    </div>
  );
}

export default App;
