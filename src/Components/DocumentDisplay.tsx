import { Box, Divider, Typography } from "@mui/material"
import { useContext } from "react"
import { DataContext } from "../Context/DataContext"
import { DocumentSection, IDocumentFields, IDocumentHeader, IDocumentText } from "../Types/sheet"
import { evalIfFunc } from "../Util/Util"
import CardDark from "./Card/CardDark"
import CardHeaderCustom from "./Card/CardHeaderCustom"
import ConditionalDisplay from "./Conditional/ConditionalDisplay"
import FieldsDisplay from "./FieldDisplay"
import InfoTooltip from "./InfoTooltip"

type DocumentDisplayProps = {
  sections: DocumentSection[],
  teamBuffOnly?: boolean,
  hideDesc?: boolean,
  hideHeader?: boolean | ((section: DocumentSection) => boolean),
}

export default function DocumentDisplay({ sections, teamBuffOnly, hideDesc = false, hideHeader = false }: DocumentDisplayProps) {
  const { data } = useContext(DataContext)
  if (!sections.length) return null
  const sectionDisplays = sections.map((s, i) => {
    // If we can't show this section, return null
    if (s.canShow && !data.get(s.canShow).value) return null
    // If we are showing only teambuffs, and this section is not a teambuff, return null
    if (teamBuffOnly && !s.teamBuff) return null
    return <SectionDisplay section={s} key={i} hideDesc={hideDesc} hideHeader={hideHeader} />
  }).filter(s => s)
  if (!sectionDisplays.length) return null
  return <Box display="flex" flexDirection="column" gap={1}>{sectionDisplays}</Box>
}

function SectionDisplay({ section, hideDesc = false, hideHeader = false }: { section: DocumentSection, hideDesc?: boolean, hideHeader?: boolean | ((section: DocumentSection) => boolean) }) {
  if ("fields" in section) {
    return <FieldsSectionDisplay section={section} hideDesc={hideDesc} hideHeader={hideHeader} />
  } else if ("states" in section) {
    return <ConditionalDisplay conditional={section} hideDesc={hideDesc} hideHeader={hideHeader} />
  } else /* if ("text" in section) */ {
    return <TextSectionDisplay section={section} />
  }
}

function FieldsSectionDisplay({ section, hideDesc, hideHeader }: { section: IDocumentFields, hideDesc?: boolean, hideHeader?: boolean | ((section: DocumentSection) => boolean) }) {
  return <CardDark>
    {!evalIfFunc(hideHeader, section) && section.header &&
      <HeaderDisplay header={section.header} hideDesc={hideDesc} hideDivider={section.fields.length === 0} />
    }
    <FieldsDisplay fields={section.fields} />
  </CardDark>
}

function TextSectionDisplay({ section }: { section: IDocumentText }) {
  const { data } = useContext(DataContext)
  return <div>
    {evalIfFunc(section.text, data)}
  </div>
}

export function HeaderDisplay({ header, hideDesc, hideDivider }: { header: IDocumentHeader, hideDesc?: boolean, hideDivider?: boolean | ((section: DocumentSection) => boolean) }) {
  const { data } = useContext(DataContext)
  let { icon, title, action } = header
  icon = evalIfFunc(icon, data)
  const description = !hideDesc && evalIfFunc(header.description, data)
  const displayTitle = hideDesc ? title : <span>{title} <InfoTooltip title={<Typography>{description}</Typography>} /></span>
  return <>
    <CardHeaderCustom avatar={icon} title={displayTitle} action={action} />
    {!hideDivider && <Divider />}
  </>
}
