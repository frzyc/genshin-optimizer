import { Box, CardHeader, ListItem, Divider, CardContent } from "@mui/material"
import { useContext } from "react"
import { DataContext } from "../DataContext"
import { DocumentSection } from "../Types/sheet"
import { evalIfFunc } from "../Util/Util"
import ConditionalDisplay from "./Conditional/ConditionalDisplay"
import CardDark from "./Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

export default function DocumentDisplay({ sections, teamBuffOnly }: { sections: DocumentSection[], teamBuffOnly?: boolean }) {
  if (!sections.length) return null
  return <Box display="flex" flexDirection="column" gap={1}>{sections.map((s, i) => <SectionDisplay section={s} key={i} teamBuffOnly={teamBuffOnly} />)}</Box>
}

function SectionDisplay({ section, teamBuffOnly }: { section: DocumentSection, teamBuffOnly?: boolean }) {
  const { data } = useContext(DataContext)
  if (section.canShow && !section.canShow(data)) return null
  if (teamBuffOnly && !section.teamBuff && !section.conditional?.teamBuff) return null
  const talentText = evalIfFunc(section.text, data)
  const description = evalIfFunc(section.fieldsDescription, data)
  const fields = section.fields ?? []
  let { icon, title, action } = section.fieldsHeader ?? {}
  icon = evalIfFunc(icon, data)
  return <>
    {!teamBuffOnly && talentText && <div>{talentText}</div>}
    {(!teamBuffOnly || section.teamBuff) && <CardDark>
      {teamBuffOnly && talentText && <CardContent>{talentText}</CardContent>}
      {section.fieldsHeader && <CardHeader avatar={icon} title={title} action={action} titleTypographyProps={{ variant: "subtitle2" }} />}
      {section.fieldsHeader && <Divider />}
      {teamBuffOnly && description && <CardContent>{description}</CardContent>}
      {fields.length > 0 && <FieldDisplayList>
        {fields?.map?.((field, i) => <FieldDisplay key={i} field={field} component={ListItem} />)}
      </FieldDisplayList>}
    </CardDark>}
    {!!section.conditional && (!teamBuffOnly || section.conditional.teamBuff) && <ConditionalDisplay conditional={section.conditional} hideDesc={!teamBuffOnly} />}
  </>
}
