import { arrayMove, range } from '@genshin-optimizer/common/util'
import type {
  ArgumentAddress,
  CustomFunction,
  CustomFunctionArgument,
  CustomMultiTarget,
  ExpressionUnit,
  FunctionAddress,
  ItemAddress,
  UnitAddress,
} from '@genshin-optimizer/gi/db'
import { itemAddressValue, itemPartFinder } from '@genshin-optimizer/gi/db'
import { Box } from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo, useState } from 'react'
import ExpressionDisplay from './ExpressionDisplay'

function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Selected item address */
function useSIA(address?: ItemAddress) {
  const [sia, _setSIA] = useState<ItemAddress | undefined>(address)
  const oldSIA = useMemo(() => (sia ? { ...sia } : undefined), [sia])

  const setSIA: Dispatch<SetStateAction<ItemAddress | undefined>> = useCallback(
    (
      arg:
        | ItemAddress
        | undefined
        | ((address: ItemAddress | undefined) => ItemAddress | undefined)
    ) => {
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
  customMultiTarget: CMT,
  setCustomMultiTarget: setCMT,
}: {
  customMultiTarget: CustomMultiTarget
  setCustomMultiTarget: Dispatch<SetStateAction<CustomMultiTarget>>
}) {
  const functions = useMemo(() => [...(CMT.functions ?? [])], [CMT])
  const expression = useMemo(() => [...(CMT.expression ?? [])], [CMT])

  const [sia, setSIA] = useSIA()

  /** Selected item related parts addresses */
  const sirpa = useMemo(
    () => itemPartFinder(expression, functions, sia),
    [sia, expression, functions]
  )
  const selectedItem = useMemo(
    () => ({ ...itemAddressValue(expression, functions, sia) }),
    [sia, expression, functions]
  )

  const addFunction = useCallback(
    (func: CustomFunction) => {
      const layer = sia ? sia.layer + 1 : 0
      functions.splice(layer, 0, func)
      setCMT({ ...CMT, functions })
      setSIA({ type: 'function', layer })
    },
    [CMT, functions, setCMT, setSIA, sia]
  )

  const moveFunction = useCallback(
    (direction: 'up' | 'down') => {
      if (!sia) return
      const newLayer = sia.layer + (direction === 'up' ? -1 : +1)
      if (newLayer < 0 || newLayer >= functions.length) return
      setCMT({ ...CMT, functions: arrayMove(functions, sia.layer, newLayer) })
      setSIA({ ...sia, layer: newLayer })
    },
    [CMT, functions, setCMT, setSIA, sia]
  )

  const removeFunction = useCallback(() => {
    if (!sia) return
    functions.splice(sia.layer, 1)
    setCMT({ ...CMT, functions })
    setSIA(undefined)
  }, [CMT, functions, setCMT, setSIA, sia])

  const setFunction = useCallback(
    (
      address: FunctionAddress,
      arg: Partial<CustomFunction> | ((func: CustomFunction) => CustomFunction)
    ) => {
      const func = functions[address.layer]
      if (!func) return
      if (arg instanceof Function) arg = arg(func)
      functions.splice(address.layer, 1, { ...func, ...arg })
      setCMT({ ...CMT, functions })
    },
    [CMT, functions, setCMT]
  )

  const addArgument = useCallback(
    (arg: CustomFunctionArgument) => {
      if (!sia) return
      setFunction({ type: 'function', layer: sia.layer }, (func) => {
        const index = sia.type === 'function' ? func.args.length : sia.index + 1
        func.args.splice(index, 0, arg)
        setSIA({ ...sia, type: 'argument', index })
        return func
      })
    },
    [setFunction, setSIA, sia]
  )

  const moveArgument = useCallback(
    (direction: 'left' | 'right') => {
      if (!sia || sia.type !== 'argument') return
      const newI = sia.index + (direction === 'left' ? -1 : 1)
      if (newI < 0 || newI >= functions[sia.layer].args.length) return
      setFunction({ type: 'function', layer: sia.layer }, (func) => {
        func.args = arrayMove(func.args, sia.index, newI)
        setSIA({ ...sia, index: newI })
        return func
      })
    },
    [functions, setFunction, setSIA, sia]
  )

  const removeArgument = useCallback(() => {
    if (!sia || sia.type !== 'argument') return
    setFunction({ type: 'function', layer: sia.layer }, (func) => {
      func.args.splice(sia.index, 1)
      return func
    })
  }, [setFunction, sia])

  const setArgument = useCallback(
    (
      address: ArgumentAddress,
      arg:
        | Partial<CustomFunctionArgument>
        | ((arg: CustomFunctionArgument) => CustomFunctionArgument)
    ) => {
      const _arg = functions[address.layer].args[address.index]
      if (!_arg) return
      setFunction({ type: 'function', layer: address.layer }, (func) => {
        if (arg instanceof Function) arg = arg(_arg)
        func.args.splice(address.index, 1, { ..._arg, ...arg })
        return func
      })
    },
    [functions, setFunction]
  )

  const addUnit = useCallback(
    (unit: ExpressionUnit) => {
      // If no item is selected, add to the beginning of the expression.
      const layer = sia ? sia.layer : functions.length
      const index = sia?.type === 'unit' ? sia.index + 1 : 0
      if (layer < functions.length) {
        setFunction({ type: 'function', layer }, (func) => {
          func.expression.splice(index, 0, unit)
          return func
        })
        setSIA({ type: 'unit', layer, index })
      } else {
        expression.splice(index, 0, unit)
        setCMT({ ...CMT, expression })
        setSIA({ type: 'unit', layer, index })
      }
    },
    [sia, functions.length, setFunction, setSIA, expression, setCMT, CMT]
  )

  const moveUnit = useCallback(
    (from: UnitAddress, to: UnitAddress) => {
      if (from.layer === to.layer && from.index === to.index) return
      if (!itemAddressValue(expression, functions, from)) return
      if (from.layer === to.layer) {
        if (from.layer < functions.length) {
          setFunction({ type: 'function', layer: from.layer }, (func) => {
            func.expression = arrayMove(func.expression, from.index, to.index)
            return func
          })
        } else {
          setCMT({
            ...CMT,
            expression: arrayMove(expression, from.index, to.index),
          })
        }
      } else {
        const fromExpression =
          from.layer < functions.length
            ? functions[from.layer].expression
            : expression
        const toExpression =
          to.layer < functions.length
            ? functions[to.layer].expression
            : expression
        if (!toExpression) return
        toExpression.splice(
          to.index,
          0,
          fromExpression.splice(from.index, 1)[0]
        )
        if (from.layer < functions.length)
          setFunction({ type: 'function', layer: from.layer }, (func) => ({
            ...func,
            expression: fromExpression,
          }))
        else setCMT({ ...CMT, expression: fromExpression })
        if (to.layer < functions.length)
          setFunction({ type: 'function', layer: to.layer }, (func) => ({
            ...func,
            expression: toExpression,
          }))
        else setCMT({ ...CMT, expression: toExpression })
      }
      setSIA({ type: 'unit', layer: to.layer, index: to.index })
    },
    [expression, functions, setSIA, setFunction, setCMT, CMT]
  )

  const removeUnit = useCallback(() => {
    if (!sia || sia.type !== 'unit') return
    if (sia.layer < functions.length) {
      setFunction({ type: 'function', layer: sia.layer }, (func) => {
        func.expression.splice(sia.index, 1)
        return func
      })
    } else {
      expression.splice(sia.index, 1)
      setCMT({ ...CMT, expression })
    }
  }, [CMT, expression, functions, setFunction, setCMT, sia])

  const setUnit = useCallback(
    (
      address: UnitAddress,
      arg: ExpressionUnit | ((unit: ExpressionUnit) => ExpressionUnit)
    ) => {
      const unit = itemAddressValue(expression, functions, address)
      if (!unit || !('type' in unit)) return
      if (arg instanceof Function) arg = arg(unit)
      if (address.layer < functions.length) {
        setFunction({ type: 'function', layer: address.layer }, (func) => {
          func.expression.splice(address.index, 1, { ...unit, ...arg })
          return func
        })
      } else {
        expression.splice(address.index, 1, { ...unit, ...arg })
        setCMT({ ...CMT, expression })
      }
    },
    [CMT, expression, functions, setFunction, setCMT]
  )

  /** Set undefined if the same item is clicked again */
  const re_setSIA = useCallback(
    (
      address:
        | ItemAddress
        | undefined
        | ((address: ItemAddress | undefined) => ItemAddress | undefined)
    ) => {
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
        />
      )),
    [expression, functions, re_setSIA, sia, sirpa]
  )

  // For testing
  if (functions.length === 0) {
    addFunction({
      name: 'test',
      args: [{ name: 'arg1' }, { name: 'arg2' }],
      expression: expression,
    })
    addFunction({
      name: 'test2',
      args: [],
      expression: expression,
    })
  }

  // return <Box display="flex" flexDirection="column" gap={1}>
  //   {expressionDisplays}
  // </Box>
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {expressionDisplays}
    </Box>
  )
}
