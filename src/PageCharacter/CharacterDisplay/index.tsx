import { Calculate, Checkroom, ExpandMore, FactCheck, Groups, Person } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonGroup, Card, CardContent, CardHeader, Collapse, Divider, Grid, MenuItem, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Navigate, Route, Routes, useMatch, useNavigate, useParams } from 'react-router-dom';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import { CharacterSelectionModal } from '../../Components/Character/CharacterSelectionModal';
import ThumbSide from '../../Components/Character/ThumbSide';
import CloseButton from '../../Components/CloseButton';
import ColorText from '../../Components/ColoredText';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../../Components/CustomNumberInput';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import { EnemyExpandCard } from '../../Components/EnemyEditor';
import ExpandButton from '../../Components/ExpandButton';
import { HitModeToggle, InfusionAuraDropdown, ReactionToggle } from '../../Components/HitModeEditor';
import ImgIcon from '../../Components/Image/ImgIcon';
import { ambiguousLevel, ascensionMaxLevel, milestoneLevels } from '../../Data/LevelData';
import { sgt } from '../../Data/SheetUtil';
import { DataContext, dataContextObj, TeamData } from '../../DataContext';
import { getDisplayHeader, getDisplaySections } from '../../Formula/DisplayUtil';
import { DisplaySub } from '../../Formula/type';
import { NodeDisplay } from '../../Formula/uiData';
import KeyMap, { valueString } from '../../KeyMap';
import useCharacterReducer from '../../ReactHooks/useCharacterReducer';
import useCharSelectionCallback from '../../ReactHooks/useCharSelectionCallback';
import usePromise from '../../ReactHooks/usePromise';
import useTeamData from '../../ReactHooks/useTeamData';
import useTitle from '../../ReactHooks/useTitle';
import { allCharacterKeys, CharacterKey } from '../../Types/consts';
import { clamp } from '../../Util/Util';
import TabEquip from './Tabs/TabEquip';
import TabBuild from './Tabs/TabOptimize';
import TabOverview from './Tabs/TabOverview';
import TabTalent from './Tabs/TabTalent';
import TabTeambuffs from './Tabs/TabTeambuffs';

export default function CharacterDisplay() {
  const navigate = useNavigate();
  let { characterKey } = useParams<{ characterKey?: CharacterKey }>();
  const invalidKey = !allCharacterKeys.includes(characterKey as any ?? "")
  if (invalidKey)
    return <Navigate to="/characters" />
  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    {characterKey && <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
      <CharacterDisplayCard characterKey={characterKey} onClose={() => navigate("/characters")} />
    </Suspense>}
  </Box>
}

type CharacterDisplayCardProps = {
  characterKey: CharacterKey,
  newteamData?: TeamData,
  mainStatAssumptionLevel?: number,
  onClose?: (any) => void,
}
function CharacterDisplayCard({ characterKey, newteamData, mainStatAssumptionLevel = 0, onClose }: CharacterDisplayCardProps) {
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel)
  const { character, characterSheet, target: charUIData } = teamData?.[characterKey] ?? {}
  let { params: { tab = "overview" } } = useMatch({ path: "/characters/:charKey/:tab", end: false }) ?? { params: { tab: "overview" } }
  const { t } = useTranslation()
  useTitle(`${t(`char_${characterKey}_gen:name`)} - ${t(`page_character:tabs.${tab}`)}`)
  const characterDispatch = useCharacterReducer(character?.key ?? "")
  const { compareData } = character ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !character || !characterSheet || !charUIData) return undefined
    return {
      character,
      characterSheet,
      mainStatAssumptionLevel,
      data: (newteamData ? newteamData[characterKey]!.target : charUIData),
      teamData: (newteamData ? newteamData : teamData),
      oldData: (compareData && newteamData) ? charUIData : undefined,
      characterDispatch
    }
  }, [character, characterSheet, mainStatAssumptionLevel, newteamData, charUIData, teamData, characterDispatch, characterKey, compareData])

  if (!teamData || !character || !characterSheet || !charUIData || !dataContextValue) return <></>

  return <CardDark >
    <DataContext.Provider value={dataContextValue}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Grid container spacing={1}>
          <Grid item>
            <CharSelectDropdown />
          </Grid>
          <Grid item flexGrow={1} />
          {!!mainStatAssumptionLevel && <Grid item><Card sx={{ p: 1, bgcolor: t => t.palette.warning.dark }}><Typography><strong>Assume Main Stats are Level {mainStatAssumptionLevel}</strong></Typography></Card></Grid>}
          {!!onClose && <Grid item>
            <CloseButton onClick={onClose} />
          </Grid>}
        </Grid>
        <CardLight>
          <TabNav tab={tab} />
        </CardLight>
        <FormulaCalcCard />
        <EnemyExpandCard />
        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={500} />}>
          <Routes>
            {/* Character Panel */}
            <Route index element={<TabOverview />} />
            <Route path="/talent" element={<TabTalent />} />
            <Route path="/equip" element={<TabEquip />} />
            <Route path="/teambuffs" element={<TabTeambuffs />} />
            <Route path="/optimize" element={<TabBuild />} />
          </Routes>
        </Suspense>
        <CardLight>
          <TabNav tab={tab} />
        </CardLight>
      </CardContent>
    </DataContext.Provider>
  </CardDark>
}
function TabNav({ tab }: { tab: string }) {
  const { t } = useTranslation("page_character")
  return <Tabs
    value={tab}
    variant="scrollable"
    allowScrollButtonsMobile
    sx={{
      "& .MuiTab-root:hover": {
        transition: "background-color 0.25s ease",
        backgroundColor: "rgba(255,255,255,0.1)"
      },
    }}
  >
    <Tab sx={{ minWidth: "20%" }} value="overview" label={t("tabs.overview")} icon={<Person />} component={RouterLink} to="" />
    <Tab sx={{ minWidth: "20%" }} value="talent" label={t("tabs.talent")} icon={<FactCheck />} component={RouterLink} to="talent" />
    <Tab sx={{ minWidth: "20%" }} value="equip" label={t("tabs.equip")} icon={<Checkroom />} component={RouterLink} to="equip" />
    <Tab sx={{ minWidth: "20%" }} value="teambuffs" label={t("tabs.teambuffs")} icon={<Groups />} component={RouterLink} to="teambuffs" />
    <Tab sx={{ minWidth: "20%" }} value="optimize" label={t("tabs.optimize")} icon={<Calculate />} component={RouterLink} to="optimize" />
  </Tabs>
}

