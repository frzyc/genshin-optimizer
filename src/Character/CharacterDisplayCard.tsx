import { Button, ButtonGroup, Card, CardContent, Divider, Grid, MenuItem, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArtifactSheet } from '../Artifact/ArtifactSheet';
import { buildContext } from '../Build/Build';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import { CharacterSelectionModal } from '../Components/Character/CharacterSelectionModal';
import CloseButton from '../Components/CloseButton';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../Components/CustomNumberInput';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import { EnemyExpandCard } from '../Components/EnemyEditor';
import FormulaCalcCard from '../Components/FormulaCalcCard';
import { DamageOptionsCard } from '../Components/HitModeEditor';
import ImgIcon from '../Components/Image/ImgIcon';
import ElementalData from '../Data/ElementalData';
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from '../Data/LevelData';
import { DatabaseContext } from '../Database/Database';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { ICachedCharacter } from '../Types/character';
import { CharacterKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { clamp, deepClone } from '../Util/Util';
import WeaponSheet from '../Weapon/WeaponSheet';
import Character from './Character';
import CharacterArtifactPane from './CharacterDisplay/CharacterArtifactPane';
import CharacterOverviewPane from './CharacterDisplay/CharacterOverviewPane';
import CharacterTalentPane from './CharacterDisplay/CharacterTalentPane';
import CharacterSheet from './CharacterSheet';
import { initialCharacter } from './CharacterUtil';

interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
  current: string | boolean;
}

function TabPanel({ children, current, value, ...other }: TabPanelProps) {
  if (value !== current) return null
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
    <div
      role="tabpanel"
      hidden={value !== current}
      id={`simple-tabpanel-${value}`}
      aria-labelledby={`simple-tab-${value}`}
      {...other}
    >
      {children}
    </div>
  </Suspense>
}

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

  useEffect(() => {
    return database.followChar(characterKey, onDatabaseUpdate)
  }, [characterKey, onDatabaseUpdate, database])

  useEffect(() => database.followWeapon(character.equippedWeapon, onDatabaseUpdate),
    [character.equippedWeapon, onDatabaseUpdate, database])

  const newBuild = useMemo(() => {
    if (!propNewBuild) return undefined
    return deepClone(propNewBuild)
  }, [propNewBuild])

  // set initial state to false, because it fails to check validity of the tab values on 1st load
  const [tab, settab] = useState<string | boolean>(tabName ? tabName : (newBuild ? "newartifacts" : "character"))

  const onTab = useCallback((e, v) => settab(v), [settab])

  const mainStatAssumptionLevel = newBuild?.mainStatAssumptionLevel ?? 0
  const equippedBuild = useMemo(() => databaseToken && characterSheet && weaponSheet && artifactSheets &&
    Character.calculateBuild(character, database, characterSheet, weaponSheet, artifactSheets, mainStatAssumptionLevel),
    [databaseToken, character, characterSheet, weaponSheet, artifactSheets, mainStatAssumptionLevel, database])

  // main CharacterDisplayCard
  return <CardDark >
    <buildContext.Provider value={{ newBuild, equippedBuild, compareBuild, setCompareBuild }}>
      <CardContent sx={{
        "> div:not(:last-child)": { mb: 1 },
      }}>
        <Grid container spacing={1}>
          <Grid item flexGrow={1}>
            <CharSelectDropdown characterSheet={characterSheet} character={character} weaponSheet={weaponSheet} setCharacterKey={setCharacterKey} />
          </Grid>
          {!!mainStatAssumptionLevel && <Grid item><Card sx={{ p: 1, bgcolor: t => t.palette.warning.dark }}><Typography><strong>Assume Main Stats are Level {mainStatAssumptionLevel}</strong></Typography></Card></Grid>}
          {!!onClose && <Grid item>
            <CloseButton onClick={onClose} />
          </Grid>}
        </Grid>
        <CardLight>
          <Tabs
            onChange={onTab}
            value={tab}
            variant="fullWidth"
          >
            <Tab value="character" label="Character" />
            {!!newBuild && <Tab value="newartifacts" label="New Artifacts" />}
            <Tab value="artifacts" label={newBuild ? "Current Artifacts" : "Artifacts"} />
            <Tab value="talent" label="Talents" />
          </Tabs>
        </CardLight>
        <DamageOptionsCard character={character} />
        {!!sheets && <FormulaCalcCard sheets={sheets} />}
        <EnemyExpandCard character={character} />

        {/* Character Panel */}
        {characterSheet && weaponSheet && <TabPanel value="character" current={tab}>
          <CharacterOverviewPane characterSheet={characterSheet} weaponSheet={weaponSheet} character={character} />
        </TabPanel >}
        {/* Artifacts Panel */}
        {sheets && <buildContext.Provider value={{ newBuild: undefined, equippedBuild, compareBuild, setCompareBuild }}>
          <TabPanel value="artifacts" current={tab} >
            <CharacterArtifactPane sheets={sheets} character={character} />
          </TabPanel >
        </buildContext.Provider>}
        {/* new build panel */}
        {newBuild && sheets && <TabPanel value="newartifacts" current={tab} >
          <CharacterArtifactPane sheets={sheets} character={character} />
        </TabPanel >}
        {/* talent panel */}
        {characterSheet && <TabPanel value="talent" current={tab}>
          <CharacterTalentPane characterSheet={characterSheet} character={character} />
        </TabPanel >}
      </CardContent>
      {!!footer && <Divider />}
      {footer && <CardContent sx={{ py: 1 }}>
        {footer}
      </CardContent>}
    </buildContext.Provider>
  </CardDark>
}

