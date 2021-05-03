import { faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Image, Row, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import Assets from '../Assets/Assets';
import CharacterDatabase from '../Database/CharacterDatabase';
import InfoComponent from '../InfoComponent';
import { allElements, CharacterKey } from '../Types/consts';
import { useForceUpdate, usePromise } from '../Util/ReactUtil';
import { loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Weapon from '../Weapon/Weapon';
import Character from './Character';
import CharacterCard from './CharacterCard';
import CharacterSheet from './CharacterSheet';
const CharacterDisplayInfo = React.lazy(() => import('./CharacterDisplayInfo'));

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('./CharacterDisplayCard'))
const toggle = {
  level: "Level",
  rarity: "Rarity",
  name: "Name"
}

function filterReducer(oldFilter, newFilter) {
  if (newFilter === oldFilter)
    return ""
  return newFilter
}

export default function CharacterDisplay(props) {
  const [charIdToEdit, setcharIdToEdit] = useState("")
  const [sortBy, setsortBy] = useState(() => Object.keys(toggle)[0])
  const [elementalFilter, elementalFilterDispatch] = useReducer(filterReducer, "")
  const [weaponFilter, weaponFilterDispatch] = useReducer(filterReducer, "")
  const [newCharacter, setnewCharacter] = useState(false)
  const [, forceUpdate] = useForceUpdate()
  const scrollRef = useRef(null as any)
  useEffect(() => {
    ReactGA.pageview('/character')
    const saved = loadFromLocalStorage("CharacterDisplay.state")
    if (saved) {
      const { charIdToEdit, sortBy, elementalFilter, weaponFilter } = saved
      setcharIdToEdit(charIdToEdit)
      setsortBy(sortBy)
      allElements.includes(elementalFilter) && elementalFilterDispatch(elementalFilter)
      Weapon.getWeaponTypeKeys().includes(weaponFilter) && weaponFilterDispatch(weaponFilter)
    }
    CharacterDatabase.registerListener(forceUpdate)
    return () => CharacterDatabase.unregisterListener(forceUpdate)
  }, [forceUpdate])
  const allCharacterSheets: StrictDict<CharacterKey, CharacterSheet> | {} = usePromise(CharacterSheet.getAll()) ?? {}
  const sortingFunc = {
    level: (ck) => Character.getLevel(CharacterDatabase.get(ck)?.levelKey),
    rarity: (ck) => allCharacterSheets[ck]?.star
  }
  useEffect(() => {
    const save = { charIdToEdit, sortBy, elementalFilter, weaponFilter }
    saveToLocalStorage("CharacterDisplay.state", save)
  }, [charIdToEdit, sortBy, elementalFilter, weaponFilter])
  const deleteCharacter = useCallback(async id => {
    const chararcterSheet = await CharacterSheet.get(id)
    if (!window.confirm(`Are you sure you want to remove ${chararcterSheet?.name}?`)) return
    Character.remove(id)
    if (charIdToEdit === id)
      setcharIdToEdit("")
  }, [charIdToEdit, setcharIdToEdit])

  const editCharacter = useCallback(id => {
    setcharIdToEdit(id)
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 500);
  }, [setcharIdToEdit, scrollRef])

  const cancelEditCharacter = useCallback(() => {
    setcharIdToEdit("")
    setnewCharacter(false)
  }, [setcharIdToEdit])

  const charKeyList = CharacterDatabase.getCharacterKeyList().filter(cKey => {
    if (elementalFilter && elementalFilter !== allCharacterSheets[cKey]?.elementKey) return false
    if (weaponFilter && weaponFilter !== allCharacterSheets[cKey]?.weaponTypeKey) return false
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
  const showEditor = Boolean(charIdToEdit || newCharacter)
  return <Container ref={scrollRef} className="mt-2">
    <InfoComponent
      pageKey="characterPage"
      modalTitle="Character Management Page Guide"
      text={["Every character will be tested with in-game numbers for maximum accuracy.",
        "You can see the details of the calculations of every number.",
        "You need to manually enable auto infusion for characters like Choungyun or Noelle.",
        "You can change character constellations in both \"Character\" tab and in \"Talents\" tab.",
        "Modified character Stats show up in yellow."] as any}
    >
      <CharacterDisplayInfo />
    </InfoComponent>
    {/* editor/character detail display */}
    {showEditor ? <Row className="mt-2"><Col>
      <React.Suspense fallback={<Card bg="darkcontent" text={"lightfont" as any} >
        <Card.Body><h3 className="text-center">Loading... <Spinner animation="border" variant="primary" /></h3></Card.Body>
      </Card>}>
        <CharacterDisplayCard
          character={undefined}
          newBuild={undefined}
          tabName={undefined}
          editable
          setCharacterKey={editCharacter}
          characterKey={charIdToEdit}
          onClose={cancelEditCharacter}
          footer={<CharDisplayFooter onClose={cancelEditCharacter} characterKey={charIdToEdit} />}
        />
      </React.Suspense>
    </Col></Row> : null}
    <Card bg="darkcontent" text={"lightfont" as any} className="mt-2">
      <Card.Body className="p-2">
        <Row>
          <Col xs="auto">
            <ButtonGroup>
              {allElements.map(eleKey =>
                <Button key={eleKey} variant={(!elementalFilter || elementalFilter === eleKey) ? "success" : "primary"} className="py-1 px-2" onClick={() => elementalFilterDispatch(eleKey)} ><h4 className="mb-0"><Image src={Assets.elements?.[eleKey]} className="inline-icon" /></h4></Button>)}
            </ButtonGroup>
          </Col>
          <Col>
            <ButtonGroup >
              {Weapon.getWeaponTypeKeys().map(weaponType =>
                <Button key={weaponType} variant={(!weaponFilter || weaponFilter === weaponType) ? "success" : "primary"} className="py-1 px-2" onClick={() => weaponFilterDispatch(weaponType)}><h4 className="mb-0"><Image src={Assets.weaponTypes?.[weaponType]} className="inline-icon" /></h4></Button>)}
            </ButtonGroup>
          </Col>
          <Col xs="auto">
            <span>Sort by: </span>
            <ToggleButtonGroup type="radio" name="level" value={sortBy} onChange={setsortBy}>
              {Object.entries(toggle).map(([key, text]) =>
                <ToggleButton key={key} value={key} variant={sortBy === key ? "success" : "primary"}>{text}</ToggleButton>)}
            </ToggleButtonGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
    <Row className="mt-2">
      {!showEditor && <Col lg={4} md={6} className="mb-2">
        <Card className="h-100" bg="darkcontent" text={"lightfont" as any}>
          <Card.Header className="pr-2">
            <span>Add New Character</span>
          </Card.Header>
          <Card.Body className="d-flex flex-column justify-content-center">
            <Row className="d-flex flex-row justify-content-center">
              <Col xs="auto">
                <Button onClick={() => setnewCharacter(true)}>
                  <h1><FontAwesomeIcon icon={faPlus} className="fa-fw" /></h1>
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>}
      {charKeyList.map(charKey =>
        <Col key={charKey} lg={4} md={6} className="mb-2">
          <CharacterCard
            header={undefined}
            cardClassName="h-100"
            characterKey={charKey}
            onDelete={deleteCharacter}
            onEdit={editCharacter}
            footer
          />
        </Col>)}
    </Row>
  </Container>
}
function CharDisplayFooter({ onClose, characterKey }) {
  return <Row>
    <Col>
      <Button variant="info" as={Link} to={{ pathname: "/flex", characterKey } as any}><FontAwesomeIcon icon={faLink} /> Share Character</Button>
    </Col>
    <Col xs="auto">
      <Button variant="danger" onClick={onClose}>Close</Button>
    </Col>
  </Row>
}