
//take the new statsDisplayKeys, and display the stats.

import { Card, Col, Row } from "react-bootstrap"
import StatDisplay from "../../Components/StatDisplay"
import { ICachedCharacter } from "../../Types/character"
import CharacterSheet from "../CharacterSheet"
import { ICalculatedStats } from "../../Types/stats"
import WeaponSheet from "../../Weapon/WeaponSheet"
import { ArtifactSetKey } from "../../Types/consts"
import { ArtifactSheet } from "../../Artifact/ArtifactSheet"
import { getFormulaTargetsDisplayHeading } from "../CharacterUtil"

type StatDisplayComponentProps = {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  },
  character: ICachedCharacter
  statsDisplayKeys: any,
  cardbg?: string
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}

export default function StatDisplayComponent({ sheets, sheets: { characterSheet, weaponSheet }, character, equippedBuild, newBuild, statsDisplayKeys, cardbg = "darkcontent" }: StatDisplayComponentProps) {
  const build = newBuild ? newBuild : equippedBuild
  return <Row className="mb-n2">{Object.entries(statsDisplayKeys).map(([sectionKey, sectionValues]: any) => {
    const header = getFormulaTargetsDisplayHeading(sectionKey, sheets, build?.characterEle)
    return <Col key={sectionKey} className="mb-2" xs={12} md={6} xl={4}>
      <Card bg={cardbg} text={"lightfont" as any} className="h-100">
        <Card.Header>{header}</Card.Header>
        <Card.Body>
          <Row>{sectionValues.map(statKey => <StatDisplay key={JSON.stringify(statKey)} {...{ characterSheet, weaponSheet, character, equippedBuild, newBuild, statKey }} />)}</Row>
        </Card.Body>
      </Card>
    </Col>
  })}</Row>
}