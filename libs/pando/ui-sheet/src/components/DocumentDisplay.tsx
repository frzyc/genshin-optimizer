'use client'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardHeaderCustom, CardThemed } from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import { read } from '@genshin-optimizer/pando/engine'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Button, Collapse, Divider } from '@mui/material'
import { useContext, useState } from 'react'
import { CalcContext } from '../context'
import type {
  Conditional,
  Document,
  FieldsDocument,
  Header,
  TextDocument,
} from '../types'
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
      return (
        <ConditionalDisplay
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
  const calculator = useContext(CalcContext)
  if (!calculator) return null
  return <div>{evalIfFunc(textDocument.text, calculator)}</div>
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
        <TextSectionDisplay textDocument={textDocument} />
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

function ConditionalDisplay({
  conditional,
  bgt = 'normal',
}: {
  conditional: Conditional
  bgt?: CardBackgroundColor
}) {
  const { header, fields } = conditional
  return (
    <CardThemed bgt={bgt}>
      {!!header && <HeaderDisplay header={header} />}
      <ConditionalSelector conditional={conditional} />
      {!!fields && <FieldsDisplay bgt={bgt} fields={fields} />}
    </CardThemed>
  )
}
function ConditionalSelector({ conditional }: { conditional: Conditional }) {
  return <BoolConditional conditional={conditional} />
}
function BoolConditional({ conditional }: { conditional: Conditional }) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional

  const conditionalValue = calc?.compute(
    read(
      {
        et: 'own',
        qt: 'cond',
        sheet: conditional.metadata.sheet,
        q: conditional.metadata.name,
        src: 'all',
        dst: calc.cache.tag.src,
      },
      'max'
    )
  ).val
  return (
    <Button
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={conditionalValue ? 'success' : 'primary'}
      // onClick={() => setConditional(conditionalValue ? undefined : stateKey)}
      // disabled={disabled}
      startIcon={
        conditionalValue ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
      }
    >
      {label} {badge}
    </Button>
  )
}