type CharSelectDropdownProps = {
  characterSheet?: CharacterSheet,
  weaponSheet?: WeaponSheet,
  character: ICachedCharacter
  disabled?: boolean
  setCharacterKey?: (any: CharacterKey) => void
}
function CharSelectDropdown({ characterSheet, weaponSheet, character, character: { key: characterKey, elementKey = "anemo", level = 1, ascension = 0 }, disabled, setCharacterKey }: CharSelectDropdownProps) {
  const [showModal, setshowModal] = useState(false)
  const characterDispatch = useCharacterReducer(characterKey)
  const HeaderIconDisplay = characterSheet ? <span >
    <ImgIcon src={characterSheet.thumbImg} sx={{ mr: 1 }} />
    {characterSheet.name}
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
  return <>{!disabled ? <>
    <CharacterSelectionModal show={showModal} onHide={() => setshowModal(false)} onSelect={setCharacterKey} />
    <ButtonGroup sx={{ bgcolor: t => t.palette.contentDark.main }} >
      <Button disabled={!setCharacterKey} onClick={() => setshowModal(true)} startIcon={<ImgIcon src={characterSheet?.thumbImg} />} >{characterSheet?.name ?? "Select a Character"}</Button>
      {characterSheet?.sheet && "talents" in characterSheet?.sheet && <DropdownButton title={ElementalData[elementKey].name}>
        {Object.keys(characterSheet.sheet.talents).map(eleKey =>
          <MenuItem key={eleKey} selected={elementKey === eleKey} disabled={elementKey === eleKey} onClick={() => characterDispatch({ elementKey: eleKey })}>
            <strong>{ElementalData[eleKey].name}</strong></MenuItem>)}
      </DropdownButton>}
      <CustomNumberInputButtonGroupWrapper >
        <CustomNumberInput onChange={setLevel} value={level}
          startAdornment="Lvl. "
          inputProps={{ min: 1, max: 90, sx: { textAlign: "center" } }}
          sx={{ width: "100%", height: "100%", pl: 2 }}
          disabled={!characterSheet} />
      </CustomNumberInputButtonGroupWrapper>
      <Button sx={{ pl: 1 }} disabled={!ambiguousLevel(level) || !characterSheet} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
      <DropdownButton title={"Select Level"} disabled={!characterSheet}>
        {milestoneLevels.map(([lv, as]) => {
          const sameLevel = lv === ascensionMaxLevel[as]
          const lvlstr = sameLevel ? `Lv. ${lv}` : `Lv. ${lv}/${ascensionMaxLevel[as]}`
          const selected = lv === level && as === ascension
          return <MenuItem key={`${lv}/${as}`} selected={selected} disabled={selected} onClick={() => characterDispatch({ level: lv, ascension: as })}>{lvlstr}</MenuItem>
        })}
      </DropdownButton>
    </ButtonGroup>
  </> : <Typography variant="h6">{HeaderIconDisplay} {characterSheet && weaponSheet && Character.getLevelString(character)}</Typography>}</>
}