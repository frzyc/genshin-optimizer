import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Box, Button, CardContent, CardMedia, Divider, Grid, Typography } from "@mui/material";
import { CharacterKey } from "pipeline";
import React, { useContext, useState } from "react";
import Assets from "../../Assets/Assets";
import CardLight from "../../Components/Card/CardLight";
import ColorText from "../../Components/ColoredText";
import { NodeFieldDisplay } from "../../Components/FieldDisplay";
import ImgIcon from "../../Components/Image/ImgIcon";
import { Stars } from "../../Components/StarDisplay";
import StatIcon from "../../Components/StatIcon";
import { DataContext } from "../../DataContext";
import { valueString } from "../../Formula/api";
import { input } from "../../Formula/index";
import { ReadNode } from "../../Formula/type";
import KeyMap from "../../KeyMap";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import { amplifyingReactions, transformativeReactions } from "../../StatConstants";
import { ICachedCharacter, TalentSheetElementKey } from "../../Types/character";
import { allElementsWithPhy, ElementKey } from "../../Types/consts";
import WeaponDisplayCard from "../../Weapon/WeaponDisplayCard";
import CharacterSheet from "../CharacterSheet_WR";
import StatInput from "../StatInput";
type CharacterOverviewPaneProps = {
  character: ICachedCharacter;
  characterSheet: CharacterSheet;
  weaponId: string
}
export default function CharacterOverviewPane({ character, characterSheet, weaponId }: CharacterOverviewPaneProps) {
  const { data } = useContext(DataContext)
  const characterKey = (data?.getStr(input.charKey)?.value ?? "") as CharacterKey | ""
  const characterDispatch = useCharacterReducer(characterKey)
  if (!data) return null
  const charEle = data.getStr(input.charEle).value as ElementKey
  const weaponTypeKey = characterSheet.weaponTypeKey
  const level = data.get(input.lvl).value
  const ascension = data.get(input.asc).value
  const constellation = data.get(input.constellation).value
  const tlvl = {
    auto: data.get(input.talent.total.auto).value,
    skill: data.get(input.talent.total.skill).value,
    burst: data.get(input.talent.total.burst).value,
  }
  const tBoost = {
    auto: data.get(input.talent.boost.auto).value,
    skill: data.get(input.talent.boost.skill).value,
    burst: data.get(input.talent.boost.burst).value,
  }
  return <Grid container spacing={1}>
    <Grid item xs={12} md={3}  >
      {/* Image card with star and name and level */}
      <CardLight >
        <CardMedia src={characterSheet.cardImg} component="img" width="100%" height="auto" />
        <CardContent>
          <Typography variant="h4" >{characterSheet.name} <ImgIcon src={Assets.weaponTypes?.[weaponTypeKey]} /> {StatIcon[charEle]} </Typography>
          <Typography variant="h6"><Stars stars={characterSheet.rarity} colored /></Typography>
          <Typography variant="h5">Lvl. {CharacterSheet.getLevelString(level, ascension)}</Typography>
          <Grid container spacing={1} mt={1}>
            {(["auto", "skill", "burst"] as TalentSheetElementKey[]).map(tKey =>
              <Grid item xs={4} key={tKey}>
                <Badge badgeContent={tlvl[tKey]} color={tBoost[tKey] ? "info" : "secondary"}
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    "& > .MuiBadge-badge": {
                      fontSize: "1.25em",
                      padding: ".25em .4em",
                      borderRadius: ".5em",
                      lineHeight: 1,
                      height: "1.25em"
                    }
                  }}>
                  <Box component="img" src={characterSheet.getTalentOfKey(tKey, charEle)?.img} width="100%" height="auto" />
                </Badge>
              </Grid>)}
          </Grid>
          <Typography sx={{ textAlign: "center", mt: 1 }} variant="h6">{characterSheet.constellationName}</Typography>
          <Grid container spacing={1}>
            {[...Array(6).keys()].map(i =>
              <Grid item xs={4} key={i}>
                <Box component="img" src={characterSheet.getTalentOfKey(`constellation${i + 1}` as TalentSheetElementKey, charEle)?.img}
                  sx={{
                    cursor: "pointer",
                    ...(constellation > i ? {} : { filter: "brightness(50%)" })
                  }}
                  width="100%" height="auto"
                  onClick={() => characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })} />
              </Grid>)}
          </Grid>
        </CardContent>
      </CardLight>
    </Grid>
    <Grid item xs={12} md={9} sx={{
      "> div:not(:last-child)": { mb: 1 }
    }} >
      <WeaponDisplayCard weaponId={weaponId} />
      <MainStatsCards />
    </Grid>
  </Grid >
}
const EDIT = "Edit Stats"
const EXIT = "EXIT"

const mainBaseKeys = ["atk", "hp", "def"] as const
const mainSubKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"] as const
const mainReadNodes = [...mainBaseKeys, ...mainSubKeys].map(k => input.total[k])
const mainEditKeys = ["atk_", "atk", "hp_", "hp", "def_", "def", ...mainSubKeys] as const

const otherStatReadNodes = [
  ...allElementsWithPhy.map(ele => input.bonus.dmg[ele]),
  ...allElementsWithPhy.map(ele => input.bonus.res[ele]),
  ...["stamina", "incHeal_", "shield_", "cdRed_"].map(x => input.misc[x])
]
const otherStatKeys = otherStatReadNodes.map(x => x.info.key)

