import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Badge, Box, Button, CardActionArea, CardContent, Divider, Grid, IconButton, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Assets from "../../../Assets/Assets";
import ArtifactCardNano from "../../../Components/Artifact/ArtifactCardNano";
import CardLight from "../../../Components/Card/CardLight";
import ColorText from "../../../Components/ColoredText";
import { NodeFieldDisplay } from "../../../Components/FieldDisplay";
import ImgIcon from "../../../Components/Image/ImgIcon";
import { Stars } from "../../../Components/StarDisplay";
import StatIcon from "../../../Components/StatIcon";
import WeaponCardNano from "../../../Components/Weapon/WeaponCardNano";
import CharacterSheet from "../../../Data/Characters/CharacterSheet";
import { DataContext } from "../../../DataContext";
import { uiInput as input } from "../../../Formula";
import { ReadNode } from "../../../Formula/type";
import KeyMap, { valueString } from "../../../KeyMap";
import { amplifyingReactions, transformativeReactions } from "../../../KeyMap/StatConstants";
import useCharacterReducer from "../../../ReactHooks/useCharacterReducer";
import { TalentSheetElementKey } from "../../../Types/character";
import { allElementsWithPhy, allSlotKeys, ElementKey } from "../../../Types/consts";
import { range } from "../../../Util/Util";
import CharacterCardPico from "../../../Components/Character/CharacterCardPico";
import StatInput from "../../../Components/StatInput";

export default function TabOverview() {
  const { data, characterSheet, character, character: { key: characterKey } } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const navigate = useNavigate()
  const { t } = useTranslation("page_character")
  const charEle = data.get(input.charEle).value as ElementKey
  const weaponTypeKey = characterSheet.weaponTypeKey
  const level = data.get(input.lvl).value
  const ascension = data.get(input.asc).value
  const constellation = data.get(input.constellation).value
  const tlvl = {
    auto: data.get(input.total.auto).value,
    skill: data.get(input.total.skill).value,
    burst: data.get(input.total.burst).value,
  }
  const tBoost = {
    auto: data.get(input.bonus.auto).value,
    skill: data.get(input.bonus.skill).value,
    burst: data.get(input.bonus.burst).value,
  }
  return <Grid container spacing={1} sx={{ justifyContent: "center" }}>
    <Grid item xs={8} sm={5} md={4} lg={2.5}  >
      {/* Image card with star and name and level */}
      <CardLight >
        <Box src={characterSheet.cardImg} component="img" width="100%" height="auto" />
        <CardContent>
          <Typography variant="h5" >
            {characterSheet.name}&nbsp;
            <ImgIcon sx={{ pr: 0.5 }} src={Assets.weaponTypes?.[weaponTypeKey]} />
            {StatIcon[charEle]}
            <IconButton sx={{ p: 0.5, mt: -0.5 }} onClick={() => characterDispatch({ favorite: !character.favorite })}>
              {character.favorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Typography>
          <Typography variant="h6"><Stars stars={characterSheet.rarity} colored /></Typography>
          <Typography variant="h5">Lvl. {CharacterSheet.getLevelString(level, ascension)}</Typography>
          <CardActionArea sx={{ p: 1 }} onClick={() => navigate("talent")}>
            <Grid container spacing={1} mt={-1}>
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
          </CardActionArea>
          <Typography sx={{ textAlign: "center", mt: 1 }} variant="h6">{characterSheet.constellationName}</Typography>
          <Grid container spacing={1}>
            {range(1, 6).map(i =>
              <Grid item xs={4} key={i}>
                <CardActionArea onClick={() => characterDispatch({ constellation: i === constellation ? i - 1 : i })}>
                  <Box component="img" src={characterSheet.getTalentOfKey(`constellation${i}` as TalentSheetElementKey, charEle)?.img}
                    sx={{
                      ...(constellation >= i ? {} : { filter: "brightness(50%)" })
                    }}
                    width="100%" height="auto" />
                </CardActionArea>
              </Grid>)}
          </Grid>
          <Typography sx={{ textAlign: "center", mt: 1 }} variant="h6">{t("teammates")}</Typography>
          <CardActionArea sx={{ p: 1 }} onClick={() => navigate("teambuffs")}>
            <Grid container columns={3} spacing={1}>
              {range(0, 2).map(i => <Grid key={i} item xs={1} height="100%"><CharacterCardPico characterKey={character.team[i]} index={i} /></Grid>)}
            </Grid>
          </CardActionArea>
        </CardContent>
      </CardLight>
    </Grid>
    <Grid item xs={12} sm={7} md={8} lg={9.5} sx={{
      display: "flex", flexDirection: "column", gap: 1
    }} >
      <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 4, xl: 6 }}>
        <Grid item xs={1}>
          <WeaponCardNano weaponId={character.equippedWeapon} BGComponent={CardLight} onClick={() => navigate("equip")} />
        </Grid>
        {allSlotKeys.map(slotKey =>
          <Grid item key={slotKey} xs={1} >
            <ArtifactCardNano artifactId={data.get(input.art[slotKey].id).value} slotKey={slotKey} BGComponent={CardLight} onClick={() => navigate("equip")} />
          </Grid>)}
      </Grid>
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
  ...allElementsWithPhy.map(ele => input.total[`${ele}_dmg_`]),
  ...allElementsWithPhy.map(ele => input.total[`${ele}_res_`]),
  ...(["stamina", "incHeal_", "shield_", "cdRed_"] as const).map(x => input.total[x])
]
const otherStatKeys = otherStatReadNodes.map(x => x.info!.key!)

