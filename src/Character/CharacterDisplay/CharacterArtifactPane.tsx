import { useCallback, useContext, useEffect, useMemo } from 'react';
import { Alert, Button, ButtonGroup, Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import ArtifactCard from '../../Artifact/ArtifactCard';
import { ArtifactSheet } from '../../Artifact/ArtifactSheet';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import { buildContext } from '../../Build/Build';
import { database as localDatabase, DatabaseContext } from '../../Database/Database';
import useForceUpdate from '../../ReactHooks/useForceUpdate';
import usePromise from '../../ReactHooks/usePromise';
import { ICachedCharacter } from '../../Types/character';
import { allSlotKeys, ArtifactSetKey } from '../../Types/consts';
import { objectFromKeyMap } from '../../Util/Util';
import WeaponSheet from '../../Weapon/WeaponSheet';
import Character from "../Character";
import CharacterSheet from '../CharacterSheet';
import StatDisplayComponent from './StatDisplayComponent';
const artLayoutSize = { xs: 12, md: 6, lg: 4 }

type CharacterArtifactPaneProps = {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  }
  character: ICachedCharacter,
}
function CharacterArtifactPane({ sheets, character, character: { key: characterKey } }: CharacterArtifactPaneProps) {
  const { newBuild, equippedBuild, compareBuild, setCompareBuild } = useContext(buildContext)
  const database = useContext(DatabaseContext)
  const history = useHistory()
  //choose which one to display stats for
  const stats = (newBuild ? newBuild : equippedBuild)
  const mainStatAssumptionLevel = stats?.mainStatAssumptionLevel ?? 0
  const statKeys = useMemo(() => stats && Character.getDisplayStatKeys(stats, sheets), [stats, sheets])
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      artToEditId: artid
    } as any), [history])
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  // TODO: We can also listen only to equipped artifacts
  const [, updateArt] = useForceUpdate()
  useEffect(() => database.followAnyArt(updateArt))

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    if (!newBuild) return
    newBuild.equippedArtifacts && database.equipArtifacts(characterKey, newBuild.equippedArtifacts)
  }, [characterKey, newBuild, database])

  const unequipArts = useCallback(() => {
    if (!window.confirm("Do you want to move all the artifacts equipped to inventory?")) return
    database.equipArtifacts(characterKey, objectFromKeyMap(allSlotKeys, () => ""))
  }, [characterKey, database])
  if (!stats) return null
  return <>
    <Card className="h-100 mb-2" bg="lightcontent" text={"lightfont" as any}>
      <Card.Body>
        <StatDisplayComponent {...{ sheets, character, equippedBuild: (newBuild && !compareBuild) ? undefined : equippedBuild, newBuild, statsDisplayKeys: statKeys }} />
      </Card.Body>
      <Card.Footer>
        <Row>
          <Col>
            {newBuild ? <Button onClick={equipArts} className="mr-2">Equip artifacts</Button> : (database === localDatabase && <Button onClick={unequipArts}>Unequip all artifacts</Button>)}
            {/* Compare against new build toggle */}
            {!!newBuild && <ButtonGroup>
              <Button variant={compareBuild ? "primary" : "success"} disabled={!compareBuild} onClick={() => setCompareBuild?.(false)}>
                <small>Show New artifact Stats</small>
              </Button>
              <Button variant={!compareBuild ? "primary" : "success"} disabled={compareBuild} onClick={() => setCompareBuild?.(true)}>
                <small>Compare against equipped artifacts</small>
              </Button>
            </ButtonGroup>}
          </Col>
          <Col xs="auto">{!!mainStatAssumptionLevel && <Alert className="mb-0 py-2" variant="orange" ><b>Assume Main Stats are Level {mainStatAssumptionLevel}</b></Alert>}</Col>
        </Row>
      </Card.Footer>
    </Card>
    <Row className="mb-n2">
      <Col {...artLayoutSize} className="d-flex flex-column">
        {artifactSheets && Object.entries(ArtifactSheet.setEffects(artifactSheets, stats.setToSlots)).map(([setKey, setNumKeyArr]) =>
          <Card key={setKey} className="mb-2 flex-grow-1" bg="lightcontent" text={"lightfont" as any}>
            <Card.Header>{artifactSheets?.[setKey].name ?? ""}</Card.Header>
            <Card.Body className="p-2 mb-n2">
              {(setNumKeyArr as any).map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild, newBuild, characterKey }} />)}
            </Card.Body>
          </Card>
        )}
      </Col>
      {allSlotKeys.map(slotKey =>
        Boolean(stats?.equippedArtifacts?.[slotKey]) && <Col {...artLayoutSize} key={stats?.equippedArtifacts?.[slotKey]} className="mb-2">
          <ArtifactCard artifactId={stats?.equippedArtifacts?.[slotKey]} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={() => edit(stats?.equippedArtifacts?.[slotKey])} />
        </Col>
      )}
    </Row>
  </>
}
export default CharacterArtifactPane
