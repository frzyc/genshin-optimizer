import { faSignature, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Badge, ButtonGroup, Dropdown, DropdownButton, FormControl, Image, InputGroup, Nav, Tab } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import DropdownToggle from 'react-bootstrap/esm/DropdownToggle';
import Row from 'react-bootstrap/Row';
import { WeaponLevelKeys } from '../Data/WeaponData';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import { deepClone, getRandomElementFromArray } from '../Util/Util';
import Weapon from '../Weapon/Weapon';
import Character from './Character';
import CharacterDatabase from './CharacterDatabase';
import CharacterArtifactPane from './CharacterDisplay/CharacterArtifactPane';
import CharacterOverviewPane from './CharacterDisplay/CharacterOverviewPane';
import CharacterTalentPane from './CharacterDisplay/CharacterTalentPane';

const CustomMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    return (
      <div
        ref={ref}
        style={{ style, minWidth: "25rem" }}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Row>
          {React.Children.toArray(children).map((child, i) => <Col key={i} xs={6}>{child}</Col>)}
        </Row>
      </div>
    );
  },
);

export default class CharacterDisplayCard extends React.Component {
  constructor(props) {
    super(props)
    DatabaseInitAndVerify();
    if (props.characterToEdit)
      this.state = props.characterToEdit
    else
      this.state = CharacterDisplayCard.getInitialState()
  }

  static initialState = {
    name: "",
    characterKey: "",//the game character this is based off
    levelKey: "L1",//combination of level and ascension
    overrideLevel: 0,
    equippedArtifacts: {},
    artifactConditionals: [],
    baseStatOverrides: {},//overriding the baseStat
    weapon: {
      key: "",
      levelKey: WeaponLevelKeys[0],
      refineIndex: 0,
      overrideMainVal: 0,
      overrideSubVal: 0,
      conditionalNum: 0,
    },
    talentLevelKeys: {
      autoLevelKey: 0,
      skillLevelKey: 0,
      burstLevelKey: 0,
    },
    constellation: 0,
    compareAgainstEquipped: false//note: needs to be deleted when saving
  }
  static getIntialWeapon = (characterKey) => {
    let weapon = deepClone(this.initialState.weapon)
    weapon.key = Object.keys(Weapon.getWeaponsOfType(Character.getWeaponTypeKey(characterKey)))[0]
    return weapon
  }

  static getInitialState = () => {
    let state = deepClone(CharacterDisplayCard.initialState)
    //set a random character key
    state.characterKey = getRandomElementFromArray(Character.getAllCharacterKeys())
    state.name = getRandomElementFromArray(Character.getTitles(state.characterKey))
    //pick the first weaponType. Should be the 1* weapon, if I organize the db correctly.
    state.weapon = this.getIntialWeapon(state.characterKey);
    return state
  }
  forceUpdateComponent = () => {
    if (this.state.id) {
      this.setState(CharacterDatabase.getCharacter(this.state.id))
    }
    this.props.forceUpdate ? this.props.forceUpdate() : this.forceUpdate();
  }
  setSetState = (val) => this.setState(val)
  setCharacterKey = (characterKey) =>
    this.setState({ characterKey, name: getRandomElementFromArray(Character.getTitles(characterKey)), weapon: CharacterDisplayCard.getIntialWeapon(characterKey) })
  setLevelKey = (levelKey) =>
    this.setState({ levelKey, baseStatOverrides: {} })

  setOverride = (statKey, value) => this.setState(state => {
    let baseStatOverrides = deepClone(state.baseStatOverrides)
    let baseStatVal = Character.getBaseStatValue(this.state.characterKey, this.state.levelKey, statKey)
    if (baseStatVal === value) {
      delete baseStatOverrides[statKey]
      return { baseStatOverrides }
    } else {
      baseStatOverrides[statKey] = value
      return { baseStatOverrides }
    }
  })
  setOverridelevel = (level) => this.setState(state => {
    let baseLevel = Character.getLevel(state.levelKey)
    if (level === baseLevel)
      return { overrideLevel: 0 }
    else return { overrideLevel: level }
  })

  setConstellation = (constellation) => this.setState({ constellation })

