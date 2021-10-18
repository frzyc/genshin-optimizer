import { Box, Typography } from "@mui/material"
import { useMemo } from "react"
import Character from "../Character/Character"
import Formula from "../Formula"
import usePromise from "../ReactHooks/usePromise"
import Stat from "../Stat"
import { ICachedCharacter } from "../Types/character"
import { IFieldDisplay } from "../Types/IFieldDisplay"
import { ICalculatedStats } from "../Types/stats"
import { characterBaseStats } from "../Util/StatUtil"
import ColorText from "./ColoredText"
import StatIcon from "./StatIcon"

function DisplayStatDiff({ label = "", val, oldVal, fixed = 0, unit = "", hasBonus = false }) {
  if (typeof oldVal === "undefined" && typeof val === "number") {//if only one value is filled, display that one.
    oldVal = val
    val = undefined
  }
  const diff = val !== undefined ? val - oldVal : 0;
  let oldText: Displayable = "", diffText: Displayable = ""
  if (oldVal || diff === 0) oldText = oldVal?.toFixed(fixed)
  else if (oldVal === undefined) oldText = val?.toFixed(fixed)//if oldval isnt defined, just display val.
  if (oldText) oldText = <span>{oldText}{unit}</span>
  if (diff !== 0) diffText = <ColorText color={diff > 0 ? "success" : "error"}>{diff > 0 ? "+" : ""}{diff?.toFixed(fixed)}{unit}</ColorText>
  const valueText = <>{oldText}{diffText}</>
  return <Box display="flex" justifyContent="space-between" >
    <Typography>{label}</Typography>
    <Typography>
      {hasBonus ? <strong>{valueText}</strong> : valueText}
    </Typography>
  </Box>
}
type StatDisplayProps = {
  character: ICachedCharacter,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats,
  statKey: string
}
export default function StatDisplay({ character, equippedBuild, newBuild, statKey }: StatDisplayProps) {
  const formula = usePromise(Array.isArray(statKey) ? Formula.get(statKey) : undefined, [statKey])

  const { val, oldVal, fixed, unit, label, hasBonus } = useMemo(() => {
    let val, oldVal, fixed, unit, label: Displayable = ""
    if (typeof statKey === "string") {//basic statKey
      if (newBuild && equippedBuild) {//comparable
        //newbuild -> val
        //equippedbuild ->old
        val = newBuild?.[statKey] ?? 0
        oldVal = equippedBuild?.[statKey] ?? 0
      } else {
        const build = newBuild ? newBuild : equippedBuild
        //build ->val
        val = build?.[statKey] ?? 0
        //statvaluewith override -> old
        oldVal = characterBaseStats(character)[statKey] as number | undefined
        if (build) {
          if (statKey === "finalHP")
            oldVal = build.characterHP
          else if (statKey === "finalDEF")
            oldVal = build.characterDEF
          else if (statKey === "finalATK")
            oldVal = build.characterATK + build.weaponATK
        }
      }
      unit = Stat.getStatUnit(statKey)
      fixed = Stat.fixedUnit(statKey)
      label = <span>{StatIcon[statKey]} {Stat.getStatName(statKey)}</span>
    } else if (formula) {//Formula
      const build = newBuild ? newBuild : equippedBuild
      const field = (formula as any).field as IFieldDisplay //assume it is attached in post-processing
      const labelVariant = Character.getTalentFieldValue(field, "variant", build)
      label = <ColorText color={labelVariant} >{Character.getTalentFieldValue(field, "text", build)}</ColorText>
      fixed = Character.getTalentFieldValue(field, "fixed", build, 0 as any)
      unit = Character.getTalentFieldValue(field, "unit", build, "")
      val = Character.getTalentFieldValue(field, "formula", build)?.[0]?.(build)
      if (newBuild && equippedBuild) {//comparable
        oldVal = Character.getTalentFieldValue(field, "formula", equippedBuild)?.[0]?.(equippedBuild)
      }
    }
    return { val, oldVal, fixed, unit, label, hasBonus: Character.hasBonusStats(character, statKey) }
  }, [character, equippedBuild, newBuild, statKey, formula])

  return <DisplayStatDiff {...{ val, oldVal, fixed, unit, label: label as any, hasBonus }} />
}