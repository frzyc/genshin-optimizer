import React, { useState } from 'react';
import { Accordion, Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import Artifact from '../../Artifact/Artifact';
import ArtifactCard from '../../Artifact/ArtifactCard';
import ConditionalSelector from '../../Components/ConditionalSelector';
import { DisplayNewBuildDiff, DisplayStats } from '../../Components/StatDisplay';
import Stat, { FormulaText } from "../../Stat";
import { GetDependencies } from '../../StatDependency';
import ConditionalsUtil from '../../Util/ConditionalsUtil';
import Character from "../Character";

function CharacterArtifactPane({ character, character: { characterKey, compareAgainstEquipped, artifactConditionals }, equippedBuild, newBuild, editable, forceUpdate, setState }) {
  let [showOther, setShowOther] = useState(false)
  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild
  let artifactsAssumeFull = newBuild ? newBuild.finalStats?.artifactsAssumeFull : character.artifactsAssumeFull
  if (newBuild) artifactConditionals = newBuild.artifactConditionals
  const statKeys = Character.getDisplayStatKeys(characterKey)

  let displayStatProps = { character, build, editable }
  let displayNewBuildProps = { character, equippedBuild, newBuild, editable }

  const setStateArtifactConditional = (setKey, setNumKey, conditionalNum) => setState?.(state =>
    ({ artifactConditionals: ConditionalsUtil.setConditional(state.artifactConditionals, { srcKey: setKey, srcKey2: setNumKey }, conditionalNum) }))
  const formulaDependencyKeys = GetDependencies(build.finalStats, statKeys)
  const formulaKeys = Object.keys(FormulaText).filter(key => formulaDependencyKeys.includes(key))
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
                    {`${showOther ? "Hide" : "Show"} Calculations`}
                  </Accordion.Toggle>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row>
                {(newBuild && compareAgainstEquipped) ?
                  statKeys.map(statKey => <DisplayNewBuildDiff xs={12} md={6} xl={4} key={statKey} {...{ ...displayNewBuildProps, statKey }} />) :
                  statKeys.map(statKey => <DisplayStats xs={12} md={6} xl={4} key={statKey} {...{ ...displayStatProps, statKey }} />)}
              </Row>
              <Accordion.Collapse eventKey="showOtherStats">
                <Row>
                  {formulaKeys.map(key => <Col key={key} xs={12} className="mt-2">
                    <Card bg="darkcontent" text="lightfont">
                      <Card.Header className="p-2">
                        {Stat.printStat(key, build.finalStats)}
                      </Card.Header>
                      <Card.Body className="p-2">
                        <small>{Stat.printFormula(key, build.finalStats, build.finalStats.formulaOverrides, false)}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  )}
                </Row>
              </Accordion.Collapse>
            </Card.Body>
            {newBuild ? <Card.Footer>
              <Button onClick={() => {
                Character.equipArtifacts(character.id, newBuild.artifactIds)
                forceUpdate?.()
              }}>Equip All artifacts to current character</Button>
              {artifactsAssumeFull && <Alert className="float-right text-right mb-0 py-2" variant="orange" ><b>Assume Main Stats are Fully Leveled</b></Alert>}
            </Card.Footer> : null}
          </Card>
        </Accordion>
      </Col>
    </Row>
    <Row className="mb-n2">
      <Col>
        <Row>
          <Col sm={6} lg={4} className="mb-2">
            <Card className="h-100 d-flex flex-column" bg="lightcontent" text="lightfont">
              <Card.Header>Artifact Set Effects</Card.Header>
              <Card.Body className="flex-grow-1">
                <Row>
                  {Object.entries(Artifact.getSetEffects(build.setToSlots)).map(([setKey, setNumKeyArr]) =>
                    <Col key={setKey} xs={12} className="mb-2">
                      <h5>{Artifact.getSetName(setKey)}</h5>
                      <Row>
                        {setNumKeyArr.map(setNumKey => {
                          let setStats = Artifact.getArtifactSetNumStats(setKey, setNumKey)
                          let conditionalNum = 0;
                          let conditional = Artifact.getSetEffectConditional(setKey, setNumKey)
                          if (conditional) {
                            conditionalNum = ConditionalsUtil.getConditionalNum(artifactConditionals, { srcKey: setKey, srcKey2: setNumKey })
                            Object.entries(Artifact.getConditionalStats(setKey, setNumKey, conditionalNum)).forEach(([statKey, val]) =>
                              setStats[statKey] = (setStats[statKey] || 0) + val)
                          }
                          let conditionalElement = <ConditionalSelector
                            disabled={newBuild ? true : false}
                            conditional={conditional}
                            conditionalNum={conditionalNum}
                            setConditional={(cnum) => setStateArtifactConditional(setKey, setNumKey, cnum)}
                            defEle={<Badge variant="success">{setNumKey}-Set</Badge>}
                          />
                          return <Col key={setNumKey} xs={12} className="mb-2">
                            <h6>{conditionalElement} {Artifact.getSetEffectText(setKey, setNumKey, build.finalStats)}</h6>
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
          {Artifact.getSlotKeys().map(slotKey =>
            build.artifactIds[slotKey] ? <Col sm={6} lg={4} key={build.artifactIds[slotKey]} className="mb-2">
              <ArtifactCard artifactId={build.artifactIds[slotKey]} forceUpdate={forceUpdate} assumeFull={artifactsAssumeFull} />
            </Col> : null
          )}
        </Row>
      </Col>
    </Row>
  </>
}
export default CharacterArtifactPane