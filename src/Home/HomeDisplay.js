import { Badge, Card, Col, Container, Image, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import WIPComponent from '../Components/WIPComponent'
import art_editor from './art_editor.png'
import build_generator from './build_generator.png'
import character_editor from './character_editor.png'
import talent_screen from './talent_scr.png'
import tools from './tools.png'

export default function HomeDisplay(props) {
  ReactGA.pageview('/home')
  return <Container className="my-2">
    <Row><Col>
      <Card bg="darkcontent" text="lightfont">
        <Card.Header>Welcome to Genshin Optimizer!</Card.Header>
        <Card.Body>
          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row ><Col>
            <h5>What is Genshin Optimizer?</h5>
            <p>
              Genshin Optimizer is a tool for the action-rpg gacha game <a href="https://genshin.mihoyo.com/" target="_blank" rel="noreferrer"><strong>Genshin Impact</strong></a>.
              It is intended to help you with dealing with the more complex aspect of the game: Artifacts.
              Artifacts are heavily RNG-based elements that directly contributes to how effective your characters are in the game.
              This tool seek to alleviate some of the complexity associated with artifact efficiency, along with which artifact to choose on your character to maximize your stats.
            </p>
            <p>
              However, this tool can do so much more. It will allow calculations of all conditional stats from artifacts, weapons, teams buffs, and calculate how those stats will affect your character in REAL TIME.
            </p>
          </Col></Row></Card.Body></Card>

          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={art_editor} className="w-100 h-auto" rounded /></Col>
            <Col>
              <h5>Artifact Editor</h5>
              <ul>
                <li>Full featured Artifact editor.</li>
                <li>Add Artifacts by scanning a screenshot.</li>
                <li>Automatically calculate the exact rolled value of each artifact.</li>
                <li>Calculate substat efficiency, using the roll calculations. Use a single number to determine whether to keep or trash an artifact!</li>
                <li>Equip/unequip/swap artifacts between your characters, try out different builds.</li>
              </ul>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row>
            <Col>
              <h5>Character Editor</h5>
              <ul>
                <li>Full featured Character editor.</li>
                <li>Automatically populate character stats at every milestone level/ascension.</li>
                <li>Fully editable stats for customization.</li>
                <li>Calculate current stats based on weapon/artifacts.</li>
                <li>Fully featured weapon, with milestone level/ascension stats</li>
                <li>Apply conditional passives, e.g. Whiteblind's ATK&DEF stacking bonus, to your character stats.</li>
                <li>Apply conditional passives from Artifacts sets as well!</li>
                <li>Under Construction Talent damage calculations.</li>
                <li>Under Construction Update character stats/talents based on constellation.</li>
              </ul>
            </Col>
            <Col xs={12} md={4}><Image src={character_editor} className="w-100 h-auto" rounded /></Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={talent_screen} className="w-100 h-auto" rounded /></Col>
            <Col>
              <h5>Character Damage Calculations</h5>
              <ul>
                <li>All the details for Every <WIPComponent><Badge variant="warning">WIP</Badge></WIPComponent> character's talents.</li>
                <li>All numbers should reflect real in game damage.</li>
                <li>Conditional stats and modifications from every Constellation accounted for.</li>
                <li>Shows calculations for all the numbers, along with formulas. I show my work.</li>
                <li>Enemy editor with level/ resistance fields to customize damage calcualtions.</li>
                <li>Account for elemental infusion for normal/charged/plunging attacks.</li>
                <li>Real time damage calculations.</li>
              </ul>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row>
            <Col>
              <h5>Build Generator</h5>
              <ul>
                <li>Generator builds for specific characters using artifacts added by user.</li>
                <li>Limit the builds by artifact sets, main stats...</li>
                <li>Sort the generated builds by a specific stat for maximization.</li>
                <li>Generator will not pick up artifacts already equipped on a differnt character.</li>
                <li>Compare generated artifact build against artifact currently on character.</li>
                <li>Use conditional stats from artifact sets, e.g. Gladitator's 4-set normal attack DMG Bonus, as part of the build calculations.</li>
              </ul>
            </Col>
            <Col xs={12} md={4}><Image src={build_generator} className="w-100 h-auto" rounded /></Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={tools} className="w-100 h-auto" rounded /></Col>
            <Col>
              <h5>Tools and Doodads</h5>
              <ul>
                <li>Server time, with countdown to reset.</li>
                <li>Resin Counter.</li>
                <li>Experience Calculator, to optimize EXP. books usage.</li>
                <li><Badge variant="warning">Under Construction</Badge> Resource Coverter, for all those pesky x3 tiered resources.</li>
                <li><Badge variant="warning">Under Construction</Badge> To-Do list: a dynamic to-do list to tell you what to grind for every day</li>
              </ul>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text="lightfont" className="mb-2"><Card.Body><Row>
            <Col xs={12} md={6}>
              <h5>What's for the future?</h5>
              <ul>
                <li>Full talent/constellation calculations for every released character.</li>
                <li>Saving multiple artifact builds per character, for comparasion.</li>
                <li>Food buffs, team buffs.</li>
                <li>Resource planning to see artifact/character/weapon commitment costs.</li>
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
          </Row></Card.Body></Card>

        </Card.Body>
      </Card>
    </Col></Row>
  </Container >
}