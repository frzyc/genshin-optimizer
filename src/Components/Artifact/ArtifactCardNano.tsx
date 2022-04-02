import { BusinessCenter } from "@mui/icons-material";
import { Box, CardMedia, Chip, Grid, Typography } from "@mui/material";
import Artifact from "../../Data/Artifacts/Artifact";
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import KeyMap, { cacheValueString } from "../../KeyMap";
import useArtifact from "../../ReactHooks/useArtifact";
import usePromise from "../../ReactHooks/usePromise";
import { ICachedSubstat } from "../../Types/artifact";
import { clamp } from "../../Util/Util";
import CardDark from "../Card/CardDark";
import ColorText from "../ColoredText";
import StatIcon from "../StatIcon";

type Data = {
  artifactId?: string,
  mainStatAssumptionLevel?: number,
}

export default function ArtifactCardNano({ artifactId, mainStatAssumptionLevel = 0 }: Data) {
  const art = useArtifact(artifactId)
  const sheet = usePromise(ArtifactSheet.get(art?.setKey), [art])
  if (!art) return null

  const { slotKey, rarity, level, mainStatKey, substats, location } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const mainStatUnit = KeyMap.unit(mainStatKey)
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  return <CardDark>
    <Grid container sx={{ flexWrap: "nowrap" }} className={`grad-${rarity}star`} >
      <Grid item maxWidth="40%" sx={{ mt: -1, mb: -2 }} >
        <CardMedia
          component="img"
          image={sheet?.slotIcons[slotKey] ?? ""}
          width="100%"
          height="auto"
        />
      </Grid>
      <Grid item sx={{ textAlign: "right", flexGrow: 1, pr: 1, pt: 1 }}>
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Chip size="small" label={<strong>{` +${level}`}</strong>} color={levelVariant as any} />
          <Chip size="small" label={<LocationIcon location={location} />} color={"info"} />
        </Box>

        <Typography variant="h6" sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <ColorText color={KeyMap.getVariant(mainStatKey)}>{StatIcon[mainStatKey]}</ColorText>
          <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{cacheValueString(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, KeyMap.unit(mainStatKey))}{mainStatUnit}</ColorText>
        </Typography>
      </Grid>
    </Grid>
    <Grid container sx={{ p: 1, pl: 2 }}>
      {substats.map((stat: ICachedSubstat) => <Grid item xs={6}>
        <SubstatDisplay key={stat.key} stat={stat} />
      </Grid>)}
    </Grid>
  </CardDark >
}
function SubstatDisplay({ stat }: { stat: ICachedSubstat }) {
  if (!stat.value) return null
  const numRolls = stat.rolls?.length ?? 0
  const rollColor = `roll${clamp(numRolls, 1, 6)}`
  const unit = KeyMap.unit(stat.key)
  return (<Box display="flex" gap={1} alignContent="center">
    <Typography sx={{ flexGrow: 1 }} color={(numRolls ? `${rollColor}.main` : "error.main") as any} component="span">{StatIcon[stat.key]} {`${cacheValueString(stat.value, KeyMap.unit(stat.key))}${unit}`}</Typography>
  </Box>)
}
function LocationIcon({ location }) {
  const characterSheet = usePromise(CharacterSheet.get(location ?? ""), [location])
  return characterSheet ? characterSheet.icon : <BusinessCenter />
}
