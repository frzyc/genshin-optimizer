import { useCallback, useMemo } from 'react';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import ArtifactCard from '../../Artifact/ArtifactCard';
import { ArtifactSheet } from '../../Artifact/ArtifactSheet';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import { ICharacter } from '../../Types/character';
import { allSlotKeys, SlotKey } from '../../Types/consts';
import ICalculatedStats from '../../Types/ICalculatedStats';
import { usePromise } from '../../Util/ReactUtil';
import WeaponSheet from '../../Weapon/WeaponSheet';
import Character from "../Character";
import CharacterSheet from '../CharacterSheet';
import StatDisplayComponent from './StatDisplayComponent';
const artLayoutSize = { xs: 12, md: 6, lg: 4 }

type CharacterArtifactPaneProps = {
  characterSheet: CharacterSheet,
  weaponSheet: WeaponSheet
  character: ICharacter,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats,
  editable: boolean,
  characterDispatch: (any) => void,
  artifacts?: any[]
}
function CharacterArtifactPane({ characterSheet, weaponSheet, character, character: { characterKey }, equippedBuild, newBuild, editable, characterDispatch, artifacts }: CharacterArtifactPaneProps) {
  const history = useHistory()
  //choose which one to display stats for
  const stats = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  const mainStatAssumptionLevel = stats?.mainStatAssumptionLevel ?? 0
  const statKeys = useMemo(() => Character.getDisplayStatKeys(stats, characterSheet), [stats, characterSheet])
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      artToEditId: artid
    } as any), [history])
  const artifactSheets = usePromise(ArtifactSheet.getAll())

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    if (!newBuild) return
    newBuild.equippedArtifacts && Character.equipArtifacts(characterKey, newBuild.equippedArtifacts)
    characterDispatch?.({ type: "fromDB" })
  }, [characterKey, newBuild, characterDispatch])

  const unequipArts = useCallback(() => {
    if (!window.confirm("Do you want to move all the artifacts equipped to inventory?")) return
    Character.equipArtifacts(characterKey, Object.fromEntries(allSlotKeys.map(sKey => [sKey, ""])) as StrictDict<SlotKey, string>)
    characterDispatch?.({ type: "fromDB" })
  }, [characterKey, characterDispatch])
  return <>
    <Card className="h-100 mb-2" bg="lightcontent" text={"lightfont" as any}>
      <Card.Body>
        <StatDisplayComponent {...{ characterSheet, weaponSheet, character, equippedBuild, newBuild, statsDisplayKeys: statKeys, editable }} />
      </Card.Body>
      <Card.Footer>
        {newBuild ? <Button onClick={equipArts}>Equip all artifacts to current character</Button> : (editable && <Button onClick={unequipArts}>Unequip all artifacts</Button>)}
        {Boolean(mainStatAssumptionLevel) && <Alert className="float-right text-right mb-0 py-2" variant="orange" ><b>Assume Main Stats are Level {mainStatAssumptionLevel}</b></Alert>}
      </Card.Footer>
    </Card>
    <Row className="mb-n2">
      <Col {...artLayoutSize} className="d-flex flex-column">
        {artifactSheets && Object.entries(ArtifactSheet.setEffects(artifactSheets, stats.setToSlots)).map(([setKey, setNumKeyArr]) =>
          <Card key={setKey} className="mb-2 flex-grow-1" bg="lightcontent" text={"lightfont" as any}>
            <Card.Header>{artifactSheets?.[setKey].name ?? ""}</Card.Header>
            <Card.Body className="p-2 mb-n2">
              {(setNumKeyArr as any).map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild, newBuild, characterDispatch, editable }} />)}
            </Card.Body>
          </Card>
        )}
      </Col>
      {artifacts ?
        allSlotKeys.map(slotKey => {//from flex
          const art = artifacts.find(art => art.slotKey === slotKey)
          return Boolean(art) && <Col {...artLayoutSize} key={slotKey} className="mb-2">
            <ArtifactCard artifactObj={art} />
          </Col>
        }) : allSlotKeys.map(slotKey =>
          Boolean(stats?.equippedArtifacts?.[slotKey]) && <Col {...artLayoutSize} key={stats?.equippedArtifacts?.[slotKey]} className="mb-2">
            <ArtifactCard artifactId={stats?.equippedArtifacts?.[slotKey]} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={() => edit(stats?.equippedArtifacts?.[slotKey])} />
          </Col>
        )}
    </Row>
  </>
}
export default CharacterArtifactPane
