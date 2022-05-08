import { Box, MenuItem, ToggleButton, ToggleButtonGroupProps } from "@mui/material";
import { useContext } from 'react';
import { infusionNode } from "../Data/Characters/dataUtil";
import { DataContext } from "../DataContext";
import { uiInput as input } from "../Formula";
import { ElementKey } from "../Types/consts";
import ColorText from "./ColoredText";
import DropdownButton, { DropdownButtonProps } from "./DropdownMenu/DropdownButton";
import SolidToggleButtonGroup from "./SolidToggleButtonGroup";
import SqBadge from "./SqBadge";
import { uncoloredEleIcons } from "./StatIcon";
const infusionVals = {
  "": <span>No Team Melee Infusion</span>,
  "pyro": <span >{uncoloredEleIcons.pyro} <SqBadge>Bennett C6</SqBadge> Fire Ventures with Me</span>,
  "cryo": <span >{uncoloredEleIcons.cryo} <SqBadge>Chongyun Skill</SqBadge> Spirit Blade: Chonghua's Layered Frost</span>,
}
type InfusionAuraDropdownProps = Omit<DropdownButtonProps, "title" | "onChange" | "children">
export function InfusionAuraDropdown(props: InfusionAuraDropdownProps) {
  const { characterSheet, character: { infusionAura }, characterDispatch } = useContext(DataContext)
  if (!characterSheet?.isMelee()) return null
  return <DropdownButton title={infusionVals[infusionAura]} color={infusionAura || "secondary"} disableElevation {...props}>
    {Object.entries(infusionVals).map(([key, text]) =>
      <MenuItem key={key} sx={key ? { color: `${key}.main` } : undefined}
        selected={key === infusionAura} disabled={key === infusionAura}
        onClick={() => characterDispatch({ infusionAura: key })}>{text}</MenuItem>)}
  </DropdownButton>
}

type ReactionToggleProps = Omit<ToggleButtonGroupProps, "color">
const sqBadgeStyle = { mx: 0.25, px: 0.25, fontSize: "1em" }
export function ReactionToggle(props: ReactionToggleProps) {
  const { data, character: { reactionMode }, characterDispatch } = useContext(DataContext)
  const charEleKey = data.get(input.charEle).value as ElementKey
  const infusion = data.get(infusionNode).value as ElementKey
  if (!["pyro", "hydro", "cryo"].includes(charEleKey) && !["pyro", "hydro", "cryo"].includes(infusion)) return null
  return <SolidToggleButtonGroup exclusive baseColor="secondary"
    value={reactionMode} onChange={(_, reactionMode) => characterDispatch({ reactionMode })} {...props}>
    <ToggleButton value="" disabled={reactionMode === ""} >No Reactions</ToggleButton >
    {(charEleKey === "pyro" || infusion === "pyro") && <ToggleButton value="pyro_vaporize" disabled={reactionMode === "pyro_vaporize"}>
      <ColorText color="vaporize">
        Vaporize(Pyro)
      </ColorText>
      <Box display="flex" alignItems="center">
        <SqBadge sx={sqBadgeStyle} color="hydro">{uncoloredEleIcons.hydro}</SqBadge>
        +
        <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
      </Box>
    </ToggleButton >}
    {(charEleKey === "pyro" || infusion === "pyro") && <ToggleButton value={"pyro_melt"} disabled={reactionMode === "pyro_melt"}>
      <ColorText color="melt">
        Melt(Pyro)
      </ColorText>
      <Box display="flex" alignItems="center">
        <SqBadge sx={sqBadgeStyle} color="cryo">{uncoloredEleIcons.cryo}</SqBadge>
        +
        <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
      </Box>
    </ToggleButton >}
    {(charEleKey === "hydro" || infusion === "hydro") && <ToggleButton value={"hydro_vaporize"} disabled={reactionMode === "hydro_vaporize"}>
      <ColorText color="vaporize">
        Vaporize(Hydro)
      </ColorText>
      <Box display="flex" alignItems="center">
        <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
        +
        <SqBadge sx={sqBadgeStyle} color="hydro">{uncoloredEleIcons.hydro}</SqBadge>
      </Box>
    </ToggleButton >}
    {(charEleKey === "cryo" || infusion === "cryo") && <ToggleButton value={"cryo_melt"} disabled={reactionMode === "cryo_melt"}>
      <ColorText color="melt">
        Melt(Cryo)
      </ColorText>
      <Box display="flex" alignItems="center">
        <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
        +
        <SqBadge sx={sqBadgeStyle} color="cryo">{uncoloredEleIcons.cryo}</SqBadge>
      </Box>
    </ToggleButton >}
  </SolidToggleButtonGroup>
}
type HitModeToggleProps = Omit<ToggleButtonGroupProps, "color">
export function HitModeToggle(props: HitModeToggleProps) {
  const { character: { hitMode }, characterDispatch } = useContext(DataContext)
  return <SolidToggleButtonGroup exclusive baseColor="secondary"
    value={hitMode} onChange={(_, hitMode) => characterDispatch({ hitMode })} {...props} >
    <ToggleButton value="avgHit" disabled={hitMode === "avgHit"}>Avg. DMG</ToggleButton>
    <ToggleButton value="hit" disabled={hitMode === "hit"}>Non Crit DMG</ToggleButton>
    <ToggleButton value="critHit" disabled={hitMode === "critHit"}>Crit Hit DMG</ToggleButton>
  </SolidToggleButtonGroup>
}
