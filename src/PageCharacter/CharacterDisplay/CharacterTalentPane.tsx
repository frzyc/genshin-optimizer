import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, CardActionArea, CardContent, Divider, Grid, MenuItem, Typography } from "@mui/material";
import React, { useCallback, useContext, useState } from 'react';
import BootstrapTooltip from "../../Components/BootstrapTooltip";
import CardDark from "../../Components/Card/CardDark";
import CardLight from "../../Components/Card/CardLight";
import ColorText from "../../Components/ColoredText";
import ConditionalWrapper from "../../Components/ConditionalWrapper";
import DocumentDisplay from "../../Components/DocumentDisplay";
import DropdownButton from "../../Components/DropdownMenu/DropdownButton";
import StatIcon from "../../Components/StatIcon";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import { TalentSheetElementKey } from "../../Types/character";
import { DataContext } from '../../DataContext';
import { uiInput as input } from "../../Formula";
import { ElementKey } from "../../Types/consts";
import KeyMap, { valueString } from '../../KeyMap'
import { NodeDisplay } from '../../Formula/uiData'
import { NumNode } from "../../Formula/type";
import { range } from "../../Util/Util";
export default function CharacterTalentPane() {
  const { data, character, characterSheet } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(character.key)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]] as [TalentSheetElementKey, string][]
  const passivesList: [tKey: TalentSheetElementKey, tText: string, asc: number][] = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const charEle = data.get(input.charEle).value as ElementKey | undefined
  const ascension = data.get(input.asc).value
  const constellation = data.get(input.constellation).value
  return <>
    <ReactionDisplay />
    <Grid container spacing={1} sx={{ mb: 1 }}>
      {/* auto, skill, burst */}
      {skillBurstList.map(([tKey, tText]) =>
        <Grid item key={tKey} xs={12} md={6} lg={4} >
          <SkillDisplayCard
            talentKey={tKey}
            subtitle={tText}
          />
        </Grid>)}
      {!!characterSheet.getTalentOfKey("sprint", charEle) && <Grid item xs={12} md={6} lg={4} >
        <SkillDisplayCard
          talentKey="sprint"
          subtitle="Alternative Sprint"
        />
      </Grid>}
      {!!characterSheet.getTalentOfKey("passive", charEle) && <Grid item xs={12} md={6} lg={4} >
        <SkillDisplayCard
          talentKey="passive"
          subtitle="Passive"
        />
      </Grid>}
    </Grid>
    <Grid container spacing={1}>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let enabled = ascension >= asc
        if (!characterSheet.getTalentOfKey(tKey, charEle)) return null
        return <Grid item key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} >
          <SkillDisplayCard
            talentKey={tKey}
            subtitle={tText}
          />
        </Grid>
      })}
    </Grid>
    <Typography variant="h6" sx={{ textAlign: "center" }}>Constellation Lv. {constellation}</Typography>
    <Grid container spacing={1}>
      {/* constellations */}
      {range(1, 6).map(i => {
        let tKey = `constellation${i}` as TalentSheetElementKey
        return <Grid item key={i} xs={12} md={4}
          sx={{ opacity: constellation >= i ? 1 : 0.5 }}>
          <SkillDisplayCard
            talentKey={tKey}
            subtitle={`Contellation Lv. ${i}`}
            onClickTitle={() => characterDispatch({ constellation: i === constellation ? i - 1 : i })}
          />
        </Grid>
      })}
    </Grid>
  </>
}
const ReactionComponents = {
  superconduct: SuperConductCard,
  electrocharged: ElectroChargedCard,
  overloaded: OverloadedCard,
  pyroSwirl: SwirlCard,// TODO: Assumes if character can pyro swirl, it can swirl every element. This behaviour will need to be changed for characters that can only swirl specific elements.
  shattered: ShatteredCard,
  crystallize: CrystallizeCard,
}
function ReactionDisplay() {
  const { data } = useContext(DataContext)
  const reaction = data.getDisplay().reaction as { [key: string]: NodeDisplay }
  return <CardLight sx={{ mb: 1 }}>
    <CardContent>
      <Grid container spacing={1}>
        {Object.entries(reaction).map(([key, node]) => {
          const Ele = ReactionComponents[key]
          if (!Ele) return null
          return <Grid item key={key}><Ele node={node} /></Grid>
        })}
      </Grid>
    </CardContent>
  </CardLight>
}
function SuperConductCard({ node }: { node: NodeDisplay }) {
  return <CardDark><CardContent sx={{ p: 1 }}>
    <Typography color="superconduct.main">{KeyMap.get(node.key!)} {StatIcon.electro}+{StatIcon.cryo} <strong>{valueString(node.value, node.unit)}</strong></Typography>
  </CardContent></CardDark>
}
function ElectroChargedCard({ node }: { node: NodeDisplay }) {
  return <CardDark><CardContent sx={{ p: 1 }}>
    <Typography color="electrocharged.main">{KeyMap.get(node.key!)} {StatIcon.electro}+{StatIcon.hydro} <strong>{valueString(node.value, node.unit)}</strong></Typography>
  </CardContent></CardDark>
}
function OverloadedCard({ node }: { node: NodeDisplay }) {
  return <CardDark><CardContent sx={{ p: 1 }}>
    <Typography color="overloaded.main" >{KeyMap.get(node.key!)} {StatIcon.electro}+{StatIcon.pyro} <strong>{valueString(node.value, node.unit)}</strong></Typography>
  </CardContent></CardDark>
}

