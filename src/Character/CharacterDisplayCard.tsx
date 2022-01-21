import { Button, ButtonGroup, Card, CardContent, Divider, Grid, MenuItem, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import { DataContext } from '../DataContext';
import { UIData } from '../Formula/api';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useCharUIData from '../ReactHooks/useCharUIData';
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
import CharacterSheet from './CharacterSheet_WR';
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
  isFlex?: boolean,
  compareBuild?: boolean
}
export default function CharacterDisplayCard({ characterKey, footer, newBuild: propNewBuild, onClose, tabName, isFlex, compareBuild: propCompareBuild }: CharacterDisplayCardProps) {
  const [compareBuild, setCompareBuild] = useState(propCompareBuild ?? false)

  const { data: charUIData, character, characterSheet, weapon, weaponSheet, artifacts, artifactSheetsData, database } = useCharUIData(characterKey)

  useEffect(() => {
    typeof propCompareBuild === "boolean" && setCompareBuild(propCompareBuild)
  }, [propCompareBuild, setCompareBuild])


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

  const newBuild = useMemo(() => {
    if (!propNewBuild) return undefined
    return deepCloneStats(propNewBuild)
  }, [propNewBuild])

  // set initial state to false, because it fails to check validity of the tab values on 1st load
  const [tab, settab] = useState<string | boolean>(tabName ? tabName : (newBuild ? "newartifacts" : "character"))

  const onTab = useCallback((e, v) => settab(v), [settab])

  const mainStatAssumptionLevel = newBuild?.mainStatAssumptionLevel ?? 0

  if (!character) return <></>
  // main CharacterDisplayCard
  const newData = undefined as UIData | undefined
  // TODO: oldData from comapreBuild
  return <CardDark >
    <DataContext.Provider value={{
      character,
      characterSheet,
      data: newData ? newData : charUIData,
      oldData: (compareBuild && newData) ? charUIData : undefined,
      setCompareData: setCompareBuild
    }}>
      <CardContent sx={{
        "> div:not(:last-child)": { mb: 1 },
      }}>
        <Grid container spacing={1}>
          <Grid item flexGrow={1}>
            <CharSelectDropdown />
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
        {/* {sheets && <FormulaCalcCard sheets={sheets} />} */}
        <EnemyExpandCard character={character} />

        {/* Character Panel */}
        <TabPanel value="character" current={tab}><CharacterOverviewPane /></TabPanel >
        {/* Artifacts Panel */}
        <DataContext.Provider value={{ data: charUIData, oldData: undefined, setCompareData: setCompareBuild }}>
          <TabPanel value="artifacts" current={tab} ><CharacterArtifactPane /></TabPanel >
        </DataContext.Provider>
        {/* new build panel */}
        {/* {newBuild && sheets && <TabPanel value="newartifacts" current={tab} >
          <CharacterArtifactPane character={character} sheets={sheets} />
        </TabPanel >} */}
        {/* Buffs panel */}
        {/* {characterSheet && <TabPanel value="buffs" current={tab}>
          <CharacterTeamBuffsPane characterSheet={characterSheet} character={character} />
        </TabPanel >} */}
        {/* talent panel */}
        {/* {characterSheet && <TabPanel value="talent" current={tab}>
          <CharacterTalentPane characterSheet={characterSheet} character={character} />
        </TabPanel >} */}
      </CardContent>
      {!!footer && <Divider />}
      {footer && <CardContent >
        {footer}
      </CardContent>}
    </DataContext.Provider>
  </CardDark>
}

type CharSelectDropdownProps = {
  disabled?: boolean
}
function CharSelectDropdown({ disabled }: CharSelectDropdownProps) {
  const { character, characterSheet } = useContext(DataContext)
  const [showModal, setshowModal] = useState(false)
  const setCharacter = useCharSelectionCallback()
  const characterDispatch = useCharacterReducer(character?.key ?? "")
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
    if (!character) return
    const { level = 1, ascension = 0 } = character
    const lowerAscension = ascensionMaxLevel.findIndex(ascenML => level !== 90 && level === ascenML)
    if (ascension === lowerAscension) characterDispatch({ ascension: ascension + 1 })
    else characterDispatch({ ascension: lowerAscension })
  }, [characterDispatch, character])
  if (!character) return null
  const { elementKey = "anemo", level = 1, ascension = 0 } = character
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