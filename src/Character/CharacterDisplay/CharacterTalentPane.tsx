import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, CardActionArea, CardContent, Divider, Grid, MenuItem, Typography } from "@mui/material";
import React, { useCallback, useContext, useState } from 'react';
import { buildContext } from "../../Build/Build";
import BootstrapTooltip from "../../Components/BootstrapTooltip";
import CardDark from "../../Components/Card/CardDark";
import CardLight from "../../Components/Card/CardLight";
import ColorText from "../../Components/ColoredText";
import ConditionalWrapper from "../../Components/ConditionalWrapper";
import DocumentDisplay from "../../Components/DocumentDisplay";
import DropdownButton from "../../Components/DropdownMenu/DropdownButton";
import FieldDisplay, { FieldDisplayList } from "../../Components/FieldDisplay";
import StatIcon from "../../Components/StatIcon";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import { ICachedCharacter } from "../../Types/character";
import statsToFields from "../../Util/FieldUtil";
import CharacterSheet from "../CharacterSheet";
type CharacterTalentPaneProps = {
  characterSheet: CharacterSheet,
  character: ICachedCharacter,
}
export default function CharacterTalentPane({ characterSheet, character, character: { ascension, constellation, key: characterKey } }: CharacterTalentPaneProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]
  const passivesList: Array<[tKey: string, tText: string, asc: number]> = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const build = newBuild ? newBuild : equippedBuild
  return <>
    <ReactionDisplay characterSheet={characterSheet} />
    <Grid container spacing={1} sx={{ mb: 1 }}>
      {/* auto, skill, burst */}
      {skillBurstList.map(([tKey, tText]) =>
        <Grid item key={tKey} xs={12} md={6} lg={4} >
          <SkillDisplayCard
            characterSheet={characterSheet}
            character={character}
            characterDispatch={characterDispatch}
            talentKey={tKey}
            subtitle={tText}
          />
        </Grid>)}
      {!!characterSheet.getTalentOfKey("sprint", build?.characterEle) && <Grid item xs={12} md={6} lg={4} >
        <SkillDisplayCard
          characterSheet={characterSheet}
          character={character}
          characterDispatch={characterDispatch}
          talentKey="sprint"
          subtitle="Alternative Sprint"
        />
      </Grid>}
      {!!characterSheet.getTalentOfKey("passive", build?.characterEle) && <Grid item xs={12} md={6} lg={4} >
        <SkillDisplayCard
          characterSheet={characterSheet}
          character={character}
          characterDispatch={characterDispatch}
          talentKey="passive"
          subtitle="Passive"
        />
      </Grid>}
    </Grid>
    <Grid container spacing={1}>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let enabled = ascension >= asc
        if (!characterSheet.getTalentOfKey(tKey, build?.characterEle)) return null
        return <Grid item key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} >
          <SkillDisplayCard
            characterSheet={characterSheet}
            character={character}
            characterDispatch={characterDispatch}
            talentKey={tKey}
            subtitle={tText}
          />
        </Grid>
      })}
    </Grid>
    <Typography variant="h6" sx={{ textAlign: "center" }}>Constellation Lv. {constellation}</Typography>
    <Grid container spacing={1}>
      {/* constellations */}
      {[...Array(6).keys()].map(i => {
        let tKey = `constellation${i + 1}`
        return <Grid item key={i} xs={12} md={4}
          style={{ opacity: constellation > i ? 1 : 0.5 }}>
          <SkillDisplayCard
            characterSheet={characterSheet}
            character={character}
            characterDispatch={characterDispatch}
            talentKey={tKey}
            subtitle={`Contellation Lv. ${i + 1}`}
            onClickTitle={() => characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })}
          />
        </Grid>
      })}
    </Grid>
  </>
}
const ReactionComponents = {
  superconduct_hit: SuperConductCard,
  electrocharged_hit: ElectroChargedCard,
  overloaded_hit: OverloadedCard,
  pyro_swirl_hit: SwirlCard,
  shattered_hit: ShatteredCard,
  crystalize_hit: CrystalizeCard,
}
function ReactionDisplay({ characterSheet }: { characterSheet: CharacterSheet }) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  const charEleKey = build.characterEle
  const eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shattered_hit") && characterSheet.weaponTypeKey === "claymore") eleInterArr.push("shattered_hit")
  return <CardLight sx={{ mb: 1 }}>
    <CardContent>
      <Grid container spacing={1}>
        {eleInterArr.map(key => {
          const Ele = ReactionComponents[key]
          if (!Ele) return null
          return <Grid item key={key}><Ele stats={build} /></Grid>
        })}
      </Grid>
    </CardContent>
  </CardLight>
}
function SuperConductCard({ stats }) {
  const sKey = "superconduct_hit"
  return <CardDark><CardContent sx={{ p: 1 }}>
    <Typography color="superconduct.main">{Stat.getStatName(sKey)} {StatIcon.electro}+{StatIcon.cryo} <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></Typography>
  </CardContent></CardDark>
}
function ElectroChargedCard({ stats }) {
  const sKey = "electrocharged_hit"
  return <CardDark><CardContent sx={{ p: 1 }}>
    <Typography color="electrocharged.main">{Stat.getStatName(sKey)} {StatIcon.electro}+{StatIcon.hydro} <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></Typography>
  </CardContent></CardDark>
}
function OverloadedCard({ stats }) {
  const sKey = "overloaded_hit"
  return <CardDark><CardContent sx={{ p: 1 }}>
    <Typography color="overloaded.main" >{Stat.getStatName(sKey)} {StatIcon.electro}+{StatIcon.pyro} <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></Typography>
  </CardContent></CardDark>
}