const swirlEleToDisplay = {
  "pyro": <span><ColorText color="pyro">{KeyMap.get("pyro_swirl_hit")}</ColorText> {StatIcon.pyro} + {StatIcon.anemo}</span>,
  "electro": <span><ColorText color="electro">{KeyMap.get("electro_swirl_hit")}</ColorText> {StatIcon.electro}+{StatIcon.anemo}</span>,
  "cryo": <span><ColorText color="cryo">{KeyMap.get("cryo_swirl_hit")}</ColorText> {StatIcon.cryo} + {StatIcon.anemo}</span>,
  "hydro": <span><ColorText color="hydro">{KeyMap.get("hydro_swirl_hit")}</ColorText> {StatIcon.hydro} + {StatIcon.anemo}</span>
} as const

function SwirlCard() {
  const [ele, setele] = useState(Object.keys(swirlEleToDisplay)[0])
  const { data } = useContext(DataContext)
  const node = data.getDisplay().reaction![`${ele}Swirl`]!
  return <CardDark sx={{ display: "flex" }}>
    <DropdownButton size="small" title={swirlEleToDisplay[ele]} color="success">
      {Object.entries(swirlEleToDisplay).map(([key, element]) => <MenuItem key={key} selected={ele === key} disabled={ele === key} onClick={() => setele(key)}>{element}</MenuItem>)}
    </DropdownButton>
    <Box sx={{ color: `${ele}.main`, p: 1 }}><strong>{valueString(node.value, node.unit)}</strong></Box>
  </CardDark>
}

function ShatteredCard({ node }: { node: NodeDisplay }) {
  const information = <BootstrapTooltip placement="top" title={<Typography>Claymores, Plunging Attacks and <ColorText color="geo">Geo DMG</ColorText></Typography>}>
    <Box component="span" sx={{ cursor: "help" }}><FontAwesomeIcon icon={faQuestionCircle} /></Box>
  </BootstrapTooltip>

  return <CardDark><CardContent sx={{ p: 1 }}>
    <ColorText color="shattered">{KeyMap.get(node.key!)} {StatIcon.hydro}+{StatIcon.cryo}+ <ColorText color="physical"><small>Heavy Attack{information} </small></ColorText> <strong>{valueString(node.value, node.unit)}</strong></ColorText>
  </CardContent></CardDark>
}

const crystallizeEleToDisplay = {
  "geo": <ColorText color="crystallize">{KeyMap.get("crystallize")} {StatIcon.electro}/{StatIcon.hydro}/{StatIcon.pyro}/{StatIcon.cryo}+{StatIcon.geo}</ColorText>,
  "pyro": <span><ColorText color="pyro">{KeyMap.get("pyro_crystallize")}</ColorText> {StatIcon.pyro}+{StatIcon.geo}</span>,
  "electro": <span><ColorText color="electro">{KeyMap.get("electro_crystallize")}</ColorText> {StatIcon.electro}+{StatIcon.geo}</span>,
  "cryo": <span><ColorText color="cryo">{KeyMap.get("cryo_crystallize")}</ColorText> {StatIcon.cryo}+{StatIcon.geo}</span>,
  "hydro": <span><ColorText color="hydro">{KeyMap.get("hydro_crystallize")}</ColorText> {StatIcon.hydro}+{StatIcon.geo}</span>
} as const

function CrystallizeCard() {
  const [ele, setele] = useState(Object.keys(crystallizeEleToDisplay)[0])
  const { data } = useContext(DataContext)
  const node = ele === "geo" ? data.getDisplay().reaction!.crystallize! : data.getDisplay().reaction![`${ele}Crystallize`]!
  return <CardDark sx={{ display: "flex" }}>
    <DropdownButton size="small" title={crystallizeEleToDisplay[ele]} color="success">
      {Object.entries(crystallizeEleToDisplay).map(([key, element]) => <MenuItem key={key} selected={ele === key} disabled={ele === key} onClick={() => setele(key)}>{element}</MenuItem>)}
    </DropdownButton>
    <Box sx={{ color: `${ele}.main`, p: 1 }}><strong>{valueString(node.value, node.unit)}</strong></Box>
  </CardDark>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
type SkillDisplayCardProps = {
  talentKey: TalentSheetElementKey,
  subtitle: string,
  onClickTitle?: (any) => any
}
function SkillDisplayCard({ talentKey, subtitle, onClickTitle }: SkillDisplayCardProps) {
  const { data, character: { talent }, characterSheet, characterDispatch } = useContext(DataContext)

  const actionWrapeprFunc = useCallback(
    children => <CardActionArea onClick={onClickTitle}>{children}</CardActionArea>,
    [onClickTitle],
  )

  let header: Displayable | null = null

  if (talentKey in talent) {
    const levelBoost = data.get(input.bonus[talentKey] as NumNode).value
    const level = data.get(input.total[talentKey]).value
    const asc = data.get(input.asc).value
    const setTalentLevel = (tKey, newTalentLevelKey) => {
      talent[tKey] = newTalentLevelKey
      characterDispatch({ talent })
    }
    header = <>
      <CardContent sx={{ py: 1 }}>
        <DropdownButton fullWidth title={`Talent Lv. ${level}`} color={levelBoost ? "info" : "primary"}>
          {range(1, talentLimits[asc]).map(i =>
            <MenuItem key={i} selected={talent[talentKey] === (i)} disabled={talent[talentKey] === (i)} onClick={() => setTalentLevel(talentKey, i)}>Talent Lv. {i + levelBoost}</MenuItem>)}
        </DropdownButton>
      </CardContent>
      <Divider />
    </>
  }
  const talentSheet = characterSheet.getTalentOfKey(talentKey, data.get(input.charEle).value as ElementKey | undefined)

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
      {talentSheet?.sections ? <DocumentDisplay sections={talentSheet.sections} /> : null}
    </CardContent>
  </CardLight>
}
