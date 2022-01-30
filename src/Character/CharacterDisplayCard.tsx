import { Button, ButtonGroup, Card, CardContent, Divider, Grid, MenuItem, Skeleton, Tab, Tabs, ToggleButton, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useState } from 'react';
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
import SolidToggleButtonGroup from '../Components/SolidToggleButtonGroup';
import { sgt } from '../Data/Characters/SheetUtil';
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from '../Data/LevelData';
import { DataContext, dataContextObj, TeamData } from '../DataContext';
import useCharacterReducer from '../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useTeamData from '../ReactHooks/useTeamData';
import { CharacterKey } from '../Types/consts';
import { clamp } from '../Util/Util';
import CharacterArtifactPane from './CharacterDisplay/CharacterArtifactPane';
import CharacterOverviewPane from './CharacterDisplay/CharacterOverviewPane';
import CharacterTalentPane from './CharacterDisplay/CharacterTalentPane';
import CharacterTeamBuffsPane from './CharacterDisplay/CharacterTeamBuffsPane';

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
  newteamData?: TeamData,
  mainStatAssumptionLevel?: number,
  onClose?: (any) => void,
  tabName?: string,
  isFlex?: boolean,
}
export default function CharacterDisplayCard({ characterKey, footer, newteamData, mainStatAssumptionLevel = 0, onClose, tabName, isFlex }: CharacterDisplayCardProps) {
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { character, characterSheet, target: charUIData } = teamData?.[characterKey] ?? {}

  // set initial state to false, because it fails to check validity of the tab values on 1st load
  const [tab, settab] = useState<string | boolean>(tabName ? tabName : (newteamData ? "newartifacts" : "character"))
  const onTab = useCallback((e, v) => settab(v), [settab])

  const characterDispatch = useCharacterReducer(character?.key ?? "")
  if (!teamData || !character || !characterSheet || !charUIData) return <></>
  const { compareData } = character
  // main CharacterDisplayCard
  const dataContextValue: dataContextObj = {
    character,
    characterSheet,
    mainStatAssumptionLevel,
    data: (newteamData ? newteamData[characterKey]!.target : charUIData),
    teamData,
    oldData: (compareData && newteamData) ? charUIData : undefined,
    characterDispatch
  }
  return <CardDark >
    <DataContext.Provider value={dataContextValue}>
      <CardContent sx={{
        "> div:not(:last-child)": { mb: 1 },
      }}>
        <Grid container spacing={1}>
          <Grid item>
            <CharSelectDropdown />
          </Grid>
          <Grid item>
            {/* Compare against new build toggle */}
            {!!newteamData && <SolidToggleButtonGroup exclusive value={compareData} onChange={(e, v) => characterDispatch({ compareData: v })} size="small">
              <ToggleButton value={false} disabled={!compareData}>
                <small>Show New artifact Stats</small>
              </ToggleButton>
              <ToggleButton value={true} disabled={compareData}>
                <small>Compare against equipped artifacts</small>
              </ToggleButton>
            </SolidToggleButtonGroup>}
          </Grid>
          <Grid item flexGrow={1} />
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
            {!!newteamData && <Tab value="newartifacts" label="New Artifacts" />}
            <Tab value="artifacts" label={newteamData ? "Current Artifacts" : "Artifacts"} />
            {!isFlex && <Tab value="buffs" label="Team Buffs" />}
            <Tab value="talent" label="Talents" />
          </Tabs>
        </CardLight>
        <DamageOptionsCard />
        <FormulaCalcCard />
        <EnemyExpandCard />

        {/* Character Panel */}
        <TabPanel value="character" current={tab}><CharacterOverviewPane /></TabPanel >
        {/* Artifacts Panel */}
        <DataContext.Provider value={{ ...dataContextValue, data: charUIData, oldData: undefined }}>
          <TabPanel value="artifacts" current={tab} ><CharacterArtifactPane /></TabPanel >
        </DataContext.Provider>
        {/* new build panel */}
        <TabPanel value="newartifacts" current={tab} ><CharacterArtifactPane newBuild /></TabPanel >
        {/* Buffs panel */}
        <TabPanel value="buffs" current={tab}><CharacterTeamBuffsPane /></TabPanel >
        {/* talent panel */}
        <TabPanel value="talent" current={tab}>
          <CharacterTalentPane />
        </TabPanel >
      </CardContent>
      {!!footer && <Divider />}
      {footer && <CardContent >
        {footer}
      </CardContent>}
    </DataContext.Provider>
  </CardDark>
}


function CharSelectDropdown() {
  const { character, characterSheet, characterDispatch } = useContext(DataContext)
  const [showModal, setshowModal] = useState(false)
  const setCharacter = useCharSelectionCallback()
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
  const { elementKey = "anemo", level = 1, ascension = 0 } = character
  return <>
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
  </>
}
