import { Card, Col, Container, Row } from "react-bootstrap";
import ReactGA from 'react-ga';

export default function FAQ(props) {
  ReactGA.pageview('/faq')
  return <Container>
    <Card bg="darkcontent" text="lightfont" className="mt-2">
      <Card.Header>Frequently Asked Questions</Card.Header>
      <Card.Body>
        <Row>
          <Col xs={12}>
            <h6>What is substat efficiency?</h6>
            <p>Substat efficiency is a measurement of how high a substat is rolled, as a percentage between the lowest roll and highest roll. Say if a stat can roll 10 ~ 20, then 10 would be 0% efficiency, 20 would be 100%, 15 would be 50%, and so on...
            </p>
            <p>Substat efficiency does not take into effect what type of substat it is measuring against, so ATK% would NOT be weighted more vs. flat ATK.</p>
          </Col>
          <Col>
            <h6>How are all the stats calculated? </h6>
            <p>
              <li><b>HP</b> is calculated as <strong className="text-success">HP Final = (Character HP Base )*(1 + HP% total) + HP Flat</strong>, where the <b>HP%</b> and <b>HP Flat</b> are the sum of total stats from Artifacts and weapon.</li>
            </p>
            <p>
              <li><b>ATK</b> is calculated as <strong className="text-success">ATK Final = (Character ATK Base + Weapon ATK Flat ) * (1 + ATK % total) + ATK Flat</strong>, where the <b>ATK%</b> and <b>ATK Flat</b> are the sum of total stats from Artifacts and weapon.</li>
            </p>
            <p>
              <li><b>DEF</b> is calculated as <strong className="text-success">DEF Final = (Character DEF Base )*(1 + DEF% total) + DEF Flat</strong>, where the <b>DEF%</b> and <b>DEF Flat</b> are the sum of total stats from Artifacts and weapon.</li>
            </p>
            <p>
              <li><b>Elemental Mastery</b> is calculated as <strong className="text-success">Elemental Mastery Final = (Character Elemental Mastery Base ) + Elemental Mastery Bonus</strong>, where the <b>Elemental Mastery Bonus</b> is the sum of total stats from Artifacts and weapon.</li>
            </p>
            <p>
              <li><b>Crit Rate</b> is calculated as <strong className="text-success">Crit Rate = Character Crit Rate Base + Crit Rate Bonus</strong>, where <b>Crit Rate Bonus</b> is the sum of all values from weapons and artifacts. Every character has 5% base Crit rate.</li>
            </p>
            <p>
              <li><b>Crit DMG</b> is calculated as <strong className="text-success">Crit DMG = Character DMG Rate Base + Crit DMG Bonus</strong>, where <b>Crit DMG Bonus</b> is the sum of all values from weapons and artifacts. Every character has 50% base Crit DMG.</li>
            </p>
            <p>
              <li><b>Physical Damage Bonus</b> is the sum of all values from weapons and artifacts.</li>
            </p>
            <p>
              <li><b>Elemental Damage Bonus</b> is calculated as the sum of all values from weapons and artifacts. Only the corresponding Elemental damage Bonus to the character's element is applicable.</li>
            </p>
            <p>
              <li><strong className="text-success">Physical Average ATK = ATK * (1 + Physical Damage Bonus %) * (1 + Crit Rate * (1 + Crit Dmg))</strong></li>
            </p>
            <p>
              <li><strong className="text-success">Elemental Average ATK = ATK * (1 + Elemental Damage Bonus %) * (1 + Crit Rate * (1 + Crit Dmg))</strong></li>
            </p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </Container>
}