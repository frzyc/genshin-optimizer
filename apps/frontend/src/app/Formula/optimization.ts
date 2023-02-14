import type { ArtifactBuildData } from "../Solver/common"
import { assertUnreachable, objPathValue } from "../Util/Util"
import { customMapFormula, forEachNodes, mapFormulas } from "./internal"
import { AnyNode, CommutativeMonoidOperation, ComputeNode, ConstantNode, Data, NumNode, Operation, ReadNode, StrNode, StrPrioNode, ThresholdNode } from "./type"
import { constant } from "./utils"

export type OptNode = ComputeNode<OptNode, OptNode> | ThresholdNode<OptNode, OptNode, OptNode> |
  ReadNode<number> | ConstantNode<number>

const allCommutativeMonoidOperations: StrictDict<CommutativeMonoidOperation, (_: number[]) => number> = {
  min: (x: number[]): number => Math.min(...x),
  max: (x: number[]): number => Math.max(...x),
  add: (x: number[]): number => x.reduce((a, b) => a + b, 0),
  mul: (x: number[]): number => x.reduce((a, b) => a * b, 1),
}
export const allOperations: StrictDict<Operation | "threshold", (_: number[]) => number> = {
  ...allCommutativeMonoidOperations,
  res: ([res]: number[]): number => {
    if (res < 0) return 1 - res / 2
    else if (res >= 0.75) return 1 / (res * 4 + 1)
    return 1 - res
  },
  sum_frac: (x: number[]): number => x[0] / x.reduce((a, b) => a + b),
  threshold: ([value, threshold, pass, fail]: number[]): number => value >= threshold ? pass : fail,
}

const commutativeMonoidOperationSet = new Set(Object.keys(allCommutativeMonoidOperations) as (NumNode["operation"])[])

export function optimize(formulas: NumNode[], topLevelData: Data, shouldFold = (_formula: ReadNode<number | string | undefined>) => false): OptNode[] {
  let opts = constantFold(formulas, topLevelData, shouldFold)
  opts = flatten(opts)
  return deduplicate(opts)
}
export function precompute(formulas: OptNode[], initial: ArtifactBuildData["values"], binding: (readNode: ReadNode<number> | ReadNode<string | undefined>) => string, slotCount: number): (_: ArtifactBuildData[]) => number[] {
  let body = `
"use strict";
// copied from the code above
function res(res) {
  if (res < 0) return 1 - res / 2
  else if (res >= 0.75) return 1 / (res * 4 + 1)
  return 1 - res
}
const x0=0`; // making sure `const` has at least one entry

  let i = 1;
  const names = new Map<NumNode | StrNode, string>()
  forEachNodes(formulas, _ => { }, f => {
    const { operation, operands } = f, name = `x${i++}`, operandNames = operands.map((x: OptNode) => names.get(x)!)
    names.set(f, name)
    switch (operation) {
      case "read": {
        const key = binding(f)
        let arr = new Array(slotCount).fill(null).map((x, i) => `(b[${i}].values["${key}"] ?? 0)`)
        if (initial[key] && initial[key] !== 0) {
          arr = [initial[key].toString(), ...arr]
        }
        body += `,${name}=${arr.join('+')}`
        break
      }
      case "const": names.set(f, `(${f.value})`); break
      case "add": case "mul": body += `,${name}=${operandNames.join(operation === "add" ? "+" : "*")}`; break
      case "min": case "max": body += `,${name}=Math.${operation}(${operandNames})`; break
      case "threshold": {
        const [value, threshold, pass, fail] = operandNames
        body += `,${name}=(${value}>=${threshold})?${pass}:${fail}`
        break
      }
      case "res": body += `,${name}=res(${operandNames[0]})`; break
      case "sum_frac": body += `,${name}=${operandNames[0]}/(${operandNames[0]}+${operandNames[1]})`; break

      default: assertUnreachable(operation)
    }
  })
  body += `;\nreturn [${formulas.map(f => names.get(f)!)}]`
  return new (Function as any)(`b`, body)
}

