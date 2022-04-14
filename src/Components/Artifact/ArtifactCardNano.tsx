import { BusinessCenter } from "@mui/icons-material";
import { Box, CardActionArea, CardMedia, Chip, Grid, Typography } from "@mui/material";
import { useCallback } from "react";
import Artifact from "../../Data/Artifacts/Artifact";
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import KeyMap, { cacheValueString } from "../../KeyMap";
import useArtifact from "../../ReactHooks/useArtifact";
import usePromise from "../../ReactHooks/usePromise";
import { ICachedSubstat } from "../../Types/artifact";
import { clamp } from "../../Util/Util";
import BootstrapTooltip from "../BootstrapTooltip";
import CardDark from "../Card/CardDark";
import ColorText from "../ColoredText";
import ConditionalWrapper from "../ConditionalWrapper";
import ImgIcon from "../Image/ImgIcon";
import StatIcon from "../StatIcon";

type Data = {
  artifactId?: string,
  mainStatAssumptionLevel?: number,
  onClick?: () => void,
  showLocation?: boolean,
  BGComponent?: React.ElementType
}

export default function ArtifactCardNano({ artifactId, mainStatAssumptionLevel = 0, showLocation = false, onClick, BGComponent = CardDark }: Data) {
  const art = useArtifact(artifactId)
  const sheet = usePromise(ArtifactSheet.get(art?.setKey), [art])
  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={onClick}>{children}</CardActionArea>,
    [onClick],
  )
  if (!art) return null

  const { slotKey, rarity, level, mainStatKey, substats, location } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const mainStatUnit = KeyMap.unit(mainStatKey)
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  return <BGComponent><ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc} >
    <Box className={`grad-${rarity}star`} sx={{ position: "relative" }}>
      <Box>
        <Box sx={{ px: 1, pt: 1 }}>
          <Box display="flex" gap={1}>
            <Chip size="small" label={<strong>{` +${level}`}</strong>} color={levelVariant as any} />
            {showLocation && <Chip size="small" label={<LocationIcon location={location} />} color={"secondary"} sx={{
              overflow: "visible", ".MuiChip-label": {
                overflow: "visible"
              }
            }} />}
          </Box>
          <Typography variant="h6" sx={{ display: "flex", gap: 1, }}>
            <ColorText color={KeyMap.getVariant(mainStatKey)}>{StatIcon[mainStatKey]}</ColorText>
            <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{cacheValueString(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, KeyMap.unit(mainStatKey))}{mainStatUnit}</ColorText>
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: "100%", position: "absolute", right: 0, top: 0 }}>
        <CardMedia
          component="img"
          image={sheet?.slotIcons[slotKey] ?? ""}
          width="auto"
          height="100%"
          sx={{ float: "right" }}
        />
      </Box>
    </Box>
    <Grid container sx={{ p: 1 }} spacing={1}>
      {substats.map((stat: ICachedSubstat, i: number) => <Grid item key={i + stat.key} xs={6}>
        <SubstatDisplay key={stat.key} stat={stat} />
      </Grid>)}
    </Grid>
  </ConditionalWrapper></BGComponent >
}
function SubstatDisplay({ stat }: { stat: ICachedSubstat }) {
  if (!stat.value) return null
  const numRolls = stat.rolls?.length ?? 0
  const rollColor = `roll${clamp(numRolls, 1, 6)}`
  const unit = KeyMap.unit(stat.key)
  return (<Box display="flex" gap={1} alignContent="center">
    <Typography sx={{ flexGrow: 1, display: "flex", gap: 1 }} color={(numRolls ? `${rollColor}.main` : "error.main") as any} component="span">
      <BootstrapTooltip placement="top" title={<Typography>{stat.key && KeyMap.getArtStr(stat.key)}</Typography>} disableInteractive>
        <span>{StatIcon[stat.key]}</span>
      </BootstrapTooltip>
      <span>{`${cacheValueString(stat.value, KeyMap.unit(stat.key))}${unit}`}</span>
    </Typography>
  </Box>)
}
function LocationIcon({ location }) {
  const characterSheet = usePromise(CharacterSheet.get(location ?? ""), [location])
  return characterSheet ? <BootstrapTooltip placement="right-end" title={<Typography>{characterSheet.name}</Typography>}><ImgIcon src={characterSheet.thumbImgSide} sx={{ height: "3em", marginTop: "-1.5em", marginLeft: "-0.5em" }} /></BootstrapTooltip> : <BusinessCenter />
}
