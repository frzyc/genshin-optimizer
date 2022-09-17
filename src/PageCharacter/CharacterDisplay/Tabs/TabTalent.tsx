import { Box, CardActionArea, CardContent, Grid, MenuItem, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/system";
import { useCallback, useContext, useMemo } from 'react';
import CardDark from "../../../Components/Card/CardDark";
import CardLight from "../../../Components/Card/CardLight";
import ConditionalWrapper from "../../../Components/ConditionalWrapper";
import DocumentDisplay from "../../../Components/DocumentDisplay";
import DropdownButton from "../../../Components/DropdownMenu/DropdownButton";
import { NodeFieldDisplay } from "../../../Components/FieldDisplay";
import { CharacterContext } from "../../../Context/CharacterContext";
import { DataContext } from '../../../Context/DataContext';
import { TalentSheetElementKey } from "../../../Data/Characters/CharacterSheet";
import { uiInput as input } from "../../../Formula";
import { NumNode } from "../../../Formula/type";
import { NodeDisplay } from '../../../Formula/uiData';
import useCharacterReducer from "../../../ReactHooks/useCharacterReducer";
import { DocumentSection } from "../../../Types/sheet";
import { range } from "../../../Util/Util";

const talentSpacing = {
  xs: 12,
  sm: 6,
  md: 4
}

export default function CharacterTalentPane() {
  const { character, characterSheet } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(character.key)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]] as [TalentSheetElementKey, string][]
  const passivesList: [tKey: TalentSheetElementKey, tText: string, asc: number][] = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const ascension = data.get(input.asc).value
  const constellation = data.get(input.constellation).value

  const theme = useTheme();
  const grlg = useMediaQuery(theme.breakpoints.up('lg'));
  const constellationCards = useMemo(() => range(1, 6).map(i =>
    <SkillDisplayCard
      talentKey={`constellation${i}` as TalentSheetElementKey}
      subtitle={`Constellation Lv. ${i}`}
      onClickTitle={() => characterDispatch({ constellation: i === constellation ? i - 1 : i })}
    />), [constellation, characterDispatch])
  return <>
    <ReactionDisplay />
    <Grid container spacing={1}>
      {/* constellations for 4column */}
      {grlg && <Grid item xs={12} md={12} lg={3} sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
        <CardLight><CardContent><Typography variant="h6" sx={{ textAlign: "center" }}>Constellation Lv. {constellation}</Typography></CardContent></CardLight>
        {constellationCards.map((c, i) => <Box key={i} sx={{ opacity: constellation >= (i + 1) ? 1 : 0.5 }} >{c}</Box>)}
      </Grid>}
      <Grid item xs={12} md={12} lg={9} container spacing={1} >
        {/* auto, skill, burst */}
        {skillBurstList.map(([tKey, tText]) =>
          <Grid item key={tKey} {...talentSpacing} >
            <SkillDisplayCard
              talentKey={tKey}
              subtitle={tText}
            />
          </Grid>)}
        {!!characterSheet.getTalentOfKey("sprint",) && <Grid item {...talentSpacing} >
          <SkillDisplayCard
            talentKey="sprint"
            subtitle="Alternative Sprint"
          />
        </Grid>}
        {!!characterSheet.getTalentOfKey("passive") && <Grid item {...talentSpacing} >
          <SkillDisplayCard
            talentKey="passive"
            subtitle="Passive"
          />
        </Grid>}
        {/* passives */}
        {passivesList.map(([tKey, tText, asc]) => {
          let enabled = ascension >= asc
          if (!characterSheet.getTalentOfKey(tKey)) return null
          return <Grid item key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} {...talentSpacing} >
            <SkillDisplayCard
              talentKey={tKey}
              subtitle={tText}
            />
          </Grid>
        })}
      </Grid>
      {/* constellations for < 4 columns */}
      {!grlg && <Grid item xs={12} md={12} lg={3} container spacing={1} >
        <Grid item xs={12}>
          <CardLight><CardContent><Typography variant="h6" sx={{ textAlign: "center" }}>Constellation Lv. {constellation}</Typography></CardContent></CardLight>
        </Grid>
        {constellationCards.map((c, i) => <Grid item key={i} sx={{ opacity: constellation >= (i + 1) ? 1 : 0.5 }} {...talentSpacing} >{c}</Grid>)}
      </Grid>}
    </Grid>
  </>
}
function ReactionDisplay() {
  const { data } = useContext(DataContext)
  const reaction = data.getDisplay().reaction as { [key: string]: NodeDisplay }
  return <CardLight>
    <CardContent>
      <Grid container spacing={1}>
        {Object.entries(reaction).map(([key, node]) => {
          return <Grid item key={key}>
            <CardDark><CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <NodeFieldDisplay node={node} />
            </CardContent></CardDark>
          </Grid>
        })}
      </Grid>
    </CardContent>
  </CardLight>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
type SkillDisplayCardProps = {
  talentKey: TalentSheetElementKey,
  subtitle: string,
  onClickTitle?: (any) => any
}
function SkillDisplayCard({ talentKey, subtitle, onClickTitle }: SkillDisplayCardProps) {
  const { character: { talent }, characterSheet, characterDispatch } = useContext(CharacterContext)
  const { data } = useContext(DataContext)

  const actionWrapeprFunc = useCallback(
    children => <CardActionArea onClick={onClickTitle}>{children}</CardActionArea>,
    [onClickTitle],
  )

  const setTalentLevel = useCallback((tKey: TalentSheetElementKey, newTalentLevelKey: number) =>
    characterDispatch({ talent: { ...talent, [tKey]: newTalentLevelKey } }), [talent, characterDispatch])

  let header: Displayable | null = null

  if (talentKey in talent) {
    const levelBoost = data.get(input.bonus[talentKey] as NumNode).value
    const level = data.get(input.total[talentKey]).value
    const asc = data.get(input.asc).value

    header = <DropdownButton fullWidth title={`Talent Lv. ${level}`} color={levelBoost ? "info" : "primary"} sx={{ borderRadius: 0 }}>
      {range(1, talentLimits[asc]).map(i =>
        <MenuItem key={i} selected={talent[talentKey] === (i)} disabled={talent[talentKey] === (i)} onClick={() => setTalentLevel(talentKey, i)}>Talent Lv. {i + levelBoost}</MenuItem>)}
    </DropdownButton>
  }
  const talentSheet = characterSheet.getTalentOfKey(talentKey)

  // Hide header if the header matches the current talent
  const hideHeader = (section: DocumentSection): boolean => {
    let headerAction = section.header?.action
    if (headerAction && (typeof headerAction !== "string")) {
      const key: string = headerAction.props.children.props.key18
      return key.includes(talentKey)
    }
    return false
  }

  return <CardLight sx={{ height: "100%" }}>
    {header}
    <CardContent>
      <ConditionalWrapper condition={!!onClickTitle} wrapper={actionWrapeprFunc} >
        <Grid container sx={{ flexWrap: "nowrap" }}>
          <Grid item>
            <Box component="img" src={talentSheet?.img} sx={{ width: 60, height: "auto" }} />
          </Grid>
          <Grid item flexGrow={1} sx={{ pl: 1 }}>
            <Typography variant="h6">{talentSheet?.name}</Typography>
            <Typography variant="subtitle1">{subtitle}</Typography>
          </Grid>
        </Grid>
      </ConditionalWrapper>
      {/* Display document sections */}
      {talentSheet?.sections ? <DocumentDisplay sections={talentSheet.sections} hideDesc hideHeader={hideHeader} /> : null}
    </CardContent>
  </CardLight>
}