function flatten(formulas: OptNode[]): OptNode[] {
  return mapFormulas(formulas, f => f, _formula => {
    let result = _formula
    if (commutativeMonoidOperationSet.has(_formula.operation as Operation)) {
      const formula = _formula as ComputeNode<OptNode>
      const { operation } = formula

      let flattened = false
      const operands = formula.operands.flatMap(dep =>
        (dep.operation === operation) ? (flattened = true, dep.operands) : [dep])
      result = flattened ? { ...formula, operands } : formula
    }

    return result
  })
}
function deduplicate(formulas: OptNode[]): OptNode[] {
  function elementCounts<T>(array: readonly T[]): Map<T, number> {
    const result = new Map<T, number>()
    for (const value of array) result.set(value, (result.get(value) ?? 0) + 1)
    return result
  }
  function arrayFromCounts<T>(counts: Map<T, number>): T[] {
    return [...counts].flatMap(([dep, count]) => Array(count).fill(dep))
  }

  const wrap = {
    common: {
      counts: new Map<OptNode, number>(),
      formulas: new Set<OptNode>(),
      operation: "add" as Operation
    }
  }

  while (true) {
    let next: typeof wrap.common | undefined

    const factored: ComputeNode<OptNode> = { operation: wrap.common.operation, operands: arrayFromCounts(wrap.common.counts) }

    const candidatesByOperation = new Map<Operation, [ComputeNode<OptNode>, Map<OptNode, number>][]>()
    for (const operation of Object.keys(allCommutativeMonoidOperations))
      candidatesByOperation.set(operation, [])

    formulas = mapFormulas(formulas, _formula => {
      if (wrap.common.formulas.has(_formula)) {
        const formula = _formula as ComputeNode<OptNode>
        const remainingCounts = new Map(wrap.common.counts)
        const operands = formula.operands.filter(dep => {
          const count = remainingCounts.get(dep)
          if (count) {
            remainingCounts.set(dep, count - 1)
            return false
          }
          return true
        })

        if (!operands.length)
          return factored
        operands.push(factored)
        return { ...formula, operands }
      }
      return _formula
    }, _formula => {
      if (!commutativeMonoidOperationSet.has(_formula.operation as any)) return _formula
      const formula = _formula as ComputeNode<OptNode>

      if (next) {
        if (next.operation === formula.operation) {
          const currentCounts = elementCounts(formula.operands), commonCounts = new Map<OptNode, number>()
          const nextCounts = next.counts
          let total = 0

          for (const [dependency, currentCount] of currentCounts.entries()) {
            const commonCount = Math.min(currentCount, nextCounts.get(dependency) ?? 0)
            if (commonCount) {
              commonCounts.set(dependency, commonCount)
              total += commonCount
            } else commonCounts.delete(dependency)
          }
          if (total > 1) {
            next.counts = commonCounts
            next.formulas.add(formula)
          }
        }
      } else {
        const candidates = candidatesByOperation.get(formula.operation)!
        const counts = elementCounts(formula.operands)

        for (const [candidate, candidateCounts] of candidates) {
          let total = 0

          const commonCounts = new Map<OptNode, number>()
          for (const [dependency, candidateCount] of candidateCounts.entries()) {
            const count = Math.min(candidateCount, counts.get(dependency) ?? 0)
            if (count) {
              commonCounts.set(dependency, count)
              total += count
            }
          }
          if (total > 1) {
            next = {
              counts: commonCounts,
              formulas: new Set([formula, candidate]),
              operation: formula.operation
            }
            candidatesByOperation.clear()
            break
          }
        }
        if (!next) candidates.push([formula, counts])
      }

      return formula
    })

    if (next) wrap.common = next
    else break
  }

  return formulas
}

/**
 * Replace nodes with known values with appropriate constants,
 * avoiding removal of any nodes that pass `isFixed` predicate
 */
