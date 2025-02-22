import { assertUnreachable, objPathValue } from '@genshin-optimizer/common/util'
import { customMapFormula, forEachNodes, mapFormulas } from './internal'
import type {
  AnyNode,
  CommutativeMonoidOperation,
  ComputeNode,
  ConstantNode,
  Data,
  NumNode,
  Operation,
  ReadNode,
  StrNode,
  StrPrioNode,
  ThresholdNode,
} from './type'
import { constant } from './utils'

export type OptNode =
  | ComputeNode<OptNode, OptNode>
  | ThresholdNode<OptNode, OptNode, OptNode>
  | ReadNode<number>
  | ConstantNode<number>

const allCommutativeMonoidOperations: Record<
  CommutativeMonoidOperation,
  (_: number[]) => number
> = {
  min: (x: number[]): number => Math.min(...x),
  max: (x: number[]): number => Math.max(...x),
  add: (x: number[]): number => x.reduce((a, b) => a + b, 0),
  mul: (x: number[]): number => x.reduce((a, b) => a * b, 1),
}
export const allOperations: Record<
  Operation | 'threshold',
  (_: number[]) => number
> = {
  ...allCommutativeMonoidOperations,
  res: ([res]: number[]): number => {
    if (res < 0) return 1 - res / 2
    else if (res >= 0.75) return 1 / (res * 4 + 1)
    return 1 - res
  },
  sum_frac: (x: number[]): number => x[0] / x.reduce((a, b) => a + b),
  threshold: ([value, threshold, pass, fail]: number[]): number =>
    value >= threshold ? pass : fail,
}

const commutativeMonoidOperationSet = new Set(
  Object.keys(allCommutativeMonoidOperations) as NumNode['operation'][]
)

export function optimize(
  formulas: NumNode[],
  topLevelData: Data,
  shouldFold = (_formula: ReadNode<number | string | undefined>) => false
): OptNode[] {
  let opts = constantFold(formulas, topLevelData, shouldFold)
  opts = flatten(opts)
  opts = constantFold(opts, {})
  return deduplicate(opts)
}

/**
 * Compile an array of `formulas` into a JS `Function`
 *
 * @param formulas
 * @param initial base stats for the formula
 * @param binding
 * @param slotCount the number of slots in the build (usually 5)
 * @returns
 */
export function precompute<C extends number>(
  formulas: OptNode[],
  initial: Record<string, number>, //DynStat,
  binding: (readNode: ReadNode<number>) => string,
  slotCount: C
): (
  _: readonly {
    readonly values: Readonly<Record<string, number> /*DynStat */>
  }[] & {
    length: C
  }
) => number[] {
  // res copied from the code above
  let body = `
"use strict";
function res(res) {
  if (res < 0) return 1 - res / 2
  else if (res >= 0.75) return 1 / (res * 4 + 1)
  return 1 - res
}
const x0=0` // making sure `const` has at least one entry

  let i = 1
  const names = new Map<NumNode | StrNode, string>()
  forEachNodes(
    formulas,
    (_) => {
      /* */
    },
    (f) => {
      const { operation, operands } = f,
        name = `x${i++}`,
        operandNames = operands.map((x: OptNode) => names.get(x)!)
      names.set(f, name)
      switch (operation) {
        case 'read': {
          const key = binding(f)
          let arr = slotCount
            ? new Array(slotCount)
                .fill(null)
                .map((_, i) => `(b[${i}].values["${key}"] ?? 0)`)
            : ['0']
          if (initial[key] && initial[key] !== 0) {
            arr = [initial[key].toString(), ...arr]
          }
          body += `,${name}=${arr.join('+')}\n`
          break
        }
        case 'const':
          names.set(f, `(${f.value})`)
          break
        case 'add':
        case 'mul':
          body += `,${name}=${operandNames.join(
            operation === 'add' ? '+' : '*'
          )}\n`
          break
        case 'min':
        case 'max':
          body += `,${name}=Math.${operation}(${operandNames})\n`
          break
        case 'threshold': {
          const [value, threshold, pass, fail] = operandNames
          body += `,${name}=(${value}>=${threshold})?${pass}:${fail}\n`
          break
        }
        case 'res':
          body += `,${name}=res(${operandNames[0]})\n`
          break
        case 'sum_frac':
          body += `,${name}=${operandNames[0]}/(${operandNames[0]}+${operandNames[1]})\n`
          break

        default:
          assertUnreachable(operation)
      }
    }
  )
  body += `;\nreturn [${formulas.map((f) => names.get(f)!)}]`
  return new (Function as any)(`b`, body)
}

