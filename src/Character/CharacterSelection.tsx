import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Badge, Button, ButtonGroup, Card, Col, Image, Modal, Row } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import Assets from "../Assets/Assets";
import CharacterSheet from "./CharacterSheet";
import { DatabaseContext } from "../Database/Database";
import { ICharacter } from "../Types/character";
import { allCharacterKeys, CharacterKey, WeaponTypeKey } from "../Types/consts";
import { usePromise } from "../Util/ReactUtil";
import { Stars } from "../Components/StarDisplay";
import StatIcon from "../Components/StatIcon";
import Character from './Character'

export function CharacterSelectionDropdownList({ onSelect, weaponTypeKey }: { onSelect: (ckey: CharacterKey) => void, weaponTypeKey?: WeaponTypeKey }) {
  const database = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll(), [])
  return <>{database._getCharKeys().filter(cKey =>
    weaponTypeKey ? (characterSheets?.[cKey]?.weaponTypeKey === weaponTypeKey) : true
  ).sort().map(characterKey => <DropDownItem key={characterKey} characterKey={characterKey} onSelect={onSelect} />)}</>
}
function DropDownItem({ characterKey, onSelect }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  if (!characterSheet) return null
  return <Dropdown.Item onClick={() => onSelect(characterKey)}>{characterSheet.nameWIthIcon}</Dropdown.Item>
}

type characterFilter = (character: ICharacter | undefined, sheet: CharacterSheet) => boolean

export function CharSelectionButton({ characterSheet, onSelect, filter }: { characterSheet?: CharacterSheet, onSelect: (cKey: CharacterKey) => void, filter?: characterFilter }) {
  const [show, setshow] = useState(false)
  const HeaderIconDisplay = characterSheet ? <span >
    <Image src={characterSheet.thumbImg} className="thumb-small my-n1 ml-n2" roundedCircle />
    <h6 className="d-inline"> {characterSheet.name} </h6>
  </span> : <span>Select a Character</span>
  return <>
    <Button as={ButtonGroup} onClick={() => setshow(true)} >{HeaderIconDisplay}</Button>
    <CharacterSelectionModal show={show} onHide={() => setshow(false)} onSelect={onSelect} filter={filter} />
  </>
}

type CharacterSelectionModalProps = {
  show: boolean,
  onHide: () => void,
  onSelect: (ckey: CharacterKey) => void,
  filter?: characterFilter
}

export function CharacterSelectionModal({ show, onHide, onSelect, filter = () => true }: CharacterSelectionModalProps) {
  const database = useContext(DatabaseContext)
  const characterSheets = usePromise(CharacterSheet.getAll(), [])

  const characterKeyList = characterSheets ? [...new Set(allCharacterKeys)].filter(cKey => filter(database._getChar(cKey), characterSheets[cKey])) : []

  if (!characterSheets) return null
  return <Modal show={show} size="xl" contentClassName="bg-transparent" onHide={onHide}>
    <Card bg="lightcontent" text={"lightfont" as any}>
      <Card.Header>
        <Row>
          <Col><h5 className="mb-0 d-inline">Select Character</h5></Col>
          <Col xs="auto">
            <Button onClick={onHide} variant="danger"><FontAwesomeIcon icon={faTimes} /></Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body><Row>
        {characterKeyList.map(characterKey => {
          const characterSheet = characterSheets[characterKey]
          const character = database._getChar(characterKey)
          return <Col key={characterKey} lg={3} md={4} className="mb-2">
            <Button className="w-100" variant="secondary" onClick={() => { onHide(); onSelect(characterKey) }}>
              <h5>{characterSheet.name}</h5>
              <Row>
                <Col xs="auto" className="pr-0">
                  <Image src={characterSheet.thumbImg} className={`thumb-big grad-${characterSheet.star}star p-0`} thumbnail />
                </Col>
                <Col>
                  {character ? <>
                    <h5 className="mb-0">Lv. {Character.getLevelString(character)} {`C${character.constellation}`}</h5>
                    <h6 className="mb-0">
                      <Badge variant="secondary"><strong className="mx-1">{character.talentLevelKeys.auto + 1}</strong></Badge>{` `}
                      <Badge variant="secondary"><strong className="mx-1">{character.talentLevelKeys.skill + 1}</strong></Badge>{` `}
                      <Badge variant="secondary"><strong className="mx-1">{character.talentLevelKeys.burst + 1}</strong></Badge>
                    </h6>
                  </> : <>
                    <h4><Badge variant="primary">NEW</Badge></h4>
                  </>}
                  <h6 className="mb-0"><Stars stars={characterSheet.star} colored /></h6>
                  <h3 className="mb-0">{characterSheet.elementKey && StatIcon[characterSheet.elementKey]} <Image src={Assets.weaponTypes?.[characterSheet.weaponTypeKey]} className="inline-icon" /></h3>
                </Col>
              </Row>
            </Button>
          </Col>
        })}
      </Row></Card.Body>
    </Card>
  </Modal>
}