const miscStatReadNodes = [
  input.total.all_dmg_,
  ...allElementsWithPhy.map(x => input.total[`${x}_enemyRes_`]),
  input.total.normal_dmg_, input.total.normal_critRate_,
  input.total.charged_dmg_, input.total.charged_critRate_,
  input.total.plunging_dmg_, input.total.plunging_critRate_,
  input.total.skill_dmg_, input.total.skill_critRate_,
  input.total.burst_dmg_, input.total.burst_critRate_,
  ...Object.keys(transformativeReactions).map(x => input.total[`${x}_dmg_`]),
  ...Object.keys(amplifyingReactions).map(x => input.total[`${x}_dmg_`]),
  ...(["moveSPD_", "atkSPD_", "weakspotDMG_"] as const).map(x => input.total[x]),
  input.total.dmgRed_
]
const miscStatkeys = miscStatReadNodes.map(x => x.info!.key!)

const statBreakpoint = {
  xs: 12, sm: 12, md: 6, lg: 4,
} as const

function StatDisplayContent({ nodes, statBreakpoint, extra }: { nodes: ReadNode<number>[], statBreakpoint: object, extra?: Displayable }) {
  const { data, oldData } = useContext(DataContext)
  return <Grid container columnSpacing={{ xs: 2, lg: 3 }} rowSpacing={1}>
    {nodes.map(rn => <Grid item key={rn.info?.key} {...statBreakpoint} >
      {<NodeFieldDisplay node={data.get(rn)} oldValue={oldData?.get(rn)?.value} />}
    </Grid>)}
    {extra}
  </Grid>
}

function MainStatsCards() {
  const { data, character, character: { key: characterKey } } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const specialNode = data.get(input.special)

  return <>
    <StatDisplayCard
      title="Main Stats"
      content={<StatDisplayContent statBreakpoint={statBreakpoint} nodes={mainReadNodes}
        extra={specialNode && <Grid item {...statBreakpoint} display="flex" flexDirection="row" justifyContent="space-between">
          <span><b>Special:</b> <ColorText color={specialNode.info.variant}>{specialNode.info.key && StatIcon[specialNode.info.key]} {specialNode.info.key && KeyMap.get(specialNode.info.key)}</ColorText></span>
          <span >{valueString(specialNode.value, specialNode.unit)}</span>
        </Grid>}
      />}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {mainEditKeys.map(statKey => {
          const statName = KeyMap.get(statKey)
          return <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {statName}</span>}
              placeholder={KeyMap.getStr(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={KeyMap.unit(statKey) === "%"}
              onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
            />
          </Grid>
        })}
      </Grid>}
    />
    <StatDisplayCard
      title="Other Stats"
      content={<StatDisplayContent statBreakpoint={statBreakpoint} nodes={otherStatReadNodes} />}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {otherStatKeys.map(statKey => {
          const statName = KeyMap.get(statKey)
          return <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {statName}</span>}
              placeholder={KeyMap.getStr(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={KeyMap.unit(statKey) === "%"}
              defaultValue={undefined}
              onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
            />
          </Grid>
        })}
      </Grid>}
    />
    <StatDisplayCard
      title="Misc Stats"
      content={<StatDisplayContent statBreakpoint={{
        xs: 12, sm: 12, md: 6,
      }} nodes={miscStatReadNodes} />}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {miscStatkeys.map(statKey => {
          const statName = KeyMap.get(statKey)
          return <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {statName}</span>}
              placeholder={KeyMap.getStr(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={KeyMap.unit(statKey) === "%"}
              onValueChange={value => characterDispatch({ type: "editStats", statKey, value })}
            />
          </Grid>
        })}
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
