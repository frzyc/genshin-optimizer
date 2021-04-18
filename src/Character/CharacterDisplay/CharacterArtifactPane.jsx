import React, { useCallback, useMemo } from 'react';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Artifact from '../../Artifact/Artifact';
import ArtifactCard from '../../Artifact/ArtifactCard';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import Character from "../Character";
import StatDisplayComponent from './StatDisplayComponent';
const artLayoutSize = { xs: 12, md: 6, lg: 4 }
function CharacterArtifactPane({ character, character: { characterKey }, equippedBuild, newBuild, editable, characterDispatch, artifacts }) {
  const history = useHistory()
  //choose which one to display stats for
  const stats = newBuild ? newBuild : equippedBuild
  const artifactsAssumeFull = Boolean(newBuild?.artifactsAssumeFull)//TODO: artifactsAssumeFull overhaul
  const statKeys = useMemo(() => Character.getDisplayStatKeys(stats), [stats])
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      artToEditId: artid
    }), [history])

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    Character.equipArtifacts(characterKey, newBuild.equippedArtifacts)
    characterDispatch?.({ type: "fromDB" })
  }, [characterKey, newBuild?.equippedArtifacts, characterDispatch])

  const unequipArts = useCallback(() => {
    if (!window.confirm("Do you want to move all the artifacts equipped to inventory?")) return
    Character.equipArtifacts(characterKey, Object.fromEntries(Artifact.getSlotKeys().map(sKey => [sKey, ""])))
    characterDispatch?.({ type: "fromDB" })
  }, [characterKey, characterDispatch])
  return <>
    <Card className="h-100 mb-2" bg="lightcontent" text="lightfont">
      <Card.Body>
        <StatDisplayComponent {...{ character, equippedBuild, newBuild, statsDisplayKeys: statKeys, editable }} />
      </Card.Body>
      <Card.Footer>
        {newBuild ? <Button onClick={equipArts}>Equip all artifacts to current character</Button> : (editable && <Button onClick={unequipArts}>Unequip all artifacts</Button>)}
        {artifactsAssumeFull && <Alert className="float-right text-right mb-0 py-2" variant="orange" ><b>Assume Main Stats are Fully Leveled</b></Alert>}
      </Card.Footer>
    </Card>
    <Row className="mb-n2">
      <Col {...artLayoutSize} className="d-flex flex-column">
        {Object.entries(Artifact.getSetEffects(stats.setToSlots)).map(([setKey, setNumKeyArr]) =>
          <Card key={setKey} className="mb-2 flex-grow-1" bg="lightcontent" text="lightfont">
            <Card.Header>{Artifact.getSetName(setKey)}</Card.Header>
            <Card.Body className="p-2 mb-n2">
              {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild, newBuild, characterDispatch, editable }} />)}
            </Card.Body>
          </Card>
        )}
      </Col>
      {artifacts ?
        Artifact.getSlotKeys().map(slotKey => {//from flex
          const art = artifacts.find(art => art.slotKey === slotKey)
          return Boolean(art) && <Col {...artLayoutSize} key={slotKey} className="mb-2">
            <ArtifactCard artifactObj={art} />
          </Col>
        }) : Artifact.getSlotKeys().map(slotKey =>
          Boolean(stats.equippedArtifacts[slotKey]) && <Col {...artLayoutSize} key={stats.equippedArtifacts[slotKey]} className="mb-2">
            <ArtifactCard artifactId={stats.equippedArtifacts[slotKey]} assumeFull={artifactsAssumeFull} onEdit={() => edit(stats.equippedArtifacts[slotKey])} />
          </Col>
        )}
    </Row>
  </>
}
export default CharacterArtifactPane
