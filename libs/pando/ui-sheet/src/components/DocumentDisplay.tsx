'use client'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardHeaderCustom, CardThemed } from '@genshin-optimizer/common/ui'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Collapse, Divider } from '@mui/material'
import { useState } from 'react'
import type { Document, FieldsDocument, Header, TextDocument } from '../types'
import { FieldsDisplay } from './FieldDisplay'

export function DocumentDisplay({
  document,
  bgt = 'normal',
  collapse = false,
}: {
  document: Document
  bgt?: CardBackgroundColor
  collapse?: boolean
}) {
  switch (document.type) {
    case 'fields':
      return <FieldsSectionDisplay fieldsDocument={document} bgt={bgt} />
    case 'text':
      return collapse ? (
        <TextSectionDisplayCollapse textDocument={document} />
      ) : (
        <TextSectionDisplay textDocument={document} />
      )
    case 'conditional':
      return null //TODO:
    // return (
    //   <ConditionalDisplay
    //     conditional={document}
    //     hideDesc={hideDesc}
    //     hideHeader={hideHeader}
    //     disabled={disabled}
    //     bgt={bgt}
    //   />
    // )
    default:
      return null
  }
}
function FieldsSectionDisplay({
  fieldsDocument: fieldsDocument,
  bgt = 'normal',
}: {
  fieldsDocument: FieldsDocument
  bgt?: CardBackgroundColor
}) {
  return (
    <CardThemed bgt={bgt}>
      {fieldsDocument.header && (
        <HeaderDisplay
          header={fieldsDocument.header}
          hideDivider={fieldsDocument.fields.length === 0}
        />
      )}
      <FieldsDisplay bgt={bgt} fields={fieldsDocument.fields} />
    </CardThemed>
  )
}

function TextSectionDisplay({ textDocument }: { textDocument: TextDocument }) {
  return <div>{textDocument.text}</div>
}
function TextSectionDisplayCollapse({
  textDocument,
}: {
  textDocument: TextDocument
}) {
  const [expanded, setExpanded] = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <Box sx={{ position: 'relative' }}>
      {!expanded && (
        <Box
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            mx: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'flex-end',
            zIndex: '10',
            transition: 'transform 0.3s ease',
            transform: hover ? 'translate(0,-5px)' : undefined,
          }}
        >
          <KeyboardArrowDownIcon />
        </Box>
      )}
      <Collapse
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        collapsedSize={55}
        onClick={() => setExpanded((e) => !e)}
        in={expanded}
        sx={{
          cursor: 'pointer',
          position: 'relative',
          maskImage: expanded
            ? undefined
            : 'linear-gradient(to bottom, black 0%, transparent 100%)',
          '&:hover': {
            maskImage: expanded
              ? undefined
              : 'linear-gradient(to bottom, black 50%, transparent 100%)',
          },
        }}
      >
        <div>{textDocument.text}</div>
      </Collapse>
    </Box>
  )
}

export function HeaderDisplay({
  header,
  hideDivider,
}: {
  header: Header
  hideDivider?: boolean | ((section: Document) => boolean)
}) {
  const { icon, text: title, additional: action } = header

  return (
    <>
      <CardHeaderCustom avatar={icon} title={title} action={action} />
      {!hideDivider && <Divider />}
    </>
  )
}
