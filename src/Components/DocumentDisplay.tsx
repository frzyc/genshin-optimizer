import { Box, CardHeader, ListItem, Divider } from "@mui/material"
import { useContext } from "react"
import { DataContext } from "../DataContext"
import { DocumentSection } from "../Types/sheet"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./ConditionalDisplay"
import CardDark from "./Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

export default function DocumentDisplay({ sections }: { sections: DocumentSection[] }) {
  const { data } = useContext(DataContext)
  const sectionsDisplay = sections?.map((section, i) => {
    if (section.canShow && !section.canShow(data)) return null
    const talentText = evalIfFunc(section.text, data)
    const fields = section.fields ?? []
    let { icon, title, action } = section.header ?? {}
    icon = evalIfFunc(icon, data)
    return <Box key={"section" + i} display="flex" flexDirection="column" gap={1}>
        {talentText && <div>{talentText}</div>}
      <CardDark>
        {section.header && <CardHeader avatar={icon} title={title} action={action} titleTypographyProps={{ variant: "subtitle2" }} />}
        {section.header && <Divider />}
        {fields.length > 0 && <FieldDisplayList>
          {fields?.map?.((field, i) => <FieldDisplay key={i} field={field} component={ListItem} />)}
        </FieldDisplayList>}
      </CardDark>
      {!!section.conditional && <ConditionalDisplay conditional={section.conditional} hideDesc />}
    </Box>
  }).filter(s => s)
  if (!sectionsDisplay.length) return null
  return <Box display="flex" flexDirection="column" gap={1}>{sectionsDisplay}</Box>
}