  componentDidUpdate() {
    if (this.props.characterToEdit && this.state.id !== this.props.characterToEdit.id)
      this.setState(this.props.characterToEdit)
    if (this.props.editable) {
      //save this.state as character to character db.
      let state = deepClone(this.state)
      delete state.compareAgainstEquipped
      if (this.state.id) {
        CharacterDatabase.updateCharacter(state)
      } else {
        let id = CharacterDatabase.addCharacter(state)
        this.setState({ id })
      }
    }
  }
  render() {
    let { footer, newBuild, editable } = this.props
    let character = this.state
    let { characterKey, levelKey, compareAgainstEquipped } = this.state
    let equippedBuild = Character.calculateBuild(this.state)
    let HeaderIconDisplay = <span >
      <Image src={Character.getThumb(characterKey)} className="thumb-small my-n1 ml-n2" roundedCircle />
      <h6 className="d-inline"> {Character.getName(characterKey)} </h6>
    </span>
    // main CharacterDisplayCard
    return (<Card bg="darkcontent" text="lightfont" >
      <Card.Header>
        <Row>
          <Col xs={"auto"}>
            {/* character selecter/display */}
            {editable ? <ButtonGroup>
              <Dropdown>
                <DropdownToggle as={Button}>
                  {HeaderIconDisplay}
                </DropdownToggle>
                <Dropdown.Menu as={CustomMenu}>
                  {Character.getAllCharacterKeys().map(charKey =>
                    <Dropdown.Item key={charKey} onClick={() => this.setCharacterKey(charKey)}>
                      <span >
                        <Image src={Character.getThumb(charKey)} className="thumb-small my-n1" roundedCircle />
                        <h6 className="d-inline">{Character.getName(charKey)} </h6>
                      </span>
                    </Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
              <DropdownButton as={ButtonGroup} title={
                <h6 className="d-inline">{Character.getlevelNames(levelKey)} </h6>
              }>
                <Dropdown.ItemText>
                  <span>Select Base Stat Template</span>
                </Dropdown.ItemText>
                {Character.getlevelKeys().map(lvlKey =>
                  <Dropdown.Item key={lvlKey} onClick={() => this.setLevelKey(lvlKey)}>
                    <h6 >{Character.getlevelNames(lvlKey)} </h6>
                  </Dropdown.Item>)}
              </DropdownButton>
            </ButtonGroup> : <span>{HeaderIconDisplay} Lvl. {Character.getLevelWithOverride(this.state)}</span>}
          </Col>
          {/* Name editor/display */}
          <Col className="pl-0 pr-0">
            {editable ? <InputGroup >
              <InputGroup.Prepend>
                <InputGroup.Text><FontAwesomeIcon icon={faSignature} /> Name</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl placeholder="Name"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
            </InputGroup> :
              <Card.Title className="mb-0 align-self-center"><span>{this.state.name}</span></Card.Title>}
          </Col>
          {/* Compare against new build toggle */}
          {newBuild ? <Col xs="auto">
            <ButtonGroup>
              <Button variant="success" disabled={!compareAgainstEquipped} onClick={() => this.setState({ compareAgainstEquipped: false })}>
                <small>Show New artiact Stats</small>
              </Button>
              <Button variant="info" disabled={compareAgainstEquipped} onClick={() => this.setState({ compareAgainstEquipped: true })}>
                <small>Compare against equipped artifact</small>
              </Button>
            </ButtonGroup>
          </Col> : null}
          <Col xs="auto" >
            <Button variant="danger" onClick={this.props?.onClose}>
              <FontAwesomeIcon icon={faTimes} /></Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Tab.Container defaultActiveKey={newBuild ? "newartifacts" : "character"}>
          <Nav variant="pills" className="mb-2 ml-2">
            <Nav.Item >
              <Nav.Link eventKey="character">Character</Nav.Link>
            </Nav.Item>
            {newBuild ? <Nav.Item>
              <Nav.Link eventKey="newartifacts">New Artifacts</Nav.Link>
            </Nav.Item> : null}
            <Nav.Item>
              <Nav.Link eventKey="artifacts">{newBuild ? "Current Artifacts" : "Artifacts"}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="talent" disabled={process.env.NODE_ENV !== "development" && (Character.getCDataObj(characterKey)?.talent?.skill?.name || "TEMPLATE") === "TEMPLATE"}>Talents {(Character.getCDataObj(characterKey)?.talent?.skill?.name || "TEMPLATE") === "TEMPLATE" && <Badge variant="warning">WIP</Badge>}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="team" disabled>Team <Badge variant="warning">WIP</Badge></Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="character">
              <CharacterOverviewPane
                setState={this.setSetState}
                setOverride={this.setOverride}
                setOverridelevel={this.setOverridelevel}
                setConstellation={this.setConstellation}
                {...{ character, editable, equippedBuild, newBuild }}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="artifacts" >
              <CharacterArtifactPane {...{ character, equippedBuild, editable }} setState={this.setSetState} />
            </Tab.Pane>
            {newBuild ? <Tab.Pane eventKey="newartifacts" >
              <CharacterArtifactPane {...{ character, newBuild, equippedBuild, editable, forceUpdate: this.forceUpdateComponent }} />
            </Tab.Pane> : null}
            <Tab.Pane eventKey="talent">
              <CharacterTalentPane {...{ character, newBuild, equippedBuild, editable }} setState={this.setSetState} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
      {footer && <Card.Footer>
        {footer}
      </Card.Footer>}
    </Card>)
  }
}
