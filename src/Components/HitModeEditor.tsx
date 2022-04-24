import { MenuItem } from "@mui/material";
import { useContext } from 'react';
import { useTranslation } from "react-i18next";
import { infusionNode } from "../Data/Characters/dataUtil";
import { DataContext } from "../DataContext";
import { uiInput as input } from "../Formula";
import { ElementKey } from "../Types/consts";
import DropdownButton, { DropdownButtonProps } from "./DropdownMenu/DropdownButton";
import StatIcon, { uncoloredEleIcons } from "./StatIcon";
const infusionIcons = {
  "": "",
  "pyro": <span>{uncoloredEleIcons.pyro}</span>,
  "cryo": <span>{uncoloredEleIcons.cryo}</span>,
}
type InfusionAuraDropdownProps = Omit<DropdownButtonProps, "title" | "onChange" | "children">
export function InfusionAuraDropdown(props: InfusionAuraDropdownProps) {
  const { characterSheet, character: { infusionAura }, characterDispatch } = useContext(DataContext)
  const { t } = useTranslation("component_hitModeEditor")
  if (!characterSheet?.isMelee()) return null
  return <DropdownButton title={<span>{infusionIcons[infusionAura]} {t(`infusionAura.${infusionAura}`)}</span>}
    color={infusionAura || "secondary"} {...props}>
    {Object.entries(infusionIcons).map(([key]) =>
      <MenuItem key={key} sx={key ? { color: `${key}.main` } : undefined}
        selected={key === infusionAura} disabled={key === infusionAura}
        onClick={() => characterDispatch({ infusionAura: key })}>
        <span>{infusionIcons[key]} {t(`infusionAura.${key}`)}</span>
      </MenuItem>)}
  </DropdownButton>
}

const reactionIcons = {
  "": "",
  "pyro_vaporize": <span>{StatIcon.hydro}+{StatIcon.pyro}</span>,
  "pyro_melt": <span>{StatIcon.cryo}+{StatIcon.pyro}</span>,
  "hydro_vaporize": <span>{StatIcon.pyro}+{StatIcon.hydro}</span>,
  "cryo_melt": <span>{StatIcon.pyro}+{StatIcon.cryo}</span>
}
type ReactionDropdownProps = Omit<DropdownButtonProps, "title" | "onChange" | "children">
export function ReactionDropdown(props: ReactionDropdownProps) {
  const { data, character: { reactionMode }, characterDispatch } = useContext(DataContext)
  const { t } = useTranslation("component_hitModeEditor")
  const charEleKey = data.get(input.charEle).value as ElementKey
  const infusion = data.get(infusionNode).value as ElementKey
  const rawReaction = reactionMode ? reactionMode.split("_")[1] as "vaporize" | "melt" : ""
  if (!["pyro", "hydro", "cryo"].includes(charEleKey) && !["pyro", "hydro", "cryo"].includes(infusion)) return null
  return <DropdownButton title={<span>{reactionIcons[reactionMode]} {t(`reaction.${reactionMode}`)}</span>}
    color={rawReaction ? rawReaction : "secondary"} {...props}>
    {Object.entries(reactionIcons).map(([key]) => {
      const [element, reaction] = key.split("_")
      if (key === "" || charEleKey === element || infusion === element) {
        return <MenuItem key={key} sx={key ? { color: `${reaction}.main` } : undefined}
          selected={reaction === reactionMode} disabled={reaction === reactionMode}
          onClick={() => characterDispatch({ reactionMode: key })}>
          <span>{reactionIcons[key]} {t(`reaction.${key}`)}</span>
        </MenuItem>
      }
    })}
  </DropdownButton>
}

type HitModeDropdownProps = Omit<DropdownButtonProps, "title" | "onChange" | "children">
export function HitModeDropdown(props: HitModeDropdownProps) {
  const { character: { hitMode }, characterDispatch } = useContext(DataContext)
  const { t } = useTranslation("component_hitModeEditor")
  return <DropdownButton title={t(`hitMode.${hitMode}`)} color="secondary" {...props}>
    <MenuItem key="avgHit"
      selected={"avgHit" === hitMode} disabled={"avgHit" === hitMode}
      onClick={() => characterDispatch({ hitMode: "avgHit" })}>
      {t(`hitMode.avgHit`)}
    </MenuItem>
    <MenuItem key="hit"
      selected={"hit" === hitMode} disabled={"hit" === hitMode}
      onClick={() => characterDispatch({ hitMode: "hit" })}>
      {t(`hitMode.hit`)}
    </MenuItem>
    <MenuItem key="critHit"
      selected={"critHit" === hitMode} disabled={"critHit" === hitMode}
      onClick={() => characterDispatch({ hitMode: "critHit" })}>
      {t(`hitMode.critHit`)}
    </MenuItem>
  </DropdownButton>
}
