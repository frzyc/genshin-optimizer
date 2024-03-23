import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { evalIfFunc, valueString } from '@genshin-optimizer/common/util'
import type { AmpReactionKey } from '@genshin-optimizer/gi/consts'
import { allAmpReactionKeys } from '@genshin-optimizer/gi/consts'
import { Groups } from '@mui/icons-material'
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
import { DataContext } from '../Context/DataContext'
import { FormulaDataContext } from '../Context/FormulaDataContext'
import type { NodeDisplay } from '../Formula/api'
import { nodeVStr } from '../Formula/uiData'
import type { IBasicFieldDisplay, IFieldDisplay } from '../Types/fieldDisplay'
import AmpReactionModeText from './AmpReactionModeText'
import BootstrapTooltip from './BootstrapTooltip'
import ColorText from './ColoredText'

export default function FieldsDisplay({
  fields,
  bgt = 'normal',
}: {
  fields: IFieldDisplay[]
  bgt?: CardBackgroundColor
}) {
  return (
    <FieldDisplayList sx={{ m: 0 }} bgt={bgt}>
      {fields.map((field, i) => (
        <FieldDisplay key={i} field={field} component={ListItem} />
      ))}
    </FieldDisplayList>
  )
}

function FieldDisplay({
  field,
  component,
}: {
  field: IFieldDisplay
  component?: React.ElementType
}) {
  const { data, oldData } = useContext(DataContext)
  const canShow = useMemo(() => field?.canShow?.(data) ?? true, [field, data])
  if (!canShow) return null
  if ('node' in field) {
    const node = data.get(field.node)
    if (node.isEmpty) return null
    if (oldData) {
      const oldNode = oldData.get(field.node)
      const oldValue = oldNode.isEmpty ? 0 : oldNode.value
      return (
        <NodeFieldDisplay
          node={node}
          oldValue={oldValue}
          component={component}
        />
      )
    } else return <NodeFieldDisplay node={node} component={component} />
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
      sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
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
  node,
  oldValue,
  component,
  emphasize,
}: {
  node: NodeDisplay
  oldValue?: number
  component?: React.ElementType
  emphasize?: boolean
}) {
  const { data } = useContext(DataContext)
  const { setFormulaData } = useContext(FormulaDataContext)
  const onClick = useCallback(
    () => setFormulaData(data, node),
    [setFormulaData, data, node]
  )

  if (node.isEmpty) return null
  const { multi } = node.info

  const multiDisplay = multi && <span>{multi}&#215;</span>
  let fieldVal = false as ReactNode
  if (oldValue !== undefined) {
    const diff = node.value - oldValue
    const pctDiff = valueString(Math.abs(diff / oldValue), '%', node.info.fixed)
    fieldVal = (
      <>
        <span>{valueString(oldValue, node.info.unit, node.info.fixed)}</span>
        {Math.abs(diff) > 0.0001 && (
          <>
            <ColorText color={diff > 0 ? 'success' : 'error'}>
              {diff > 0 ? '+' : ''}
              {valueString(diff, node.info.unit, node.info.fixed)}
            </ColorText>
            {node.info.unit !== '%' && oldValue !== 0 && (
              <ColorText color={diff > 0 ? 'success' : 'error'}>
                ({pctDiff})
              </ColorText>
            )}
          </>
        )}
      </>
    )
  } else fieldVal = <span>{nodeVStr(node)}</span>

  return (
    <Box
      width="100%"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1,
        boxShadow: emphasize ? '0px 0px 0px 2px red inset' : undefined,
      }}
      component={component}
    >
      <NodeFieldDisplayText node={node} />
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
      {!!node.formula && (
        <BootstrapTooltip
          placement="top"
          title={
            <Typography>
              <Suspense
                fallback={
                  <Skeleton variant="rectangular" width={300} height={30} />
                }
              >
                {allAmpReactionKeys.includes(node.info.variant as any) && (
                  <Box sx={{ display: 'inline-flex', gap: 1, mr: 1 }}>
                    <Box>
                      <AmpReactionModeText
                        reaction={node.info.variant as AmpReactionKey}
                        trigger={
                          node.info.subVariant as
                            | 'cryo'
                            | 'pyro'
                            | 'hydro'
                            | undefined
                        }
                      />
                    </Box>
                    <Divider orientation="vertical" flexItem />
                  </Box>
                )}
                <span>{node.formula}</span>
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
export function NodeFieldDisplayText({ node }: { node: NodeDisplay }) {
  const { textSuffix } = node.info
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
      {!!node.info.isTeamBuff && <Groups />}
      {node.info.icon}
      <ColorText color={node.info.variant}>
        {node.info.name}
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