function CharSelectDropdown() {
  const { t } = useTranslation("page_character")
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
        <Button color="info" onClick={() => setshowModal(true)} startIcon={<ThumbSide src={characterSheet?.thumbImgSide} />} >{characterSheet?.name ?? t("selectCharacter")}</Button>
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
              startAdornment="Lv. "
              inputProps={{ min: 1, max: 90, sx: { textAlign: "center" } }}
              sx={{ width: "100%", height: "100%", pl: 2 }}
              disabled={!characterSheet} />
          </CustomNumberInputButtonGroupWrapper>
          <Button sx={{ pl: 1 }} disabled={!ambiguousLevel(level) || !characterSheet} onClick={setAscension}><strong>/ {ascensionMaxLevel[ascension]}</strong></Button>
          <DropdownButton title={t("selectLevel")} disabled={!characterSheet}>
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

function FormulaCalcCard() {
  const { t } = useTranslation("page_character")
  const [expanded, setexpanded] = useState(false)
  const toggle = useCallback(() => setexpanded(!expanded), [setexpanded, expanded])
  return <CardLight>
    <CardContent sx={{ display: "flex", gap: 1 }}>
      <Grid container spacing={1}>
        <Grid item><HitModeToggle size="small" /></Grid>
        <Grid item><InfusionAuraDropdown /></Grid>
        <Grid item><ReactionToggle size="small" /></Grid>
      </Grid>
      <Box display="flex" gap={1} >
        <Box>
          <Typography variant='subtitle2' >{t("formulas")} {"&"}</Typography>
          <Typography variant='subtitle2' >{t("calculations")}</Typography>
        </Box>
        <ExpandButton
          expand={expanded}
          onClick={toggle}
          aria-expanded={expanded}
          aria-label="show more"
          size="small"
          sx={{ p: 0 }}
        >
          <ExpandMore />
        </ExpandButton>
      </Box>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        <CalculationDisplay />
      </CardContent>
    </Collapse>
  </CardLight>
}

function CalculationDisplay() {
  const { data } = useContext(DataContext)
  const sections = getDisplaySections(data)
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />} >
    <Box sx={{ mr: -1, mb: -1 }}>
      {sections.map(([key, Nodes]) =>
        <FormulaCalc key={key} displayNs={Nodes} sectionKey={key} />)}
    </Box>
  </Suspense>
}
function FormulaCalc({ sectionKey, displayNs }: { displayNs: DisplaySub<NodeDisplay>, sectionKey: string }) {
  const { data } = useContext(DataContext)
  const header = usePromise(getDisplayHeader(data, sectionKey), [data, sectionKey])
  if (!header) return null
  if (Object.entries(displayNs).every(([_, node]) => node.isEmpty)) return null
  const { title, icon, action } = header
  return <CardDark sx={{ mb: 1 }}>
    <CardHeader avatar={icon && <ImgIcon size={2} sx={{ m: -1 }} src={icon} />} title={title} action={action} titleTypographyProps={{ variant: "subtitle1" }} />
    <Divider />
    <CardContent>
      {Object.entries(displayNs).map(([key, node]) =>
        !node.isEmpty && <Accordion sx={{ bgcolor: "contentLight.main" }} key={key}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography><ColorText color={node.info.variant}>{KeyMap.get(node.info.key ?? "")}</ColorText> <strong>{valueString(node.value, node.unit)}</strong></Typography>
          </AccordionSummary>
          <AccordionDetails>
            {node.formulas.map((subform, i) => <Typography key={i}>{subform}</Typography>)}
          </AccordionDetails>
        </Accordion>)}
    </CardContent>
  </CardDark>
}
