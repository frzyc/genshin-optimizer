import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardHeaderCustom,
  CardThemed,
  InfoTooltipInline,
} from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import type {
  DocumentSection,
  IDocumentFields,
  IDocumentHeader,
  IDocumentText,
} from '@genshin-optimizer/gi/sheets'
import { Box, Divider, Typography } from '@mui/material'
import { useContext } from 'react'
import { DataContext } from '../context'
import { FieldsDisplay } from './FieldDisplay'
import { ConditionalDisplay } from './conditional/ConditionalDisplay'

type DocumentDisplayProps = {
  sections: DocumentSection[]
  teamBuffOnly?: boolean
  hideDesc?: boolean
  hideHeader?: boolean | ((section: DocumentSection) => boolean)
  disabled?: boolean
  bgt?: CardBackgroundColor
}

export function DocumentDisplay({
  sections,
  teamBuffOnly,
  hideDesc = false,
  hideHeader = false,
  disabled = false,
  bgt = 'normal',
}: DocumentDisplayProps) {
  const { data } = useContext(DataContext)
  if (!sections.length) return null
  const sectionDisplays = sections
    .map((s, i) => {
      // If we can't show this section, return null
      if (s.canShow && !data.get(s.canShow).value) return null
      // If we are showing only teambuffs, and this section is not a teambuff, return null
      if (teamBuffOnly && !s.teamBuff) return null
      return (
        <SectionDisplay
          section={s}
          key={i}
          hideDesc={hideDesc}
          hideHeader={hideHeader}
          disabled={disabled}
          bgt={bgt}
        />
      )
    })
    .filter((s) => s)
  if (!sectionDisplays.length) return null
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {sectionDisplays}
    </Box>
  )
}

function SectionDisplay({
  section,
  hideDesc = false,
  hideHeader = false,
  disabled = false,
  bgt = 'normal',
}: {
  section: DocumentSection
  hideDesc?: boolean
  hideHeader?: boolean | ((section: DocumentSection) => boolean)
  disabled?: boolean
  bgt?: CardBackgroundColor
}) {
  if ('fields' in section) {
    return (
      <FieldsSectionDisplay
        section={section}
        hideDesc={hideDesc}
        hideHeader={hideHeader}
        bgt={bgt}
      />
    )
  } else if ('states' in section) {
    return (
      <ConditionalDisplay
        conditional={section}
        hideDesc={hideDesc}
        hideHeader={hideHeader}
        disabled={disabled}
        bgt={bgt}
      />
    )
  } /* if ("text" in section) */ else {
    return <TextSectionDisplay section={section} />
  }
}

function FieldsSectionDisplay({
  section,
  hideDesc,
  hideHeader,
  bgt = 'normal',
}: {
  section: IDocumentFields
  hideDesc?: boolean
  hideHeader?: boolean | ((section: DocumentSection) => boolean)
  bgt?: CardBackgroundColor
}) {
  return (
    <CardThemed bgt={bgt}>
      {!evalIfFunc(hideHeader, section) && section.header && (
        <HeaderDisplay
          header={section.header}
          hideDesc={hideDesc}
          hideDivider={section.fields.length === 0}
        />
      )}
      <FieldsDisplay bgt={bgt} fields={section.fields} />
    </CardThemed>
  )
}

function TextSectionDisplay({ section }: { section: IDocumentText }) {
  const { data } = useContext(DataContext)
  return <div>{evalIfFunc(section.text, data)}</div>
}

export function HeaderDisplay({
  header,
  hideDesc,
  hideDivider,
}: {
  header: IDocumentHeader
  hideDesc?: boolean
  hideDivider?: boolean | ((section: DocumentSection) => boolean)
}) {
  const { data } = useContext(DataContext)
  const { icon: preicon, title, action } = header
  const icon = evalIfFunc(preicon, data)
  const description = !hideDesc && evalIfFunc(header.description, data)
  const displayTitle = hideDesc ? (
    title
  ) : (
    <span>
      {title}
      <InfoTooltipInline title={<Typography>{description}</Typography>} />
    </span>
  )
  return (
    <>
      <CardHeaderCustom avatar={icon} title={displayTitle} action={action} />
      {!hideDivider && <Divider />}
    </>
  )
}
