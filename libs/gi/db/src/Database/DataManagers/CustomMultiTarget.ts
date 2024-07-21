import type { MultiOptHitModeKey } from '@genshin-optimizer/gi/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allInfusionAuraElementKeys,
  allMultiOptHitModeKeys,
} from '@genshin-optimizer/gi/consts'
import type {
  AddressItemTypesMap,
  ConstantUnit,
  CustomFunction,
  CustomFunctionArgument,
  CustomMultiTarget,
  CustomTarget,
  EnclosingHeadUnit,
  EnclosingPartUnit,
  ExpressionUnit,
  FunctionUnit,
  ItemAddress,
  ItemRelations,
  NullUnit,
  OperationUnit,
  TargetUnit,
} from '../../Interfaces/CustomMultiTarget'
import {
  OperationSpecs,
  isEnclosing,
  isNonEnclosing,
} from '../../Interfaces/CustomMultiTarget'
import type { InputPremodKey } from '../../legacy/keys'
import { allInputPremodKeys } from '../../legacy/keys'

export const MAX_NAME_LENGTH = 200
export const MAX_DESC_LENGTH = 2000
export function initCustomMultiTarget() {
  return {
    name: 'New Custom Target',
    targets: [],
  }
}
export function initCustomTarget(path: string[], multi = 1): CustomTarget {
  return {
    weight: multi,
    path,
    hitMode: 'avgHit',
    bonusStats: {},
    description: '',
  }
}

export function initExpressionUnit(
  args: Partial<ExpressionUnit> = {}
): ExpressionUnit {
  const { type } = args
  let result
  switch (type) {
    case 'constant':
      result = {
        ...args,
        type: 'constant',
        value: args.value ?? 1,
      } as ConstantUnit
      break
    case 'target':
      result = {
        ...args,
        type: 'target',
        target: args.target ?? initCustomTarget([]),
      } as TargetUnit
      break
    case 'operation':
      result = {
        ...args,
        type: 'operation',
        operation: args.operation ?? 'addition',
      } as OperationUnit
      break
    case 'function':
      result = {
        ...args,
        type: 'function',
        name: args.name ?? 'Unknown',
      } as FunctionUnit
      break
    case 'enclosing':
      switch (args.part) {
        case 'head':
          result = {
            ...args,
            type: 'enclosing',
            part: 'head',
            operation: args.operation ?? 'priority',
          } as EnclosingHeadUnit
          break
        case 'comma':
          result = {
            ...args,
            type: 'enclosing',
            part: 'comma',
          } as EnclosingPartUnit
          break
        case 'tail':
          result = {
            ...args,
            type: 'enclosing',
            part: 'tail',
          } as EnclosingPartUnit
          break
        default:
          result = {
            ...args,
            type: 'enclosing',
            part: 'head',
            operation: 'priority',
          } as EnclosingHeadUnit
          break
      }
      break
    case 'null':
      result = {
        ...args,
        type: 'null',
        kind: args.kind ?? 'operation',
      } as NullUnit
      break
    case undefined:
      result = { type: 'null', kind: 'operation' } as NullUnit
      break
    default:
      result = ((_: never) => {
        return { type: 'null', kind: 'operation' } as NullUnit
      })(type)
  }
  return result
}

export function initCustomFunction(
  args: Partial<CustomFunction> = {},
  functions?: CustomFunction[]
): CustomFunction {
  const n = functions?.length ?? 0
  const name = args.name ?? `ƒ${n + 1}`
  return {
    name,
    args: args.args ?? [],
    expression: args.expression ?? [],
    description: args.description,
  }
}

export function initCustomFunctionArgument(
  args: Partial<CustomFunctionArgument> = {},
  func?: CustomFunction
): CustomFunctionArgument {
  return {
    name: args.name ?? `arg${(func?.args.length ?? 0) + 1}`,
    description: args.description,
  }
}

