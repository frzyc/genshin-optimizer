import {
  BootstrapTooltip,
  type CardBackgroundColor,
  ColorText,
} from '@genshin-optimizer/common-ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common-util'
import type { CalcMeta, Read, Tag } from '@genshin-optimizer/game-opt-engine'
import {
  CalcContext,
  DebugReadContext,
  TagContext,
} from '@genshin-optimizer/game-opt-formula-ui'
import type { CalcResult } from '@genshin-optimizer/pando-engine'
import { read } from '@genshin-optimizer/pando-engine'
import HelpIcon from '@mui/icons-material/Help'
import type { ListProps, PaletteColor, SxProps, Theme } from '@mui/material'
import {
  Box,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
  styled,
} from '@mui/material'
import type { ReactNode } from 'react'
import React, { useCallback, useContext, useMemo } from 'react'
import {
  FormulaTextCacheContext,
  FormulaTextContext,
  FullTagDisplayContext,
  TagRowSxContext,
} from '../context'
import type { Field, TagField, TextField } from '../types'

export function FieldsDisplay({
  fields,
  bgt = 'normal',
}: {
  fields: Field[]
  bgt?: CardBackgroundColor
}) {
  return (
    <FieldDisplayList sx={{ m: 0 }} bgt={bgt}>
      {fields.map((field, i) => (
        <FieldDisplay key={i} field={field} />
      ))}
    </FieldDisplayList>
  )
}

function FieldDisplay({
  field,
  component = ListItem,
}: {
  field: Field
  component?: React.ElementType
}) {
  if ('fieldValue' in field)
    return <TextFieldDisplay field={field} component={component} />
  if ('fieldRef' in field) {
    return <TagFieldDisplay field={field} component={component} />
  }
  return null
}

export function TextFieldDisplay({
  field,
  component,
}: {
  field: TextField
  component?: React.ElementType
}) {
  const { title, subtitle, variant, toFixed, fieldValue, unit } = field
  const titleEle = <span>{title}</span>
  const subtitleEle = subtitle && <span> {subtitle}</span>
  return (
    <Box
      width="100%"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1,
        py: 0.25,
      }}
      component={component}
    >
      <Typography color={`${variant}.main`}>
        {titleEle}
        {subtitleEle}
      </Typography>
      <Typography>
        {typeof fieldValue === 'number' && toFixed !== undefined
          ? fieldValue.toFixed?.(toFixed)
          : fieldValue}
        {unit}
      </Typography>
    </Box>
  )
}

