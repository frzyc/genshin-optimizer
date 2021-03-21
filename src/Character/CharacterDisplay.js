import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { lazy } from 'react';
import { Button, Card, Col, Container, Image, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import ReactGA from 'react-ga';
import Assets from '../Assets/Assets';
import { DatabaseInitAndVerify } from '../Database/DatabaseUtil';
import { loadFromLocalStorage, saveToLocalStorage } from '../Util/Util';
import Weapon from '../Weapon/Weapon';
import Character from './Character';
import CharacterCard from './CharacterCard';
import CharacterDatabase from '../Database/CharacterDatabase';

//lazy load the character display
const CharacterDisplayCardPromise = import('../Character/CharacterDisplayCard');
const CharacterDisplayCard = lazy(() => CharacterDisplayCardPromise)
const toggle = {
  level: "Level",
  rarity: "Rarity",
  name: "Name"
}
const sortingFunc = {
  level: (ck) => Character.getLevel(CharacterDatabase.get(ck).levelKey),
  rarity: (ck) => Character.getStar(ck)
}
export default class CharacterDisplay extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    this.state = {
      charIdToEdit: "",
      showEditor: false,
      sortBy: Object.keys(toggle)[0],
      elementalFilter: Character.getElementalKeysWithoutPhysical(),
      weaponFilter: Weapon.getWeaponTypeKeys(),
    }
    const saved = loadFromLocalStorage("CharacterDisplay.state")
    if (saved)
      this.state = { ...this.state, ...saved }
    ReactGA.pageview('/character')
  }

  deleteCharacter = (id) => {
    Character.remove(id)
    this.forceUpdate()
  }

  editCharacter = (id) =>
    this.setState({ charIdToEdit: id, showEditor: true },
      () => this.scrollRef.current.scrollIntoView({ behavior: "smooth" }))

  cancelEditCharacter = () =>
    this.setState({ charIdToEdit: null, showEditor: false })

  componentDidMount() {
    this.scrollRef = React.createRef()
    Promise.all([
      Character.getCharacterDataImport(),
    ]).then(() => this.forceUpdate())
  }
  componentDidUpdate() {
    saveToLocalStorage("CharacterDisplay.state", this.state)
  }
  render() {
    const { showEditor, elementalFilter, weaponFilter, sortBy } = this.state
    const charKeyList = CharacterDatabase.getCharacterKeyList().filter(cKey => {
      if (!elementalFilter.includes(Character.getElementalKey(cKey))) return false
      if (!weaponFilter.includes(Character.getWeaponTypeKey(cKey))) return false
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
    return (<Container ref={this.scrollRef}>
      {/* editor/character detail display */}
      {showEditor ? <Row className="mt-2"><Col>
        <React.Suspense fallback={<span>Loading...</span>}>
          <CharacterDisplayCard editable
            setCharacterKey={cKey => this.editCharacter(cKey)}
            characterKey={this.state.charIdToEdit}
            onClose={this.cancelEditCharacter}
            footer={<Button variant="danger" onClick={this.cancelEditCharacter}>Close</Button>}
          />
        </React.Suspense>
      </Col></Row> : null}
      <Card bg="darkcontent" text="lightfont" className="mt-2">
        <Card.Body className="p-2">
          <Row>
            <Col xs="auto">
              <ToggleButtonGroup type="checkbox" defaultValue={elementalFilter} onChange={v => this.setState({ elementalFilter: v })}>
                {Character.getElementalKeysWithoutPhysical().map(eleKey =>
                  <ToggleButton key={eleKey} value={eleKey} variant={elementalFilter.includes(eleKey) ? "success" : "primary"} className="py-1 px-2"><h4 className="mb-0"><Image src={Assets.elements?.[eleKey]} className="inline-icon" /></h4></ToggleButton>)}
              </ToggleButtonGroup>
            </Col>
            <Col>
              <ToggleButtonGroup type="checkbox" defaultValue={weaponFilter} onChange={v => this.setState({ weaponFilter: v })}>
                {Weapon.getWeaponTypeKeys().map(weaponType =>
                  <ToggleButton key={weaponType} value={weaponType} variant={weaponFilter.includes(weaponType) ? "success" : "primary"} className="py-1 px-2"><h4 className="mb-0"><Image src={Assets.weaponTypes?.[weaponType]} className="inline-icon" /></h4></ToggleButton>)}
              </ToggleButtonGroup>
            </Col>
            <Col xs="auto">
              <span>Sort by: </span>
              <ToggleButtonGroup type="radio" name="level" defaultValue={this.state.sortBy} onChange={v => this.setState({ sortBy: v })}>
                {Object.entries(toggle).map(([key, text]) =>
                  <ToggleButton key={key} value={key} variant={this.state.sortBy === key ? "success" : "primary"}>{text}</ToggleButton>)}
              </ToggleButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="mt-2">
        {showEditor ? null : <Col lg={4} md={6} className="mb-2">
          <Card className="h-100" bg="darkcontent" text="lightfont">
            <Card.Header className="pr-2">
              <span>Add New Character</span>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-center">
              <Row className="d-flex flex-row justify-content-center">
                <Col xs="auto">
                  <Button onClick={() => this.editCharacter("")}>
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
              cardClassName="h-100"
              characterKey={charKey}
              onDelete={() => this.deleteCharacter(charKey)}
              onEdit={() => this.editCharacter(charKey)}
            />
          </Col>
        )}
      </Row>
    </Container>)
  }
}