const swirlEleToDisplay = {
  "pyro": <span>{Stat.getStatName("pyro_swirl_hit")} {StatIcon.pyro} + {StatIcon.anemo}</span>,
  "electro": <span>{Stat.getStatName("electro_swirl_hit")} {StatIcon.electro}+{StatIcon.anemo}</span>,
  "cryo": <span>{Stat.getStatName("cryo_swirl_hit")} {StatIcon.cryo} + {StatIcon.anemo}</span>,
  "hydro": <span>{Stat.getStatName("hydro_swirl_hit")} {StatIcon.hydro} + {StatIcon.anemo}</span>
} as const
function SwirlCard({ stats }) {
  const [ele, setele] = useState(Object.keys(swirlEleToDisplay)[0])
  const sKey = `${ele}_swirl_hit`
  return <CardDark sx={{ display: "flex" }}>
    <DropdownButton size="small" title={swirlEleToDisplay[ele]} color="success">
      {Object.entries(swirlEleToDisplay).map(([key, element]) => <MenuItem key={key} selected={ele === key} disabled={ele === key} onClick={() => setele(key)}>{element}</MenuItem>)}
    </DropdownButton>
    <Box sx={{ color: `${ele}.main`, p: 1 }}><strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></Box>
  </CardDark>
}
function ShatteredCard({ stats }) {
  const sKey = "shattered_hit"
  const information = <BootstrapTooltip placement="top" title={<Typography>Claymores, Plunging Attacks and <ColorText color="geo">Geo DMG</ColorText></Typography>}>
    <Box component="span" sx={{ cursor: "help" }}><FontAwesomeIcon icon={faQuestionCircle} /></Box>
  </BootstrapTooltip>

  return <CardDark><CardContent sx={{ p: 1 }}>
    <ColorText color="shattered">{Stat.getStatName(sKey)} {StatIcon.hydro}+{StatIcon.cryo}+ <ColorText color="physical"><small>Heavy Attack{information} </small></ColorText> <strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></ColorText>
  </CardContent></CardDark>
}
const crystalizeEleToDisplay = {
  "default": <ColorText color="crystalize">{Stat.getStatName("crystalize_hit")} {StatIcon.electro}/{StatIcon.hydro}/{StatIcon.pyro}/{StatIcon.cryo}+{StatIcon.geo}</ColorText>,
  "pyro": <span>{Stat.getStatName("pyro_crystalize_hit")} {StatIcon.pyro}+{StatIcon.geo}</span>,
  "electro": <span>{Stat.getStatName("electro_crystalize_hit")} {StatIcon.electro}+{StatIcon.geo}</span>,
  "cryo": <span>{Stat.getStatName("cryo_crystalize_hit")} {StatIcon.cryo}+{StatIcon.geo}</span>,
  "hydro": <span>{Stat.getStatName("hydro_crystalize_hit")} {StatIcon.hydro}+{StatIcon.geo}</span>
} as const
function CrystalizeCard({ stats }) {
  const [ele, setele] = useState(Object.keys(crystalizeEleToDisplay)[0])
  const sKey = ele === "default" ? "crystalize_hit" : `${ele}_crystalize_hit`
  return <CardDark sx={{ display: "flex" }}>
    <DropdownButton size="small" title={crystalizeEleToDisplay[ele]} color="success">
      {Object.entries(crystalizeEleToDisplay).map(([key, element]) => <MenuItem key={key} selected={ele === key} disabled={ele === key} onClick={() => setele(key)}>{element}</MenuItem>)}
    </DropdownButton>
    <Box sx={{ color: `${ele}.main`, p: 1 }}><strong>{stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</strong></Box>
  </CardDark>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
type SkillDisplayCardProps = {
  characterSheet: CharacterSheet
  character: ICachedCharacter,
  characterDispatch: (any) => void,
  talentKey: string,
  subtitle: string,
  onClickTitle?: (any) => any
}
function SkillDisplayCard({ characterSheet, character: { talent, ascension, key: characterKey }, characterDispatch, talentKey, subtitle, onClickTitle }: SkillDisplayCardProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  let build = newBuild ? newBuild : equippedBuild

  const actionWrapeprFunc = useCallback(
    children => <CardActionArea onClick={onClickTitle}>{children}</CardActionArea>,
    [onClickTitle],
  )

  if (!build) return null
  let header: Displayable | null = null

  if (talentKey in talent) {
    const levelBoost: number = build[`${talentKey}Boost`] ?? 0
    const talentLvlKey = talent[talentKey] + levelBoost
    const setTalentLevel = (tKey, newTalentLevelKey) => {
      talent[tKey] = newTalentLevelKey
      characterDispatch({ talent })
    }
    header = <>
      <CardContent sx={{ py: 1 }}>
        <DropdownButton fullWidth title={`Talent Lv. ${talentLvlKey}`} color={levelBoost ? "info" : "primary"}>
          {[...Array(talentLimits[ascension] + (talentKey === "auto" && !levelBoost ? 1 : 0)).keys()].map(i => //spcial consideration for Tartaglia
            <MenuItem key={i} selected={talent[talentKey] === (i + 1)} disabled={talent[talentKey] === (i + 1)} onClick={() => setTalentLevel(talentKey, i + 1)}>Talent Lv. {i + levelBoost + 1}</MenuItem>)}
        </DropdownButton>
      </CardContent>
      <Divider />
    </>

  }
  const talentStats = characterSheet.getTalentStats(talentKey, build)
  const talentStatsFields = talentStats && statsToFields(talentStats, build)
  const statsEle = talentStatsFields && !!talentStatsFields.length &&
    <FieldDisplayList >
      {talentStatsFields.map((field, i) =>
        <FieldDisplay key={i} field={field} />)}
    </FieldDisplayList>

  const talentSheet = characterSheet.getTalentOfKey(talentKey, build.characterEle)
  const sections = talentSheet?.sections

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
      {sections ? <DocumentDisplay {...{ sections, characterKey, equippedBuild, newBuild }} /> : null}
      {statsEle}
    </CardContent>
  </CardLight>
}