export function TagFieldDisplay({
  field,
  component = ListItem,
  emphasize,
  showZero = process.env['NODE_ENV'] === 'development',
  calcRead: calcReadOverride,
  rowSx,
  onClickFormula,
  onMouseEnter,
  onMouseLeave,
}: {
  field: TagField
  component?: React.ElementType
  emphasize?: boolean

  // Show field, even if the value is zero
  showZero?: boolean
  /** Use when `listFormulas` returns a full `Read`. */
  calcRead?: Read
  rowSx?: SxProps<Theme>
  /** Override help-icon click; pass a no-op to disable debug read. */
  onClickFormula?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const calc = useContext(CalcContext)
  const contextTag = useContext(TagContext)
  const getTagRowSx = useContext(TagRowSxContext)
  const { setRead } = useContext(DebugReadContext)
  const contextRowSx = getTagRowSx?.(field.fieldRef)
  const fieldRead = useMemo(
    () => calcReadOverride ?? read(field.fieldRef),
    [calcReadOverride, field.fieldRef]
  )

  const defaultHelpClick = useCallback(
    () => setRead(fieldRead),
    [fieldRead, setRead]
  )
  const onClick = onClickFormula ?? defaultHelpClick
  // const compareCalc: null | Calculator = null //TODO: compare calcs
  if (!calc) return null
  // if (!calc && !compareCalc) return null

  const valueCalcRes = calc.withTag(contextTag).compute(fieldRead)
  // const compareValueCalcRes: CalcResult<number, CalcMeta> | null = null

  // const { setFormulaData } = useContext(FormulaDataContext)
  const { multi, icon, title, subtitle } = field
  const multiDisplay = multi && <span>{multi}&#215;</span>

  const calcValue = valueCalcRes.val
  const compareCalcValue = 0 //TODO: compare calcs

  if (!showZero && !calcValue && !compareCalcValue) return null

  let fieldVal = false as ReactNode
  const unit = getUnitStr(fieldRead.tag['q'] || fieldRead.tag['name'] || '')

  const diff = calcValue - compareCalcValue
  const pctDiff =
    compareCalcValue &&
    unit !== '%' &&
    (calcValue > 100 || compareCalcValue > 100)
      ? valueString(diff / compareCalcValue, '%')
      : null

  fieldVal = (
    <>
      <span>{valueString(calcValue, unit)}</span>
      {Math.abs(diff) > 0.0001 && !!compareCalcValue && (
        <BootstrapTooltip
          title={
            <Typography>
              Compare to <strong>{valueString(compareCalcValue, unit)}</strong>
            </Typography>
          }
        >
          <ColorText
            color={diff > 0 ? 'success' : 'error'}
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <span>
              ({diff > 0 ? '+' : ''}
              {valueString(diff, unit)})
            </span>
            {!!pctDiff && (
              <span>
                ({diff > 0 ? '+' : ''}
                {pctDiff})
              </span>
            )}
          </ColorText>
        </BootstrapTooltip>
      )}
    </>
  )

  return (
    <Box
      width="100%"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={[
        {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          // Red inset: sheet conditional emphasis. Green opt-target uses `TagRowSxContext`.
          boxShadow: emphasize ? '0px 0px 0px 2px red inset' : undefined,
          py: 0.25,
        },
        ...(contextRowSx
          ? Array.isArray(contextRowSx)
            ? contextRowSx
            : [contextRowSx]
          : []),
        ...(rowSx ? (Array.isArray(rowSx) ? rowSx : [rowSx]) : []),
      ]}
      component={component}
    >
      <Typography
        component="div"
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          marginRight: 'auto',
        }}
      >
        {icon}
        {title}
        {subtitle}
      </Typography>
      <Typography
        sx={{
          display: 'flex',
          gap: 0.5,
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {multiDisplay}
        {fieldVal}
      </Typography>
      <FormulaHelpIcon computed={valueCalcRes} onClick={onClick} />
    </Box>
  )
}
function FormulaHelpIcon({
  computed,
  onClick,
}: {
  computed: CalcResult<number, CalcMeta<Tag, string>>
  onClick?: () => void
}) {
  const FullTagDisplay = useContext(FullTagDisplayContext)
  const formulaText = useContext(FormulaTextContext)
  const formulaTextCache = useContext(FormulaTextCacheContext)
  const tag = computed.meta.tag
  const name = tag?.['name'] || tag?.['q'] || ''
  const valDisplay = valueString(computed.val, getUnitStr(name))
  const fText = useMemo(
    () => formulaText(computed as any, formulaTextCache),
    [computed, formulaText, formulaTextCache]
  )
  if (!tag) return null
  return (
    <BootstrapTooltip
      title={
        <Typography component="div">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FullTagDisplay tag={tag} />
            <span>{valDisplay}</span>
          </Box>
          <Divider />
          <Box>{fText?.formula}</Box>

          <Stack spacing={1} sx={{ pl: 1, pt: 1 }}>
            {fText?.deps.map((dep, i) => (
              <Box key={i}>
                <Box>{dep.name}</Box>
                <Divider />
                <Box> {dep.formula}</Box>
              </Box>
            ))}
          </Stack>
        </Typography>
      }
    >
      <HelpIcon onClick={onClick} fontSize="inherit" sx={{ cursor: 'help' }} />
    </BootstrapTooltip>
  )
}

export interface FieldDisplayListProps extends ListProps {
  bgt?: CardBackgroundColor
  palletOption?: keyof PaletteColor
}
export const FieldDisplayList = styled(List)<FieldDisplayListProps>(
  ({ theme, bgt = 'normal' }) => {
    const palette =
      bgt === 'light'
        ? 'contentLight'
        : bgt === 'dark'
          ? 'contentDark'
          : 'contentNormal'
    return {
      borderRadius: theme.shape.borderRadius,
      overflow: 'hidden',
      margin: 0,
      '> .MuiListItem-root:nth-of-type(even)': {
        backgroundColor: (theme.palette[palette] as PaletteColor)['main'],
      },
      '> .MuiListItem-root:nth-of-type(odd)': {
        backgroundColor: (theme.palette[palette] as PaletteColor)['dark'],
      },
    }
  }
)