function validateOptTarget(path: string[]): string[] {
  // TODO: validate path. This function will probably need to be async
  return path
}
function validateCustomTarget(ct: unknown): CustomTarget | undefined {
  if (typeof ct !== 'object') return undefined
  let {
    weight,
    path,
    hitMode,
    reaction,
    infusionAura,
    bonusStats,
    description,
  } = ct as CustomTarget

  if (typeof weight !== 'number' || weight <= 0) weight = 1

  if (!Array.isArray(path) || path[0] === 'custom') return undefined

  path = validateOptTarget(path)

  if (
    !hitMode ||
    typeof hitMode !== 'string' ||
    !allMultiOptHitModeKeys.includes(hitMode as MultiOptHitModeKey)
  )
    hitMode = 'avgHit'

  if (
    reaction &&
    !(allAmpReactionKeys as readonly string[]).includes(reaction) &&
    !(allAdditiveReactions as readonly string[]).includes(reaction)
  )
    reaction = undefined

  if (infusionAura && !allInfusionAuraElementKeys.includes(infusionAura))
    infusionAura = undefined

  if (!bonusStats) bonusStats = {}

  if (typeof description !== 'string') description = ''

  bonusStats = Object.fromEntries(
    Object.entries(bonusStats).filter(
      ([key, value]) =>
        allInputPremodKeys.includes(key as InputPremodKey) &&
        typeof value == 'number'
    )
  )

  return {
    weight,
    path,
    hitMode,
    reaction,
    infusionAura,
    bonusStats,
    description,
  }
}

function validateCustomFunction(
  cf: unknown,
  pcf: CustomFunction[]
): CustomFunction | undefined {
  // cf is the custom function to validate
  // pcf is the previous custom functions
  // name must be different from the previous custom functions names
  // args names must be different from the previous custom functions names
  // args names must be different from the name of the current custom function
  // args names must be different

  if (typeof cf !== 'object') return undefined
  const takenNames = pcf.map((cf) => cf.name)
  const { args, expression } = cf as CustomFunction
  let { name, description } = cf as CustomFunction
  if (typeof name !== 'string' || name === '') return undefined
  if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH)
  if (takenNames.includes(name)) return undefined
  takenNames.push(name)
  if (!Array.isArray(args)) return undefined
  const args_: CustomFunction['args'] = []
  for (const arg of args) {
    let { name, description } = arg
    if (typeof name !== 'string' || name === '') continue
    if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH)
    if (takenNames.includes(name)) continue
    takenNames.push(name)
    if (typeof description !== 'string' || description === '')
      description = undefined
    else if (description.length > MAX_DESC_LENGTH)
      description = description.slice(0, MAX_DESC_LENGTH)
    args_.push({ name, description })
  }
  const expression_ = validateCustomExpression(
    expression,
    pcf,
    args_.map((a) => a.name)
  )
  if (!expression_) return undefined
  if (typeof description !== 'string' || description === '')
    description = undefined
  else if (description.length > MAX_DESC_LENGTH)
    description = description.slice(0, MAX_DESC_LENGTH)
  return { name, args: args_, expression: expression_, description }
}

function validateExpressionUnit(
  eu: unknown,
  availableFuncNames: string[]
): ExpressionUnit | undefined {
  if (typeof eu !== 'object') return undefined
  const unit = eu as ExpressionUnit
  const { type } = unit
  let { description } = unit
  if (typeof type !== 'string') return undefined
  if (typeof description !== 'string') description = ''
  else if (description.length > MAX_DESC_LENGTH)
    description = description.slice(0, MAX_DESC_LENGTH)
  let result

  if (type === 'constant') {
    const { value } = unit
    if (typeof value !== 'number') return undefined
    result = { type, value }
  } else if (type === 'target') {
    const { target } = unit
    const target_ = validateCustomTarget(target)
    if (!target_) return undefined
    result = { type, target: target_ }
  } else if (type === 'operation') {
    const { operation } = unit
    if (!isNonEnclosing(operation)) return undefined
    result = { type, operation }
  } else if (type === 'function') {
    const { name } = unit
    if (typeof name !== 'string') return undefined
    if (!availableFuncNames.includes(name)) return undefined
    result = { type, name }
  } else if (type === 'enclosing') {
    const { part } = unit
    if (part === 'head') {
      const { operation } = unit
      if (!isEnclosing(operation)) return undefined
      result = { type, part, operation }
    } else if (part === 'comma' || part === 'tail') {
      result = { type, part }
    } else {
      return ((_: never) => undefined)(part)
    }
  } else if (type === 'null') {
    const { kind } = unit
    if (kind === 'operand' || kind === 'operation') result = { type, kind }
    else return ((_: never) => undefined)(kind)
  } else {
    return ((_: never) => undefined)(type)
  }
  return description === '' ? result : { ...result, description }
}

