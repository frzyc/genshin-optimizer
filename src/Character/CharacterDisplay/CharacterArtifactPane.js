import React, { useState } from 'react';
import { Accordion, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import Artifact from '../../Artifact/Artifact';
import ArtifactCard from '../../Artifact/ArtifactCard';
import ConditionalSelector from '../../Components/ConditionalSelector';
import { StatIconEle } from '../../Components/StatIcon';
import Stat from "../../Stat";
import ArtifactConditionals from '../../Util/ArtifactConditionals';
import Character from "../Character";

function CharacterArtifactPane(props) {
  let [showOther, setShowOther] = useState(false)
  let { character: { characterKey, compareAgainstEquipped, artifactConditionals }, equippedBuild, newBuild, editable, forceUpdate, setState } = props
  let { character } = props
  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild
  if (newBuild) artifactConditionals = newBuild.artifactConditionals
  let eleKey = Character.getElementalKey(characterKey)
  const statKeys = ["hp", "atk", "def", "ele_mas", "crit_rate", "crit_dmg", "crit_multi", "ener_rech", "heal_bonu", "phy_dmg", "phy_avg_dmg",]
  statKeys.push(`${eleKey}_ele_dmg`)
  statKeys.push(`${eleKey}_ele_avg_dmg`)

  let otherStatKeys = ["inc_heal", "pow_shield", "red_cd", "phy_dmg", "phy_res", "norm_atk_dmg", "char_atk_dmg", "skill_dmg", "burst_dmg"]
  Character.getElementalKeys().forEach(ele => {
    otherStatKeys.push(`${ele}_ele_dmg`)
    otherStatKeys.push(`${ele}_ele_res`)
  })
  otherStatKeys = otherStatKeys.filter(key => !statKeys.includes(key))

  const displayStats = (statKey) => {
    let statVal = Character.getStatValueWithOverride(character, statKey)
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (build?.finalStats?.[statKey] || 0) - statVal

    return <Col xs={12} md={6} xl={4} key={statKey}>
      <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
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

    return <Col xs={12} md={6} xl={4} key={statKey}>
      <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
        {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> ({buildDiff > 0 ? "+" : ""}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit})</span> : null}
      </span>
    </Col>
  }
  const setStateArtifactConditional = (setKey, setNumKey, conditionalNum) => setState(state =>
    ({ artifactConditionals: ArtifactConditionals.setConditional(state.artifactConditionals, setKey, setNumKey, conditionalNum) }))

  return <>
    <Row>
      <Col className="mb-2">
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
          <Col sm={6} lg={4} className="mb-2">
            <Card className="h-100 d-flex flex-column" bg="lightcontent" text="lightfont">
              <Card.Header>Artifact Set Effects</Card.Header>
              <Card.Body className="flex-grow-1">
                <Row>
                  {Object.entries(Artifact.getArtifactSetEffects(build.setToSlots)).map(([setKey, setNumKeyArr]) =>
                    <Col key={setKey} xs={12} className="mb-2">
                      <h5>{Artifact.getArtifactSetName(setKey)}</h5>
                      <Row>
                        {setNumKeyArr.map(setNumKey => {
                          let setStats = Artifact.getArtifactSetNumStats(setKey, setNumKey)
                          let conditionalNum = 0;
                          let conditional = Artifact.getArtifactSetEffectConditional(setKey, setNumKey)
                          if (conditional) {
                            conditionalNum = ArtifactConditionals.getConditionalNum(artifactConditionals, setKey, setNumKey)
                            let conditionalStats = Artifact.getArtifactConditionalStats(setKey, setNumKey, conditionalNum)
                            if (conditionalStats) {
                              if (!setStats) setStats = {}
                              Object.entries(conditionalStats).forEach(([statKey, val]) =>
                                setStats[statKey] = (setStats[statKey] || 0) + val)
                            }
                          }
                          let conditionalElement = <ConditionalSelector
                            disabled={newBuild ? true : false}
                            conditional={conditional}
                            conditionalNum={conditionalNum}
                            setConditional={(cnum) => setStateArtifactConditional(setKey, setNumKey, cnum)}
                            defEle={<Badge variant="success">{setNumKey}-Set</Badge>}
                          />
                          return <Col key={setNumKey} xs={12} className="mb-2">
                            <h6>{conditionalElement} {Artifact.getArtifactSetEffectText(setKey, setNumKey, build.finalStats)}</h6>
                            {setStats ? <Row>
                              {Object.entries(setStats).map(([statKey, val]) =>
                                <Col xs={12} key={statKey}>{Stat.getStatName(statKey)}: {val}{Stat.getStatUnit(statKey)}</Col>)}
                            </Row> : null}
                          </Col>
                        })}
                      </Row>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
          {Object.values(build.artifactIds).map(artid =>
            artid ? <Col sm={6} lg={4} key={artid} className="mb-2">
              <ArtifactCard artifactId={artid} forceUpdate={forceUpdate} />
            </Col> : null
          )}
        </Row>
      </Col>
    </Row>
  </>
}
export default CharacterArtifactPane