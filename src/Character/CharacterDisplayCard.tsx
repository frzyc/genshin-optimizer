import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Alert, Badge, ButtonGroup, Dropdown, DropdownButton, Image, Nav, Tab } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import WIPComponent from '../Components/WIPComponent';
import { WeaponLevelKeys } from '../Data/WeaponData';
import CharacterDatabase from '../Database/CharacterDatabase';
import { ICharacter } from '../Types/character';
import { allCharacterKeys, allSlotKeys } from '../Types/consts';
import ICalculatedStats from '../Types/ICalculatedStats';
import { usePromise } from '../Util/ReactUtil';
import { deepClone } from '../Util/Util';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterArtifactPane from './CharacterDisplay/CharacterArtifactPane';
import CharacterOverviewPane from './CharacterDisplay/CharacterOverviewPane';
import CharacterTalentPane from './CharacterDisplay/CharacterTalentPane';
import DamageOptionsAndCalculation from './CharacterDisplay/DamageOptionsAndCalculation';
import CharacterSheet from './CharacterSheet';

export const compareAgainstEquippedContext = createContext(undefined)

const CustomMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }: any, ref: any) => {
    return (
      <div
        ref={ref}
        style={{ style, minWidth: "25rem" } as any}
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
const initialCharacter = (characterKey): ICharacter => ({
  characterKey: characterKey ?? "",//the game character this is based off
  levelKey: "L1",//combination of level and ascension
  hitMode: "avgHit",
  reactionMode: null,
  equippedArtifacts: Object.fromEntries(allSlotKeys.map(sKey => [sKey, ""])),
  conditionalValues: {},
  baseStatOverrides: {},//overriding the baseStat
  weapon: {
    key: "",
    levelKey: WeaponLevelKeys[0],
    refineIndex: 0,
    overrideMainVal: 0,
    overrideSubVal: 0,
  },
  talentLevelKeys: {
    auto: 0,
    skill: 0,
    burst: 0,
  },
  infusionAura: "",
  constellation: 0,
  buildSettings: {}//use to reset when changing to a new character, so it would not copy from old character.
})

type characterReducerOverwrite = {
  type: "overwrite",
  character: ICharacter
}
type characterReducerFromDB = {
  type: "fromDB",
}
type characterReducerStatOverride = {
  type: "statOverride",
  statKey: string
  value: number | string
  characterSheet: CharacterSheet
  weaponSheet: WeaponSheet
}
type characterReducerOverwriteAction = characterReducerOverwrite | characterReducerFromDB | characterReducerStatOverride | Partial<ICharacter>

function characterReducer(state: ICharacter, action: characterReducerOverwriteAction) {
  if ("type" in action) switch (action?.type) {
    case "overwrite":
      return { ...state, ...action.character }
    case "fromDB"://for equipping artifacts, that makes the changes in DB instead of in state.
      return { ...state, ...CharacterDatabase.get(state.characterKey) ?? {} }
    case "statOverride": {
      const { statKey, value, characterSheet, weaponSheet, } = action
      const baseStatOverrides = state.baseStatOverrides
      const baseStatVal = Character.getBaseStatValue(state, characterSheet, weaponSheet, statKey)
      if (baseStatVal === value)
        delete baseStatOverrides[statKey]
      else
        baseStatOverrides[statKey] = value
      return { ...state, baseStatOverrides }
    }
    default:
      break;
  }
  return { ...state, ...action }
}
type CharacterDisplayCardProps = {
  characterKey?: string,
  character?: ICharacter,
  setCharacterKey?: (any) => void
  footer?: JSX.Element
  newBuild?: ICalculatedStats,
  editable?: boolean,
  onClose?: (any) => void,
  tabName?: string
}
export default function CharacterDisplayCard({ characterKey: propCharacterKey, character: propCharacter, setCharacterKey: propSetCharacterKey, footer, newBuild: propNewBuild, editable = false, onClose, tabName }: CharacterDisplayCardProps) {
  const [character, characterDispatch] = useReducer(characterReducer, initialCharacter(propCharacterKey))
  const [compareAgainstEquipped, setcompareAgainstEquipped] = useState(false)
  const firstUpdate = useRef(true)
  useEffect(() => {
    if (!propCharacterKey) return
    const char = { ...initialCharacter(propCharacterKey), ...CharacterDatabase.get(propCharacterKey) ?? {} }
    characterDispatch({ type: "overwrite", character: char })
  }, [propCharacterKey])
  useEffect(() => {
    if (!propCharacter) return
    const char = { ...initialCharacter(propCharacter.characterKey), ...propCharacter }
    characterDispatch({ type: "overwrite", character: char })
  }, [propCharacter])

  useEffect(() => {
    //skip saving on the first update, since those updates are from loading from DB
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    //save character to DB
    editable && CharacterDatabase.update(character)
  }, [character, editable])

  const characterKey = propCharacter?.characterKey ?? character.characterKey
  const characterSheet = usePromise(CharacterSheet.get(characterKey))
  const weaponSheets = usePromise(WeaponSheet.getAll())
  useEffect(() => {
    if (weaponSheets && characterSheet && !character.weapon.key) {
      character.weapon.key = Object.keys(WeaponSheet.getWeaponsOfType(weaponSheets, characterSheet.weaponTypeKey))[0] ?? ""
      characterDispatch({ weapon: character.weapon })
    }
  }, [characterSheet, weaponSheets, character.weapon])

  const weaponSheet = usePromise(WeaponSheet.get(character.weapon.key))
  const artifactSheets = usePromise(ArtifactSheet.getAll())

  const setCharacterKey = useCallback(
    newCKey => {
      let state = initialCharacter(newCKey)
      const char = CharacterDatabase.get(newCKey)
      if (char) state = { ...state, ...char }
      characterDispatch({ type: "overwrite", character: state })
      if (newCKey !== characterKey)
        propSetCharacterKey?.(newCKey)
    }, [characterKey, characterDispatch, propSetCharacterKey])

  const newBuild = useMemo(() => {
    if (!propNewBuild) return
    const newBuild = propNewBuild && deepClone(propNewBuild);
    (newBuild as any).hitMode = character.hitMode;
    (newBuild as any).reactionMode = character.reactionMode;
    return newBuild
  }, [propNewBuild, character.hitMode, character.reactionMode])

  const { levelKey, artifacts: flexArts } = character

  const mainStatAssumptionLevel = newBuild?.mainStatAssumptionLevel ?? 0
  const equippedBuild = useMemo(() => characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, characterSheet, weaponSheet, artifactSheets, mainStatAssumptionLevel), [character, characterSheet, weaponSheet, artifactSheets, mainStatAssumptionLevel])

  const commonPaneProps = { character, newBuild, equippedBuild: (!newBuild || compareAgainstEquipped) ? equippedBuild : undefined, editable, characterDispatch, compareAgainstEquipped }
  if (flexArts) (commonPaneProps as any).artifacts = flexArts//from flex
  // main CharacterDisplayCard
  const DamageOptionsAndCalculationEle = characterSheet?.hasTalentPage && weaponSheet && <DamageOptionsAndCalculation {...{ characterSheet, weaponSheet, character, characterDispatch, newBuild, equippedBuild }} className="mb-2" />
  return (<Card bg="darkcontent" text={"lightfont" as any} >
    <Card.Header>
      <Row>
        <Col xs={"auto"} className="mr-auto">
          {/* character selecter/display */}
          <CharSelectDropdown characterSheet={characterSheet} character={character} weaponSheet={weaponSheet} editable={editable} levelKey={levelKey} characterDispatch={characterDispatch} setCharacterKey={setCharacterKey} />
        </Col>
        {Boolean(mainStatAssumptionLevel) && <Col xs="auto"><Alert className="mb-0 py-1 h-100" variant="orange" ><b>Assume Main Stats are Level {mainStatAssumptionLevel}</b></Alert></Col>}
        {/* Compare against new build toggle */}
        {newBuild ? <Col xs="auto">
          <ButtonGroup>
            <Button variant={compareAgainstEquipped ? "primary" : "success"} disabled={!compareAgainstEquipped} onClick={() => setcompareAgainstEquipped(false)}>
              <small>Show New artifact Stats</small>
            </Button>
            <Button variant={!compareAgainstEquipped ? "primary" : "success"} disabled={compareAgainstEquipped} onClick={() => setcompareAgainstEquipped(true)}>
              <small>Compare against equipped artifact</small>
            </Button>
          </ButtonGroup>
        </Col> : null}
        {Boolean(onClose) && <Col xs="auto" >
          <Button variant="danger" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /></Button>
        </Col>}
      </Row>
    </Card.Header>
    {characterKey && characterSheet && weaponSheet && <Card.Body>
      <compareAgainstEquippedContext.Provider value={compareAgainstEquipped as any}>
        <Tab.Container defaultActiveKey={tabName ? tabName : (newBuild ? "newartifacts" : "character")} mountOnEnter={true} unmountOnExit={true}>
          <Nav variant="pills" className="mb-2 mx-0" fill>
            <Nav.Item >
              <Nav.Link eventKey="character"><h5 className="mb-0">Character</h5></Nav.Link>
            </Nav.Item>
            {newBuild ? <Nav.Item>
              <Nav.Link eventKey="newartifacts"><h5 className="mb-0">New Artifacts</h5></Nav.Link>
            </Nav.Item> : null}
            <Nav.Item>
              <Nav.Link eventKey="artifacts"><h5 className="mb-0">{newBuild ? "Current Artifacts" : "Artifacts"}</h5></Nav.Link>
            </Nav.Item>
            <Nav.Item>
              {process.env.NODE_ENV !== "development" && !characterSheet.hasTalentPage ?
                <WIPComponent>
                  <Nav.Link eventKey="talent" disabled><h5 className="mb-0">Talents</h5> <Badge variant="warning">WIP</Badge></Nav.Link>
                </WIPComponent> :
                <Nav.Link eventKey="talent"><h5 className="mb-0">Talents</h5></Nav.Link>
              }
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="character">
              {DamageOptionsAndCalculationEle}
              <CharacterOverviewPane characterSheet={characterSheet} weaponSheet={weaponSheet} {...commonPaneProps} />
            </Tab.Pane>
            <Tab.Pane eventKey="artifacts" >
              {DamageOptionsAndCalculationEle}
              <CharacterArtifactPane characterSheet={characterSheet} weaponSheet={weaponSheet} artifacts={undefined} {...{ ...commonPaneProps, newBuild: undefined, equippedBuild, }} />
            </Tab.Pane>
            {newBuild ? <Tab.Pane eventKey="newartifacts" >
              {DamageOptionsAndCalculationEle}
              <CharacterArtifactPane characterSheet={characterSheet} weaponSheet={weaponSheet} artifacts={undefined} {...commonPaneProps} />
            </Tab.Pane> : null}
            <Tab.Pane eventKey="talent">
              {DamageOptionsAndCalculationEle}
              <CharacterTalentPane characterSheet={characterSheet} {...commonPaneProps} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </compareAgainstEquippedContext.Provider>
    </Card.Body>}
    {footer && <Card.Footer>
      {footer}
    </Card.Footer>}
  </Card>)
}
type CharSelectDropdownProps = {
  characterSheet?: CharacterSheet,
  weaponSheet?: WeaponSheet,
  character: ICharacter
  editable: boolean
  levelKey: string
  characterDispatch: (any) => void
  setCharacterKey: (any) => void
}
function CharSelectDropdown({ characterSheet, weaponSheet, character, editable, levelKey, characterDispatch, setCharacterKey }: CharSelectDropdownProps) {
  const HeaderIconDisplay = characterSheet ? <span >
    <Image src={characterSheet.thumbImg} className="thumb-small my-n1 ml-n2" roundedCircle />
    <h6 className="d-inline"> {characterSheet.name} </h6>
  </span> : <span>Select a Character</span>
  return <>{editable ? <ButtonGroup>
    <Dropdown as={ButtonGroup}>
      <Dropdown.Toggle as={Button}>
        {HeaderIconDisplay}
      </Dropdown.Toggle>
      <Dropdown.Menu as={CustomMenu}>
        {[...allCharacterKeys].sort().map(charKey => <CharDropdownItem key={charKey} characterKey={charKey} setCharacterKey={setCharacterKey} />)}
      </Dropdown.Menu>
    </Dropdown>
    <DropdownButton as={ButtonGroup} disabled={!characterSheet} title={
      <h6 className="d-inline">Stats Template: {Character.getlevelTemplateName(levelKey)} </h6>
    }>
      <Dropdown.ItemText>
        <span>Select Base Stat Template</span>
      </Dropdown.ItemText>
      {Character.getlevelKeys().map(lvlKey =>
        <Dropdown.Item key={lvlKey} onClick={() => characterDispatch({ levelKey: lvlKey })}>
          <h6 >{Character.getlevelTemplateName(lvlKey)} </h6>
        </Dropdown.Item>)}
    </DropdownButton>
  </ButtonGroup> : <span>{HeaderIconDisplay} {characterSheet && weaponSheet && Character.getLevelString(character, characterSheet, weaponSheet)}</span>}</>
}
function CharDropdownItem({ characterKey, setCharacterKey }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey))
  if (!characterSheet) return null
  return <Dropdown.Item onClick={() => setCharacterKey(characterKey)}>
    <span >
      <Image src={characterSheet.thumbImg} className={`thumb-small p-0 m-n1 grad-${characterSheet.star}star`} thumbnail />
      <h6 className="d-inline ml-2">{characterSheet.name} </h6>
    </span>
  </Dropdown.Item>
}