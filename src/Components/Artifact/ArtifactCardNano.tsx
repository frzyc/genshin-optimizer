import { BusinessCenter } from "@mui/icons-material";
import { alpha, Box, CardActionArea, Chip, Typography, useTheme } from "@mui/material";
import { useCallback, useContext } from "react";
import Assets from "../../Assets/Assets";
import Artifact from "../../Data/Artifacts/Artifact";
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet";
import CharacterSheet from "../../Data/Characters/CharacterSheet";
import { DatabaseContext } from "../../Database/Database";
import KeyMap, { cacheValueString } from "../../KeyMap";
import useArtifact from "../../ReactHooks/useArtifact";
import useGender from "../../ReactHooks/useGender";
import usePromise from "../../ReactHooks/usePromise";
import { ICachedSubstat } from "../../Types/artifact";
import { allElementsWithPhy, CharacterKey, SlotKey } from "../../Types/consts";
import { clamp } from "../../Util/Util";
import BootstrapTooltip from "../BootstrapTooltip";
import CardDark from "../Card/CardDark";
import ColorText from "../ColoredText";
import ConditionalWrapper from "../ConditionalWrapper";
import ImgIcon from "../Image/ImgIcon";
import { StatColoredWithUnit } from "../StatDisplay";
import StatIcon from "../StatIcon";
import ArtifactTooltip from "./ArtifactTooltip";

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
  const { database } = useContext(DatabaseContext)
  const sheet = usePromise(() => ArtifactSheet.get(art?.setKey), [art?.setKey])
  const actionWrapperFunc = useCallback(children => <CardActionArea onClick={onClick} sx={{ height: "100%" }}>{children}</CardActionArea>, [onClick],)
  const theme = useTheme()
  if (!art) return <BGComponent sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
    <Box component="img" src={Assets.slot[pSlotKey]} sx={{ width: "25%", height: "auto", opacity: 0.7 }} />
  </BGComponent>

  const { slotKey, rarity, level, mainStatKey, substats, location } = art
  const mainStatLevel = Math.max(Math.min(mainStatAssumptionLevel, rarity * 4), level)
  const mainStatUnit = KeyMap.unit(mainStatKey)
  const element = allElementsWithPhy.find(ele => art.mainStatKey.includes(ele))
  const color = element ? alpha(theme.palette[element].main, 0.6) : alpha(theme.palette.secondary.main, 0.6)
  return <BGComponent sx={{ height: "100%" }}><ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}  >
    <Box display="flex" height="100%">
      <Box className={`grad-${rarity}star`} sx={{ position: "relative", flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} >
        <ArtifactTooltip art={art}>
          <Box
            component="img"
            src={sheet?.slotIcons[slotKey] ?? ""}
            sx={{ m: -1, maxHeight: "110%", maxWidth: "110%" }}
          />
        </ArtifactTooltip>
        <Box sx={{ position: "absolute", width: "100%", height: "100%", p: 0.5, opacity: 0.85, display: "flex", justifyContent: "space-between", pointerEvents: "none" }} >
          <Chip size="small" label={<strong>{` +${level}`}</strong>} color={Artifact.levelVariant(level)} />
          {showLocation && <Chip size="small" label={<LocationIcon charKey={location && database.chars.LocationToCharacterKey(location)} />} color={"secondary"} sx={{
            overflow: "visible", ".MuiChip-label": {
              overflow: "visible"
            }
          }} />}
        </Box>
        {/* mainstats */}
        <Chip size="small" sx={{ position: "absolute", bottom: 0, mb: 1, backgroundColor: color }}
          label={<Typography sx={{ display: "flex", gap: 0.5, px: 1, zIndex: 1 }}>
            <BootstrapTooltip placement="top" title={<Typography><StatColoredWithUnit statKey={mainStatKey} /></Typography>} disableInteractive>
              <span>{StatIcon[mainStatKey]}</span>
            </BootstrapTooltip>
            <ColorText color={mainStatLevel !== level ? "warning" : undefined}>{cacheValueString(Artifact.mainStatValue(mainStatKey, rarity, mainStatLevel) ?? 0, KeyMap.unit(mainStatKey))}{mainStatUnit}</ColorText>
          </Typography>} />
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
    <Typography sx={{ flexGrow: 1, display: "flex", gap: 0.5 }} color={(numRolls ? `${rollColor}.main` : "error.main") as any} component="span">
      <BootstrapTooltip placement="top" title={<Typography>{stat.key && <StatColoredWithUnit statKey={stat.key} />}</Typography>} disableInteractive>
        <span>{StatIcon[stat.key]}</span>
      </BootstrapTooltip>
      <span>{`${cacheValueString(stat.value, KeyMap.unit(stat.key))}${unit}`}</span>
    </Typography>
  </Box>)
}
function LocationIcon({ charKey }: { charKey: CharacterKey | "" }) {
  const { database } = useContext(DatabaseContext)
  const gender = useGender(database)
  const characterSheet = usePromise(() => CharacterSheet.get(charKey, gender), [charKey, gender])
  return characterSheet ? <BootstrapTooltip placement="right-end" title={<Typography>{characterSheet.name}</Typography>}><ImgIcon src={characterSheet.thumbImgSide} sx={{ height: "3em", marginTop: "-1.5em", marginLeft: "-0.5em" }} /></BootstrapTooltip> : <BusinessCenter />
}