export function constantFold(formulas: NumNode[], topLevelData: Data, shouldFold = (_formula: ReadNode<number | string | undefined>) => false): OptNode[] {
  type Context = { data: Data[], processed: Map<NumNode | StrNode, OptNode | StrNode> }
  const origin: Context = { data: [], processed: new Map() }
  const nextContextMap = new Map([[origin, new Map<Data, Context>()]])

  const context = { data: [topLevelData], processed: new Map() }
  nextContextMap.set(context, new Map())
  nextContextMap.get(origin)!.set(topLevelData, context)
  return customMapFormula<typeof context, OptNode | StrNode, AnyNode>(formulas, context, (formula, context, map) => {
    const { operation } = formula, fold = (x: NumNode, c: typeof context) => map(x, c) as OptNode
    const foldStr = (x: StrNode, c: typeof context) => map(x, c) as StrNode
    let result: OptNode | StrNode
    switch (operation) {
      case "const": result = formula; break
      case "add": case "mul": case "max": case "min":
        const f = allOperations[operation]
        const numericOperands: number[] = []
        const formulaOperands: OptNode[] = formula.operands.filter(formula => {
          const folded = fold(formula, context)
          return (folded.operation === "const")
            ? (numericOperands.push(folded.value), false)
            : true
        }).map(x => fold(x, context))
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
          if ((operation !== "mul") &&
            (operation !== "max" || numericValue > 0) &&
            (operation !== "min" || numericValue < 0)) {
            result = constant(numericValue)
            break
          }
        } else if (operation === "mul" && numericValue === 0) {
          result = constant(numericValue)
          break
        }

        if (numericValue !== f([])) // Skip vacuous values
          formulaOperands.push(constant(numericValue))
        if (formulaOperands.length <= 1) result = formulaOperands[0] ?? constant(f([]))
        else result = { operation, operands: formulaOperands }
        break
      case "res": case "sum_frac": {
        const operands = formula.operands.map(x => fold(x, context))
        const f = allOperations[operation]
        if (operands.every(x => x.operation === "const"))
          result = constant(f(operands.map(x => (x as ConstantNode<number>).value)))
        else result = { ...formula, operands }
        break
      }
      case "lookup": {
        const index = foldStr(formula.operands[0], context)
        if (index.operation === "const") {
          const selected = formula.table[index.value!] ?? formula.operands[1]
          if (selected) {
            result = map(selected, context)
            break
          }
        }
        throw new Error(`Unsupported ${operation} node while folding`)
      }
      case "prio": {
        const first = formula.operands.find(op => {
          const folded = foldStr(op, context)
          if (folded.operation !== "const")
            throw new Error(`Unsupported ${operation} node while folding`)
          return folded.value !== undefined
        })
        result = first ? foldStr(first, context) : constant(undefined)
        break
      }
      case "small": {
        let smallest = undefined as ConstantNode<string | undefined> | undefined
        for (const operand of formula.operands) {
          const folded = foldStr(operand, context)
          if (folded.operation !== "const")
            throw new Error(`Unsupported ${operation} node while folding`)
          if (smallest?.value === undefined || (folded.value !== undefined && folded.value < smallest.value))
            smallest = folded
        }
        result = smallest ?? constant(undefined)
        break
      }
      case "match": {
        const [v1, v2, match, unmatch] = formula.operands.map((x: NumNode | StrNode) => map(x, context))
        if (v1.operation !== "const" || v2.operation !== "const")
          throw new Error(`Unsupported ${operation} node while folding`)
        result = (v1.value === v2.value) ? match : unmatch
        break
      }
      case "threshold": {
        const [value, threshold, pass, fail] = formula.operands.map(x => map(x, context) as OptNode)
        if (pass.operation === "const" && fail.operation === "const" && pass.value === fail.value)
          result = pass
        else if (value.operation === "const" && threshold.operation === "const")
          result = value.value >= threshold.value ? pass : fail
        else
          result = { ...formula, operands: [value, threshold, pass, fail] }
        break
      }
      case "subscript": {
        const index = fold(formula.operands[0], context)
        if (index.operation !== "const")
          throw new Error("Found non-constant subscript node while folding")
        result = constant(formula.list[index.value])
        break
      }
      case "read": {
        const operands = context.data
          .map(x => objPathValue(x, formula.path) as (NumNode | StrNode))
          .filter(x => x)

        if (operands.length === 0) {
          if (shouldFold(formula)) {
            const { accu } = formula
            if (accu === undefined || accu === "small")
              result = formula.type === "string" ? constant(undefined) : constant(NaN)
            else result = constant(allOperations[accu]([]))
          } else result = formula
        } else if (formula.accu === undefined || operands.length === 1)
          result = map(operands[operands.length - 1], context)
        else
          result = map({ operation: formula.accu, operands } as ComputeNode | StrPrioNode, context)
        break
      }
      case "data": {
        if (formula.reset) context = origin
        const nextMap = nextContextMap.get(context)!
        let nextContext = nextMap.get(formula.data)
        if (!nextContext) {
          nextContext = { data: [...context.data, formula.data], processed: new Map() }
          nextContextMap.set(nextContext, new Map())
          nextMap.set(formula.data, nextContext)
        }
        result = map(formula.operands[0], nextContext)
        break
      }
      default: assertUnreachable(operation)
    }

    if (result.info) {
      result = { ...result }
      delete result.info
    }
    return result
  }) as OptNode[]
}

export const testing = {
  constantFold, flatten, deduplicate
}
