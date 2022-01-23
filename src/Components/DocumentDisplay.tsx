import { Box, ListItem } from "@mui/material"
import { useContext } from "react"
import { DataContext } from "../DataContext"
import { DocumentSection } from "../Types/character_WR"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./ConditionalDisplay"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

export default function DocumentDisplay({ sections }: { sections: DocumentSection[] }) {
  const { data } = useContext(DataContext)
  const sectionsDisplay = sections?.map((section, i) => {
    if (section.canShow && !section.canShow(data)) return null
    const talentText = evalIfFunc(section.text, data)
    const fields = section.fields ?? []
    return <Box key={"section" + i} display="flex" flexDirection="column" gap={1}>
      {talentText && <div>{talentText}</div>}
      {fields.length > 0 && <FieldDisplayList>
        {fields?.map?.((field, i) => <ListItem key={i}><FieldDisplay field={field} /></ListItem>)}
      </FieldDisplayList>}
      {!!section.conditional && <ConditionalDisplay conditional={section.conditional} hideDesc />}
    </Box>
  }).filter(s => s)
  if (!sectionsDisplay.length) return null
  return <Box display="flex" flexDirection="column" gap={1}>{sectionsDisplay}</Box>
}