function validateCustomExpression(
  ce: unknown,
  cf: CustomFunction[] = [],
  args: string[] = []
): ExpressionUnit[] | undefined {
  // ce is custom expression to validate
  // cf is custom functions that are available
  // args are argument names that are available
  // Function assumes that all custom functions and arguments are already validated
  if (!Array.isArray(ce)) return undefined
  if (ce.length === 0)
    return [initExpressionUnit({ type: 'null', kind: 'operand' })]

  // If a function has no arguments, then it is a variable
  const functions: Record<string, { min: number; max: number }> = {}
  const variables: string[] = [...args]
  for (const cf_ of cf) {
    if (cf_.args.length)
      functions[cf_.name] = { min: cf_.args.length, max: cf_.args.length }
    else variables.push(cf_.name)
  }

  const ce_ = ce
    .map((eu) =>
      validateExpressionUnit(eu, [...variables, ...Object.keys(functions)])
    )
    .filter((eu): eu is NonNullable<ExpressionUnit> => eu !== undefined)

  // EnclosingUnit can be treated as an operand only from the outside
  const isOperand = (
    unit: ExpressionUnit,
    from: 'any' | 'left' | 'right' | 'all'
  ) => {
    if (['constant', 'target'].includes(unit.type)) return true
    if (unit.type === 'null') return unit.kind === 'operand'
    if (unit.type === 'function') {
      // If it is a variable, then it's operand from any direction
      if (variables.includes(unit.name)) return true
      // Otherwise it's a function, then it's like an enclosing head unit
      if (['any', 'left'].includes(from)) return true
      return false
    }
    if (unit.type === 'enclosing') {
      if (unit.part === 'comma') return false
      if (from === 'any') return true
      if (from === 'left') return unit.part === 'head'
      if (from === 'right') return unit.part === 'tail'
      if (from === 'all') return false
    }
    return false
  }

  const expression: ExpressionUnit[] = []
  const stack: {
    operation: string
    arity: { min: number; max: number }
    argsCount: number
  }[] = []
  let prevUnit = initExpressionUnit({ type: 'null', kind: 'operation' })
  let currentEnclosing: (typeof stack)[number] | undefined
  const updateCurrentEnclosing = () => {
    currentEnclosing = stack[stack.length - 1] as typeof currentEnclosing
    return currentEnclosing
  }

  for (let unit of ce_ as ExpressionUnit[]) {
    updateCurrentEnclosing()

    // Condition one
    // Ignore enclosing(tail) or enclosing(comma) units if stack is empty
    if (
      unit.type === 'enclosing' &&
      ['tail', 'comma'].includes(unit.part) &&
      !currentEnclosing
    ) {
      continue
    }
    // Replace enclosing(comma) unit with null(operation) unit if current enclosing argsCount >= max
    if (
      unit.type === 'enclosing' &&
      unit.part === 'comma' &&
      currentEnclosing &&
      currentEnclosing.argsCount >= currentEnclosing.arity.max
    ) {
      unit = initExpressionUnit({ ...unit, type: 'null', kind: 'operation' })
    }
    // Replace null(operation) unit with enclosing(comma) unit if current enclosing argsCount < min
    if (
      unit.type === 'null' &&
      unit.kind === 'operation' &&
      currentEnclosing &&
      currentEnclosing.argsCount < currentEnclosing.arity.min
    ) {
      unit = initExpressionUnit({ ...unit, type: 'enclosing', part: 'comma' })
    }

    // Condition two
    // Ignore any null units if they are adjacent to each other
    if (unit.type === 'null' && prevUnit.type === 'null') {
      expression.pop()
      prevUnit =
        expression[expression.length - 1] ??
        initExpressionUnit({ type: 'null', kind: 'operation' })
      continue
    }
    // Ignore null(operand) unit if the previous or next unit is an operand
    if (
      unit.type === 'null' &&
      unit.kind === 'operand' &&
      isOperand(prevUnit, 'right')
    ) {
      continue
    } else if (
      prevUnit.type === 'null' &&
      prevUnit.kind === 'operand' &&
      isOperand(unit, 'left')
    ) {
      expression.pop()
      prevUnit =
        expression[expression.length - 1] ??
        initExpressionUnit({ type: 'null', kind: 'operation' })
    }
    // Ignore null(operation) unit if the previous or next unit is an operation
    if (
      unit.type === 'null' &&
      unit.kind === 'operation' &&
      !isOperand(prevUnit, 'right')
    ) {
      continue
    } else if (
      prevUnit.type === 'null' &&
      prevUnit.kind === 'operation' &&
      !isOperand(unit, 'left')
    ) {
      expression.pop()
      prevUnit =
        expression[expression.length - 1] ??
        initExpressionUnit({ type: 'null', kind: 'operation' })
    }

    // Condition three
    // Add null(operand) unit between any two non-operand units, and nothing is also considered a non-operand unit
    if (!isOperand(prevUnit, 'right') && !isOperand(unit, 'left')) {
      expression.push(initExpressionUnit({ type: 'null', kind: 'operand' }))
    }

    // Condition four
    // Add null(operation), enclosing(comma) or enclosing(tail) unit between any two operand units
    if (isOperand(prevUnit, 'right') && isOperand(unit, 'left')) {
      while (true) {
        updateCurrentEnclosing()
        if (!currentEnclosing) {
          // Add null(operation) unit if the stack is empty
          expression.push(
            initExpressionUnit({ type: 'null', kind: 'operation' })
          )
        } else if (currentEnclosing.argsCount < currentEnclosing.arity.max) {
          // Add enclosing(comma) unit if the current enclosing argsCount < max
          expression.push(
            initExpressionUnit({ type: 'enclosing', part: 'comma' })
          )
          currentEnclosing.argsCount++
        } else {
          // Add enclosing(tail) unit if the current enclosing argsCount >= max
          expression.push(
            initExpressionUnit({ type: 'enclosing', part: 'tail' })
          )
          stack.pop()
          continue
        }
        break
      }
    }

    // Stack management block
    if (unit.type === 'function' && functions[unit.name]) {
      // argsCount is 1 because in any case we will add one operand even if it is not there (Condition three)
      stack.push({
        operation: unit.name,
        arity: functions[unit.name],
        argsCount: 1,
      })
    } else if (unit.type === 'enclosing') {
      if (unit.part === 'head') {
        stack.push({
          operation: unit.operation,
          arity: OperationSpecs[unit.operation].arity,
          argsCount: 1,
        })
      } else if (unit.part === 'comma') {
        if (currentEnclosing) currentEnclosing.argsCount++
      } else if (unit.part === 'tail') {
        // Condition five
        // At the end of the enclosing or expression
        // Add enclosing(comma) + null(operand) if the stack is not empty and the current enclosing argsCount < min
        while (
          currentEnclosing &&
          currentEnclosing.argsCount < currentEnclosing.arity.min
        ) {
          expression.push(
            initExpressionUnit({ type: 'enclosing', part: 'comma' }),
            initExpressionUnit({ type: 'null', kind: 'operand' })
          )
          currentEnclosing.argsCount++
        }
        stack.pop()
      }
    }

    expression.push(unit)
    prevUnit = unit
  }

  // Condition three
  // Add null(operand) unit if the last unit is not an operand
  if (!isOperand(prevUnit, 'right')) {
    expression.push(initExpressionUnit({ type: 'null', kind: 'operand' }))
  }

  while (stack.length) {
    const currentEnclosing = stack.pop()!
    // Condition five
    // At the end of the enclosing or expression
    // Add enclosing(comma) + null(operand) if the stack is not empty and the current enclosing argsCount < min
    while (currentEnclosing.argsCount < currentEnclosing.arity.min) {
      expression.push(
        initExpressionUnit({ type: 'enclosing', part: 'comma' }),
        initExpressionUnit({ type: 'null', kind: 'operand' })
      )
      currentEnclosing.argsCount++
    }
    // Condition six
    // At the end of the expression
    // Add enclosing(tail) units if stack is not empty
    expression.push(initExpressionUnit({ type: 'enclosing', part: 'tail' }))
  }

  return expression
}

