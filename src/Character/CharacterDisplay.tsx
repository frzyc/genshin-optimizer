import { faCalculator, faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import i18next from 'i18next';
import React, { lazy, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Image, Row, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import Assets from '../Assets/Assets';
import InfoComponent from '../Components/InfoComponent';
import { uncoloredEleIcons } from '../Components/StatIcon';
import { DatabaseContext } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { allElements, allWeaponTypeKeys, CharacterKey } from '../Types/consts';
import { defaultInitialWeapon } from '../Weapon/WeaponUtil';
import CharacterCard from './CharacterCard';
import { CharacterSelectionModal } from './CharacterSelection';
import CharacterSheet from './CharacterSheet';
import { initialCharacter } from './CharacterUtil';

const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

//lazy load the character display
const CharacterDisplayCard = lazy(() => import('./CharacterDisplayCard'))
const toggle = {
  level: "Level",
  rarity: "Rarity",
  name: "Name"
} as const

function filterReducer(oldFilter, newFilter) {
  if (newFilter === oldFilter)
    return ""
  return newFilter
}

export default function CharacterDisplay(props) {
  const database = useContext(DatabaseContext)
  const [characterKeyToEdit, setCharacterKeyToEdit] = useState("" as CharacterKey | "")
  const [sortBy, setsortBy] = useState(() => Object.keys(toggle)[0])
  const [elementalFilter, elementalFilterDispatch] = useReducer(filterReducer, "")
  const [weaponFilter, weaponFilterDispatch] = useReducer(filterReducer, "")
  const [newCharacter, setnewCharacter] = useState(false)
  const [, forceUpdate] = useForceUpdate()
  const scrollRef = useRef(null as any)
  useEffect(() => {
    ReactGA.pageview('/character')
    const saved = dbStorage.get("CharacterDisplay.state")
    if (saved) {
      const { characterKeyToEdit, sortBy, elementalFilter, weaponFilter } = saved
      characterKeyToEdit && setCharacterKeyToEdit(characterKeyToEdit)
      sortBy && setsortBy(sortBy)
      allElements.includes(elementalFilter) && elementalFilterDispatch(elementalFilter)
      allWeaponTypeKeys.includes(weaponFilter) && weaponFilterDispatch(weaponFilter)
    }
    return database.followAnyChar(forceUpdate)
  }, [forceUpdate, database])
  const allCharacterSheets = usePromise(CharacterSheet.getAll(), []) ?? {}
  const sortingFunc = {
    level: (ck) => database._getChar(ck)?.level ?? 0,
    rarity: (ck) => allCharacterSheets[ck]?.star
  }
  useEffect(() => {
    const save = { characterKeyToEdit, sortBy, elementalFilter, weaponFilter }
    dbStorage.set("CharacterDisplay.state", save)
  }, [characterKeyToEdit, sortBy, elementalFilter, weaponFilter])
  const deleteCharacter = useCallback(async (cKey: CharacterKey) => {
    const chararcterSheet = await CharacterSheet.get(cKey)
    let name = chararcterSheet?.name
    //use translated string
    if (typeof name === "object")
      name = i18next.t(`char_${cKey}_gen:name`)

    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return
    database.removeChar(cKey)
    if (characterKeyToEdit === cKey)
      setCharacterKeyToEdit("")
  }, [characterKeyToEdit, setCharacterKeyToEdit, database])

  const editCharacter = useCallback(cKey => {
    if (!database._getChar(cKey))
      (async () => {
        //Create a new character + weapon, with linking.
        const newChar = initialCharacter(cKey)
        database.updateChar(newChar)
        const characterSheet = await CharacterSheet.get(cKey)
        if (!characterSheet) return
        const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
        const weaponId = database.createWeapon(weapon)
        database.setWeaponLocation(weaponId, cKey)
        setCharacterKeyToEdit(cKey)
      })()
    else
      setCharacterKeyToEdit(cKey)
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 500);
  }, [setCharacterKeyToEdit, scrollRef, database])

  const cancelEditCharacter = useCallback(() => {
    setCharacterKeyToEdit("")
    setnewCharacter(false)
  }, [setCharacterKeyToEdit])

  const charKeyList = database._getCharKeys().filter(cKey => {
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
  return <Container ref={scrollRef} className="mt-2">
    <InfoComponent
      pageKey="characterPage"
      modalTitle="Character Management Page Guide"
      text={["Every character will be tested with in-game numbers for maximum accuracy.",
        "You can see the details of the calculations of every number.",
        "You need to manually enable auto infusion for characters like Choungyun or Noelle.",
        "You can change character constellations in both \"Character\" tab and in \"Talents\" tab.",
        "Modified character Stats show up in yellow."]}
    >
      <InfoDisplay />
    </InfoComponent>
    {/* editor/character detail display */}
    {!!characterKeyToEdit ? <Row className="mt-2"><Col>
      <React.Suspense fallback={<Card bg="darkcontent" text={"lightfont" as any} >
        <Card.Body><h3 className="text-center">Loading... <Spinner animation="border" variant="primary" /></h3></Card.Body>
      </Card>}>
        <CharacterDisplayCard
          setCharacterKey={editCharacter}
          characterKey={characterKeyToEdit}
          onClose={cancelEditCharacter}
          footer={<CharDisplayFooter onClose={cancelEditCharacter} characterKey={characterKeyToEdit} />}
        />
      </React.Suspense>
    </Col></Row> : null}
    <Card bg="darkcontent" text={"lightfont" as any} className="mt-2">
      <Card.Body className="p-2">
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
        </Row>
      </Card.Body>
    </Card>
    <Row className="mt-2">
      {!characterKeyToEdit && <Col lg={4} md={6} className="mb-2">
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
                <CharacterSelectionModal show={newCharacter} onHide={() => setnewCharacter(false)} onSelect={editCharacter} />
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
    <Col xs="auto">
    <Button as={Link} to={{
        pathname: "/build",
        characterKey
      } as any}><FontAwesomeIcon icon={faCalculator} /> Generate Builds</Button>
    </Col>
    <Col>
    <Button variant="info" as={Link} to={{ pathname: "/flex", characterKey } as any}><FontAwesomeIcon icon={faLink} /> Share Character</Button>
    </Col>
    <Col xs="auto">
      <Button variant="danger" onClick={onClose}>Close</Button>
    </Col>
  </Row>
}