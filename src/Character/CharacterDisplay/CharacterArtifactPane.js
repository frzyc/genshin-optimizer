import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Accordion, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import Artifact from '../../Artifact/Artifact';
import ArtifactCard from '../../Artifact/ArtifactCard';
import StatIcon from '../../Components/StatIcon';
import Stat from "../../Stat";
import Character from "../Character";

function CharacterArtifactPane(props) {
  let [showOther, setShowOther] = useState(false)
  let { character: { characterKey, compareAgainstEquipped }, equippedBuild, newBuild, editable, forceUpdate } = props
  let { character } = props
  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild
  let eleKey = Character.getElementalKey(characterKey)
  const statKeys = ["hp", "atk", "def", "ele_mas", "crit_rate", "crit_dmg", "ener_rech", "heal_bonu", "phy_dmg", "phy_atk",]
  statKeys.push(`${eleKey}_ele_dmg`)
  statKeys.push(`${eleKey}_ele_atk`)

  const otherStatKeys = ["stam", "inc_heal", "pow_shield", "red_cd", "phy_dmg", "phy_res"]
  Character.getElementalKeys().forEach(ele => {
    otherStatKeys.push(`${ele}_ele_dmg`)
    otherStatKeys.push(`${ele}_ele_res`)
  })

  const displayStats = (statKey) => {
    let statVal = Character.getStatValueWithOverride(character, statKey)
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (build?.finalStats?.[statKey] || 0) - statVal

    return <Col xs={12} md={6} lg={4} key={statKey}>
      <h6 className="d-inline">{StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
        {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> {buildDiff > 0 && "+"}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit}</span> : null}
      </span>
    </Col>
  }
  const displayNewBuildDiff = (statKey) => {
    let statVal = (equippedBuild?.finalStats?.[statKey] || Character.getStatValueWithOverride(character, statKey))
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (newBuild?.finalStats?.[statKey] || 0) - (equippedBuild?.finalStats?.[statKey] || 0)

    return <Col xs={12} md={6} lg={4} key={statKey}>
      <h6 className="d-inline">{StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
        {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> ({buildDiff > 0 ? "+" : ""}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit})</span> : null}
      </span>
    </Col>
  }

  return <>
    <Row>
      <Col className="mb-3">
        <Accordion>
          <Card className="h-100" bg="lightcontent" text="lightfont">
            <Card.Header>
              <Row>
                <Col>
                  <span>Character Stats</span>
                </Col>
                <Col xs="auto">
                  <Accordion.Toggle as={Button} variant="info" eventKey="showOtherStats" onClick={() => setShowOther(!showOther)} size="sm">
                    {`${showOther ? "Hide" : "Show"} Other Stats`}
                  </Accordion.Toggle>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row>
                {(newBuild && compareAgainstEquipped) ? statKeys.map(displayNewBuildDiff) : statKeys.map(displayStats)}
              </Row>
              <Accordion.Collapse eventKey="showOtherStats">
                <Row>
                  {(newBuild && compareAgainstEquipped) ? otherStatKeys.map(displayNewBuildDiff) : otherStatKeys.map(displayStats)}
                </Row>
              </Accordion.Collapse>

            </Card.Body>
            {newBuild ? <Card.Footer>
              <Button size="sm" onClick={() => {
                Character.equipArtifacts(character.id, newBuild.artifactIds)
                forceUpdate?.()
              }}>Equip All artifacts to current character</Button>
            </Card.Footer> : null}
          </Card>
        </Accordion>
      </Col>
    </Row>
    <Row>
      <Col>
        <Row>
          <Col sm={6} className="mb-3">
            <Row className="h-100">
              <Col xs={12} className="d-flex flex-column">
                <Card className="flex-grow-1" bg="lightcontent" text="lightfont">
                  <Card.Header>Artifact Set Effects</Card.Header>
                  <Card.Body>
                    <Row>
                      {Object.entries(build.artifactSetEffect).map(([setKey, effects]) =>
                        <Col key={setKey} xs={12} className="mb-3">
                          <h5>{Artifact.getArtifactSetName(setKey)}</h5>
                          <Row>
                            {Object.entries(effects).map(([num, effect]) => {
                              return <Col key={num} xs={12}><h6><Badge variant="success">{num}-Set</Badge> <span>{effect.text}</span></h6></Col>
                            })}
                          </Row>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </Col >
            </Row>
          </Col>
          {Object.values(build.artifactIds).map(artid =>
            artid ? <Col sm={6} key={artid} className="mb-3 testname">
              <ArtifactCard artifactId={artid} forceUpdate={forceUpdate} />
            </Col> : null
          )}
        </Row>
      </Col>
    </Row>
  </>
}
export default CharacterArtifactPane