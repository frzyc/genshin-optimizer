import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo, useReducer, useState } from "react";
import { Badge, Button, ButtonGroup, Card, Col, Image, Modal, Row, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import Assets from "../Assets/Assets";
import CharacterSheet from "./CharacterSheet";
import { DatabaseContext } from "../Database/Database";
import { ICachedCharacter } from "../Types/character";
import { allCharacterKeys, allElements, allWeaponTypeKeys, CharacterKey, WeaponTypeKey } from "../Types/consts";
import { usePromise } from "../Util/ReactUtil";
import { Stars } from "../Components/StarDisplay";
import StatIcon, { uncoloredEleIcons } from "../Components/StatIcon";
import Character from './Character'
import WeaponSheet from "../Weapon/WeaponSheet";
import { ArtifactSheet } from "../Artifact/ArtifactSheet";

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

type characterFilter = (character: ICachedCharacter | undefined, sheet: CharacterSheet) => boolean

export function CharSelectionButton({ characterSheet, onSelect, filter }: { characterSheet?: CharacterSheet, onSelect?: (cKey: CharacterKey) => void, filter?: characterFilter }) {
  const [show, setshow] = useState(false)
  const HeaderIconDisplay = characterSheet ? <span >
    <Image src={characterSheet.thumbImg} className="thumb-small my-n1 ml-n2" roundedCircle />
    <h6 className="d-inline"> {characterSheet.name} </h6>
  </span> : <span>Select a Character</span>
  return <>
    <Button disabled={!onSelect} onClick={() => setshow(true)} >{HeaderIconDisplay}</Button>
    <CharacterSelectionModal show={show} onHide={() => setshow(false)} onSelect={onSelect} filter={filter} />
  </>
}

const toggle = {
  rarity: "Rarity",
  level: "Level",
  name: "Name"
} as const

function filterReducer(oldFilter, newFilter) {
  if (newFilter === oldFilter)
    return ""
  return newFilter
}


type CharacterSelectionModalProps = {
  show: boolean,
  onHide: () => void,
  onSelect?: (ckey: CharacterKey) => void,
  filter?: characterFilter
}

export function CharacterSelectionModal({ show, onHide, onSelect, filter = () => true }: CharacterSelectionModalProps) {
  const database = useContext(DatabaseContext)

  const [sortBy, setsortBy] = useState(() => Object.keys(toggle)[0])
  const [elementalFilter, elementalFilterDispatch] = useReducer(filterReducer, "")
  const [weaponFilter, weaponFilterDispatch] = useReducer(filterReducer, "")

  const characterSheets = usePromise(CharacterSheet.getAll(), [])

  const sortingFunc = {
    level: (ck) => database._getChar(ck)?.level ?? 0,
    rarity: (ck) => characterSheets?.[ck]?.star,
    name: (ck) => characterSheets?.[ck]?.name
  }

  const characterKeyList = !characterSheets ? [] : [...new Set(allCharacterKeys)].filter(cKey => filter(database._getChar(cKey), characterSheets[cKey])).filter(cKey => {
    if (elementalFilter && elementalFilter !== characterSheets?.[cKey]?.elementKey) return false
    if (weaponFilter && weaponFilter !== characterSheets?.[cKey]?.weaponTypeKey) return false
    return true
  }).sort((a, b) => {
    if (sortBy === "name") {
      if (a < b) return -1;
      if (a > b) return 1;
      // names must be equal
      return 0;
    }
    if (sortBy === "level") {
      const diff = sortingFunc["level"](b) - sortingFunc["level"](a)
      if (diff) return diff
      return sortingFunc["rarity"](b) - sortingFunc["rarity"](a)
    } else {
      const diff = sortingFunc["rarity"](b) - sortingFunc["rarity"](a)
      if (diff) return diff
      return sortingFunc["level"](b) - sortingFunc["level"](a)
    }
  })

  if (!characterSheets) return null
  return <Modal show={show} size="xl" contentClassName="bg-transparent" onHide={onHide}>
    <Card bg="lightcontent" text={"lightfont" as any}>
      <Card.Header>
        <Row>
          <Col xs="auto">
            <ButtonGroup>
              {allElements.map(eleKey => <Button key={eleKey} variant={(!elementalFilter || elementalFilter === eleKey) ? eleKey : "secondary"} className="py-1 px-2 text-white" onClick={() => elementalFilterDispatch(eleKey)} >
                <h3 className="mb-0">{uncoloredEleIcons[eleKey]}</h3>
              </Button>)}
            </ButtonGroup>
          </Col>
          <Col>
            <ButtonGroup >
              {allWeaponTypeKeys.map(weaponType =>
                <Button key={weaponType} variant={(!weaponFilter || weaponFilter === weaponType) ? "success" : "secondary"} className="py-1 px-2" onClick={() => weaponFilterDispatch(weaponType)}>
                  <h3 className="mb-0"><Image src={Assets.weaponTypes?.[weaponType]} className="inline-icon" /></h3></Button>)}
            </ButtonGroup>
          </Col>
          <Col xs="auto">
            <span>Sort by: </span>
            <ToggleButtonGroup type="radio" name="level" value={sortBy} onChange={setsortBy}>
              {Object.entries(toggle).map(([key, text]) =>
                <ToggleButton key={key} value={key} variant={sortBy === key ? "success" : "primary"}>
                  <h6 className="mb-0">{text}</h6>
                </ToggleButton>)}
            </ToggleButtonGroup>
          </Col>
          <Col xs="auto">
            <Button onClick={onHide} variant="danger"><FontAwesomeIcon icon={faTimes} /></Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body><Row>
        {characterKeyList.map(characterKey => <CharacterBtn key={characterKey} characterKey={characterKey} onClick={() => { onHide(); onSelect?.(characterKey) }} />)}
      </Row></Card.Body>
    </Card>
  </Modal>
}

function CharacterBtn({ onClick, characterKey }) {
  const database = useContext(DatabaseContext)
  const character = database._getChar(characterKey)
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const weapon = character?.equippedWeapon ? database._getWeapon(character.equippedWeapon) : undefined
  const weaponSheet = usePromise(weapon ? WeaponSheet.get(weapon.key) : undefined, [weapon?.key])
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const stats = useMemo(() => character && characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, database, characterSheet, weaponSheet, artifactSheets), [character, characterSheet, weaponSheet, artifactSheets, database])
  if (!characterSheet) return null
  return <Col key={characterKey} lg={3} md={4} className="mb-2">
    <Button className="w-100" variant="darkcontent" onClick={onClick}>
      <h5>{characterSheet.name}</h5>
      <Row>
        <Col xs="auto" className="pr-0">
          <Image src={characterSheet.thumbImg} className={`thumb-big grad-${characterSheet.star}star p-0`} thumbnail />
        </Col>
        <Col>
          {stats && character ? <>
            <h5 className="mb-0">Lv. {Character.getLevelString(character)} {`C${character.constellation}`}</h5>
            <h6 className="mb-0">
              <Badge variant="secondary"><strong className="mx-1">{stats.tlvl.auto + 1}</strong></Badge>{` `}
              <Badge variant="secondary"><strong className="mx-1">{stats.tlvl.skill + 1}</strong></Badge>{` `}
              <Badge variant="secondary"><strong className="mx-1">{stats.tlvl.burst + 1}</strong></Badge>
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
}