import { Button, ButtonGroup, Card, CardContent, Divider, Grid, MenuItem, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildContext } from '../Build/Build';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import { CharacterSelectionModal } from '../Components/Character/CharacterSelectionModal';
import ThumbSide from '../Components/Character/ThumbSide';
import CloseButton from '../Components/CloseButton';
import ColorText from '../Components/ColoredText';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../Components/CustomNumberInput';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import { EnemyExpandCard } from '../Components/EnemyEditor';
import FormulaCalcCard from '../Components/FormulaCalcCard';
import { DamageOptionsCard } from '../Components/HitModeEditor';
import ImgIcon from '../Components/Image/ImgIcon';
import { sgt } from '../Data/Characters/SheetUtil';
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from '../Data/LevelData';
import { DatabaseContext } from '../Database/Database';
import useCharacter from '../ReactHooks/useCharacter';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import useSheets from '../ReactHooks/useSheets';
import { ICachedCharacter } from '../Types/character';
import { CharacterKey } from '../Types/consts';
import { ICalculatedStats } from '../Types/stats';
import { deepCloneStats } from '../Util/StatUtil';
import { clamp } from '../Util/Util';
import { defaultInitialWeapon } from '../Weapon/WeaponUtil';
import Character from './Character';
import CharacterArtifactPane from './CharacterDisplay/CharacterArtifactPane';
import CharacterOverviewPane from './CharacterDisplay/CharacterOverviewPane';
import CharacterTalentPane from './CharacterDisplay/CharacterTalentPane';
import CharacterTeamBuffsPane from './CharacterDisplay/CharacterTeamBuffsPane';
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
  footer?: JSX.Element
  newBuild?: ICalculatedStats,
  onClose?: (any) => void,
  tabName?: string,
  isFlex?: boolean
}
export default function CharacterDisplayCard({ characterKey, footer, newBuild: propNewBuild, onClose, tabName, isFlex }: CharacterDisplayCardProps) {
  const database = useContext(DatabaseContext)
  const [compareBuild, setCompareBuild] = useState(false)
  const character = useCharacter(characterKey)
  const [dbDirty, setDbDirty] = useForceUpdate()

  const sheets = useSheets()
  //follow updates from team
  const [teammate1, teammate2, teammate3] = character?.team ?? []
  useEffect(() =>
    teammate1 ? database.followChar(teammate1, setDbDirty) : undefined,
    [teammate1, setDbDirty, database])
  useEffect(() =>
    teammate2 ? database.followChar(teammate2, setDbDirty) : undefined,
    [teammate2, setDbDirty, database])
  useEffect(() =>
    teammate3 ? database.followChar(teammate3, setDbDirty) : undefined,
    [teammate3, setDbDirty, database])

  useEffect(() => {
    if (!characterKey) return
    if (database._getChar(characterKey)) return
    // Create a new character + weapon, with linking if char isnt in db.
    (async () => {
      const newChar = initialCharacter(characterKey)
      database.updateChar(newChar)
      const characterSheet = await CharacterSheet.get(characterKey)
      if (!characterSheet) return
      const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
      const weaponId = database.createWeapon(weapon)
      database.setWeaponLocation(weaponId, characterKey)
    })()
  }, [database, characterKey])


  const characterSheet = sheets?.characterSheets?.[characterKey ?? ""]

  useEffect(() => character && database.followWeapon(character.equippedWeapon, setDbDirty),
    [character, character?.equippedWeapon, setDbDirty, database])

  const newBuild = useMemo(() => {
    if (!propNewBuild) return undefined
    return deepCloneStats(propNewBuild)
  }, [propNewBuild])

  // set initial state to false, because it fails to check validity of the tab values on 1st load
  const [tab, settab] = useState<string | boolean>(tabName ? tabName : (newBuild ? "newartifacts" : "character"))

  const onTab = useCallback((e, v) => settab(v), [settab])

  const mainStatAssumptionLevel = newBuild?.mainStatAssumptionLevel ?? 0
  const equippedBuild = useMemo(() => character && dbDirty && sheets &&
    Character.calculateBuild(character, database, sheets, mainStatAssumptionLevel),
    [dbDirty, character, sheets, mainStatAssumptionLevel, database])
  if (!character) return <></>
  // main CharacterDisplayCard
  return <CardDark >
    <buildContext.Provider value={{ newBuild, equippedBuild, compareBuild, setCompareBuild }}>
      <CardContent sx={{
        "> div:not(:last-child)": { mb: 1 },
      }}>
        <Grid container spacing={1}>
          <Grid item flexGrow={1}>
            <CharSelectDropdown characterSheet={characterSheet} character={character} />
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
            {!isFlex && <Tab value="buffs" label="Team Buffs" />}
            <Tab value="talent" label="Talents" />
          </Tabs>
        </CardLight>
        <DamageOptionsCard character={character} />
        {sheets && <FormulaCalcCard sheets={sheets} />}
        <EnemyExpandCard character={character} />

        {/* Character Panel */}
        {characterSheet && <TabPanel value="character" current={tab}>
          <CharacterOverviewPane characterSheet={characterSheet} character={character} />
        </TabPanel >}
        {/* Artifacts Panel */}
        {sheets && <buildContext.Provider value={{ newBuild: undefined, equippedBuild, compareBuild, setCompareBuild }}>
          <TabPanel value="artifacts" current={tab} >
            <CharacterArtifactPane character={character} sheets={sheets} />
          </TabPanel >
        </buildContext.Provider>}
        {/* new build panel */}
        {newBuild && sheets && <TabPanel value="newartifacts" current={tab} >
          <CharacterArtifactPane character={character} sheets={sheets} />
        </TabPanel >}
        {/* Buffs panel */}
        {characterSheet && <TabPanel value="buffs" current={tab}>
          <CharacterTeamBuffsPane characterSheet={characterSheet} character={character} />
        </TabPanel >}
        {/* talent panel */}
        {characterSheet && <TabPanel value="talent" current={tab}>
          <CharacterTalentPane characterSheet={characterSheet} character={character} />
        </TabPanel >}
      </CardContent>
      {!!footer && <Divider />}
      {footer && <CardContent >
        {footer}
      </CardContent>}
    </buildContext.Provider>
  </CardDark>
}

