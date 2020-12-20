import art_editor from './art_editor.png'
import character_editor from './character_editor.png'
import build_generator from './build_generator.png'
import { Badge, Card, Col, Container, Image, Row } from "react-bootstrap";
import ReactGA from 'react-ga';

export default function HomeDisplay(props) {
  ReactGA.pageview('/home')
  return <Container className="mt-2">
    <Row><Col>
      <Card bg="darkcontent" text="lightfont">
        <Card.Header>Welcome to Genshin Optimizer!</Card.Header>
        <Card.Body>
          <Row className="mb-2">
            <Col>
              <h5>What is Genshin Optimizer?</h5>
              <p>
                Genshin Optimizer is a tool for the action-rpg gacha game <a href="https://genshin.mihoyo.com/" target="_blank" rel="noreferrer"><strong>Genshin Impact</strong></a>.
                It is intended to help you with dealing with the more complex aspect of the game: Artifacts.
                Artifacts are heavily RNG-based elements that directly contributes to how effective your characters are in the game.
                This tool seek to alleviate some of the complexity associated with artifact efficiency, along with which artifact to choose on your character to maximize your stats.
              </p>
              <p></p>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col xs={12} md={4}><Image src={art_editor} className="w-100 h-auto" rounded /></Col>
            <Col>
              <h5>Artifact Editor</h5>
              <ul>
                <li>Full featured Artifact editor.</li>
                <li>Add Artifacts by scanning a screenshot.</li>
                <li>Calculate substat efficiency, use a single number to determine whether to keep or trash an artifact!</li>
                <li>Automatically calculate the exact rolled value of each artifact.</li>
                <li>Equip/unequip/swap artifacts between your characters, to try out different builds.</li>
              </ul>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <h5>Character Editor</h5>
              <ul>
                <li>Full featured Character editor.</li>
                <li>Automatically populate character stats at every milestone level/ascension.</li>
                <li>Fully editable stats for customization.</li>
                <li>Calculate current stats based on weapon/artifacts.</li>
                <li><Badge variant="warning">Under Construction</Badge> Talent damage calculations.</li>
                <li><Badge variant="warning">Under Construction</Badge> Update character stats/talents based on constellation.</li>
              </ul>
            </Col>
            <Col xs={12} md={4}><Image src={character_editor} className="w-100 h-auto" rounded /></Col>
          </Row>
          <Row className="mb-2">
            <Col xs={12} md={4}><Image src={build_generator} className="w-100 h-auto" rounded /></Col>
            <Col>
              <h5>Build Generator</h5>
              <ul>
                <li>Generator builds for specific characters using artifacts added by user.</li>
                <li>Limit the builds by artifact sets, main stats...</li>
                <li>Sort the generated builds by a specific stat for maximization.</li>
                <li>Generator will not pick up artifacts already equipped on a differnt character.</li>
                <li>Compare generated artifact build against artifact currently on character.</li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <h5>What's for the future?</h5>
              <ul>
                <li>Domain name & server, hosted using funds from donations</li>
                <li>Login, to access your data from any device(will need a server backend)</li>
                <li>To-Do list: a dynamic to-do list to tell you what to grind for every day</li>
                <li>Artifact Analytics, graphs to show your artifact data.</li>
              </ul>
              <p>For more, and to check on what is being worked on, join our <a href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer">discord.</a></p>
            </Col>
            <Col xs={12} md={6}>
              <h5>Want to help the developer?</h5>
              <p>
                Genshin Optimizer has been the manifestation of many days and weeks of sleepless nights, and the developer is still actively trying to improve and add features.
                If you want to give feedback, request a feature, report a bug, please join our <a href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer">discord.</a>
              </p>
              <p>
                If you want to fiancially support the developer, please either donate via <a href={process.env.REACT_APP_PAYPAL_LINK} target="_blank" rel="noreferrer">Paypal</a> or <a href={process.env.REACT_APP_PATREON_LINK} target="_blank" rel="noreferrer">Patreon</a>.
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col></Row>
  </Container >
}