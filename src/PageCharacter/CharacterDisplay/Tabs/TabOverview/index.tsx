import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Badge, Box, CardActionArea, CardContent, Grid, IconButton, Typography } from "@mui/material";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Assets from "../../../../Assets/Assets";
import { CharacterContext } from "../../../../Context/CharacterContext";
import ArtifactCardNano from "../../../../Components/Artifact/ArtifactCardNano";
import CardLight from "../../../../Components/Card/CardLight";
import CharacterCardPico from "../../../../Components/Character/CharacterCardPico";
import ImgIcon from "../../../../Components/Image/ImgIcon";
import { Stars } from "../../../../Components/StarDisplay";
import StatIcon from "../../../../Components/StatIcon";
import WeaponCardNano from "../../../../Components/Weapon/WeaponCardNano";
import CharacterSheet, { TalentSheetElementKey } from "../../../../Data/Characters/CharacterSheet";
import { DataContext } from "../../../../Context/DataContext";
import { uiInput as input } from "../../../../Formula";
import useCharacterReducer from "../../../../ReactHooks/useCharacterReducer";
import { allSlotKeys, ElementKey } from "../../../../Types/consts";
import { range } from "../../../../Util/Util";
import StatCards from "./StatCards";

export default function TabOverview() {
  const { characterSheet, character: { key: characterKey, favorite, equippedWeapon, team } } = useContext(CharacterContext)
  const { data, } = useContext(DataContext)
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
            <IconButton sx={{ p: 0.5, mt: -0.5 }} onClick={() => characterDispatch({ favorite: !favorite })}>
              {favorite ? <Favorite /> : <FavoriteBorder />}
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
              {range(0, 2).map(i => <Grid key={i} item xs={1} height="100%"><CharacterCardPico characterKey={team[i]} index={i} /></Grid>)}
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
          <WeaponCardNano weaponId={equippedWeapon} BGComponent={CardLight} onClick={() => navigate("equip")} />
        </Grid>
        {allSlotKeys.map(slotKey =>
          <Grid item key={slotKey} xs={1} >
            <ArtifactCardNano artifactId={data.get(input.art[slotKey].id).value} slotKey={slotKey} BGComponent={CardLight} onClick={() => navigate("equip")} />
          </Grid>)}
      </Grid>
      <StatCards />
    </Grid>
  </Grid >
}
