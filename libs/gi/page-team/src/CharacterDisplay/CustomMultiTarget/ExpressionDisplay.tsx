import { ColorText, SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type {
  ArgumentAddress,
  CustomFunction,
  ExpressionUnit,
  FunctionAddress,
  ItemAddress,
  UnitAddress,
} from '@genshin-optimizer/gi/db'
import {
  OperationSpecs,
  isEnclosing,
  unitPartFinder,
} from '@genshin-optimizer/gi/db'
import { DataContext, resolveInfo } from '@genshin-optimizer/gi/ui'
import { Box, ToggleButton } from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useContext, useMemo } from 'react'

export default function ExpressionDisplay({
  expression,
  functions,
  layer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sia,
  setSIA,
  sirpa,
}: {
  expression: ExpressionUnit[]
  functions: CustomFunction[]
  layer: number
  sia: ItemAddress | undefined
  setSIA: Dispatch<SetStateAction<ItemAddress | undefined>>
  sirpa: {
    functions: FunctionAddress[]
    args: ArgumentAddress[]
    units: UnitAddress[]
  }
}): JSX.Element {
  const { data } = useContext(DataContext)
  const getTargetName = useCallback(
    (path: string[]) => {
      const node = objPathValue(data.getDisplay(), path)
      if (!node) return path.join('.')
      return resolveInfo(node.info)?.name ?? path.join('.')
    },
    [data]
  )

  const sirpaList = useMemo(() => {
    return [
      ...sirpa.functions.map((f) => f.type + f.layer),
      ...sirpa.args.map((a) => a.type + a.layer + a.index),
      ...sirpa.units.map((a) => a.type + a.layer + a.index),
    ]
  }, [sirpa])

  /** Current function */
  const f = layer < functions.length && functions[layer]
  /** Current expression */
  const e = f ? f.expression : expression
  /** Veritable function available names */
  const vefuna = functions
    .slice(0, layer)
    .filter((f) => f.args.length > 0)
    .map((f) => f.name)
  /** Available variable names */
  const avana = [
    ...(f ? f.args.map((a) => a.name) : []),
    ...functions
      .slice(0, layer)
      .filter((f) => f.args.length < 1)
      .map((f) => f.name),
  ]
  /** All available names */
  const alana = [...avana, ...vefuna]

  const buttons: JSX.Element[] = []
  if (f) {
    /** Previous function names */
    const prefuna = functions.slice(0, layer).map((f) => f.name)
    let text = prefuna.includes(f.name) ? (
      <ColorText color="burning">{f.name}</ColorText>
    ) : (
      f.name
    )
    if (f.args.length)
      text = (
        <>
          {text}
          {'('}
        </>
      )
    else
      text = (
        <>
          {text}
          {/* {'\u00A0\u2A75\u00A0'} */}
          {'  ='}
        </>
      )
    const functionButton = (text: JSX.Element | string) => {
      return (
        <ToggleButton
          key={'function' + layer}
          value={'function' + layer}
          sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
          onClick={() => setSIA({ type: 'function', layer })}
        >
          {text}
        </ToggleButton>
      )
    }
    buttons.push(functionButton(text))
    for (const [i, arg] of f.args.entries()) {
      const text = prefuna.includes(arg.name) ? (
        <ColorText color="burning">{arg.name}</ColorText>
      ) : (
        arg.name
      )
      if (i > 0) buttons.push(functionButton(','))
      buttons.push(
        <ToggleButton
          key={'argument' + layer + i}
          value={'argument' + layer + i}
          sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
          onClick={() => setSIA({ type: 'argument', layer, index: i })}
        >
          {text}
        </ToggleButton>
      )
    }
    if (f.args.length) buttons.push(functionButton(')  ='))
  }

  const stack: string[] = []
  for (const [i, unit] of e.entries()) {
    const { type } = unit
    let text: string | JSX.Element = ''
    if (type === 'constant') {
      text = unit.value.toString()
    } else if (type === 'target') {
      text = getTargetName(unit.target.path)
    } else if (type === 'operation') {
      text = OperationSpecs[unit.operation].symbol
    } else if (type === 'function') {
      if (alana.includes(unit.name)) {
        text = unit.name
      } else {
        text = <ColorText color="burning">{unit.name}</ColorText>
      }
      if (vefuna.includes(unit.name)) {
        const parts = unitPartFinder(i, e, functions)
        const tail = e[parts[parts.length - 1]]
        if (tail && tail.type === 'enclosing' && tail.part === 'tail') {
          text = (
            <>
              {text}
              {'('}
            </>
          )
        } else {
          text = (
            <>
              {text}
              <ColorText color="burning">{'('}</ColorText>
            </>
          )
        }
        stack.push(unit.name)
      }
    } else if (type === 'enclosing') {
      if (unit.part === 'head') {
        text = OperationSpecs[unit.operation].symbol
        const parts = unitPartFinder(i, e, functions)
        const tail = e[parts[parts.length - 1]]
        if (tail && tail.type === 'enclosing' && tail.part === 'tail') {
          text = (
            <>
              {text}
              {OperationSpecs[unit.operation].enclosing.left}
            </>
          )
        } else {
          text = (
            <>
              {text}
              <ColorText color="burning">
                {OperationSpecs[unit.operation].enclosing.left}
              </ColorText>
            </>
          )
        }
        stack.push(unit.operation)
      } else if (unit.part === 'comma') {
        text = ','
        if (!stack.length) {
          text = <ColorText color="burning">{','}</ColorText>
        }
      } else if (unit.part === 'tail') {
        if (stack.length) {
          const enclosing = stack.pop()!
          if (isEnclosing(enclosing)) {
            text = OperationSpecs[enclosing].enclosing.right
          } else {
            text = ')'
          }
        } else {
          text = <ColorText color="burning">{')'}</ColorText>
        }
      }
    } else if (type === 'null') {
      text = <ColorText color="burning">null</ColorText>
    } else {
      text = ((_: never) => _)(type)
    }
    buttons.push(
      <ToggleButton
        key={'unit' + layer + i}
        value={'unit' + layer + i}
        sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
        onClick={() => setSIA({ type: 'unit', layer, index: i })}
      >
        {text}
      </ToggleButton>
    )
  }
  // <CardThemed
  //   bgt="light"
  //   sx={{
  //     boxShadow: '0 0 10px black',
  //     position: 'sticky',
  //     bottom: `10px`,
  //     zIndex: 1000,
  //   }}
  // >
  // </CardThemed>

  return (
    <Box display="flex" gap={1}>
      <SolidToggleButtonGroup
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
        value={sirpaList}
        size={'small'}
        baseColor="secondary"
      >
        {buttons}
      </SolidToggleButtonGroup>
    </Box>
  )
}
