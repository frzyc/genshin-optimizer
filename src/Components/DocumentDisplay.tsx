import { Box, ListItem } from "@mui/material"
import { useCallback, useContext } from "react"
import Conditional from "../Conditional/Conditional"
import { DataContext } from "../DataContext"
import { UIData } from "../Formula/api"
import useCharacterReducer from "../ReactHooks/useCharacterReducer"
import { DocumentSection } from "../Types/character_WR"
import { CharacterKey } from "../Types/consts"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./ConditionalDisplay"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

type SkillDisplayCardProps = {
  sections: DocumentSection[],
  characterKey: CharacterKey,
  skipConditionalEquipmentCheck?: boolean
}
export default function DocumentDisplay({ sections, characterKey, skipConditionalEquipmentCheck }: SkillDisplayCardProps) {
  const { data } = useContext(DataContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const onCVChange = useCallback(
    v => characterDispatch({ conditionalValues: v }), [characterDispatch])
  if (!data) return null

  const sectionsDisplay = sections?.map((section, i) => {
    if (section.canShow && !section.canShow(data)) return null
    const talentText = evalIfFunc(section.text, data)
    const fields = section.fields ?? []
    // const canShowConditional = section.conditional && section.conditional.partyBuff !== "partyOnly" && Conditional.canShow(section.conditional, build, skipConditionalEquipmentCheck)
    // if (!talentText && !fields.length && !canShowConditional) return null
    return <Box key={"section" + i} display="flex" flexDirection="column" gap={1}>
      {talentText && <div>{talentText}</div>}
      {fields.length > 0 && <FieldDisplayList>
        {fields?.map?.((field, i) => <ListItem key={i}><FieldDisplay field={field} /></ListItem>)}
      </FieldDisplayList>}
      {/* {!!section.conditional && canShowConditional && <ConditionalDisplay conditional={section.conditional} data={build} onChange={onCVChange} hideDesc skipConditionalEquipmentCheck={skipConditionalEquipmentCheck} />} */}
    </Box>
  }).filter(s => s)
  if (!sectionsDisplay.length) return null
  return <Box display="flex" flexDirection="column" gap={1}>{sectionsDisplay}</Box>
}
