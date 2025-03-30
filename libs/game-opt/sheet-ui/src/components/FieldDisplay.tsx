import {
  BootstrapTooltip,
  type CardBackgroundColor,
  ColorText,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, valueString } from '@genshin-optimizer/common/util'
import type { Tag } from '@genshin-optimizer/game-opt/engine'
import { Read } from '@genshin-optimizer/game-opt/engine'
import {
  CalcContext,
  DebugReadContext,
  TagContext,
} from '@genshin-optimizer/game-opt/formula-ui'
import { read } from '@genshin-optimizer/pando/engine'
import GroupsIcon from '@mui/icons-material/Groups'
import HelpIcon from '@mui/icons-material/Help'
import type { ListProps, Palette, PaletteColor } from '@mui/material'
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
}: {
  field: TagField
  component?: React.ElementType
  emphasize?: boolean

  // Show field, even if the value is zero
  showZero?: boolean
}) {
  const calc = useContext(CalcContext)
  const contextTag = useContext(TagContext)
  const { setRead } = useContext(DebugReadContext)
  const calcRead = read(field.fieldRef) // we assume default accumulator

  const onClick = useCallback(() => setRead(calcRead), [calcRead, setRead])
  // const compareCalc: null | Calculator = null //TODO: compare calcs
  if (!calc) return null
  // if (!calc && !compareCalc) return null

  const valueCalcRes = calc.withTag(contextTag).compute(calcRead)
  // const compareValueCalcRes: CalcResult<number, CalcMeta> | null = null

  // const { setFormulaData } = useContext(FormulaDataContext)
  const { multi, icon, title, subtitle } = field
  const multiDisplay = multi && <span>{multi}&#215;</span>

  const calcValue = valueCalcRes.val
  const compareCalcValue = 0 //TODO: compare calcs

  if (!showZero && !calcValue && !compareCalcValue) return null

  let fieldVal = false as ReactNode
  const unit = (field.fieldRef['q'] ?? '')?.endsWith('_') ? '%' : ''
  const variant = '' // TODO: variant from tag like { ele: amp: cata: trans: }
  const fixed = undefined // TODO: what do here?
  // const calcDisplay = <span>TODO formula</span> //TODO: Formula display
  const isTeamBuff = false //TODO: teambuff?

  const diff = calcValue - compareCalcValue
  const pctDiff =
    compareCalcValue &&
    unit !== '%' &&
    (calcValue > 100 || compareCalcValue > 100)
      ? valueString(diff / compareCalcValue, '%', fixed)
      : null

  fieldVal = (
    <>
      <span>{valueString(calcValue, unit, fixed)}</span>
      {Math.abs(diff) > 0.0001 && !!compareCalcValue && (
        <BootstrapTooltip
          title={
            <Typography>
              Compare to{' '}
              <strong>{valueString(compareCalcValue, unit, fixed)}</strong>
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
              {valueString(diff, unit, fixed)})
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
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1,
        boxShadow: emphasize ? '0px 0px 0px 2px red inset' : undefined,
        py: 0.25,
      }}
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
        {!!isTeamBuff && <GroupsIcon />}
        {icon}
        <ColorText color={variant as unknown as keyof Palette}>
          {title}
          {subtitle}
        </ColorText>
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
      <FormulaHelpIcon tag={field.fieldRef} onClick={onClick} />
    </Box>
  )
}
export function FormulaHelpIcon({
  tag,
  onClick,
}: { tag: Tag; onClick?: () => void }) {
  const calc = useContext(CalcContext)
  const contextTag = useContext(TagContext)
  const FullTagDisplay = useContext(FullTagDisplayContext)
  const formulaText = useContext(FormulaTextContext)
  const formulaTextCache = useContext(FormulaTextCacheContext)
  const name = tag.name || tag.q
  const read = useMemo(() => new Read(tag, undefined), [tag])
  const computed = useMemo(
    () => calc?.withTag(contextTag).compute(read),
    [calc, contextTag, read]
  )
  const valDisplay = valueString(computed?.val ?? 0, getUnitStr(name ?? ''))
  const fText = useMemo(
    () => computed && formulaText(computed as any, formulaTextCache),
    [computed, formulaText, formulaTextCache]
  )
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
