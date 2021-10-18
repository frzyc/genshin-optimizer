import { CardContent, Grid, MenuItem, ToggleButton, ToggleButtonGroupProps } from "@mui/material";
import { useContext } from 'react';
import { buildContext } from "../Build/Build";
import CharacterSheet from "../Character/CharacterSheet";
import useCharacterReducer from "../ReactHooks/useCharacterReducer";
import usePromise from "../ReactHooks/usePromise";
import { ICachedCharacter } from "../Types/character";
import { ICalculatedStats } from "../Types/stats";
import CardLight from "./Card/CardLight";
import ColorText from "./ColoredText";
import DropdownButton, { DropdownButtonProps } from "./DropdownMenu/DropdownButton";
import SolidToggleButtonGroup from "./SolidToggleButtonGroup";
import StatIcon, { uncoloredEleIcons } from "./StatIcon";
const infusionVals = {
  "": <span>No External Infusion</span>,
  "pyro": <span >{uncoloredEleIcons.pyro} Pyro Infusion</span>,
  "cryo": <span >{uncoloredEleIcons.cryo} Cryo Infusion</span>,
}
type InfusionAuraDropdownProps = Omit<DropdownButtonProps, "title" | "onChange" | "children"> & {
  character: ICachedCharacter,
}
export function InfusionAuraDropdown({ character: { infusionAura = "", key: characterKey }, ...props }: InfusionAuraDropdownProps) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const characterDispatch = useCharacterReducer(characterKey)
  if (!characterSheet?.isMelee()) return null
  return <DropdownButton title={infusionVals[infusionAura]} color={infusionAura || "secondary"} {...props}>
    {Object.entries(infusionVals).map(([key, text]) =>
      <MenuItem key={key} sx={key ? { color: `${key}.main` } : undefined}
        selected={key === infusionAura} disabled={key === infusionAura}
        onClick={() => characterDispatch({ infusionAura: key })}>{text}</MenuItem>)}
  </DropdownButton>
}

type ReactionToggleProps = Omit<ToggleButtonGroupProps, "color"> & {
  character: ICachedCharacter,
  build: ICalculatedStats,
}
export function ReactionToggle({ character: { reactionMode = "", infusionAura, key: characterKey }, build, ...props }: ReactionToggleProps) {
  const characterDispatch = useCharacterReducer(characterKey)
  if (!build) return null
  const charEleKey = build.characterEle
  if (!["pyro", "hydro", "cryo"].includes(charEleKey) && !["pyro", "hydro", "cryo"].includes(infusionAura)) return null
  return <SolidToggleButtonGroup exclusive baseColor="secondary"
    value={reactionMode} onChange={(e, reactionMode) => characterDispatch({ reactionMode })} {...props}>
    <ToggleButton value="" >No Reactions</ToggleButton >
    {(charEleKey === "pyro" || infusionAura === "pyro") && <ToggleButton value="pyro_vaporize"  >
      <ColorText color="vaporize">Vaporize(Pyro){StatIcon.hydro}+{StatIcon.pyro}</ColorText>
    </ToggleButton >}
    {(charEleKey === "pyro" || infusionAura === "pyro") && <ToggleButton value={"pyro_melt"}  >
      <ColorText color="melt">Melt(Pyro) {StatIcon.cryo}+{StatIcon.pyro}</ColorText>
    </ToggleButton >}
    {(charEleKey === "hydro" || infusionAura === "hydro") && <ToggleButton value={"hydro_vaporize"}  >
      <ColorText color="vaporize">Vaporize(Hydro) {StatIcon.pyro}+{StatIcon.hydro}</ColorText>
    </ToggleButton >}
    {(charEleKey === "cryo" || infusionAura === "cryo") && <ToggleButton value={"cryo_melt"}  >
      <ColorText color="melt">Melt(Cryo) {StatIcon.pyro}+{StatIcon.cryo}</ColorText>
    </ToggleButton >}
  </SolidToggleButtonGroup>
}
type HitModeToggleProps = Omit<ToggleButtonGroupProps, "color"> & {
  character: ICachedCharacter
}
export function HitModeToggle({ character: { hitMode = "avgHit", key: characterKey }, ...props }: HitModeToggleProps) {
  const characterDispatch = useCharacterReducer(characterKey)
  return <SolidToggleButtonGroup exclusive baseColor="secondary"
    value={hitMode} onChange={(e, hitMode) => characterDispatch({ hitMode })} {...props} >
    <ToggleButton value="avgHit">Avg. DMG</ToggleButton>
    <ToggleButton value="hit">Non Crit DMG</ToggleButton>
    <ToggleButton value="critHit">Crit Hit DMG</ToggleButton>
  </SolidToggleButtonGroup>
}


export function DamageOptionsCard({ character }: { character: ICachedCharacter }) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild!
  return <CardLight>
    <CardContent>
      <Grid container spacing={1}>
        <Grid item><HitModeToggle character={character} size="small" /></Grid>
        <Grid item><InfusionAuraDropdown character={character} /></Grid>
        <Grid item><ReactionToggle character={character} build={build} size="small" /></Grid>
      </Grid>
    </CardContent>
  </CardLight>
}

