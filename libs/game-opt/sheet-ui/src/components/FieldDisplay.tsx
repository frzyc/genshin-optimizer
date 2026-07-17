import {
  BootstrapTooltip,
  type CardBackgroundColor,
  ColorText,
} from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  type Unit,
  valueString,
} from '@genshin-optimizer/common/util'
import type { CalcMeta, Read, Tag } from '@genshin-optimizer/game-opt/engine'
import {
  CalcContext,
  TagContext,
  useSetDebugTarget,
} from '@genshin-optimizer/game-opt/formula-ui'
import type { BaseRead, CalcResult } from '@genshin-optimizer/pando/engine'
import { read } from '@genshin-optimizer/pando/engine'
import HelpIcon from '@mui/icons-material/Help'
import type { ListProps, PaletteColor, SxProps, Theme } from '@mui/material'
import {
  Box,
  Divider,
  List,
  ListItem,
  Stack,
  styled,
  Typography,
} from '@mui/material'
import type { ElementType } from 'react'
import { useCallback, useContext, useMemo, useState } from 'react'
import {
  CompareCalcContext,
  FormulaTextCacheContext,
  FormulaTextContext,
  FullTagDisplayContext,
  TagRowSxContext,
} from '../context'
import type { Field, MultiTagField, TagField, TextField } from '../types'
import { isMultiTagField } from '../types'

export function CompareValueDisplay({
  calcValue,
  compareCalcValue,
  unit,
}: {
  calcValue: number
  compareCalcValue: number | undefined
  unit: Unit
}) {
  const pctChange =
    compareCalcValue !== undefined && compareCalcValue !== 0
      ? (calcValue - compareCalcValue) / compareCalcValue
      : undefined
  const showPct = pctChange !== undefined && Math.round(pctChange * 1000) !== 0

  return (
    <>
      <span>{valueString(calcValue, unit)}</span>
      {showPct && (
        <BootstrapTooltip
          title={
            <Typography>
              Compare to <strong>{valueString(compareCalcValue!, unit)}</strong>
            </Typography>
          }
        >
          <ColorText
            color={pctChange! > 0 ? 'success' : 'error'}
            sx={{ ml: 0.5 }}
          >
            {pctChange! > 0 ? '+' : ''}
            {valueString(pctChange!, '%', 1)}
          </ColorText>
        </BootstrapTooltip>
      )}
    </>
  )
}

