
//take the new statsDisplayKeys, and display the stats.

import { Card, Col, Row } from "react-bootstrap"
import StatDisplay from "../../Components/StatDisplay"
import Character from "../Character"

export default function StatDisplayComponent({ character, character: { characterKey }, equippedBuild, newBuild, statsDisplayKeys, editable, cardbg = "darkcontent" }) {
  return <Row className="mb-n2">{Object.entries(statsDisplayKeys).map(([talentKey, fields]) => {
    let header = ""
    if (talentKey === "basicKeys") header = "Basic Stats"
    else if (talentKey === "genericAvgHit") header = "Generic Optimization Values"
    else if (talentKey === "transReactions") header = "Transformation Reaction"
    else header = Character.getTalentName(characterKey, talentKey, talentKey)
    return <Col key={talentKey} className="mb-2" xs={12} md={6} xl={4}>
      <Card bg={cardbg} text="lightfont" className="h-100">
        <Card.Header>{header}</Card.Header>
        <Card.Body>
          {fields.map(field => <StatDisplay key={JSON.stringify(field)} {...{ character, equippedBuild, newBuild, editable, statKey: field }} />)}
        </Card.Body>
      </Card>
    </Col>
  })}</Row>
}