import { faEdit, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Box, Button, CardContent, CardMedia, Divider, Grid, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import Assets from "../../Assets/Assets";
import { buildContext } from "../../Build/Build";
import CardLight from "../../Components/Card/CardLight";
import ImgIcon from "../../Components/Image/ImgIcon";
import { Stars } from "../../Components/StarDisplay";
import StatDisplay from "../../Components/StatDisplay";
import StatIcon from "../../Components/StatIcon";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import Stat from "../../Stat";
import { ICachedCharacter } from "../../Types/character";
import { allElements } from "../../Types/consts";
import { ICalculatedStats } from "../../Types/stats";
import WeaponDisplayCard from "../../Weapon/WeaponDisplayCard";
import WeaponSheet from "../../Weapon/WeaponSheet";
import Character from "../Character";
import CharacterSheet from "../CharacterSheet";
import StatInput from "../StatInput";
type CharacterOverviewPaneProps = {
  characterSheet: CharacterSheet;
  weaponSheet: WeaponSheet
  character: ICachedCharacter
}
export default function CharacterOverviewPane({ characterSheet, weaponSheet, character, character: { constellation, key: characterKey } }: CharacterOverviewPaneProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const build = newBuild ? newBuild : equippedBuild
  if (!build) return null
  const { tlvl } = build
  const elementKey = build.characterEle
  const weaponTypeKey = characterSheet.weaponTypeKey
  return <Grid container spacing={1}>
    <Grid item xs={12} md={3}  >
      {/* Image card with star and name and level */}
      <CardLight >
        <CardMedia src={characterSheet.cardImg} component="img" width="100%" height="auto" />
        <CardContent>
          <Typography variant="h5" >{characterSheet.name} <ImgIcon src={Assets.weaponTypes?.[weaponTypeKey]} /> {StatIcon[elementKey]} </Typography>
          <Typography><Stars stars={characterSheet.star} colored /></Typography>
          <Typography variant="subtitle1">Lvl. {Character.getLevelString(character)}</Typography>
          <Grid container spacing={1}>
            {["auto", "skill", "burst"].map(tKey =>
              <Grid item xs={4} key={tKey}>
                <Badge badgeContent={tlvl[tKey] + 1} color={((tKey === "skill" && build.skillBoost) || (tKey === "burst" && build.burstBoost)) ? "info" : "secondary"}
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  sx={{
                    "& > .MuiBadge-badge": {
                      fontSize: "1.25em",
                      padding: ".25em .4em",
                      borderRadius: ".5em",
                      lineHeight: 1,
                      height: "1.25em"
                    }
                  }}>
                  <Box component="img" src={characterSheet.getTalentOfKey(tKey, build.characterEle)?.img} width="100%" height="auto" />
                </Badge>
              </Grid>)}
          </Grid>
          <Typography sx={{ textAlign: "center", mt: 1 }} variant="h6">{characterSheet.constellationName}</Typography>
          <Grid container spacing={1}>
            {[...Array(6).keys()].map(i =>
              <Grid item xs={4} key={i}>
                <Box component="img" src={characterSheet.getTalentOfKey(`constellation${i + 1}`, build.characterEle)?.img}
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
      <WeaponDisplayCard {...{ charData: { character, characterSheet, equippedBuild, newBuild, characterDispatch }, weaponId: character.equippedWeapon }} />
      <MainStatsCards {...{ characterSheet, character, equippedBuild, newBuild }} />
    </Grid>
  </Grid >
}
const EDIT = "Edit Stats"
const EXIT = "EXIT"
type MainStatsCardsProps = {
  characterSheet: CharacterSheet,
  character: ICachedCharacter,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats
}
function MainStatsCards({ characterSheet, character, character: { key: characterKey }, equippedBuild, newBuild }: MainStatsCardsProps) {
  const characterDispatch = useCharacterReducer(characterKey)

  const additionalKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"]
  const displayStatKeys = ["finalHP", "finalATK", "finalDEF"]
  displayStatKeys.push(...additionalKeys)
  const editStatKeys = ["hp", "hp_", "def", "def_", "atk", "atk_"]
  editStatKeys.push(...additionalKeys)
  const otherStatKeys: any[] = [];

  ["physical", ...allElements].forEach(ele => {
    otherStatKeys.push(`${ele}_dmg_`)
    otherStatKeys.push(`${ele}_res_`)
  })
  otherStatKeys.push("stamina", "incHeal_", "shield_", "cdRed_")

  const miscStatkeys = [
    "normal_dmg_", "normal_critRate_",
    "charged_dmg_", "charged_critRate_",
    "plunging_dmg_", "plunging_critRate_",
    "skill_dmg_", "skill_critRate_",
    "burst_dmg_", "burst_critRate_",
    "dmg_", "electrocharged_dmg_",
    "vaporize_dmg_", "swirl_dmg_",
    "moveSPD_", "atkSPD_",
    "weakspotDMG_",
  ]

  const specializedStatKey = characterSheet.getSpecializedStat(character.ascension)
  const specializedStatVal = characterSheet.getSpecializedStatVal(character.ascension)
  const specializedStatUnit = Stat.getStatUnit(specializedStatKey)

  const displayNewBuildProps = { character, equippedBuild, newBuild }
  return <>
    <StatDisplayCard
      title="Main Base Stats"
      content={<Grid container columnSpacing={2} rowSpacing={1}>
        {displayStatKeys.map(statKey => <Grid item key={statKey} xs={12} lg={6} >
          <StatDisplay statKey={statKey} {...displayNewBuildProps} />
        </Grid>)}
        <Grid item xs={12} lg={6} display="flex" flexDirection="row" justifyContent="space-between">
          <span><b>Specialized:</b> <span>{specializedStatKey && StatIcon[specializedStatKey]} {Stat.getStatName(specializedStatKey)}</span></span>
          <span >{`${specializedStatVal.toFixed(Stat.fixedUnit(specializedStatKey))}${specializedStatUnit}`}</span>
        </Grid>
      </Grid>}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {editStatKeys.map(statKey =>
          <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              disabled={undefined}
              name={<span>{StatIcon[statKey]} {Stat.getStatNameWithPercent(statKey)}</span>}
              placeholder={Stat.getStatNameRaw(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={Stat.getStatUnit(statKey) === "%"}
              onValueChange={value => characterDispatch({ type: "bonusStats", statKey, value })}
            />
          </Grid>)}
      </Grid>}
    />
    <StatDisplayCard
      title="Other Stats"
      content={<Grid container columnSpacing={2} rowSpacing={1}>
        {otherStatKeys.map(statKey => <Grid item xs={12} lg={6} key={statKey} ><StatDisplay statKey={statKey} {...displayNewBuildProps} /></Grid>)}
      </Grid>}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {otherStatKeys.map(statKey =>
          <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {Stat.getStatName(statKey)}</span>}
              placeholder={Stat.getStatNameRaw(statKey)}
              value={character.bonusStats[statKey] ?? (statKey === "stamina" ? 100 : 0)}
              percent={Stat.getStatUnit(statKey) === "%"}
              defaultValue={statKey === "stamina" ? 100 : undefined}
              onValueChange={value => characterDispatch({ type: "bonusStats", statKey, value })}
            />
          </Grid>)}
      </Grid>}
    />
    <StatDisplayCard
      title="Misc Stats"
      content={<Grid container columnSpacing={2} rowSpacing={1}>
        {miscStatkeys.map(statKey => <Grid item xs={12} lg={6} key={statKey} ><StatDisplay statKey={statKey} {...displayNewBuildProps} /></Grid>)}
      </Grid>}
      editContent={<Grid container columnSpacing={2} rowSpacing={1}>
        {miscStatkeys.map(statKey =>
          <Grid item xs={12} lg={6} key={statKey}>
            <StatInput
              name={<span>{StatIcon[statKey]} {Stat.getStatName(statKey)}</span>}
              placeholder={Stat.getStatNameRaw(statKey)}
              value={character.bonusStats[statKey] ?? 0}
              percent={Stat.getStatUnit(statKey) === "%"}
              onValueChange={value => characterDispatch({ type: "bonusStats", statKey, value })}
            />
          </Grid>)}
      </Grid>}
    />
  </>
}
function StatDisplayCard({ title, content, editContent }) {
  const [edit, setedit] = useState(false)
  return <CardLight>
    <CardContent>
      <Grid container>
        <Grid item flexGrow={1}>
          <Typography variant="subtitle1">{title}</Typography>
        </Grid>
        <Grid item>
          <Button size="small" color={edit ? "error" : "info"} onClick={() => setedit(!edit)} >
            <span><FontAwesomeIcon icon={edit ? faSave : faEdit} /> {edit ? EXIT : EDIT}</span>
          </Button>
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent>
      {edit ? editContent : content}
    </CardContent>
  </CardLight>
}