export function validateCustomMultiTarget(
  cmt: unknown
): CustomMultiTarget | undefined {
  if (typeof cmt !== 'object') return undefined
  let { name, description, targets, functions, expression } =
    cmt as CustomMultiTarget
  if (typeof name !== 'string') name = 'New Custom Target'
  else if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH)
  if (typeof description !== 'string') description = undefined
  else if (description.length > MAX_DESC_LENGTH)
    description = description.slice(0, MAX_DESC_LENGTH)
  if (!Array.isArray(targets)) return undefined
  targets = targets
    .map((t) => validateCustomTarget(t))
    .filter((t): t is NonNullable<CustomTarget> => t !== undefined)
  if (functions !== undefined) {
    // Functions on the left in the list are assumed to be accessible to functions on the right in the list, but not vice versa.
    if (!Array.isArray(functions)) functions = []
    const functions_: CustomFunction[] = []
    for (const f of functions) {
      const f_ = validateCustomFunction(f, functions_)
      if (f_) functions_.push(f_)
    }
    functions = functions_
  }
  if (expression !== undefined) {
    expression = validateCustomExpression(expression, functions)
    if (!expression) return undefined
  }
  return { name, description, targets, functions, expression }
}

export function targetListToExpression(
  cmt: CustomMultiTarget
): CustomMultiTarget {
  const expression: ExpressionUnit[] = []
  cmt.targets.forEach((t, i) => {
    if (i > 0) {
      expression.push(
        initExpressionUnit({ type: 'operation', operation: 'addition' })
      )
    }
    expression.push(initExpressionUnit({ type: 'constant', value: t.weight }))
    expression.push(
      initExpressionUnit({ type: 'operation', operation: 'multiplication' })
    )
    expression.push(
      initExpressionUnit({
        type: 'target',
        target: t,
      })
    )
    t.weight = 1
  })
  if (!expression.length)
    expression.push(initExpressionUnit({ type: 'null', kind: 'operand' }))
  return {
    ...cmt,
    targets: [],
    expression,
  }
}

