import {
  BootstrapTooltip,
  ColorText,
  type CardBackgroundColor,
} from '@genshin-optimizer/common/ui'
import { evalIfFunc, valueString } from '@genshin-optimizer/common/util'
import type { AmpReactionKey } from '@genshin-optimizer/gi/consts'
import { allAmpReactionKeys } from '@genshin-optimizer/gi/consts'
import type {
  IBasicFieldDisplay,
  IFieldDisplay,
} from '@genshin-optimizer/gi/sheets'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import GroupsIcon from '@mui/icons-material/Groups'
import HelpIcon from '@mui/icons-material/Help'
import type { ListProps, PaletteColor } from '@mui/material'
import {
  Box,
  Divider,
  List,
  ListItem,
  Skeleton,
  Typography,
  styled,
} from '@mui/material'
import type { ReactNode } from 'react'
import React, { Suspense, useCallback, useContext, useMemo } from 'react'
import { DataContext, FormulaDataContext } from '../context'
import { GetCalcDisplay, resolveInfo } from '../util'
import { AmpReactionModeText } from './AmpReactionModeText'

export function FieldsDisplay({
  fields,
  bgt = 'normal',
}: {
  fields: IFieldDisplay[]
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
  field: IFieldDisplay
  component?: React.ElementType
}) {
  const { data, compareData } = useContext(DataContext)
  const canShow = useMemo(() => field?.canShow?.(data) ?? true, [field, data])
  if (!canShow) return null
  if ('node' in field) {
    const node = data.get(field.node)
    if (node.isEmpty) return null
    if (compareData) {
      const compareNode = compareData.get(field.node)
      return (
        <NodeFieldDisplay
          calcRes={node}
          compareCalcRes={compareNode}
          component={component}
        />
      )
    } else return <NodeFieldDisplay calcRes={node} component={component} />
  }
  return <BasicFieldDisplay field={field} component={component} />
}

export function BasicFieldDisplay({
  field,
  component,
}: {
  field: IBasicFieldDisplay
  component?: React.ElementType
}) {
  const { data } = useContext(DataContext)
  const v = evalIfFunc(field.value, data)
  const variant = evalIfFunc(field.variant, data)
  const text = field.text && <span>{field.text}</span>
  const suffix = field.textSuffix && <span> {field.textSuffix}</span>
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
        {text}
        {suffix}
      </Typography>
      <Typography>
        {typeof v === 'number' ? v.toFixed?.(field.fixed) : v}
        {field.unit}
      </Typography>
    </Box>
  )
}

export function NodeFieldDisplay({
  calcRes,
  compareCalcRes,
  component = ListItem,
  emphasize,
  showZero = false,
}: {
  calcRes?: CalcResult
  compareCalcRes?: CalcResult
  component?: React.ElementType
  emphasize?: boolean

  // Show field, even if the value is zero
  showZero?: boolean
}) {
  const { data } = useContext(DataContext)
  const { setFormulaData } = useContext(FormulaDataContext)
  const onClick = useCallback(
    () => setFormulaData(data, calcRes),
    [setFormulaData, data, calcRes]
  )
  if (!calcRes && !compareCalcRes) return null
  const { multi } = calcRes?.info ?? compareCalcRes?.info ?? {}

  const multiDisplay = multi && <span>{multi}&#215;</span>
  const calcValue = calcRes?.value ?? 0
  const compareCalcValue = compareCalcRes?.value ?? 0

  if (!showZero && !calcValue && !compareCalcValue) return null

  let fieldVal = false as ReactNode
  const { unit, fixed, variant, subVariant } = resolveInfo(
    (calcRes?.info ?? compareCalcRes?.info)!
  )
  const calcDisplay = GetCalcDisplay((calcRes ?? compareCalcRes)!)

  const diff = calcValue - compareCalcValue
  const pctDiff =
    compareCalcRes &&
    unit !== '%' &&
    (calcValue > 100 || compareCalcValue > 100)
      ? valueString(diff / compareCalcValue, '%', fixed)
      : null

  fieldVal = (
    <>
      <span>{valueString(calcValue, unit, fixed)}</span>
      {Math.abs(diff) > 0.0001 && compareCalcRes && (
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
      <NodeFieldDisplayText node={(calcRes ?? compareCalcRes)!} />
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
      {!!calcDisplay.formula && (
        <BootstrapTooltip
          placement="top"
          title={
            <Typography>
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width={300} height={30} />
                }
              >
                {allAmpReactionKeys.includes(variant as any) && (
                  <Box sx={{ display: 'inline-flex', gap: 1, mr: 1 }}>
                    <Box>
                      <AmpReactionModeText
                        reaction={variant as AmpReactionKey}
                        trigger={
                          subVariant as 'cryo' | 'pyro' | 'hydro' | undefined
                        }
                      />
                    </Box>
                    <Divider orientation="vertical" flexItem />
                  </Box>
                )}
                <span>{calcDisplay.formula}</span>
              </Suspense>
            </Typography>
          }
        >
          <HelpIcon
            onClick={onClick}
            fontSize="inherit"
            sx={{ cursor: 'help' }}
          />
        </BootstrapTooltip>
      )}
    </Box>
  )
}
export function NodeFieldDisplayText({ node }: { node: CalcResult }) {
  const { textSuffix, icon, isTeamBuff, variant, name } = resolveInfo(node.info)
  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  return (
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
      <ColorText color={variant !== 'invalid' ? variant : undefined}>
        {name}
        {suffixDisplay}
      </ColorText>
    </Typography>
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