function useCompareCalcValue(
  fieldRead: Read | BaseRead,
  contextTag: Tag
): number | undefined {
  const compareCalc = useContext(CompareCalcContext)
  return useMemo(() => {
    if (!compareCalc) return undefined
    return compareCalc.withTag(contextTag).compute(fieldRead).val
  }, [compareCalc, contextTag, fieldRead])
}

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
  component?: ElementType
}) {
  if ('fieldValue' in field)
    return <TextFieldDisplay field={field} component={component} />
  if (isMultiTagField(field)) {
    return <MultiTagFieldDisplay field={field} component={component} />
  }
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
  component?: ElementType
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

export function MultiTagFieldDisplay({
  field,
  component = ListItem,
  showZero = process.env['NODE_ENV'] === 'development',
  rowSx,
  onMouseEnter,
  onMouseLeave,
}: {
  field: MultiTagField
  component?: ElementType
  showZero?: boolean
  rowSx?: SxProps<Theme>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const calc = useContext(CalcContext)
  const compareCalc = useContext(CompareCalcContext)
  const contextTag = useContext(TagContext)
  const getTagRowSx = useContext(TagRowSxContext)
  const { icon, title, subtitle, fieldRefs } = field

  const taggedCalc = useMemo(
    () => (calc ? calc.withTag(contextTag) : undefined),
    [calc, contextTag]
  )
  const taggedCompareCalc = useMemo(
    () => (compareCalc ? compareCalc.withTag(contextTag) : undefined),
    [compareCalc, contextTag]
  )
  const computed = useMemo(
    () =>
      taggedCalc
        ? fieldRefs.map(({ label, ref: fieldRef }) => {
            const fieldRead = read(fieldRef)
            const valueCalcRes = taggedCalc.compute(fieldRead)
            const compareCalcValue = taggedCompareCalc
              ? taggedCompareCalc.compute(fieldRead).val
              : undefined
            return {
              label,
              fieldRef,
              fieldRead,
              valueCalcRes,
              compareCalcValue,
            }
          })
        : [],
    [fieldRefs, taggedCalc, taggedCompareCalc]
  )

  if (!calc) return null

  if (!showZero && computed.every(({ valueCalcRes }) => !valueCalcRes.val))
    return null

  const contextRowSx = computed
    .map(({ fieldRef }) => getTagRowSx?.(fieldRef))
    .find(Boolean)

  const stackValues = fieldRefs.length > 1

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
          py: 0.25,
          alignItems: stackValues ? 'flex-start' : 'center',
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
        component="div"
        sx={{
          display: 'flex',
          flexDirection: stackValues ? 'column' : 'row',
          gap: stackValues ? 0.25 : 1,
          alignItems: stackValues ? 'flex-end' : 'center',
          justifyContent: 'flex-end',
          flexWrap: stackValues ? 'nowrap' : 'wrap',
        }}
      >
        {computed.map(
          ({ label, fieldRead, valueCalcRes, compareCalcValue }) => {
            const calcValue = valueCalcRes.val
            if (!showZero && !calcValue && !compareCalcValue) return null
            const tag = fieldRead.tag
            const unit = getUnitStr(tag['name'] || tag['q'] || '')
            return (
              <Box
                key={`${tag['sheet']}_${tag['name']}_${tag['q']}`}
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {label && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {label}
                  </Typography>
                )}
                <CompareValueDisplay
                  calcValue={calcValue}
                  compareCalcValue={compareCalcValue}
                  unit={unit}
                />
                <FormulaHelpIcon
                  computed={valueCalcRes}
                  fieldRead={fieldRead}
                />
              </Box>
            )
          }
        )}
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
  onMouseEnter,
  onMouseLeave,
}: {
  field: TagField
  component?: ElementType
  emphasize?: boolean

  // Show field, even if the value is zero
  showZero?: boolean
  /** Use when `listFormulas` returns a full `Read`. */
  calcRead?: Read
  rowSx?: SxProps<Theme>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const calc = useContext(CalcContext)
  const contextTag = useContext(TagContext)
  const getTagRowSx = useContext(TagRowSxContext)
  const contextRowSx = getTagRowSx?.(field.fieldRef)
  const fieldRead = useMemo(
    () => calcReadOverride ?? read(field.fieldRef),
    [calcReadOverride, field.fieldRef]
  )

  const valueCalcRes = useMemo(
    () => calc?.withTag(contextTag).compute(fieldRead),
    [calc, contextTag, fieldRead]
  )
  const compareCalcValue = useCompareCalcValue(fieldRead, contextTag)

  if (!calc || !valueCalcRes) return null

  const { multi, icon, title, subtitle } = field
  const multiDisplay = multi && <span>{multi}&#215;</span>

  const calcValue = valueCalcRes.val

  if (!showZero && !calcValue && !compareCalcValue) return null

  const unit = getUnitStr(fieldRead.tag['q'] || fieldRead.tag['name'] || '')

  const fieldVal = (
    <CompareValueDisplay
      calcValue={calcValue}
      compareCalcValue={compareCalcValue}
      unit={unit}
    />
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
      <FormulaHelpIcon computed={valueCalcRes} fieldRead={fieldRead} />
    </Box>
  )
}
function FormulaHelpIcon({
  computed,
  fieldRead,
}: {
  computed: CalcResult<number, CalcMeta<Tag, string>>
  fieldRead: BaseRead
}) {
  const setDebugTarget = useSetDebugTarget()
  const FullTagDisplay = useContext(FullTagDisplayContext)
  const formulaText = useContext(FormulaTextContext)
  const formulaTextCache = useContext(FormulaTextCacheContext)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const onOpen = useCallback(() => setTooltipOpen(true), [])
  const onClose = useCallback(() => setTooltipOpen(false), [])
  const tag = computed.meta.tag
  const name = tag?.['name'] || tag?.['q'] || ''
  const valDisplay = valueString(computed.val, getUnitStr(name))
  const fText = useMemo(
    () =>
      tooltipOpen ? formulaText(computed as any, formulaTextCache) : undefined,
    [tooltipOpen, computed, formulaText, formulaTextCache]
  )
  if (!tag) return null
  const onClick = setDebugTarget ? () => setDebugTarget(fieldRead) : undefined
  return (
    <BootstrapTooltip
      onOpen={onOpen}
      onClose={onClose}
      title={
        tooltipOpen ? (
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
        ) : (
          ''
        )
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
