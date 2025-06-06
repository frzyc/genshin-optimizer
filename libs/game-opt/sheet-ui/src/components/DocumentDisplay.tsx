'use client'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import { CalcContext, TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { TypographyOwnProps } from '@mui/material'
import { Box, Collapse, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import type { Document, FieldsDocument, TextDocument } from '../types'
import { ConditionalsDisplay } from './ConditionalDisplay'
import { FieldsDisplay } from './FieldDisplay'
import { HeaderDisplay } from './HeaderDisplay'

export function DocumentDisplay({
  document,
  bgt = 'normal',
  collapse = false,
  typoVariant = 'body1',
}: {
  document: Document
  bgt?: CardBackgroundColor
  collapse?: boolean
  typoVariant?: TypographyOwnProps['variant']
}) {
  switch (document.type) {
    case 'fields':
      return <FieldsSectionDisplay fieldsDocument={document} bgt={bgt} />
    case 'text':
      return collapse ? (
        <TextSectionDisplayCollapse
          textDocument={document}
          typoVariant={typoVariant}
        />
      ) : (
        <TextSectionDisplay textDocument={document} typoVariant={typoVariant} />
      )
    case 'conditional':
      return (
        <ConditionalsDisplay
          conditional={document.conditional}
          // hideDesc={hideDesc}
          // hideHeader={hideHeader}
          // disabled={disabled}
          bgt={bgt}
        />
      )
    default:
      return null
  }
}

function FieldsSectionDisplay({
  fieldsDocument,
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

function TextSectionDisplay({
  textDocument,
  typoVariant,
}: {
  textDocument: TextDocument
  typoVariant?: TypographyOwnProps['variant']
}) {
  const calculator = useContext(CalcContext)
  const tag = useContext(TagContext)
  if (!calculator) return null
  return (
    <Typography variant={typoVariant}>
      {textDocument.header && <HeaderDisplay header={textDocument.header} />}
      {evalIfFunc(textDocument.text, calculator.withTag(tag))}
    </Typography>
  )
}
function TextSectionDisplayCollapse({
  textDocument,
  typoVariant,
}: {
  textDocument: TextDocument
  typoVariant?: TypographyOwnProps['variant']
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
        <TextSectionDisplay
          textDocument={textDocument}
          typoVariant={typoVariant}
        />
      </Collapse>
    </Box>
  )
}
