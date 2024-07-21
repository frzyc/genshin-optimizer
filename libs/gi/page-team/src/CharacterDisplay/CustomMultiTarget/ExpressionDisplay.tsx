import { ColorText, SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type {
  CustomFunction,
  ExpressionUnit,
  ItemAddress,
  ItemRelations,
} from '@genshin-optimizer/gi/db'
import {
  OperationSpecs,
  isEnclosing,
  unitPartFinder,
} from '@genshin-optimizer/gi/db'
import { DataContext, resolveInfo } from '@genshin-optimizer/gi/ui'
import { Box, ToggleButton } from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react'

export default function ExpressionDisplay({
  expression,
  functions,
  layer,
  // TODO: Highlight sia and sirpa with different colors
  sia,
  setSIA,
  sirpa,
  onFocused,
}: {
  expression: ExpressionUnit[]
  functions: CustomFunction[]
  layer: number
  sia: ItemAddress
  setSIA: Dispatch<SetStateAction<ItemAddress>>
  sirpa: ItemRelations
  onFocused: boolean
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

  const buttonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (sia && buttonRef.current) {
      // buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [sia, onFocused])

  const siaKey = useMemo(() => {
    if (sia) {
      return sia.type + sia.layer + (sia.index ?? '')
    }
    return ''
  }, [sia])

  const sirpaList: string[] = useMemo(() => {
    return [sirpa.this].concat(sirpa.all).map((a) => {
      if (!a) return ''
      const index = a.type !== 'function' ? a.index : ''
      return a.type + a.layer + index
    })
  }, [sirpa])

  /** Current function */
  const f = layer < functions.length && functions[layer]
  /** Current expression */
  const e = f ? f.expression : expression
  /** All available names */
  const alana = [] as string[]
  /** Veritable function available names */
  const vefuna = [] as string[]
  /** Available variable names */
  const avana = [] as string[]

  for (const f of functions.slice(0, layer)) {
    if (!alana.includes(f.name)) {
      alana.push(f.name)
      if (f.args.length) {
        vefuna.push(f.name)
      } else {
        avana.push(f.name)
      }
    }
  }

  for (const arg of f ? f.args : []) {
    if (!alana.includes(arg.name)) {
      alana.push(arg.name)
      avana.push(arg.name)
    }
  }

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
          {'  ='}
        </>
      )
    const key = 'function' + layer
    const functionButton = (text: JSX.Element | string, keySuffix: string) => {
      return (
        <ToggleButton
          key={key + keySuffix}
          value={key}
          sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
          onClick={() => setSIA({ type: 'function', layer })}
          ref={siaKey === key ? buttonRef : undefined}
        >
          {text}
        </ToggleButton>
      )
    }
    buttons.push(functionButton(text, 'name'))
    for (const [i, arg] of f.args.entries()) {
      const text = prefuna.includes(arg.name) ? (
        <ColorText color="burning">{arg.name}</ColorText>
      ) : (
        arg.name
      )
      if (i > 0) buttons.push(functionButton(',', 'comma' + i))

      const key = 'argument' + layer + i
      buttons.push(
        <ToggleButton
          key={key}
          value={key}
          sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
          onClick={() => setSIA({ type: 'argument', layer, index: i })}
          ref={siaKey === key ? buttonRef : undefined}
        >
          {text}
        </ToggleButton>
      )
    }
    if (f.args.length) buttons.push(functionButton(')  =', 'tail'))
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
      text = unit.name === '' ? '...' : unit.name
      if (!alana.includes(unit.name)) {
        text = <ColorText color="burning">{text}</ColorText>
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
    const key = 'unit' + layer + i
    buttons.push(
      <ToggleButton
        key={key}
        value={key}
        sx={{ minWidth: '0', pl: 0.25, pr: 0.35, pt: 1, pb: 1 }}
        onClick={() => setSIA({ type: 'unit', layer, index: i })}
        ref={siaKey === key ? buttonRef : undefined}
      >
        {text}
      </ToggleButton>
    )
  }

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
