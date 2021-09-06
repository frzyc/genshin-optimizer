import { Badge, Card, Col, Container, Image, Nav, Row } from "react-bootstrap"
import ReactGA from 'react-ga'

import { Trans, useTranslation } from 'react-i18next';
import { HashRouter, Link, Route, Switch } from "react-router-dom";

export default function HomeDisplay(props: any) {
  const { t } = useTranslation("documentation")
  ReactGA.pageview('/doc')
  return <Container className="my-2">
    <HashRouter>
      <Card bg="darkcontent" text={"lightfont" as any}>
        <Card.Header>
          <Row>
            <Col><h4 className="mb-0">Documentataion</h4>
            </Col>
            <Col xs="auto">
              <h4 className="mb-0"><Badge variant="info">Version. 1</Badge></h4>
            </Col>
          </Row>

        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Card bg="lightcontent" text={"lightfont" as any} className="h-100">
                <Card.Body>
                  <Nav defaultActiveKey="/" className="flex-column">
                    <Nav.Link as={Link} to="/doc/">Overview</Nav.Link>
                    <Nav.Link as={Link} to="/doc/IArtifact"><code>IArtifact</code></Nav.Link>
                    <Nav.Link as={Link} to="/doc/statKey"><code>statKey</code></Nav.Link>
                    <Nav.Link as={Link} to="/doc/ArtifactSetKey"><code>ArtifactSetKey</code></Nav.Link>
                    <Nav.Link as={Link} to="/doc/ICharacter"><code>ICharacter</code></Nav.Link>
                    <Nav.Link as={Link} to="/doc/CharacterKey"><code>CharacterKey</code></Nav.Link>
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
            <Col md={9}>
              <Card bg="lightcontent" text={"lightfont" as any} className="h-100">
                <Card.Body>
                  <Switch>
                    <Route path="/" component={Overview} />
                    {/* 
                  <Route path="/weapon" component={WeaponDisplay} />
                  <Route path="/character" component={CharacterDisplay} />
                  <Route path="/build" component={BuildDisplay} />
                  <Route path="/tools" component={Planner} />
                  {process.env.NODE_ENV === "development" && <Route path="/test" component={TestDisplay} />}
                  <Route path="/database" component={SettingsDisplay} />
                  <Route path="/doc" component={DocumentationDisplay} />
                  <Route path="/flex" component={FlexDisplay} />
                  <Route path="/" component={Home} /> */}
                  </Switch>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Card.Body>
      </Card>
    </HashRouter>
  </Container >
}

const goodCode = `Interface IGOOD {
  format: "GOOD" //A way for people to recognize this format.
  version: number //API version.
  source: string //the app that generates this data.
  characters: ICharacter[]
  artifacts: IArtifact[]
  weapons: IWeapon[]
}`

const artifactCode = `Interface IArtifact {
  setKey: SetKey //e.g. "GladiatorsFinale"
  slotKey: SlotKey //e.g. "plume"
  level: number //0-20 inclusive
  rarity: number //3-5 inclusive
  mainStatKey: StatKey
  location: CharacterKey|"" //where "" means not equipped.
  lock: boolean //Whether the artifact is locked in game.
  substats: ISubstat[]
}
  
interface ISubstat {
  key: StatKey //e.g. "critDMG_"
  value: number //e.g. 19.4
}`

function Overview() {
  return <>
    <h4>Genshin Open Object Description (GOOD)</h4>
    <div className="mb-2">
      <p><strong>GOOD</strong> is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion.</p>
      <Card bg="darkcontent" text={"lightfont" as any}>
        <Card.Body>
          <CodeBlock text={goodCode} />

        </Card.Body>
      </Card>
    </div>
    <h4>Artifact data representation</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={artifactCode} />
      </Card.Body>
    </Card>
  </>
}
function CodeBlock({ text }) {
  const lines = text.split(/\r\n|\r|\n/).length+1
  const lineNums = Array.from(Array(lines).keys()).map(i => i + 1).join('\n')
  console.log(lineNums);

  return <div className="d-flex flex-row">
    <textarea className="code text-secondary" disabled={true} spellCheck="false" aria-label='Code Sample' rows={lines} style={{ width: "2em", overflow: "hidden", userSelect: "none" }} value={lineNums} unselectable="off"/>
    <textarea className="code w-100 text-info flex-grow-1 " disabled={true} spellCheck="false" aria-label='Code Sample' rows={lines}>
      {text}
    </textarea>
  </div>

}