type CharSelectDropdownProps = {
  characterSheet?: CharacterSheet,
  character: ICachedCharacter
  disabled?: boolean
}
function CharSelectDropdown({ characterSheet, character, character: { key: characterKey, elementKey = "anemo", level = 1, ascension = 0 }, disabled }: CharSelectDropdownProps) {
  const [showModal, setshowModal] = useState(false)
  const setCharacter = useCharSelectionCallback()
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
    <CharacterSelectionModal show={showModal} onHide={() => setshowModal(false)} onSelect={setCharacter} />
    <Grid container spacing={1}>
      <Grid item>
        <Button onClick={() => setshowModal(true)} startIcon={<ThumbSide src={characterSheet?.thumbImgSide} />} >{characterSheet?.name ?? "Select a Character"}</Button>
      </Grid>
      <Grid item>
        <ButtonGroup sx={{ bgcolor: t => t.palette.contentDark.main }} >
          {characterSheet?.sheet && "talents" in characterSheet?.sheet && <DropdownButton title={<strong><ColorText color={elementKey}>{sgt(`element.${elementKey}`)}</ColorText></strong>}>
            {Object.keys(characterSheet.sheet.talents).map(eleKey =>
              <MenuItem key={eleKey} selected={elementKey === eleKey} disabled={elementKey === eleKey} onClick={() => characterDispatch({ elementKey: eleKey })}>
                <strong><ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText></strong></MenuItem>)}
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
      </Grid>
    </Grid>
  </> : <Typography variant="h6">{HeaderIconDisplay} {characterSheet && Character.getLevelString(character)}</Typography>}</>
}