const miscStatReadNodes = [
  input.bonus.dmg.common,
  ...allElementsWithPhy.map(x => input.enemy.res[x]),
  input.bonus.dmg.normal, input.bonus.crit.normal,
  input.bonus.dmg.charged, input.bonus.crit.charged,
  input.bonus.dmg.plunging, input.bonus.crit.plunging,
  input.bonus.dmg.skill, input.bonus.crit.skill,
  input.bonus.dmg.burst, input.bonus.crit.burst,
  ...Object.keys(transformativeReactions).map(x => input.bonus.dmg[x]),
  ...Object.keys(amplifyingReactions).map(x => input.bonus.dmg[x]),
  ...["moveSPD_", "atkSPD_", "weakspotDMG_"].map(x => input.misc[x])
]
const miscStatkeys = miscStatReadNodes.map(x => x.info.key)

const statBreakpoint = {
  xs: 12, sm: 6, md: 6, lg: 4,
} as const

function StatDisplayContent({ nodes, statBreakpoint, extra }: { nodes: ReadNode[], statBreakpoint: object, extra?: Displayable }) {
  const { data, oldData } = useContext(DataContext)
  if (!data) return null
  return <Grid container columnSpacing={{ xs: 2, lg: 3 }} rowSpacing={1}>
    {nodes.map((rn, i) => <Grid item key={i} {...statBreakpoint} >
      {<NodeFieldDisplay node={data.get(rn)} oldValue={oldData?.get(rn)?.value} />}
    </Grid>)}
    {extra}
  </Grid>
}

function MainStatsCards() {

  const { data, character } = useContext(DataContext)
  const characterKey = (character?.key ?? "") as CharacterKey | ""
  const characterDispatch = useCharacterReducer(characterKey)
  if (!data || !character) return null
  const specialNode = data.get(input.special)

  return <>
    {/* TODO: Team buff stuff */}
    {/* <TeamBuffDisplay character={character} /> */}
    <StatDisplayCard
      title="Main Stats"
      content={<StatDisplayContent statBreakpoint={statBreakpoint} nodes={mainReadNodes}
        extra={specialNode && <Grid item {...statBreakpoint} display="flex" flexDirection="row" justifyContent="space-between">
          <span><b>Special:</b> <ColorText color={specialNode.variant}>{specialNode.key && StatIcon[specialNode.key]} {specialNode.key && KeyMap.get(specialNode.key)}</ColorText></span>
          <span >{valueString(specialNode.value, specialNode.unit)}</span>
        </Grid>}
      />}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {mainEditKeys.map(statKey =>
          <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {KeyMap.get(statKey)}</span>}
              placeholder={KeyMap.get(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={KeyMap.unit(statKey) === "%"}
              onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
            />
          </Grid>)}
      </Grid>}
    />
    <StatDisplayCard
      title="Other Stats"
      content={<StatDisplayContent statBreakpoint={statBreakpoint} nodes={otherStatReadNodes} />}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {otherStatKeys.map(statKey =>
          <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {KeyMap.get(statKey)}</span>}
              placeholder={KeyMap.get(statKey)}
              value={character.bonusStats[statKey] ?? (statKey === "stamina" ? 100 : 0)}
              percent={KeyMap.unit(statKey) === "%"}
              defaultValue={statKey === "stamina" ? 100 : undefined}
              onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
            />
          </Grid>)}
      </Grid>}
    />
    <StatDisplayCard
      title="Misc Stats"
      content={<StatDisplayContent statBreakpoint={{
        xs: 12, sm: 6, md: 6,
      }} nodes={miscStatReadNodes} />}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {miscStatkeys.map(statKey =>
          <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {KeyMap.get(statKey)}</span>}
              placeholder={KeyMap.get(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={KeyMap.unit(statKey) === "%"}
              onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
            />
          </Grid>)}
      </Grid>}
    />
  </>
}
function StatDisplayCard({ title, content, editContent }) {
  const [edit, setedit] = useState(false)
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="subtitle1">{title}</Typography>
        <Button size="small" color={edit ? "error" : "info"} onClick={() => setedit(!edit)} >
          <span><FontAwesomeIcon icon={edit ? faSave : faEdit} /> {edit ? EXIT : EDIT}</span>
        </Button>
      </Box>
    </CardContent>
    <Divider />
    <CardContent>
      {edit ? editContent : content}
    </CardContent>
  </CardLight>
}
function TeamBuffDisplay({ character }: { character: ICachedCharacter }) {
  // const { newBuild, equippedBuild } = useContext(buildContext)
  // const build = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  // if (!Object.keys(build.partyBuff).length) return null
  return <CardLight>
    <CardContent>
      Team Buffs
    </CardContent>
    <Divider />
    <CardContent>
      {/* <Grid container columnSpacing={2} rowSpacing={1}>
        {Object.entries(build.partyBuff).map(([statKey, value]) => <Grid item {...statBreakpoint} key={statKey} >
          <StatDisplay character={character} newBuild={newBuild} equippedBuild={equippedBuild} statKey={statKey} partyBuff />
        </Grid>)}
      </Grid> */}
    </CardContent>
  </CardLight>
}