export function itemAddressValue<
  T extends AddressItemTypesMap | [undefined, undefined]
>(
  expression: ExpressionUnit[],
  functions: CustomFunction[],
  address: T[0]
): T[1] {
  if (!address) return undefined
  const { type, layer, index } = address
  if (type === 'unit') {
    const expression_ =
      layer < functions.length ? functions[layer].expression : expression
    return expression_[index]
  } else if (type === 'function') {
    return functions[layer]
  } else if (type === 'argument') {
    return functions[layer].args[index]
  }
  return undefined
}

export function itemPartFinder(
  expression: ExpressionUnit[],
  functions: CustomFunction[],
  address: ItemAddress | undefined
): ItemRelations {
  const result: ItemRelations = {
    this: undefined,
    related: [],
    dependent: [],
    independent: [],
    all: [],
  }
  if (!address) return result
  const { type, layer, index } = address
  const item = itemAddressValue(expression, functions, address)
  if (!item) return result
  result.this = address
  if (type === 'unit') {
    const unit = item as ExpressionUnit
    const e =
      layer < functions.length ? functions[layer].expression : expression
    for (const i of unitPartFinder(index, e, functions.slice(0, layer))) {
      if (i === index) continue
      result.related.push({ type: 'unit', layer, index: i })
    }
    if (unit.type === 'function') {
      for (const [i, f] of functions.entries()) {
        if (unit.name === f.name) {
          result.independent.push({ type: 'function', layer: i })
          break
        }
      }
      // If the function is not found, maybe it's an argument
      if (result.independent.length === 0) {
        const args = functions[layer]?.args ?? []
        for (const [i, a] of args.entries()) {
          if (unit.name === a.name) {
            result.independent.push({ type: 'argument', layer, index: i })
            break
          }
        }
      }
    }
  } else if (type === 'function') {
    const f = item as CustomFunction
    if (!functions.slice(0, layer).some((f_) => f_.name === f.name)) {
      const matrix = [...functions.map((f) => f.expression), expression]
      for (const [layer_i1, e] of matrix.entries()) {
        if (layer_i1 <= layer) continue
        for (const [index_i2, u] of e.entries()) {
          if (u.type === 'function' && u.name === f.name) {
            for (const i of unitPartFinder(
              index_i2,
              e,
              functions.slice(0, layer_i1)
            )) {
              result.dependent.push({ type: 'unit', layer: layer_i1, index: i })
            }
          }
        }
      }
    }
  } else if (type === 'argument') {
    const a = item as CustomFunctionArgument
    if (
      !functions[layer].args.slice(0, index).some((a_) => a_.name === a.name)
    ) {
      const e = functions[layer].expression
      for (const [i, u] of e.entries()) {
        if (u.type === 'function' && u.name === a.name) {
          result.dependent.push({ type: 'unit', layer, index: i })
        }
      }
    }
  }
  result.all = [...result.related, ...result.dependent, ...result.independent]
  return result
}

