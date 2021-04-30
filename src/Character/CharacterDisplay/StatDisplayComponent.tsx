
//take the new statsDisplayKeys, and display the stats.

import { Card, Col, Row } from "react-bootstrap"
import StatDisplay from "../../Components/StatDisplay"
import { ICharacter } from "../../Types/character"
import CharacterSheet from "../CharacterSheet"
import ICalculatedStats from "../../Types/ICalculatedStats"
import WeaponSheet from "../../Weapon/WeaponSheet"

type StatDisplayComponentProps = {
  characterSheet: CharacterSheet
  weaponSheet: WeaponSheet
  character: ICharacter
  statsDisplayKeys: any,
  editable: boolean,
  cardbg?: string
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}

export default function StatDisplayComponent({ characterSheet, weaponSheet, character, equippedBuild, newBuild, statsDisplayKeys, editable, cardbg = "darkcontent" }: StatDisplayComponentProps) {
  return <Row className="mb-n2">{Object.entries(statsDisplayKeys).map(([talentKey, sectionValues]: any) => {
    let header = ""
    if (talentKey === "basicKeys") header = "Basic Stats"
    else if (talentKey === "genericAvgHit") header = "Generic Optimization Values"
    else if (talentKey === "transReactions") header = "Transformation Reaction"
    else header = characterSheet.getTalent(talentKey)?.name ?? talentKey
    return <Col key={talentKey} className="mb-2" xs={12} md={6} xl={4}>
      <Card bg={cardbg} text={"lightfont" as any} className="h-100">
        <Card.Header>{header}</Card.Header>
        <Card.Body>
          <Row>{sectionValues.map(statKey => <StatDisplay key={JSON.stringify(statKey)} {...{ characterSheet, weaponSheet, character, equippedBuild, newBuild, editable, statKey }} />)}</Row>
        </Card.Body>
      </Card>
    </Col>
  })}</Row>
}