import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Badge, Box, CardActionArea, Chip, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useCallback, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Assets from "../../../../Assets/Assets";
import ArtifactCardNano from "../../../../Components/Artifact/ArtifactCardNano";
import CardLight from "../../../../Components/Card/CardLight";
import CharacterCardPico from "../../../../Components/Character/CharacterCardPico";
import StatDisplayComponent from "../../../../Components/Character/StatDisplayComponent";
import ImgIcon from "../../../../Components/Image/ImgIcon";
import SqBadge from "../../../../Components/SqBadge";
import { StarsDisplay } from "../../../../Components/StarDisplay";
import StatIcon from "../../../../Components/StatIcon";
import WeaponCardNano from "../../../../Components/Weapon/WeaponCardNano";
import { CharacterContext } from "../../../../Context/CharacterContext";
import { DataContext } from "../../../../Context/DataContext";
import { TalentSheetElementKey } from "../../../../Data/Characters/CharacterSheet";
import { getLevelString } from "../../../../Data/LevelData";
import { initCharMeta } from "../../../../Database/Data/StateData";
import { uiInput as input } from "../../../../Formula";
import useCharacterReducer from "../../../../ReactHooks/useCharacterReducer";
import useDBState from "../../../../ReactHooks/useDBState";
import { allSlotKeys, Ascension, ElementKey } from "../../../../Types/consts";
import { range } from "../../../../Util/Util";
import EquipmentSection from "./EquipmentSection";

export default function TabOverview() {
  const scrollRef = useRef<HTMLDivElement>()
  const onScroll = useCallback(() => scrollRef?.current?.scrollIntoView?.({ behavior: "smooth" }), [scrollRef])

  return <Stack spacing={1}>
    <Grid container spacing={1} sx={{ justifyContent: "center" }}>
      <Grid item xs={8} sm={5} md={4} lg={2.3}  >
        <CharacterProfileCard />
      </Grid>
      <Grid item xs={12} sm={7} md={8} lg={9.7} sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
        <EquipmentRow onClick={onScroll} />
        <CardLight sx={{ flexGrow: 1, p: 1 }}>
          <StatDisplayComponent />
        </CardLight>
      </Grid>
    </Grid >
    <Box ref={scrollRef}>
      <EquipmentSection />
    </Box>
  </Stack>
}
function EquipmentRow({ onClick }: { onClick: () => void }) {
  const { character: { equippedWeapon } } = useContext(CharacterContext)
  const { data, } = useContext(DataContext)

  return <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
    <Grid item xs={1}>
      <WeaponCardNano weaponId={equippedWeapon} BGComponent={CardLight} onClick={onClick} />
    </Grid>
    {allSlotKeys.map(slotKey =>
      <Grid item key={slotKey} xs={1} >
        <ArtifactCardNano artifactId={data.get(input.art[slotKey].id).value} slotKey={slotKey} BGComponent={CardLight} onClick={onClick} />
      </Grid>)}
  </Grid>
}
/* Image card with star and name and level */
function CharacterProfileCard() {
  const { characterSheet, character: { key: characterKey, team } } = useContext(CharacterContext)
  const { data, } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const navigate = useNavigate()
  const charEle = data.get(input.charEle).value as ElementKey
  const weaponTypeKey = characterSheet.weaponTypeKey
  const level = data.get(input.lvl).value
  const ascension = data.get(input.asc).value as Ascension
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
  const [{ favorite }, setCharMeta] = useDBState(`charMeta_${characterKey}`, initCharMeta)
  return <CardLight sx={{ height: "100%" }} >
    <Box sx={{ position: "relative" }}>
      <Box sx={{ position: "absolute", width: "100%", height: "100%" }}>
        <Typography variant="h6" sx={{ position: "absolute", left: "50%", bottom: 0, transform: "translate(-50%, -50%)", opacity: 0.75 }}>
          <StarsDisplay stars={characterSheet.rarity} colored />
        </Typography>
        <Box sx={{ position: "absolute", left: "50%", bottom: "5%", transform: "translate(-50%, -50%)", opacity: 0.85, width: "100%", display: "flex", justifyContent: "center", px: 1 }}>
          <Chip color={charEle} sx={{ height: "auto" }}
            label={<Typography variant="h6" sx={{ display: "flex", gap: 1, alignItems: "center" }} >
              {StatIcon[charEle]}
              <Box sx={{ whiteSpace: "normal", textAlign: "center" }}>{characterSheet.name}</Box>
              <ImgIcon src={Assets.weaponTypes?.[weaponTypeKey]} />
            </Typography>} />
        </Box>
        <Box sx={{ position: "absolute", left: 0, top: 0 }}>
          <IconButton sx={{ p: 1 }} color="error" onClick={() => setCharMeta({ favorite: !favorite })}>
            {favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <Typography sx={{ p: 1, position: "absolute", right: 0, top: 0, opacity: 0.8 }}>
          <SqBadge>{getLevelString(level, ascension)}</SqBadge>
        </Typography>
      </Box>
      <Box src={characterSheet.cardImg} component="img" width="100%" height="auto" />
    </Box>
    <Box>
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
                <Box component="img" src={characterSheet.getTalentOfKey(tKey)?.img} width="100%" height="auto" />
              </Badge>
            </Grid>)}
        </Grid>
      </CardActionArea>
      <Typography sx={{ textAlign: "center", mt: 1 }} variant="h6">{characterSheet.constellationName}</Typography>
      <Grid container spacing={1}>
        {range(1, 6).map(i =>
          <Grid item xs={4} key={i}>
            <CardActionArea onClick={() => characterDispatch({ constellation: i === constellation ? i - 1 : i })}>
              <Box component="img" src={characterSheet.getTalentOfKey(`constellation${i}` as TalentSheetElementKey)?.img}
                sx={{
                  ...(constellation >= i ? {} : { filter: "brightness(50%)" })
                }}
                width="100%" height="auto" />
            </CardActionArea>
          </Grid>)}
      </Grid>
      <CardActionArea sx={{ p: 1 }} onClick={() => navigate("teambuffs")}>
        <Grid container columns={3} spacing={1}>
          {range(0, 2).map(i => <Grid key={i} item xs={1} height="100%"><CharacterCardPico characterKey={team[i]} index={i} /></Grid>)}
        </Grid>
      </CardActionArea>
    </Box>
  </CardLight >
}
