import { clamp, range } from '@genshin-optimizer/common/util'
import type {
  AddressItemTypesMap,
  CustomFunction,
  CustomFunctionArgument,
  ExpressionUnit,
  ItemAddress,
} from '@genshin-optimizer/gi/db'
import { itemAddressValue, itemPartFinder } from '@genshin-optimizer/gi/db'
import { Box } from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AddItemsPanel from './AddItemsPanel'
import ExpressionDisplay from './ExpressionDisplay'
import ItemConfigPanel from './ItemConfigPanel'

function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function assertNever(_: never) {}

/** Selected item address */
function useSIA(address?: ItemAddress) {
  const [sia, _setSIA] = useState<ItemAddress>(address)
  const oldSIA = useMemo(() => (sia ? { ...sia } : undefined), [sia])

  const setSIA: Dispatch<SetStateAction<ItemAddress>> = useCallback(
    (arg: ItemAddress | ((address: ItemAddress) => ItemAddress)) => {
      if (arg instanceof Function) arg = arg(oldSIA ? { ...oldSIA } : undefined)
      if (!arg) return _setSIA(undefined)
      if (oldSIA && isEqual(oldSIA, arg)) return
      _setSIA({ ...arg })
    },
    [oldSIA]
  )

  return [sia, setSIA] as const
}

