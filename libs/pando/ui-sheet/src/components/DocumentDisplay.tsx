'use client'
import type {
  IListConditionalData,
  INumConditionalData,
} from '@genshin-optimizer/common/formula'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardHeaderCustom,
  CardThemed,
  DropdownButton,
  NumberInputLazy,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import type { Calculator } from '@genshin-optimizer/pando/engine'
import { read } from '@genshin-optimizer/pando/engine'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { SliderProps } from '@mui/material'
import {
  Box,
  Button,
  Collapse,
  Divider,
  MenuItem,
  Slider,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
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

type SetConditionalFunc = (
  srcKey: string,
  sheetKey: string,
  condKey: string,
  value: number
) => void

export function DocumentDisplay({
  document,
  bgt = 'normal',
  collapse = false,
  setConditional,
}: {
  document: Document
  bgt?: CardBackgroundColor
  collapse?: boolean
  setConditional: SetConditionalFunc
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
          setConditional={setConditional}
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
  setConditional,
}: {
  conditional: Conditional
  bgt?: CardBackgroundColor
  setConditional: SetConditionalFunc
}) {
  const { header, fields } = conditional
  return (
    <CardThemed bgt={bgt}>
      {!!header && <HeaderDisplay header={header} />}
      <ConditionalSelector
        conditional={conditional}
        setConditional={setConditional}
      />
      {!!fields && <FieldsDisplay bgt={bgt} fields={fields} />}
    </CardThemed>
  )
}
function ConditionalSelector({
  conditional,
  setConditional,
}: {
  conditional: Conditional
  setConditional: SetConditionalFunc
}) {
  switch (conditional.metadata.type) {
    case 'bool':
      return (
        <BoolConditional
          conditional={conditional}
          setConditional={setConditional}
        />
      )
    case 'list':
      return (
        <ListConditional
          conditional={conditional}
          setConditional={setConditional}
        />
      )
    case 'num':
      return (
        <NumConditional
          conditional={conditional}
          setConditional={setConditional}
        />
      )
    default:
      return null
  }
}
function Badge({ children }: { children: ReactNode }) {
  if (!children) return null
  return <SqBadge sx={{ ml: 1 }}>{children}</SqBadge>
}
function getConditionalValue(
  calc: Calculator,
  sheetKey: string,
  condKey: string,
  srcKey: string
) {
  return calc.compute(
    read(
      {
        et: 'own',
        qt: 'cond',
        sheet: sheetKey,
        q: condKey,
        src: srcKey,
        dst: calc.cache.tag.src,
      },
      'max'
    )
  ).val
}
function BoolConditional({
  conditional,
  setConditional,
}: {
  conditional: Conditional
  setConditional: SetConditionalFunc
}) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional
  const { sheet: sheetKey, name: condKey } = conditional.metadata
  if (!sheetKey || !condKey) throw new Error('metadata missing')
  if (!calc) return null
  const srcKey = 'all'
  const conditionalValue = getConditionalValue(calc, sheetKey, condKey, srcKey)
  const labelEle = evalIfFunc(label, calc, conditionalValue)
  const badgeEle = evalIfFunc(badge, calc, conditionalValue)
  return (
    <Button
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={conditionalValue ? 'success' : 'primary'}
      onClick={() =>
        setConditional(srcKey, sheetKey, condKey, +!conditionalValue)
      }
      // disabled={disabled}
      startIcon={
        conditionalValue ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
      }
    >
      {labelEle} <Badge>{badgeEle}</Badge>
    </Button>
  )
}
function ListConditional({
  conditional,
  setConditional,
}: {
  conditional: Conditional
  setConditional: SetConditionalFunc
}) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional
  const {
    sheet: sheetKey,
    name: condKey,
    list,
  } = conditional.metadata as IListConditionalData
  if (!sheetKey || !condKey) throw new Error('metadata missing')
  if (!calc) return null
  const srcKey = 'all'

  const conditionalValue = getConditionalValue(calc, sheetKey, condKey, srcKey)

  return (
    <DropdownButton
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={conditionalValue ? 'success' : 'primary'}
      title={
        <>
          {evalIfFunc(label, calc, conditionalValue)}{' '}
          <Badge>{evalIfFunc(badge, calc, conditionalValue)}</Badge>
        </>
      }
      // disabled={disabled}
    >
      <Divider />
      {['0', ...list].map((val, ind) => (
        <MenuItem
          key={val}
          onClick={() => setConditional(srcKey, sheetKey, condKey, ind)}
          selected={conditionalValue === ind}
          disabled={conditionalValue === ind}
        >
          {evalIfFunc(label, calc, ind)}
          <Badge>{evalIfFunc(badge, calc, ind)}</Badge>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

function NumConditional({
  conditional,
  setConditional,
}: {
  conditional: Conditional
  setConditional: SetConditionalFunc
}) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional
  const {
    sheet: sheetKey,
    name: condKey,
    int_only,
    min,
    max,
  } = conditional.metadata as INumConditionalData
  if (!sheetKey || !condKey) throw new Error('metadata missing')
  if (!calc) return null
  const srcKey = 'all'

  const conditionalValue = getConditionalValue(calc, sheetKey, condKey, srcKey)
  const labelEle = evalIfFunc(label, calc, conditionalValue)
  const badgeEle = evalIfFunc(badge, calc, conditionalValue)
  if (typeof min === 'undefined' || typeof max === 'undefined')
    return (
      <NumberInputLazy
        fullWidth
        float={!int_only}
        inputProps={{ min, max }}
        InputProps={{
          startAdornment: labelEle && <Box sx={{ mr: 1 }}>{labelEle}</Box>,
          endAdornment: (
            <Badge>{evalIfFunc(badge, calc, conditionalValue)}</Badge>
          ),
        }}
        value={conditionalValue}
        onChange={(newVal) => setConditional(srcKey, sheetKey, condKey, newVal)}
      />
    )
  return (
    <Box sx={{ px: 2 }}>
      {(labelEle || badge) && (
        <Typography display="flex" justifyContent="space-between">
          {labelEle} {<Badge>{badgeEle}</Badge>}
        </Typography>
      )}
      <CondSlider
        max={max}
        min={min}
        value={conditionalValue}
        // onChange={(_e, v) => setInnerValue(v as number)}
        onChangeCommitted={(_e, v) =>
          setConditional(srcKey, sheetKey, condKey, v as number)
        }
        valueLabelDisplay="auto"
      />
    </Box>
  )
}
function CondSlider(props: Omit<SliderProps, 'onChange'>) {
  const [innerValue, setInnerValue] = useState(props.value)
  return (
    <Slider
      {...props}
      onChange={(_e, v) => setInnerValue(v as number)}
      value={innerValue}
    />
  )
}
