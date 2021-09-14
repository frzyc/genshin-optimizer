import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, ButtonGroup, Dropdown, Image, InputGroup, Nav, Tab } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import Row from 'react-bootstrap/Row';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import { buildContext } from '../Build/Build';
import CustomFormControl from '../Components/CustomFormControl';
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from '../Data/CharacterData';
import ElementalData from '../Data/ElementalData';
import { DatabaseContext } from '../Database/Database';
import { ICachedCharacter } from '../Types/character';
import { CharacterKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { useForceUpdate, usePromise } from '../Util/ReactUtil';
import { clamp, deepClone } from '../Util/Util';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterArtifactPane from './CharacterDisplay/CharacterArtifactPane';
import CharacterOverviewPane from './CharacterDisplay/CharacterOverviewPane';
import CharacterTalentPane from './CharacterDisplay/CharacterTalentPane';
import DamageOptionsAndCalculation from './CharacterDisplay/DamageOptionsAndCalculation';
import { CharSelectionButton } from './CharacterSelection';
import CharacterSheet from './CharacterSheet';
import { initialCharacter } from './CharacterUtil';

type characterEquipWeapon = {
  type: "weapon", id: string
}
type characterReducerStatOverride = {
  type: "statOverride",
  statKey: string
  value: any | undefined
}
export type characterReducerAction = characterEquipWeapon | characterReducerStatOverride | Partial<ICachedCharacter>

type CharacterDisplayCardProps = {
  characterKey: CharacterKey,
  setCharacterKey?: (any: CharacterKey) => void
  footer?: JSX.Element
  newBuild?: ICalculatedStats,
  onClose?: (any) => void,
  tabName?: string
}
export default function CharacterDisplayCard({ characterKey, setCharacterKey, footer, newBuild: propNewBuild, onClose, tabName }: CharacterDisplayCardProps) {
  const database = useContext(DatabaseContext)
  const [compareBuild, setCompareBuild] = useState(false)
  // Use databaseToken anywhere `database._get*` is used
  // Use onDatabaseUpdate when `following` database entries
  const [databaseToken, onDatabaseUpdate] = useForceUpdate()

  // TODO: We probably don't need to fetch all sheets,
  // though this wouldn't affect the performance currently.
  const weaponSheets = usePromise(WeaponSheet.getAll(), [])
  const characterSheets = usePromise(CharacterSheet.getAll(), [])
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  const character = useMemo(() =>
    databaseToken && (database._getChar(characterKey) ?? initialCharacter(characterKey)),
    [characterKey, databaseToken, database])
  const weapon = useMemo(() =>
    databaseToken && database._getWeapon(character.equippedWeapon),
    [character.equippedWeapon, databaseToken, database])

  const characterSheet = characterSheets?.[characterKey]
  const weaponSheet = weapon ? weaponSheets?.[weapon.key] : undefined
  const sheets = characterSheet && weaponSheet && artifactSheets && { characterSheet, weaponSheet, artifactSheets }

  const characterDispatch = useCallback((action: characterReducerAction): void => {
    if (!characterKey) return

    if ("type" in action) switch (action.type) {
      case "weapon":
        database.setWeaponLocation(action.id, characterKey)
        break
      case "statOverride": {
        const character = database._getChar(characterKey)!
        if (!characterSheet || !weaponSheet) break
        const { statKey, value } = action
        const baseStatOverrides = character.baseStatOverrides
        const baseStatVal = Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)
        if (baseStatVal === value || baseStatVal === undefined) delete baseStatOverrides[statKey]
        else baseStatOverrides[statKey] = value
        database.updateChar({ ...character, baseStatOverrides }) // TODO: Validate this
        break
      }
    } else
      database.updateChar({ ...database._getChar(characterKey)!, ...action }) // TODO: Validate this
  }, [characterKey, characterSheet, weaponSheet, database])

  useEffect(() => {
    return database.followChar(characterKey, onDatabaseUpdate)
  }, [characterKey, onDatabaseUpdate, database])

  useEffect(() => database.followWeapon(character.equippedWeapon, onDatabaseUpdate),
    [character.equippedWeapon, onDatabaseUpdate, database])

  const newBuild = useMemo(() => {
    if (!propNewBuild) return undefined
    return deepClone(propNewBuild)
  }, [propNewBuild])

  const mainStatAssumptionLevel = newBuild?.mainStatAssumptionLevel ?? 0
  const equippedBuild = useMemo(() => characterSheet && weaponSheet && artifactSheets && Character.calculateBuild(character, database, characterSheet, weaponSheet, artifactSheets, mainStatAssumptionLevel), [character, characterSheet, weaponSheet, artifactSheets, mainStatAssumptionLevel, database])
  // main CharacterDisplayCard
  const DamageOptionsAndCalculationEle = sheets && <DamageOptionsAndCalculation sheets={sheets} character={character} characterDispatch={characterDispatch} className="mb-2" />
  return (<Card bg="darkcontent" text={"lightfont" as any} >
    <Card.Header>
      <Row>
        <Col xs={"auto"} className="mr-auto">
          {/* character selecter/display */}
          <CharSelectDropdown characterSheet={characterSheet} character={character} weaponSheet={weaponSheet} characterDispatch={characterDispatch} setCharacterKey={setCharacterKey} />
        </Col>
        {Boolean(mainStatAssumptionLevel) && <Col xs="auto"><Alert className="mb-0 py-1 h-100" variant="orange" ><b>Assume Main Stats are Level {mainStatAssumptionLevel}</b></Alert></Col>}
        {Boolean(onClose) && <Col xs="auto" >
          <Button variant="danger" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /></Button>
        </Col>}
      </Row>
    </Card.Header>
    {characterKey && sheets && characterSheet && weaponSheet && <Card.Body>
      <buildContext.Provider value={{ newBuild, equippedBuild, compareBuild, setCompareBuild }}>
        <Tab.Container defaultActiveKey={tabName ? tabName : (newBuild ? "newartifacts" : "character")} mountOnEnter unmountOnExit>
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
              <Nav.Link eventKey="talent"><h5 className="mb-0">Talents</h5></Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="character">
              {DamageOptionsAndCalculationEle}
              <CharacterOverviewPane characterSheet={characterSheet} weaponSheet={weaponSheet} character={character} characterDispatch={characterDispatch} />
            </Tab.Pane>
            <buildContext.Provider value={{ newBuild: undefined, equippedBuild, compareBuild, setCompareBuild }}>
              <Tab.Pane eventKey="artifacts" >
                {DamageOptionsAndCalculationEle}
                <CharacterArtifactPane sheets={sheets} character={character} characterDispatch={characterDispatch} />
              </Tab.Pane>
            </buildContext.Provider>
            {newBuild ? <Tab.Pane eventKey="newartifacts" >
              {DamageOptionsAndCalculationEle}
              <CharacterArtifactPane sheets={sheets} character={character} characterDispatch={characterDispatch} />
            </Tab.Pane> : null}
            <Tab.Pane eventKey="talent">
              {DamageOptionsAndCalculationEle}
              <CharacterTalentPane characterSheet={characterSheet} character={character} characterDispatch={characterDispatch} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </buildContext.Provider>
    </Card.Body>}
    {footer && <Card.Footer>
      {footer}
    </Card.Footer>}
  </Card>)
}

