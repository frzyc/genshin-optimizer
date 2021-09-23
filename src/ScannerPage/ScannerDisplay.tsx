import { faDiscord } from "@fortawesome/free-brands-svg-icons"
import { faDownload, faHome } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Card, Col, Container, Image, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"
import Amenoma from './Amenoma.png'
import cocogoat from './cocogoat.png'
import GIScanner from './GIScanner.png'

export default function ScannerDisplay(props: any) {
  const { t } = useTranslation('page_scanner')
  ReactGA.pageview('/scanner')
  return <Container className="my-2">
    <Row><Col>
      <Card bg="darkcontent" text={"lightfont" as any}>
        <Card.Body>
          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row ><Col>
            <Trans t={t} i18nKey="intro">
              <h5>Automatic Scanners</h5>
              <p>Automatic Scanners are Genshin tools that can automatically scan in-game data by manipulating your mouse movements, taking screenshots of the game, and then scanning information from those screenshots. These are low-risk tools that can help you automate a lot of manual process with scanning artifacts for GO. As any tools that indirectly interact with the game, althought their usage is virtually undetectable, there could still be risk with using them. Users discretion is advised.
              </p>
              <p>The most important aspect of using these Scanners with GO is the output format:
              </p>
              <ul>
                <li>As of <code className="text-light">v5.21.0</code>, GO can import artifact data in the <code className="text-light">mona-uranai</code> format. </li>
                <li>As of <code className="text-light">v6.0.0</code>, GO can import data in the <code className="text-light">Genshin Open Object Description (GOOD)</code> format.</li>
              </ul>
              <p>Below are several scanners that have been tested with GO.</p>
              <p>To upload the exported file, go to <Link to="/database">Database</Link> page, and upload your file in the "Database Upload" section.</p>
            </Trans>
          </Col></Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={GIScanner} className="w-100 h-auto" rounded /></Col>
            <Col>
              <Trans t={t} i18nKey="gis">
                <h5>Genshin Impact Scanner</h5>
                <p>This light-weight app will scan all your characters + weapons + artifacts in your inventory. Follow the instrutions in the app to set it up. This scanner only scans in english. </p>
                <p>The app exports to GOOD format by default.</p>
                <Button href="https://github.com/Andrewthe13th/Genshin_Scanner/releases" target="_blank" ><FontAwesomeIcon icon={faDownload} /> Download link</Button>

              </Trans>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col>
              <Trans t={t} i18nKey="amenoma">
                <h5>「天目」-- Amenoma</h5>
                <p>Scans all you artifacts in your inventory. Follow the instruction to capture the window and scan.</p>
                <p>Has both Chinese and English version. (Download the <code className="text-light">_EN.exe</code> version to scan in english)</p>
                <p>Both the <code className="text-light">mona-uranai</code> and <code className="text-light">GOOD</code> format is accepted in GO. the <code className="text-light">GOOD</code> format is recommended.</p>
                <p><Button href="https://github.com/daydreaming666/Amenoma/releases/" target="_blank" ><FontAwesomeIcon icon={faDownload} /> Download link</Button></p>
                <p>Please feel free to join their discord if you find any bugs. They are in need of more english testers.</p>
                <Button href="https://discord.gg/S3B9NB7Bk2" target="_blank" ><FontAwesomeIcon icon={faDiscord} /> Discord Invite</Button>
              </Trans>
            </Col>
            <Col xs={12} md={4}><Image src={Amenoma} className="w-100 h-auto" rounded /></Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body><Row>
            <Col xs={12} md={4}><Image src={cocogoat} className="w-100 h-auto" rounded /></Col>
            <Col>
              <Trans t={t} i18nKey="cocogoat">
                <h5>cocogoat</h5>
                <p>Originally Chinese scanner that was ported to English. Has an overlay to scan individual artifacts. </p>
                <p>Cocogoat also retains your scanned artifacts, where you can edit them individually, and you can use them in its built-in mona-uranai optimizer.(Currently a Chinese-only optimizer)</p>
                <p>It is recommended to export in its "Mona's Divination Shop" format.</p>
                <p><Button href="https://github.com/YuehaiTeam/cocogoat/releases" target="_blank" ><FontAwesomeIcon icon={faDownload} /> Download link</Button></p>
                <p className="text-warning">WARNING: do not use the "Genshin Optimizer" export format. importing it will delete your character {"&"} weapon data.</p>
              </Trans>
            </Col>
          </Row></Card.Body></Card>

          <Card bg="lightcontent" text={"lightfont" as any} className="mb-2"><Card.Body>
            <Button as={Link} to="/" ><FontAwesomeIcon icon={faHome} /> <Trans t={t} i18nKey="backHome">Go back to home page</Trans></Button>
          </Card.Body></Card>
        </Card.Body>
      </Card>
    </Col></Row>
  </Container >
}