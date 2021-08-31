import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import i18next from 'i18next';
import React, { lazy, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Image, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactGA from 'react-ga';
import Assets from '../Assets/Assets';
import { database } from '../Database/Database';
import { dbStorage } from '../Database/DBStorage';
import { allWeaponTypeKeys, CharacterKey } from '../Types/consts';
import { useForceUpdate, usePromise } from '../Util/ReactUtil';
import WeaponCard from './WeaponCard';
import WeaponSheet from './WeaponSheet';
// const InfoDisplay = React.lazy(() => import('./InfoDisplay'));

//lazy load the character display
const WeaponDisplayCard = lazy(() => import('./WeaponDisplayCard'))
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

export default function WeaponDisplay(props) {
  const [weaponIdToEdit, setWeaponIdToEdit] = useState("" as CharacterKey | "")
  const [sortBy, setsortBy] = useState(() => Object.keys(toggle)[0])
  const [weaponFilter, weaponFilterDispatch] = useReducer(filterReducer, "")
  const [newCharacter, setnewCharacter] = useState(false)
  const [, forceUpdate] = useForceUpdate()
  const scrollRef = useRef(null as any)
  useEffect(() => {
    ReactGA.pageview('/weapon')
    const saved = dbStorage.get("WeaponDisplay.state")
    if (saved) {
      const { charIdToEdit, sortBy, weaponFilter } = saved
      setWeaponIdToEdit(charIdToEdit)
      setsortBy(sortBy)
      allWeaponTypeKeys.includes(weaponFilter) && weaponFilterDispatch(weaponFilter)
    }
    return database.followAnyWeapon(forceUpdate)
  }, [forceUpdate])
  const allWeaponSheets = usePromise(WeaponSheet.getAll(), []) ?? {}
  const sortingFunc = {
    level: (wKey) => database._getWeapon(wKey)?.level ?? 0,
    rarity: (wKey) => allWeaponSheets[database._getWeapon(wKey)?.key as any]?.star
  }
  useEffect(() => {
    const save = { charIdToEdit: weaponIdToEdit, sortBy, weaponFilter }
    dbStorage.set("WeaponDisplay.state", save)
  }, [weaponIdToEdit, sortBy, weaponFilter])
  const deleteWeapon = useCallback(async (key) => {
    const weapon = database._getWeapon(key)
    if (!weapon) return
    const name = i18next.t(`weapon_${weapon.key}_gen:name`)

    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return
    database.removeWeapon(key)
    if (weaponIdToEdit === key)
      setWeaponIdToEdit("")
  }, [weaponIdToEdit, setWeaponIdToEdit])

  const editCharacter = useCallback(key => {
    setWeaponIdToEdit(key)
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 500);
  }, [setWeaponIdToEdit, scrollRef])

  const cancelEditCharacter = useCallback(() => {
    setWeaponIdToEdit("")
    setnewCharacter(false)
  }, [setWeaponIdToEdit])

  const weaponIdList = database.weapons.keys.filter(wKey => {
    const dbWeapon = database._getWeapon(wKey)
    if (!dbWeapon) return false
    if (weaponFilter && weaponFilter !== allWeaponSheets[dbWeapon.key]?.weaponType) return false
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
  const showEditor = Boolean(weaponIdToEdit || newCharacter)
  return <Container ref={scrollRef} className="mt-2">
    {/* <InfoComponent
      pageKey="characterPage"
      modalTitle="Character Management Page Guide"
      text={["Every character will be tested with in-game numbers for maximum accuracy.",
        "You can see the details of the calculations of every number.",
        "You need to manually enable auto infusion for characters like Choungyun or Noelle.",
        "You can change character constellations in both \"Character\" tab and in \"Talents\" tab.",
        "Modified character Stats show up in yellow."]}
    >
      <InfoDisplay />
    </InfoComponent> */}
    {/* editor/character detail display */}
    {showEditor ? <Row className="mt-2"><Col>
      <WeaponDisplayCard
        weaponId={weaponIdToEdit}
        // onDelete={deleteWeapon}
        editable
        onClose={cancelEditCharacter}
      />
    </Col></Row> : null}
    <Card bg="darkcontent" text={"lightfont" as any} className="mt-2">
      <Card.Body className="p-2">
        <Row>
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
      {!showEditor && <Col lg={4} md={6} className="mb-2">
        <Card className="h-100" bg="darkcontent" text={"lightfont" as any}>
          <Card.Header className="pr-2">
            <span>Add New Weapon</span>
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
      {weaponIdList.map(weaponId =>
        <Col key={weaponId} lg={4} md={6} className="mb-2">
          <WeaponCard
            weaponId={weaponId}
            // header={undefined}
            cardClassName="h-100"
            // characterKey={charKey}
            onDelete={deleteWeapon}
            onEdit={editCharacter}
            onClick={editCharacter}
            footer
            editable
          />
        </Col>)}
    </Row>
  </Container>
}