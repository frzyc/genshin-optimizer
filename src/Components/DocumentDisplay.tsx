import { Box } from "@mui/material"
import { useCallback, useContext } from "react"
import { buildContext } from "../Build/Build"
import Conditional from "../Conditional/Conditional"
import useCharacterReducer from "../ReactHooks/useCharacterReducer"
import { DocumentSection } from "../Types/character"
import { CharacterKey } from "../Types/consts"
import { ICalculatedStats } from "../Types/stats"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./ConditionalDisplay"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

type SkillDisplayCardProps = {
  sections: DocumentSection[],
  characterKey: CharacterKey,
  skipConditionalEquipmentCheck?: boolean
}
export default function DocumentDisplay({ sections, characterKey, skipConditionalEquipmentCheck }: SkillDisplayCardProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const build = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  const characterDispatch = useCharacterReducer(characterKey)
  const onCVChange = useCallback(
    v => characterDispatch({ conditionalValues: v }), [characterDispatch])
  if (!build) return null

  const sectionsDisplay = sections?.map((section, i) => {
    if (!section.canShow!(build)) return null
    const talentText = evalIfFunc(section.text, build)
    const fields = section.fields ?? []
    const canShowConditional = section.conditional && section.conditional.partyBuff !== "partyOnly" && Conditional.canShow(section.conditional, build, skipConditionalEquipmentCheck)
    if (!talentText && !fields.length && !canShowConditional) return null
    return <Box key={"section" + i} display="flex" flexDirection="column" gap={1}>
      {talentText && <div>{talentText}</div>}
      {fields.length > 0 && <FieldDisplayList>
        {fields?.map?.((field, i) => <FieldDisplay key={i} field={field} />)}
      </FieldDisplayList>}
      {!!section.conditional && canShowConditional && <ConditionalDisplay conditional={section.conditional} stats={build} onChange={onCVChange} hideDesc skipConditionalEquipmentCheck={skipConditionalEquipmentCheck} />}
    </Box>
  }).filter(s => s)
  if (!sectionsDisplay.length) return null
  return <Box display="flex" flexDirection="column" gap={1}>{sectionsDisplay}</Box>
}
