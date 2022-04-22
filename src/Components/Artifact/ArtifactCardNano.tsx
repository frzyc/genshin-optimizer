import { BusinessCenter } from "@mui/icons-material";
import { Box, CardActionArea, Chip, Typography } from "@mui/material";
import { useCallback } from "react";
import Assets from "../../Assets/Assets";
import Artifact from "../../Data/Artifacts/Artifact";
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import KeyMap, { cacheValueString } from "../../KeyMap";
import useArtifact from "../../ReactHooks/useArtifact";
import usePromise from "../../ReactHooks/usePromise";
import { ICachedSubstat } from "../../Types/artifact";
import { SlotKey } from "../../Types/consts";
import { clamp } from "../../Util/Util";
import BootstrapTooltip from "../BootstrapTooltip";
import CardDark from "../Card/CardDark";
import ColorText from "../ColoredText";
import ConditionalWrapper from "../ConditionalWrapper";
import ImgIcon from "../Image/ImgIcon";
import StatIcon from "../StatIcon";
import ArtifactSetSlotTooltip from "./ArtifactSetSlotTooltip";

type Data = {
  artifactId?: string,
  slotKey: SlotKey,
  mainStatAssumptionLevel?: number,
  onClick?: () => void,
  showLocation?: boolean,
  BGComponent?: React.ElementType
}

export default function ArtifactCardNano({ artifactId, slotKey: pSlotKey, mainStatAssumptionLevel = 0, showLocation = false, onClick, BGComponent = CardDark }: Data) {
  const art = useArtifact(artifactId)
  const sheet = usePromise(ArtifactSheet.get(art?.setKey), [art])
  const actionWrapperFunc = useCallback(children => <CardActionArea onClick={onClick} sx={{ height: "100%" }}>{children}</CardActionArea>, [onClick],)
  if (!art) return <BGComponent sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
    <Box component="img" src={Assets.slot[pSlotKey]} sx={{ width: "25%", height: "auto", opacity: 0.7 }} />
  </BGComponent>

  const { slotKey, rarity, level, mainStatKey, substats, location } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const mainStatUnit = KeyMap.unit(mainStatKey)
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  return <BGComponent sx={{ height: "100%" }}><ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}  >
    <Box display="flex" height="100%">
      <Box className={`grad-${rarity}star`} sx={{ position: "relative", flexGrow: 1, display: "flex", flexDirection: "column" }} >
        <Box sx={{ position: "absolute", width: "100%", height: "80%", textAlign: "center" }} >
          <Box
            component="img"
            src={sheet?.slotIcons[slotKey] ?? ""}
            sx={{ m: -1, display: "inline", maxHeight: "110%", maxWidth: "110%" }}
          />
        </Box>
        <Box sx={{ position: "absolute", width: "100%", height: "100%", p: 0.5, opacity: 0.85, display: "flex", justifyContent: "space-between" }} >
          <Chip size="small" label={<strong>{` +${level}`}</strong>} color={levelVariant as any} />
          {showLocation && <Chip size="small" label={<LocationIcon location={location} />} color={"secondary"} sx={{
            overflow: "visible", ".MuiChip-label": {
              overflow: "visible"
            }
          }} />}
        </Box>
        <ArtifactSetSlotTooltip slotKey={slotKey} sheet={sheet}>
          <Box sx={{ flexGrow: 1, display: "flex", position: "relative", mt: -1, mx: -1 }}>
          </Box>
        </ArtifactSetSlotTooltip>
        {/* mainstats */}
        <Typography variant="h6" sx={{ display: "flex", gap: 1, px: 1, zIndex: 1 }}>
          <BootstrapTooltip placement="top" title={<Typography>{KeyMap.getArtStr(mainStatKey)}</Typography>} disableInteractive>
            <ColorText color={KeyMap.getVariant(mainStatKey)}>{StatIcon[mainStatKey]}</ColorText>
          </BootstrapTooltip>
          <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{cacheValueString(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, KeyMap.unit(mainStatKey))}{mainStatUnit}</ColorText>
        </Typography>
      </Box>
      {/* substats */}
      <Box display="flex" flexDirection="column" justifyContent="space-between" sx={{ p: 1, }}>
        {substats.map((stat: ICachedSubstat, i: number) => <SubstatDisplay key={i + stat.key} stat={stat} />)}
      </Box>
    </Box>
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