export function availableFunctionUnitNames(
  functions: CustomFunction[],
  layer: number
): string[] {
  const result: string[] = []
  for (const f of functions.slice(0, layer)) {
    if (result.includes(f.name)) continue
    result.push(f.name)
  }
  for (const a of functions[layer]?.args ?? []) {
    if (result.includes(a.name)) continue
    result.push(a.name)
  }
  return result
}

export function unitPartFinder(
  index: number,
  expression: ExpressionUnit[],
  functions: CustomFunction[]
): number[] {
  const funcNames = functions.filter((f) => f.args.length).map((f) => f.name)
  const unit = expression[index]
  const parts = [index]
  if (!unit || (unit.type !== 'enclosing' && unit.type !== 'function'))
    return parts
  if (unit.type === 'function' && !funcNames.includes(unit.name)) return parts
  const _part = unit.type === 'enclosing' ? unit.part : 'head'
  const directions: ('left' | 'right')[] = []
  if (['head', 'comma'].includes(_part)) {
    directions.push('right')
  }
  if (['comma', 'tail'].includes(_part)) {
    directions.push('left')
  }
  directions.forEach((direction) => {
    const dl = direction === 'left'
    let stack = 0
    for (
      let i = index + (dl ? -1 : 1);
      i >= 0 && i < expression.length;
      dl ? i-- : i++
    ) {
      const _unit = expression[i]
      if (_unit.type !== 'enclosing' && _unit.type !== 'function') continue
      if (_unit.type === 'function' && !funcNames.includes(_unit.name)) continue
      const __part = _unit.type === 'enclosing' ? _unit.part : 'head'
      if (__part === 'head') {
        if (stack === 0 && dl) {
          parts.push(i)
          break
        }
        stack++
      } else if (__part === 'comma') {
        stack === 0 && parts.push(i)
      } else if (__part === 'tail') {
        if (stack === 0 && !dl) {
          parts.push(i)
          break
        }
        stack--
      }
    }
  })
  if (_part !== 'head') parts.sort((a, b) => a - b)
  return parts
}
