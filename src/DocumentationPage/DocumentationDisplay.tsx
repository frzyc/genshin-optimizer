import { Badge, Card, Col, Container, ListGroup, Row, Tab } from "react-bootstrap";
import ReactGA from 'react-ga';
import { useTranslation } from 'react-i18next';
import { HashRouter, Link, matchPath, Route, Switch, useLocation } from "react-router-dom";
import { StatData } from "../StatData";
import { allCharacterKeys, allWeaponKeys } from "../Types/consts";


function MenuItem({ text, path = '' }) {
  const location = useLocation();
  const match = !!matchPath(
    location.pathname,
    { path: `/${path}`, exact: true }
  )

  return <ListGroup.Item action variant={match ? "customdark" : "customlight"} className="text-white" as={Link} to={`/${path}`}>
    {match ? <strong>{text}</strong> : text}
  </ListGroup.Item>
}

export default function HomeDisplay(props: any) {
  // const { t } = useTranslation("documentation")
  ReactGA.pageview('/doc')
  return <Container className="my-2">
    <HashRouter basename="/doc/">
      <Card bg="darkcontent" text={"lightfont" as any}>
        <Card.Header>
          <Row>
            <Col><h4 className="mb-0">Documentation</h4>
            </Col>
            <Col xs="auto">
              <h4 className="mb-0"><Badge variant="info">Version. 1</Badge></h4>
            </Col>
          </Row>

        </Card.Header>
        <Card.Body>
          <Tab.Container>
            <Row>
              <Col md={3}>
                <Card bg="lightcontent" text={"lightfont" as any} className="h-100">
                  <ListGroup className="h-100" variant="flush">
                    <MenuItem text={"Overview"} />
                    <MenuItem text={<code>StatKey</code>} path="StatKey" />
                    <MenuItem text={<code>ArtifactSetKey</code>} path="ArtifactSetKey" />
                    <MenuItem text={<code>CharacterKey</code>} path="CharacterKey" />
                    <MenuItem text={<code>WeaponKey</code>} path="WeaponKey" />
                  </ListGroup>
                </Card>

              </Col>
              <Col md={9}>
                <Card bg="lightcontent" text={"lightfont" as any} className="h-100">
                  <Card.Body>
                    <Switch>
                      <Route path="/WeaponKey" component={WeaponKeyPane} />
                      <Route path="/CharacterKey" component={CharacterKeyPane} />
                      <Route path="/StatKey" component={StatKeyPane} />
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
          </Tab.Container>
        </Card.Body>
      </Card>
    </HashRouter>
  </Container >
}

const goodCode = `interface IGOOD {
  format: "GOOD" //A way for people to recognize this format.
  version: number //API version.
  source: string //the app that generates this data.
  characters: ICachedCharacter[]
  artifacts: ICachedArtifact[]
  weapons: ICachedWeapon[]
}`

const artifactCode = `interface IArtifact {
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
const weaponCode = `interface IWeapon {
  key: WeaponKey //"CrescentPike"
  level: number //1-90 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number //1-5 inclusive
  location: CharacterKey | "" //where "" means not equipped.
}`
const characterCode = `interface ICharacter {
  key: CharacterKey //e.g. "Rosaria"
  level: number //1-90 inclusive
  constellation: number //0-6 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: { //does not include boost from constellations. 1-15 inclusive
    auto: number
    skill: number
    burst: number
  }
}`

function Overview() {
  return <>
    <h4>Genshin Open Object Description (GOOD)</h4>
    <div className="mb-2">
      <p><strong>GOOD</strong> is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion.</p>
      <p>As of version 6.0.0, Genshin Optimizer's database export follows this format.</p>
      <Card bg="darkcontent" text={"lightfont" as any}>
        <Card.Body>
          <CodeBlock text={goodCode} />
        </Card.Body>
      </Card>
    </div>
    <br />
    <h4>Artifact data representation</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={artifactCode} />
      </Card.Body>
    </Card>
    <br />
    <h4>Weapon data representation</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={weaponCode} />
      </Card.Body>
    </Card><br />
    <h4>Character data representation</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={characterCode} />
      </Card.Body>
    </Card>
  </>
}

function StatKeyPane() {
  // const { t } = useTranslation()
  const statKeys = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_"]
  const statKeysCode = `type StatKey\n  = ${statKeys.map(k => `"${k}" //${StatData[k]?.name}${k?.endsWith('_') ? "%" : ""}`).join(`\n  | `)}`
  return <>
    <h4>StatKey</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={statKeysCode} />
      </Card.Body>
    </Card>
  </>
}
function CharacterKeyPane() {
  const { t } = useTranslation()
  const charKeysCode = `type CharacterKey\n  = ${[...new Set(allCharacterKeys)].sort().map(k => `"${k}" //${t(`char_${k}_gen:name`)}`).join(`\n  | `)}`
  return <>
    <h4>statKey</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={charKeysCode} />
      </Card.Body>
    </Card>
  </>
}
function WeaponKeyPane() {
  const { t } = useTranslation()
  const charKeysCode = `type WeaponKey\n  = ${[...new Set(allWeaponKeys)].sort().map(k => `"${k}" //${t(`char_${k}_gen:name`)}`).join(`\n  | `)}`
  return <>
    <h4>statKey</h4>
    <Card bg="darkcontent" text={"lightfont" as any}>
      <Card.Body>
        <CodeBlock text={charKeysCode} />
      </Card.Body>
    </Card>
  </>
}

function CodeBlock({ text }) {
  const lines = text.split(/\r\n|\r|\n/).length + 1
  const lineNums = Array.from(Array(lines).keys()).map(i => i + 1).join('\n')

  return <div className="d-flex flex-row">
    <textarea className="code text-secondary" disabled={true} spellCheck="false" aria-label='Code Sample' rows={lines} style={{ width: "2em", overflow: "hidden", userSelect: "none" }} value={lineNums} unselectable="off" />
    <textarea className="code w-100 text-info flex-grow-1 " disabled={true} spellCheck="false" aria-label='Code Sample' rows={lines} value={text}>
    </textarea>
  </div>

}