export default function TargetExpressionEditor({
  expression: _expression,
  setExpression: _setExpression,
  functions: _functions,
  setFunctions: _setFunctions,
}: {
  expression?: ExpressionUnit[]
  setExpression: Dispatch<SetStateAction<typeof _expression>>
  functions?: CustomFunction[]
  setFunctions?: Dispatch<SetStateAction<typeof _functions>>
}) {
  const [expression, functions] = useMemo(() => {
    return [_expression ?? [], _functions ?? []]
  }, [_expression, _functions])

  const setExpression = useCallback(
    (
      arg:
        | ExpressionUnit[]
        | ((expression: ExpressionUnit[]) => ExpressionUnit[])
    ) => {
      if (arg instanceof Function) arg = arg(expression)
      _setExpression([...arg])
    },
    [_setExpression, expression]
  )

  const setFunctions = useCallback(
    (
      arg:
        | CustomFunction[]
        | ((functions: CustomFunction[]) => CustomFunction[])
    ) => {
      if (!_setFunctions) return
      if (arg instanceof Function) arg = arg(functions)
      _setFunctions([...arg])
    },
    [_setFunctions, functions]
  )

  const [sia, setSIA] = useSIA()
  const [onFocused, setOnFocus] = useState(false)
  const focusToSIA = useCallback(() => setOnFocus((prev) => !prev), [])

  /** Selected item related parts addresses */
  const sirpa = useMemo(
    () => itemPartFinder(expression, functions, sia),
    [sia, expression, functions]
  )

  useEffect(() => {
    if (!itemAddressValue(expression, functions, sia)) setSIA(undefined)
  }, [expression, functions, sia, setSIA])

  const setFunction = useCallback(
    (
      layer: number,
      arg: Partial<CustomFunction> | ((func: CustomFunction) => CustomFunction)
    ) => {
      if (!setFunctions) return
      setFunctions((prev) => {
        const funcs = prev ?? []
        const func = funcs[layer]
        if (!func) return prev
        if (arg instanceof Function) arg = arg(func)
        funcs.splice(layer, 1, { ...func, ...arg })
        return funcs
      })
    },
    [setFunctions]
  )

  const setExpressionItem = useCallback(
    <T extends AddressItemTypesMap>(
      address: T[0] | undefined,
      arg: Partial<T[1]> | ((item: T[1]) => T[1])
    ) => {
      if (!address) return
      const item = itemAddressValue<T>(expression, functions, address)
      if (!item) return
      if (arg instanceof Function) arg = arg(item)
      const newItem = { ...item, ...arg }
      if (address.type === 'function') {
        setFunction(address.layer, newItem)
      } else if (address.type === 'argument') {
        setFunction(address.layer, (func) => {
          func.args.splice(address.index, 1, newItem as CustomFunctionArgument)
          return func
        })
      } else if (address.type === 'unit') {
        if (address.layer < functions.length) {
          setFunction(address.layer, (func) => {
            func.expression.splice(address.index, 1, newItem as ExpressionUnit)
            return func
          })
        } else {
          expression.splice(address.index, 1, newItem as ExpressionUnit)
          setExpression(expression)
        }
      } else {
        return assertNever(address)
      }
    },
    [expression, functions, setExpression, setFunction]
  )

  const addExpressionItem = useCallback(
    <T extends AddressItemTypesMap>(address: T[0], item: T[1]) => {
      const layer = clamp(address.layer, 0, functions.length)
      if (address.type === 'function') {
        functions.splice(layer, 0, item as CustomFunction)
        setFunctions(functions)
      } else if (address.type === 'argument') {
        setFunction(layer, (func) => {
          const index = clamp(address.index, 0, func.args.length)
          func.args.splice(index, 0, item as CustomFunctionArgument)
          return func
        })
      } else if (address.type === 'unit') {
        const e = functions[layer]?.expression ?? expression
        const index = clamp(address.index, 0, e.length)
        if (layer < functions.length) {
          setFunction(layer, (func) => {
            func.expression.splice(index, 0, item as ExpressionUnit)
            return func
          })
        } else {
          expression.splice(index, 0, item as ExpressionUnit)
          setExpression(expression)
        }
      } else {
        return assertNever(address)
      }
    },
    [expression, functions, setExpression, setFunction, setFunctions]
  )

  const removeExpressionItem = useCallback(
    (address: ItemAddress) => {
      if (!address) return
      if (address.type === 'function') {
        functions.splice(address.layer, 1)
        setFunctions(functions)
      } else if (address.type === 'argument') {
        setFunction(address.layer, (func) => {
          func.args.splice(address.index, 1)
          return func
        })
      } else if (address.type === 'unit') {
        if (address.layer < functions.length) {
          setFunction(address.layer, (func) => {
            func.expression.splice(address.index, 1)
            return func
          })
        } else {
          expression.splice(address.index, 1)
          setExpression(expression)
        }
      } else {
        return assertNever(address)
      }
    },
    [expression, functions, setExpression, setFunction, setFunctions]
  )

  // TODO: Drag and drop
  const moveExpressionItem = useCallback(
    <T extends ItemAddress>(from: T, to: T) => {
      if (!from || !to) return
      if (isEqual(from, to)) return
      const item = itemAddressValue(expression, functions, from)
      if (!item) return
      removeExpressionItem(from)
      addExpressionItem(to, item)
    },
    [addExpressionItem, expression, functions, removeExpressionItem]
  )

  /** Set undefined if the same item is clicked again */
  const re_setSIA = useCallback(
    (address: ItemAddress | ((address: ItemAddress) => ItemAddress)) => {
      setSIA((prev) => {
        if (address instanceof Function) address = address(prev)
        if (!address) return undefined
        if (prev && isEqual(prev, address)) return undefined
        return address
      })
    },
    [setSIA]
  )

  const expressionDisplays = useMemo(
    () =>
      range(0, functions.length).map((layer) => (
        <ExpressionDisplay
          key={layer}
          expression={expression}
          functions={functions}
          layer={layer}
          sia={sia}
          setSIA={re_setSIA}
          sirpa={sirpa}
          onFocused={onFocused}
        />
      )),
    [expression, functions, onFocused, re_setSIA, sia, sirpa]
  )

  const itemConfigPanel = useMemo(() => {
    if (!sia) return null
    const item = itemAddressValue(expression, functions, sia)
    if (!item) return null
    return (
      <ItemConfigPanel
        item={item}
        setItem={setExpressionItem}
        removeItem={removeExpressionItem}
        moveItem={moveExpressionItem}
        addItem={addExpressionItem}
        sia={sia}
        sirpa={sirpa}
        functions={functions}
        expression={expression}
        setSIA={setSIA}
        focusToSIA={focusToSIA}
      />
    )
  }, [
    addExpressionItem,
    expression,
    focusToSIA,
    functions,
    moveExpressionItem,
    removeExpressionItem,
    setExpressionItem,
    setSIA,
    sia,
    sirpa,
  ])

  return (
    <>
      <AddItemsPanel
        functions={functions}
        sia={sia}
        setSIA={setSIA}
        addItem={addExpressionItem}
        noFunctions={!_setFunctions}
      />
      <Box display="flex" flexDirection="column" gap={1} pb={'60vh'}>
        {expressionDisplays}
      </Box>
      {itemConfigPanel}
    </>
  )
}