function flatten(formulas: OptNode[]): OptNode[] {
  return mapFormulas(
    formulas,
    (f) => f,
    (_formula) => {
      let result = _formula
      if (commutativeMonoidOperationSet.has(_formula.operation as Operation)) {
        const formula = _formula as ComputeNode<OptNode>
        const { operation } = formula

        let flattened = false
        const operands = formula.operands.flatMap((dep) =>
          dep.operation === operation
            ? ((flattened = true), dep.operands)
            : [dep]
        )
        result = flattened ? { ...formula, operands } : formula
      }

      return result
    }
  )
}

function arrayCompare<T>(
  a: readonly T[],
  b: readonly T[],
  cmp: (a: T, b: T) => number
): number {
  if (a.length !== b.length) return a.length - b.length
  for (let i = 0; i < a.length; i++) {
    const cc = cmp(a[i], b[i])
    if (cc !== 0) return cc
  }
  return 0
}
/**
 * Converts `formulas` to a unique normal form via sorting. Commutative operations are
 * also sorted to enforce unique operand ordering. As a consequence, duplicated nodes
 * become easy to find, so we combine identical nodes into the same reference. The
 * sort follows the below fields sequentially:
 *  ```
 *    node height  - height of subtree; distance to furthest leaf.
 *    node type    - Ordering is [const, read, add, mul, min, max, sum_frac, threshold, res]
 *    When types are same:
 *      const:             n.value
 *      read:              alphabetical on path
 *      add/mul/min/max:   sort the operands, then compare sequentially
 *      frac/thresh/res:   compare operands sequentially
 *  ```
 *
 * Sorting is efficient because sorting by ascending height first lets us memoize the
 * ordering of all the children and find a bijection with the natual numbers.
 */
function deduplicate(formulas: OptNode[]): OptNode[] {
  const nodeHeightMap = new Map<OptNode, number>()
  const layers = [[]] as OptNode[][]
  forEachNodes(
    formulas,
    (_) => {},
    (n) => {
      switch (n.operation) {
        case 'const':
        case 'read':
          layers[0].push(n)
          nodeHeightMap.set(n, 0)
          break
        default: {
          const h =
            Math.max(...n.operands.map((op) => nodeHeightMap.get(op)!)) + 1
          if (layers.length <= h) layers.push([])
          layers[h].push(n)
          nodeHeightMap.set(n, h)
          break
        }
      }
    }
  )

  function cmpNode(n1: OptNode, n2: OptNode): number {
    const h1 = nodeHeightMap.get(n1)!,
      h2 = nodeHeightMap.get(n2)!
    if (h1 !== h2) return h1 - h2
    const op1 = n1.operation,
      op2 = n2.operation
    if (op1 !== op2) return op1.localeCompare(op2)

    switch (op1) {
      case 'const':
        if (op1 !== op2) throw Error('ily jslint')
        return n1.value - n2.value
      case 'read':
        if (op1 !== op2) throw Error('ily jslint')
        return arrayCompare(n1.path, n2.path, (s1, s2) => s1.localeCompare(s2))
      case 'res':
      case 'threshold':
      case 'sum_frac': {
        if (op1 !== op2) throw Error('ily jslint')
        const s1 = n1.operands.map((op) => nodeSortMap.get(op)!),
          s2 = n2.operands.map((op) => nodeSortMap.get(op)!)
        return arrayCompare(s1, s2, (n1, n2) => n1 - n2)
      }
      case 'add':
      case 'mul':
      case 'min':
      case 'max': {
        if (op1 !== op2) throw Error('ily jslint')
        const s1 = n1.operands.map((op) => nodeSortMap.get(op)!),
          s2 = n2.operands.map((op) => nodeSortMap.get(op)!)
        s1.sort((a, b) => a - b)
        s2.sort((a, b) => a - b)
        return arrayCompare(s1, s2, (n1, n2) => n1 - n2)
      }
    }
  }

  let ix = 0
  const nodeSortMap = new Map<OptNode, number>()
  const sortedNodes = [] as OptNode[]
  layers.forEach((layer) => {
    layer.sort(cmpNode)
    sortedNodes.push(layer[0])
    nodeSortMap.set(layer[0], ix++)
    for (let i = 1; i < layer.length; i++) {
      if (cmpNode(layer[i - 1], layer[i]) === 0)
        nodeSortMap.set(layer[i], nodeSortMap.get(layer[i - 1])!)
      else {
        sortedNodes.push(layer[i])
        nodeSortMap.set(layer[i], ix++)
      }
    }
  })

  sortedNodes.forEach((n, i) => {
    switch (n.operation) {
      case 'add':
      case 'mul':
      case 'min':
      case 'max':
        sortedNodes[i] = {
          ...n,
          operands: [...n.operands].sort(
            (a, b) => nodeSortMap.get(a)! - nodeSortMap.get(b)!
          ),
        }
    }
  })

  return mapFormulas(
    formulas,
    (f) => sortedNodes[nodeSortMap.get(f)!],
    (_) => _
  )
}

