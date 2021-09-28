import { faDiscord, faGithub, faPatreon, faPaypal } from "@fortawesome/free-brands-svg-icons"
import { faBook, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Card, Col, Container, Image, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"
import art_editor from './art_editor.png'
import build_generator from './build_generator.png'
import character_editor from './character_editor.png'
import talent_screen from './talent_scr.png'
import tools from './tools.png'


export default function HomeDisplay(props: any) {
  const { t } = useTranslation("page_home")
  ReactGA.pageview('/home')
  return <Container className="my-2">
    <Row><Col>
      <Card bg="darkcontent" text={"lightfont" as any}>
        <Card.Header><Trans t={t} i18nKey="welcome">Welcome to Genshin Optimizer!</Trans></Card.Header>
        <Card.Body>
          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body>
            <Trans t={t} i18nKey="intro">
              <h5>What is Genshin Optimizer?</h5>
              <p>
                Genshin Optimizer (GO) is an open-source fan-made website for the action-RPG gacha game <a href="https://genshin.mihoyo.com/" target="_blank" rel="noreferrer"><strong>Genshin Impact</strong></a>.
                It is mainly intended to help players with the complex aspect of the game: Artifact Optimization.
                Since artifacts are heavily RNG-based elements that directly contribute to how effective your characters are in the game, GO will try to find the best artifacts for your characters based on your current artifact inventory.
              </p>
              <p>GO can keep track of your artifacts, and allows more ease in filtering/comparing artifacts, it serves as a tool to help user find good artifacts in their inventory to level up, and bad artifacts to use as fodder.</p>
              <p>Since GO can replicate the exact stats of any character, along with calculate all their damage numbers to up 1% accuracy, it can also serve as a Damage calculator, and a tool for theory crafting.</p>
            </Trans>
          </Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body>
            <Trans t={t} i18nKey="quickLinks">
              <h5>Quick Links</h5>
              <h6>Do you want to automate some of the artifact input process?</h6>
              <p>
                <Link to="/scanner">Here is a list of compatible automatic scanners that can feed data into GO.</Link> These programs will automatically scan artifacts from your game, and exporting that data into a file. This file can then be imported to GO.
              </p>
            </Trans>
          </Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={art_editor} className="w-100 h-auto" rounded /></Col>
            <Col>
              <Trans t={t} i18nKey="artifactEditor">
                <h5><Link to="/artifact">Artifact Editor & Inventory</Link></h5>
                <ul>
                  <li>Full featured Artifact editor.</li>
                  <li>Add Artifacts by scanning a screenshot.</li>
                  <li>Automatically calculate the exact rolled value of each artifact.</li>
                  <li>Calculate substat efficiency, using the roll calculations. Use a single number to determine whether to keep or trash an artifact!</li>
                  <li>Maintains a completely sortable, filterable artifact inventory.</li>
                  <li>Imports artifact database from <Link to="/scanner">3rd party automatic scanners</Link>.</li>
                </ul>
              </Trans>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col>
              <Trans t={t} i18nKey="characterEditor">
                <h5><Link to="/character">Character & Weapon Editor</Link></h5>
                <ul>
                  <li>Full featured Character editor.</li>
                  <li>Automatically populate character stats at every milestone level/ascension.</li>
                  <li>Fully editable stats for customization.</li>
                  <li>Calculate current stats based on weapon/artifacts.</li>
                  <li>Fully featured weapon editor, with milestone level/ascension stats</li>
                  <li>Apply conditional passives, from talents & weapons & artifacts to accurately mimic in-game conditions. </li>
                </ul>
              </Trans>
            </Col>
            <Col xs={12} md={4}><Image src={character_editor} className="w-100 h-auto" rounded /></Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={talent_screen} className="w-100 h-auto" rounded /></Col>
            <Col>
              <Trans t={t} i18nKey="dmgCalculations">
                <h5><Link to="/character">Character Damage Calculations</Link></h5>
                <ul>
                  <li>All the details for every character's talents.</li>
                  <li>All numbers should reflect real in game damage (within 1% error).</li>
                  <li>Conditional stats and modifications from every Constellation accounted for.</li>
                  <li>Shows calculations for all the numbers, along with formulas.</li>
                  <li>Enemy editor with level/ resistance fields to customize damage calculations.</li>
                  <li>Account for elemental infusion for normal/charged/plunging attacks.</li>
                  <li>Real time damage calculations.</li>
                </ul>
              </Trans>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col>
              <Trans t={t} i18nKey="buildGenerator">
                <h5><Link to="/build">Build Generator</Link></h5>
                <ul>
                  <li>Allows the maximization of character build based on specified optimization target.</li>
                  <li>Generates builds for specific characters using artifact inventory.</li>
                  <li>Limit the builds by artifact sets, main stats...</li>
                  <li>Fully featured build settings to fine-tune build results.</li>
                  <li>Compare generated artifact build against artifacts currently on character.</li>
                  <li>Use conditional stats from artifact sets, e.g. Gladiator's 4-set normal attack DMG Bonus, as part of the build calculations.</li>
                </ul>
              </Trans>
            </Col>
            <Col xs={12} md={4}><Image src={build_generator} className="w-100 h-auto" rounded /></Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={tools} className="w-100 h-auto" rounded /></Col>
            <Col>
              <Trans t={t} i18nKey="tools">
                <h5><Link to="/tools">Tools and Gadgets</Link></h5>
                <ul>
                  <li>Server time, with countdown to reset.</li>
                  <li>Resin Counter.</li>
                  <li>Experience Calculator, to optimize EXP. books usage.</li>
                </ul>
              </Trans>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col xs={12} md={6}>
              <Trans t={t} i18nKey="helpDev">
                <h5>Want to help the developer?</h5>
                <p>Genshin Optimizer has been the manifestation of many days and weeks of sleepless nights, and the developers are still actively trying to improve/add features.</p>
                <p>If you want to financially support the developer, please consider donating via <a href={process.env.REACT_APP_PAYPAL_LINK} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faPaypal} /> Paypal</a> or <a href={process.env.REACT_APP_PATREON_LINK} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faPatreon} /> Patreon</a>. GO does not host ads, and will not lock any features behind a paywall. </p>
                <p>If you want to give feedback, request a feature or report a bug, join our <a href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faDiscord} /> discord</a>. This is where you will find more GO-related information, and to check on what is being actively worked on.</p>
                <p>If you want to help with localization/translation of GO to your native language, please join our discord as well.</p>
              </Trans>
            </Col>
            <Col xs={12} md={6}>
              <Trans t={t} i18nKey="programmer">
                <h5>Are you a programmer?</h5>
                <p>GO is written in TypeScript, with React. Go is completely open source, and can be found on <a href={process.env.REACT_APP_GITHUB_LINK} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faGithub} /> Github</a></p>
                <p>You can also join the <a href={process.env.REACT_APP_DEVDISCORD_LINK} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faDiscord} /> Genshin Dev discord</a> if you are interested in creating Genshin apps.</p>
                <p>GO currently hosts the <Link to="/doc"><FontAwesomeIcon icon={faBook} />Documentation</Link> for the <strong>Genshin Open Object Description (GOOD)</strong> format. This is the format that GO uses to import/export its data. GOOD is an universal format intended for Genshin apps to transfer data between eachother.</p>
              </Trans>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} ><Card.Body>
            <Trans t={t} i18nKey="credits">
              <h5>Credit where credit is due</h5>
              <p>GO is the culmination of hundreds of hours of programming/designing by two maintainers, <a href={process.env.REACT_APP_FRZYC_LINK} target="_blank" rel="noreferrer"><strong><FontAwesomeIcon icon={faUser} /> frzyc</strong></a> and <a href={process.env.REACT_APP_LANTUA_LINK} target="_blank" rel="noreferrer"><strong><FontAwesomeIcon icon={faUser} /> lantua</strong></a>. There are also a ton of other resources that aid in the creation of this website. Time to take a bow and thank them.</p>
              <ul>
                <li>Thanks to everyone in the community, and especially people on our <a href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer">discord</a> for providing feedback and helping us improve this tool.</li>
                <li>Thanks to <a href="https://github.com/Dimbreath" target="_blank" rel="noreferrer">Dimbreath</a>, for giving us a reliable, consistent source for Genshin data and numbers. All our calculations would be moot without them.</li>
                <li>Some of our Genshin images are directly yoinked from <a href="https://genshin-impact.fandom.com/" target="_blank" rel="noreferrer">The Genshin Impact Wiki</a>, so a serendipitous thanks for them.</li>
                <li>Special thanks to members of our community who has gone the extra mile, and has been helping us with localization/translation of GO to other languages, help us test formulas by recording in-game data, and programmers who has helped us with source code contributions.</li>
                <li>Thanks for everyone else, for sharing this tool, and getting more people to use this tool.</li>
                <li>Lastly, and most importantly, thank <strong>YOU</strong>, for using GO right now.</li>
              </ul>
            </Trans>
          </Card.Body></Card>
        </Card.Body>
      </Card>
    </Col></Row>
  </Container >
}