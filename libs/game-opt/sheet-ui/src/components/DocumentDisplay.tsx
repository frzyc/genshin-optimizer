import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import type { Tag } from '@genshin-optimizer/game-opt/engine'
import { CalcContext, TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { SxProps, Theme, TypographyOwnProps } from '@mui/material'
import { Box, Collapse, Typography } from '@mui/material'
import { type ReactNode, createContext, useContext, useState } from 'react'
import type { Document, FieldsDocument, TextDocument } from '../types'
import { ConditionalsDisplay } from './ConditionalDisplay'
import { FieldsDisplay } from './FieldDisplay'
import { HeaderDisplay } from './HeaderDisplay'

const DocumentGroupContext = createContext(false)

function useInDocumentGroup() {
  return useContext(DocumentGroupContext)
}

/** Enables grouped document layout inside a caller-provided card surface. */
export function DocumentGroupProvider({ children }: { children: ReactNode }) {
  return (
    <DocumentGroupContext.Provider value={true}>
      {children}
    </DocumentGroupContext.Provider>
  )
}

/** Card wrapper for multiple {@link DocumentContent} siblings sharing one surface. */
export function DocumentGroup({
  children,
  bgt = 'normal',
  sx,
}: {
  children: ReactNode
  bgt?: CardBackgroundColor
  sx?: SxProps<Theme>
}) {
  return (
    <DocumentGroupProvider>
      <CardThemed bgt={bgt} sx={sx}>
        {children}
      </CardThemed>
    </DocumentGroupProvider>
  )
}

export function DocumentContent({
  document,
  bgt = 'normal',
  collapse = false,
  typoVariant = 'body1',
  onClickFormula,
}: {
  document: Document
  bgt?: CardBackgroundColor
  collapse?: boolean
  typoVariant?: TypographyOwnProps['variant']
  onClickFormula?: (read: BaseRead, tag: Tag) => void
}) {
  switch (document.type) {
    case 'fields':
      return (
        <FieldsSectionContent
          fieldsDocument={document}
          bgt={bgt}
          onClickFormula={onClickFormula}
        />
      )
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
          bgt={bgt}
          onClickFormula={onClickFormula}
        />
      )
    default:
      return null
  }
}

export function DocumentDisplay({
  document,
  bgt = 'normal',
  collapse = false,
  typoVariant = 'body1',
  onClickFormula,
}: {
  document: Document
  bgt?: CardBackgroundColor
  collapse?: boolean
  typoVariant?: TypographyOwnProps['variant']
  onClickFormula?: (read: BaseRead) => void
}) {
  const content = (
    <DocumentContent
      document={document}
      bgt={bgt}
      collapse={collapse}
      typoVariant={typoVariant}
      onClickFormula={onClickFormula}
    />
  )
  if (document.type === 'fields') {
    return <CardThemed bgt={bgt}>{content}</CardThemed>
  }
  return content
}

function FieldsSectionContent({
  fieldsDocument,
  bgt = 'normal',
  onClickFormula,
}: {
  fieldsDocument: FieldsDocument
  bgt?: CardBackgroundColor
  onClickFormula?: (read: BaseRead, tag: Tag) => void
}) {
  return (
    <>
      {fieldsDocument.header && (
        <HeaderDisplay
          header={fieldsDocument.header}
          hideDivider={fieldsDocument.fields.length === 0}
        />
      )}
      <FieldsDisplay
        bgt={bgt}
        fields={fieldsDocument.fields}
        onClickFormula={onClickFormula}
      />
    </>
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
  const grouped = useInDocumentGroup()
  if (!calculator) return null
  const body = evalIfFunc(textDocument.text, calculator.withTag(tag))
  const hasBody = body !== null && body !== undefined && body !== false
  return (
    <>
      {textDocument.header && (
        <HeaderDisplay
          header={textDocument.header}
          hideDivider={!hasBody}
          compact={grouped}
        />
      )}
      {hasBody && (
        <Typography
          component="div"
          variant={typoVariant}
          sx={{
            px: 2,
            pb: grouped ? 1 : 2,
            pt: textDocument.header ? 0 : 2,
          }}
        >
          {body}
        </Typography>
      )}
    </>
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