type CharSelectDropdownProps = {
  characterSheet?: CharacterSheet,
  weaponSheet?: WeaponSheet,
  character: ICachedCharacter
  disabled?: boolean
  characterDispatch: (any: characterReducerAction) => void
  setCharacterKey?: (any: CharacterKey) => void
}
function CharSelectDropdown({ characterSheet, weaponSheet, character, character: { elementKey = "anemo", level = 1, ascension = 0 }, disabled, characterDispatch, setCharacterKey }: CharSelectDropdownProps) {
  const HeaderIconDisplay = characterSheet ? <span >
    <Image src={characterSheet.thumbImg} className="thumb-small my-n1 ml-n2" roundedCircle />
    <h6 className="d-inline"> {characterSheet.name} </h6>
  </span> : <span>Select a Character</span>
  const setLevel = useCallback((level) => {
    level = clamp(level, 1, 90)
    const ascension = ascensionMaxLevel.findIndex(ascenML => level <= ascenML)
    characterDispatch({ level, ascension })
  }, [characterDispatch])
  const setAscension = useCallback(() => {
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) characterDispatch({ ascension: ascension + 1 })
    else characterDispatch({ ascension: lowerAscension })
  }, [characterDispatch, ascension, level])
  return <>{!disabled ? <InputGroup >
    <ButtonGroup as={InputGroup.Prepend}>
      <CharSelectionButton characterSheet={characterSheet} onSelect={setCharacterKey} />
      {characterSheet?.sheet && "talents" in characterSheet?.sheet && <Dropdown as={ButtonGroup}>
        <Dropdown.Toggle as={Button} className={`text-${elementKey}`}>
          <strong>{ElementalData[elementKey].name}</strong>
        </Dropdown.Toggle>
        <Dropdown.Menu >
          {Object.keys(characterSheet.sheet.talents).map(eleKey =>
            <Dropdown.Item key={eleKey} className={`text-${eleKey}`} onClick={() => characterDispatch({ elementKey: eleKey })}><strong>{ElementalData[eleKey].name}</strong></Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown>}
    </ButtonGroup>
    <InputGroup.Prepend>
      <InputGroup.Text><strong>Lvl. </strong></InputGroup.Text>
    </InputGroup.Prepend>

    <InputGroup.Append>
      <CustomFormControl placeholder={undefined} className="h-100" onChange={setLevel} value={level} min={1} max={90} disabled={!characterSheet} />
    </InputGroup.Append>
    <ButtonGroup as={InputGroup.Append}>
      <Button disabled={!ambiguousLevel(level) || !characterSheet} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
      <Dropdown as={ButtonGroup} >
        <Dropdown.Toggle as={Button} disabled={!characterSheet}>Select Level</Dropdown.Toggle>
        <Dropdown.Menu>
          {milestoneLevels.map(([lv, as]) => {
            const sameLevel = lv === ascensionMaxLevel[as]
            const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
            return <DropdownItem key={`${lv}/${as}`} onClick={() => characterDispatch({ level: lv, ascension: as })}>{lvlstr}</DropdownItem>
          })}
        </Dropdown.Menu>
      </Dropdown>
    </ButtonGroup>
  </InputGroup> : <span>{HeaderIconDisplay} {characterSheet && weaponSheet && Character.getLevelString(character)}</span>}</>
}