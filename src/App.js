import React from 'react';
import './App.scss';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import ArtifactDisplay from './ArtifactDisplay';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <div id="root">
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand href="/">Genshin Optimizer</Navbar.Brand>
        <Nav navbar>
          <Nav.Link href="/artifact">Artifacts</Nav.Link>
        </Nav>
      </Navbar>
      <Router>
        <Switch>
          <Route path="/artifact">
            <ArtifactDisplay />
          </Route>
          <Route path="/">
            <ArtifactDisplay />
          </Route>
        </Switch>

      </Router>

    </div>
  );
}

export default App;
