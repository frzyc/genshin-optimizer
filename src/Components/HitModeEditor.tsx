import { Box, MenuItem, ToggleButton, ToggleButtonGroupProps } from "@mui/material";
import { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { CharacterContext } from "../CharacterContext";
import { infusionNode } from "../Data/Characters/dataUtil";
import { DataContext } from "../DataContext";
import { uiInput as input } from "../Formula";
import { allHitModes, allReactionModes, ElementKey } from "../Types/consts";
import ColorText from "./ColoredText";
import DropdownButton, { DropdownButtonProps } from "./DropdownMenu/DropdownButton";
import SolidToggleButtonGroup from "./SolidToggleButtonGroup";
import SqBadge from "./SqBadge";
import { uncoloredEleIcons } from "./StatIcon";
export const infusionVals = {
  "": <span>No Team Melee Infusion</span>,
  "pyro": <span >{uncoloredEleIcons.pyro} <SqBadge>Bennett C6</SqBadge> Fire Ventures with Me</span>,
  "cryo": <span >{uncoloredEleIcons.cryo} <SqBadge>Chongyun Skill</SqBadge> Spirit Blade: Chonghua's Layered Frost</span>,
}
type InfusionAuraDropdownProps = Omit<DropdownButtonProps, "title" | "onChange" | "children">
export function InfusionAuraDropdown(props: InfusionAuraDropdownProps) {
  const { characterSheet, character: { infusionAura }, characterDispatch } = useContext(CharacterContext)
  if (!characterSheet?.isMelee()) return null
  return <DropdownButton title={infusionVals[infusionAura]} color={infusionAura || "secondary"} disableElevation {...props}>
    {Object.entries(infusionVals).map(([key, text]) =>
      <MenuItem key={key} sx={key ? { color: `${key}.main` } : undefined}
        selected={key === infusionAura} disabled={key === infusionAura}
        onClick={() => characterDispatch({ infusionAura: key })}>{text}</MenuItem>)}
  </DropdownButton>
}

const sqBadgeStyle = { mx: 0.25, px: 0.25, fontSize: "1em" }
export const reactionModeText = {
  pyro_vaporize: (t) => <Box display="flex" alignItems="center">
    <ColorText color="vaporize">{t`ampReaction.pyro_vaporize`}</ColorText>
    <SqBadge sx={sqBadgeStyle} color="hydro">{uncoloredEleIcons.hydro}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
  </Box>,
  pyro_melt: (t) => <Box display="flex" alignItems="center">
    <ColorText color="melt">{t`ampReaction.pyro_melt`}</ColorText>
    <SqBadge sx={sqBadgeStyle} color="cryo">{uncoloredEleIcons.cryo}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
  </Box>,
  hydro_vaporize: (t) => <Box display="flex" alignItems="center">
    <ColorText color="vaporize">{t`ampReaction.pyro_melt`}</ColorText>
    <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color="hydro">{uncoloredEleIcons.hydro}</SqBadge>
  </Box>,
  cryo_melt: (t) => <Box display="flex" alignItems="center">
    <ColorText color="melt">{t`ampReaction.cryo_melt`}</ColorText>
    <SqBadge sx={sqBadgeStyle} color="pyro">{uncoloredEleIcons.pyro}</SqBadge>
    {`+`}
    <SqBadge sx={sqBadgeStyle} color="cryo">{uncoloredEleIcons.cryo}</SqBadge>
  </Box>

} as const

type ReactionToggleProps = Omit<ToggleButtonGroupProps, "color">
export function ReactionToggle(props: ReactionToggleProps) {
  const { t } = useTranslation("page_character")
  const { character: { reactionMode }, characterDispatch } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const charEleKey = data.get(input.charEle).value as ElementKey
  const infusion = data.get(infusionNode).value as ElementKey
  if (!["pyro", "hydro", "cryo"].includes(charEleKey) && !["pyro", "hydro", "cryo"].includes(infusion)) return null
  return <SolidToggleButtonGroup exclusive baseColor="secondary"
    value={reactionMode} onChange={(_, reactionMode) => characterDispatch({ reactionMode })} {...props}>
    <ToggleButton value="" disabled={reactionMode === ""} >No Reactions</ToggleButton >
    {allReactionModes.map(rm => (charEleKey === rm.split("_")[0] || infusion === rm.split("_")[0]) && <ToggleButton key={rm} value={rm} disabled={reactionMode === rm}>
      {reactionModeText[rm](t)}
    </ToggleButton >)}
  </SolidToggleButtonGroup>
}
type HitModeToggleProps = Omit<ToggleButtonGroupProps, "color">
export function HitModeToggle(props: HitModeToggleProps) {
  const { t } = useTranslation("page_character")
  const { character: { hitMode }, characterDispatch } = useContext(CharacterContext)
  return <SolidToggleButtonGroup exclusive baseColor="secondary"
    value={hitMode} onChange={(_, hitMode) => characterDispatch({ hitMode })} {...props} >
    {allHitModes.map(hm => <ToggleButton key={hm} value={hm} disabled={hitMode === hm}>{t(`hitmode.${hm}`)}</ToggleButton>)}
  </SolidToggleButtonGroup>
}
