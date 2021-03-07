import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Badge, ButtonGroup, Dropdown, DropdownButton, Image, Nav, Tab } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import DropdownToggle from 'react-bootstrap/esm/DropdownToggle';
import Row from 'react-bootstrap/Row';
import Artifact from '../Artifact/Artifact';
import { WeaponLevelKeys } from '../Data/WeaponData';
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import { deepClone } from '../Util/Util';
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
    this.state = CharacterDisplayCard.getInitialState()
    const { characterKey } = props
    if (characterKey) {
      const char = CharacterDatabase.get(characterKey) ?? { characterKey, weapon: CharacterDisplayCard.getIntialWeapon(characterKey) }
      this.state = { ...this.state, ...char }
    }
  }

  static initialState = {
    characterKey: "",//the game character this is based off
    levelKey: "L1",//combination of level and ascension
    hitMode: "hit",
    reactionMode: null,
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
      auto: 0,
      skill: 0,
      burst: 0,
    },
    autoInfused: false,
    talentConditionals: [],
    constellation: 0,
    compareAgainstEquipped: false//note: needs to be deleted when saving
  }
  static getIntialWeapon = (characterKey) => {
    let weapon = deepClone(this.initialState.weapon)
    weapon.key = Object.keys(Weapon.getWeaponsOfType(Character.getWeaponTypeKey(characterKey)))[0]
    return weapon
  }

  static getInitialState = () => deepClone(CharacterDisplayCard.initialState)
  //UI will not update if the character is updated in DB. Components will have to call this to update this UI.
  forceUpdateComponent = () => {
    if (this.state.characterKey)
      this.setState(CharacterDatabase.get(this.state.characterKey))
    this.props.forceUpdate ? this.props.forceUpdate() : this.forceUpdate();
  }
  setCharacterKey = (characterKey) => {
    this.props?.setCharacterKey?.(characterKey)
    let state = CharacterDisplayCard.getInitialState()
    let char = CharacterDatabase.get(characterKey)
    if (char) state = { ...state, ...char }
    else state = { ...state, characterKey, weapon: CharacterDisplayCard.getIntialWeapon(characterKey) }
    this.setState(state)
  }

  setLevelKey = (levelKey) =>
    this.setState({ levelKey })

  setOverride = (statKey, value) => this.setState(state => {
    let baseStatOverrides = state.baseStatOverrides
    let baseStatVal = Character.getBaseStatValue(this.state, statKey)
    if (baseStatVal === value) {
      delete baseStatOverrides[statKey]
      return { baseStatOverrides }
    } else {
      baseStatOverrides[statKey] = value
      return { baseStatOverrides }
    }
  })

  setConstellation = (constellation) => this.setState({ constellation })
  componentDidMount() {
    Promise.all([
      Character.getCharacterDataImport(),
      Weapon.getWeaponDataImport(),
      Artifact.getDataImport(),
    ]).then(() => this.forceUpdate())
  }
  componentDidUpdate(prevProps) {
    if (prevProps.characterKey !== this.props.characterKey)
      this.setCharacterKey(this.props.characterKey)
    if (this.props.editable && this.state.characterKey) {
      //save this.state as character to character db.
      const state = deepClone(this.state)
      delete state.compareAgainstEquipped
      CharacterDatabase.updateCharacter(state)
    }
  }
  render() {
    let { footer, newBuild, editable, onClose } = this.props
    let character = this.state
    let { characterKey, levelKey, compareAgainstEquipped } = this.state
    let equippedBuild = Character.calculateBuild(this.state)
    let HeaderIconDisplay = characterKey ? <span >
      <Image src={Character.getThumb(characterKey)} className="thumb-small my-n1 ml-n2" roundedCircle />
      <h6 className="d-inline"> {Character.getName(characterKey)} </h6>
    </span> : <span>Select a Character</span>
    const commonPaneProps = { character, newBuild, equippedBuild: !newBuild || compareAgainstEquipped ? equippedBuild : undefined, editable, setState: u => this.setState(u), setOverride: this.setOverride, forceUpdate: this.forceUpdateComponent }
    // main CharacterDisplayCard
    return (<Card bg="darkcontent" text="lightfont" >
      <Card.Header>
        <Row>
          <Col xs={"auto"} className="mr-auto">
            {/* character selecter/display */}
            {editable ? <ButtonGroup>
              <Dropdown as={ButtonGroup}>
                <DropdownToggle as={Button}>
                  {HeaderIconDisplay}
                </DropdownToggle>
                <Dropdown.Menu as={CustomMenu}>
                  {Character.getAllCharacterKeys().map(charKey =>
                    <Dropdown.Item key={charKey} onClick={() => this.setCharacterKey(charKey)}>
                      <span >
                        <Image src={Character.getThumb(charKey)} className={`thumb-small p-0 m-n1 grad-${Character.getStar(charKey)}star`} thumbnail />
                        <h6 className="d-inline ml-2">{Character.getName(charKey)} </h6>
                      </span>
                    </Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
              <DropdownButton as={ButtonGroup} disabled={!characterKey} title={
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
            </ButtonGroup> : <span>{HeaderIconDisplay} Lvl. {Character.getStatValueWithOverride(this.state, "characterLevel")}</span>}
          </Col>
          {/* Compare against new build toggle */}
          {newBuild ? <Col xs="auto">
            <ButtonGroup>
              <Button variant={compareAgainstEquipped ? "primary" : "success"} disabled={!compareAgainstEquipped} onClick={() => this.setState({ compareAgainstEquipped: false })}>
                <small>Show New artifact Stats</small>
              </Button>
              <Button variant={!compareAgainstEquipped ? "primary" : "success"} disabled={compareAgainstEquipped} onClick={() => this.setState({ compareAgainstEquipped: true })}>
                <small>Compare against equipped artifact</small>
              </Button>
            </ButtonGroup>
          </Col> : null}
          <Col xs="auto" >
            <Button variant="danger" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} /></Button>
          </Col>
        </Row>
      </Card.Header>
      {Boolean(characterKey) && <Card.Body>
        <Tab.Container defaultActiveKey={newBuild ? "newartifacts" : "character"} mountOnEnter={true} unmountOnExit={true}>
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
              <Nav.Link eventKey="talent" disabled={process.env.NODE_ENV !== "development" && !Character.hasTalentPage(characterKey)}>Talents {!Character.hasTalentPage(characterKey) && <Badge variant="warning">WIP</Badge>}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="team" disabled>Team <Badge variant="warning">WIP</Badge></Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="character">
              <CharacterOverviewPane
                setConstellation={this.setConstellation}
                {...commonPaneProps}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="artifacts" >
              <CharacterArtifactPane {...{ ...commonPaneProps, newBuild: undefined, equippedBuild, }} />
            </Tab.Pane>
            {newBuild ? <Tab.Pane eventKey="newartifacts" >
              <CharacterArtifactPane {...commonPaneProps} />
            </Tab.Pane> : null}
            <Tab.Pane eventKey="talent">
              <CharacterTalentPane {...commonPaneProps} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>}
      {footer && <Card.Footer>
        {footer}
      </Card.Footer>}
    </Card>)
  }
}
