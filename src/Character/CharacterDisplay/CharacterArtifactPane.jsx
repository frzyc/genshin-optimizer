import React, { useCallback } from 'react';
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Artifact from '../../Artifact/Artifact';
import ArtifactCard from '../../Artifact/ArtifactCard';
import ConditionalSelector from '../../Components/ConditionalSelector';
import Stat from "../../Stat";
import ConditionalsUtil from '../../Util/ConditionalsUtil';
import Character from "../Character";
import StatDisplayComponent from './StatDisplayComponent';

function CharacterArtifactPane({ character, character: { characterKey, artifactConditionals }, equippedBuild, newBuild, editable, characterDispatch, artifacts }) {
  const history = useHistory()
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild
  let artifactsAssumeFull = newBuild ? newBuild.finalStats?.artifactsAssumeFull : character.artifactsAssumeFull
  if (newBuild) artifactConditionals = newBuild.artifactConditionals
  const statKeys = Character.getDisplayStatKeys(build.finalStats)
  const setStateArtifactConditional = (setKey, setNumKey, conditionalNum) => characterDispatch?.({ artifactConditionals: ConditionalsUtil.setConditional(artifactConditionals, { srcKey: setKey, srcKey2: setNumKey }, conditionalNum) })
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      artToEditId: artid
    }), [history])
  return <>
    <Row>
      <Col className="mb-2">
        <Card className="h-100" bg="lightcontent" text="lightfont">
          <Card.Body>
            <StatDisplayComponent {...{ character, equippedBuild, newBuild, statsDisplayKeys: statKeys, editable }} />
          </Card.Body>
          {newBuild ? <Card.Footer>
            <Button onClick={() => {
              if (!window.confirm("Do you want to equip this artifact build to this character?")) return
              Character.equipArtifacts(characterKey, newBuild.artifactIds)
              characterDispatch?.({ type: "fromDB" })
            }}>Equip all artifacts to current character</Button>
            {artifactsAssumeFull && <Alert className="float-right text-right mb-0 py-2" variant="orange" ><b>Assume Main Stats are Fully Leveled</b></Alert>}
          </Card.Footer> : (editable && <Card.Footer>
            <Button onClick={() => {
              if (!window.confirm("Do you want to move all the artifacts equipped to inventory?")) return
              Character.equipArtifacts(characterKey, Object.fromEntries(Artifact.getSlotKeys().map(sKey => [sKey, ""])))
              characterDispatch?.({ type: "fromDB" })
            }}>Unequip all artifacts</Button>
            {artifactsAssumeFull && <Alert className="float-right text-right mb-0 py-2" variant="orange" ><b>Assume Main Stats are Fully Leveled</b></Alert>}
          </Card.Footer>)}
        </Card>
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
          {artifacts ?
            Artifact.getSlotKeys().map(slotKey => {//from flex
              const art = artifacts.find(art => art.slotKey === slotKey)
              return art ? <Col sm={6} lg={4} key={slotKey} className="mb-2">
                <ArtifactCard artifactObj={art} />
              </Col> : null
            }) : Artifact.getSlotKeys().map(slotKey =>
              build.artifactIds[slotKey] ? <Col sm={6} lg={4} key={build.artifactIds[slotKey]} className="mb-2">
                <ArtifactCard artifactId={build.artifactIds[slotKey]} assumeFull={artifactsAssumeFull} onEdit={() => edit(build.artifactIds[slotKey])} />
              </Col> : null
            )}
        </Row>
      </Col>
    </Row>
  </>
}
export default CharacterArtifactPane