/**
 * Replace nodes with known values with appropriate constants,
 * and remove read nodes where `shouldFold(node)` is `true`
 */
export function constantFold(
  formulas: NumNode[],
  topLevelData: Data,
  shouldFold = (_formula: ReadNode<number | string | undefined>) => false
): OptNode[] {
  type Context = {
    data: Data[]
    processed: Map<NumNode | StrNode, OptNode | StrNode>
  }
  const origin: Context = { data: [], processed: new Map() }
  const nextContextMap = new Map([[origin, new Map<Data, Context>()]])

  const context = { data: [topLevelData], processed: new Map() }
  nextContextMap.set(context, new Map())
  nextContextMap.get(origin)!.set(topLevelData, context)
  return customMapFormula<typeof context, OptNode | StrNode, AnyNode>(
    formulas,
    context,
    (formula, context, map) => {
      const { operation } = formula,
        fold = (x: NumNode, c: typeof context) => map(x, c) as OptNode
      const foldStr = (x: StrNode, c: typeof context) => map(x, c) as StrNode
      let result: OptNode | StrNode
      switch (operation) {
        case 'const':
          result = formula
          break
        case 'add':
        case 'mul':
        case 'max':
        case 'min': {
          const f = allOperations[operation]
          const numericOperands: number[] = []
          const formulaOperands: OptNode[] = formula.operands
            .filter((formula) => {
              const folded = fold(formula, context)
              return folded.operation === 'const'
                ? (numericOperands.push(folded.value), false)
                : true
            })
            .map((x) => fold(x, context))
          const numericValue = f(numericOperands)

          // Fold degenerate cases. This may incorrectly compute NaN
          // results, which shouldn't appear under expected usage.
          // - zero
          //   - 0 * ... = 0
          // - infinity
          //   - max(infinity, ...) = infinity
          //   - infinity + ... = infinity
          // - (-infinity)
          //   - min(-infinity, ...) - infinity
          //   - (-infinity) + ... = -infinity
          // - NaN
          //   - operation(NaN, ...) = NaN
          if (!isFinite(numericValue)) {
            if (
              operation !== 'mul' &&
              (operation !== 'max' || numericValue > 0) &&
              (operation !== 'min' || numericValue < 0)
            ) {
              result = constant(numericValue)
              break
            }
          } else if (operation === 'mul' && numericValue === 0) {
            result = constant(numericValue)
            break
          }

          if (numericValue !== f([]))
            // Skip vacuous values
            formulaOperands.push(constant(numericValue))
          if (formulaOperands.length <= 1)
            result = formulaOperands[0] ?? constant(f([]))
          else result = { operation, operands: formulaOperands }
          break
        }
        case 'res':
        case 'sum_frac': {
          const operands = formula.operands.map((x) => fold(x, context))
          const f = allOperations[operation]
          if (operands.every((x) => x.operation === 'const'))
            result = constant(
              f(operands.map((x) => (x as ConstantNode<number>).value))
            )
          else result = { ...formula, operands }
          break
        }
        case 'lookup': {
          const index = foldStr(formula.operands[0], context)
          if (index.operation === 'const') {
            const selected = formula.table[index.value!] ?? formula.operands[1]
            if (selected) {
              result = map(selected, context)
              break
            }
            throw new Error(`Unsupported ${operation} node while folding`)
          }
          result = map(transpose(formula.operands[0], index, formula), context)
          break
        }
        case 'prio': {
          const first = formula.operands.find((op) => {
            const folded = foldStr(op, context)
            if (folded.operation !== 'const')
              throw new Error(`Unsupported ${operation} node while folding`)
            return folded.value !== undefined
          })
          result = first ? foldStr(first, context) : constant(undefined)
          break
        }
        case 'small': {
          let smallest = undefined as
            | ConstantNode<string | undefined>
            | undefined
          for (const operand of formula.operands) {
            const folded = foldStr(operand, context)
            if (folded.operation !== 'const') {
              smallest = map(
                transpose(operand, folded, formula),
                context
              ) as any // wrong type, but immediately assigned to `result` anyway
              break
            }
            if (
              smallest?.value === undefined ||
              (folded.value !== undefined && folded.value < smallest.value)
            )
              smallest = folded
          }
          result = smallest ?? constant(undefined)
          break
        }
        case 'match': {
          const [v1, v2, match, unmatch] = formula.operands.map(
            (x: NumNode | StrNode) => map(x, context)
          )
          if (v1.operation !== 'const')
            result = map(transpose(formula.operands[0], v1, formula), context)
          else if (v2.operation !== 'const')
            result = map(transpose(formula.operands[1], v2, formula), context)
          else result = v1.value === v2.value ? match : unmatch
          break
        }
        case 'threshold': {
          const [value, threshold, pass, fail] = formula.operands.map(
            (x) => map(x, context) as OptNode
          )
          if (
            pass.operation === 'const' &&
            fail.operation === 'const' &&
            pass.value === fail.value
          )
            result = pass
          else if (
            value.operation === 'const' &&
            threshold.operation === 'const'
          )
            result = value.value >= threshold.value ? pass : fail
          else result = { ...formula, operands: [value, threshold, pass, fail] }
          break
        }
        case 'subscript': {
          const index = fold(formula.operands[0], context)
          if (index.operation !== 'const')
            throw new Error('Found non-constant subscript node while folding')
          result = constant(formula.list[index.value])
          break
        }
        case 'read': {
          const operands = context.data
            .map((x) => objPathValue(x, formula.path) as NumNode | StrNode)
            .filter((x) => x)

          if (operands.length === 0) {
            if (shouldFold(formula)) {
              const { accu } = formula
              if (accu === undefined || accu === 'small')
                result =
                  formula.type === 'string'
                    ? constant(undefined)
                    : constant(NaN)
              else result = constant(allOperations[accu]([]))
            } else result = formula
          } else if (formula.accu === undefined || operands.length === 1)
            result = map(operands[operands.length - 1], context)
          else
            result = map(
              { operation: formula.accu, operands } as
                | ComputeNode
                | StrPrioNode,
              context
            )
          break
        }
        case 'data': {
          if (formula.reset) context = origin
          const nextMap = nextContextMap.get(context)!
          let nextContext = nextMap.get(formula.data)
          if (!nextContext) {
            nextContext = {
              data: [...context.data, formula.data],
              processed: new Map(),
            }
            nextContextMap.set(nextContext, new Map())
            nextMap.set(formula.data, nextContext)
          }
          result = map(formula.operands[0], nextContext)
          break
        }
        default:
          assertUnreachable(operation)
      }

      if (result.info) {
        result = { ...result }
        delete result.info
      }
      return result
    }
  ) as OptNode[]
}

/** "Move" branching `br`, which must be inside `parent` and folded to `fold`, to be the "container" of `parent` instead */
function transpose(br: AnyNode, fold: AnyNode, parent: AnyNode): AnyNode {
  if (
    process.env['NODE_ENV'] === 'development' &&
    !parent.operands.includes(br as any as never)
  )
    throw new Error('ill-formed transpose')
  function replace(newNode: AnyNode): AnyNode {
    return {
      ...parent,
      operands: parent.operands.map((n) => (n === br ? newNode : n)),
    } as AnyNode
  }

  if (fold.operation === 'threshold') {
    const [v0, v1, v2, v3] = fold.operands
    if (v2.operation === 'const' || v3.operation === 'const') {
      return {
        operation: 'threshold',
        operands: [v0, v1, replace(v2) as any, replace(v3) as any],
      }
    }
  }
  throw new Error(`Unsupported dynamic operand ${fold.operation}`)
}

export const testing = {
  constantFold,
  flatten,
  deduplicate,
}
