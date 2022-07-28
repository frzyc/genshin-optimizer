import { BarChart, Calculate, ExpandMore, FactCheck, Groups, Person } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, CardContent, CardHeader, Collapse, Divider, Grid, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Suspense, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Navigate, Route, Routes, useMatch, useNavigate, useParams } from 'react-router-dom';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import CloseButton from '../../Components/CloseButton';
import ColorText from '../../Components/ColoredText';
import ExpandButton from '../../Components/ExpandButton';
import { HitModeToggle, InfusionAuraDropdown, ReactionToggle } from '../../Components/HitModeEditor';
import ImgIcon from '../../Components/Image/ImgIcon';
import { CharacterContext, CharacterContextObj } from '../../Context/CharacterContext';
import { DataContext, dataContextObj } from '../../Context/DataContext';
import CharacterSheet from '../../Data/Characters/CharacterSheet';
import { getDisplayHeader, getDisplaySections } from '../../Formula/DisplayUtil';
import { DisplaySub } from '../../Formula/type';
import { NodeDisplay } from '../../Formula/uiData';
import KeyMap, { valueString } from '../../KeyMap';
import useBoolState from '../../ReactHooks/useBoolState';
import useCharacter from '../../ReactHooks/useCharacter';
import useCharacterReducer from '../../ReactHooks/useCharacterReducer';
import usePromise from '../../ReactHooks/usePromise';
import useTeamData from '../../ReactHooks/useTeamData';
import useTitle from '../../ReactHooks/useTitle';
import { allCharacterKeys, CharacterKey } from '../../Types/consts';
import CharSelectDropdown from './CharSelectDropdown';
import LevelSelect from './LevelSelect';
import StatModal from './StatModal';
import TabBuild from './Tabs/TabOptimize';
import TabOverview from './Tabs/TabOverview';
import TabTalent from './Tabs/TabTalent';
import TabTeambuffs from './Tabs/TabTeambuffs';
import TravelerElementSelect from './TravelerElementSelect';

export default function CharacterDisplay() {
  const navigate = useNavigate();
  const onClose = useCallback(() => navigate("/characters"), [navigate])
  let { characterKey } = useParams<{ characterKey?: CharacterKey }>();
  const invalidKey = !allCharacterKeys.includes(characterKey as any ?? "")
  if (invalidKey)
    return <Navigate to="/characters" />

  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
      {characterKey && <CharacterDisplayCard characterKey={characterKey} onClose={onClose} />}
    </Suspense>
  </Box>
}

type CharacterDisplayCardProps = {
  characterKey: CharacterKey,
  onClose?: () => void,
}
function CharacterDisplayCard({ characterKey, onClose }: CharacterDisplayCardProps) {
  const character = useCharacter(characterKey)
  const characterSheet = usePromise(() => CharacterSheet.get(characterKey), [characterKey])
  const teamData = useTeamData(characterKey)
  const { target: charUIData } = teamData?.[characterKey] ?? {}
  let { params: { tab = "overview" } } = useMatch({ path: "/characters/:charKey/:tab", end: false }) ?? { params: { tab: "overview" } }
  const { t } = useTranslation()
  useTitle(`${t(`char_${characterKey}_gen:name`)} - ${t(`page_character:tabs.${tab}`)}`)
  const characterDispatch = useCharacterReducer(character?.key ?? "")

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      oldData: undefined,
    }
  }, [charUIData, teamData])

  const characterContextValue: CharacterContextObj | undefined = useMemo(() => {
    if (!character || !characterSheet) return undefined
    return {
      character,
      characterSheet,
      characterDispatch
    }
  }, [character, characterSheet, characterDispatch])
  return <CardDark >
    {dataContextValue && characterContextValue ? <CharacterContext.Provider value={characterContextValue}><DataContext.Provider value={dataContextValue}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Stack direction="row" >
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            <CharSelectDropdown />
            <TravelerElementSelect />
            <LevelSelect />
            <DetailStatButton />
          </Stack>
          {!!onClose && <CloseButton onClick={onClose} />}
        </Stack>
        <CardLight>
          <TabNav tab={tab} />
        </CardLight>
        <FormulaCalcCard />
        <CharacterPanel />
        <CardLight>
          <TabNav tab={tab} />
        </CardLight>
      </CardContent>
    </DataContext.Provider></CharacterContext.Provider> : <Skeleton variant='rectangular' width='100%' height={1000} />}
  </CardDark>
}
function CharacterPanel() {
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={500} />}>
    <Routes>
      {/* Character Panel */}
      <Route index element={<TabOverview />} />
      <Route path="/talent" element={<TabTalent />} />
      <Route path="/teambuffs" element={<TabTeambuffs />} />
      <Route path="/optimize" element={<TabBuild />} />
    </Routes>
  </Suspense>
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
    <Tab sx={{ minWidth: "25%" }} value="overview" label={t("tabs.overview")} icon={<Person />} component={RouterLink} to="" />
    <Tab sx={{ minWidth: "25%" }} value="talent" label={t("tabs.talent")} icon={<FactCheck />} component={RouterLink} to="talent" />
    <Tab sx={{ minWidth: "25%" }} value="teambuffs" label={t("tabs.teambuffs")} icon={<Groups />} component={RouterLink} to="teambuffs" />
    <Tab sx={{ minWidth: "25%" }} value="optimize" label={t("tabs.optimize")} icon={<Calculate />} component={RouterLink} to="optimize" />
  </Tabs>
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
  const header = usePromise(() => getDisplayHeader(data, sectionKey), [data, sectionKey])
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
function DetailStatButton() {
  const [open, onOpen, onClose] = useBoolState()
  return <>
    <Button color="info" startIcon={<BarChart />} onClick={onOpen}>Detailed Stats</Button>
    <StatModal open={open} onClose={onClose} />
  </>
}
