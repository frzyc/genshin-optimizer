import type { ArtifactBuildData } from "../PageCharacter/CharacterDisplay/Tabs/TabOptimize/common"
import { assertUnreachable, objPathValue } from "../Util/Util"
import { forEachNodes, mapFormulas } from "./internal"
import { CommutativeMonoidOperation, ComputeNode, ConstantNode, Data, NumNode, Operation, ReadNode, StrNode, StrPrioNode } from "./type"
import { constant } from "./utils"

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

export function optimize(formulas: NumNode[], topLevelData: Data, shouldFold = (_formula: ReadNode<number | string | undefined>) => false): NumNode[] {
  formulas = constantFold(formulas, topLevelData, shouldFold)
  formulas = flatten(formulas)
  formulas = deduplicate(formulas)
  return formulas
}
export function precompute(formulas: NumNode[], initial: ArtifactBuildData["values"], binding: (readNode: ReadNode<number> | ReadNode<string | undefined>) => string, slotCount: number): (_: ArtifactBuildData[]) => number[] {
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
    const { operation, operands } = f, name = `x${i++}`, operandNames = operands.map(x => names.get(x)!)
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

      case "match": case "lookup": case "subscript":
      case "prio": case "small":
      case "data": throw new Error(`Unsupported ${operation} node in precompute`)
      default: assertUnreachable(operation)
    }
  })
  body += `;\nreturn [${formulas.map(f => names.get(f)!)}]`
  return new (Function as any)(`b`, body)
}

function flatten(formulas: NumNode[]): NumNode[] {
  return mapFormulas(formulas, f => f, _formula => {
    let result = _formula
    if (commutativeMonoidOperationSet.has(_formula.operation as any)) {
      const formula = _formula as ComputeNode
      const { operation } = formula

      let flattened = false
      const operands = formula.operands.flatMap(dep =>
        (dep.operation === operation) ? (flattened = true, dep.operands) : [dep])
      result = flattened ? { ...formula, operands } : formula
    }

    return result
  })
}
function deduplicate(formulas: NumNode[]): NumNode[] {
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
      counts: new Map<NumNode, number>(),
      formulas: new Set<NumNode>(),
      operation: "add" as Operation
    }
  }

  while (true) {
    let next: typeof wrap.common | undefined

    const factored: ComputeNode = { operation: wrap.common.operation, operands: arrayFromCounts(wrap.common.counts) }

    let candidatesByOperation = new Map<Operation, [ComputeNode, Map<NumNode, number>][]>()
    for (const operation of Object.keys(allCommutativeMonoidOperations))
      candidatesByOperation.set(operation, [])

    formulas = mapFormulas(formulas, _formula => {
      if (wrap.common.formulas.has(_formula as NumNode)) {
        const formula = _formula as ComputeNode
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
      const formula = _formula as ComputeNode

      if (next) {
        if (next.operation === formula.operation) {
          const currentCounts = elementCounts(formula.operands), commonCounts = new Map<NumNode, number>()
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

          const commonCounts = new Map<NumNode, number>()
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
export function constantFold(formulas: NumNode[], topLevelData: Data, shouldFold = (_formula: ReadNode<number | string | undefined>) => false): NumNode[] {
  type Context = { data: Data[], processed: Map<NumNode | StrNode, NumNode | StrNode> }
  const origin: Context = { data: [], processed: new Map() }
  const nextContextMap = new Map([[origin, new Map<Data, Context>()]])

  function fold(formula: StrNode, context: Context): StrNode
  function fold(formula: NumNode, context: Context): NumNode
  function fold(formula: NumNode | StrNode, context: Context): NumNode | StrNode
  function fold(formula: NumNode | StrNode, context: Context): NumNode | StrNode {
    const old = context.processed.get(formula)
    if (old) return old

    const { operation } = formula
    let result: NumNode | StrNode
    switch (operation) {
      case "const": return formula
      case "add": case "mul": case "max": case "min":
        const f = allOperations[operation]
        const numericOperands: number[] = []
        const formulaOperands: NumNode[] = formula.operands.filter(formula => {
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
        const index = fold(formula.operands[0], context)
        if (index.operation === "const") {
          const selected = formula.table[index.value!] ?? formula.operands[1]
          if (selected) {
            result = fold(selected, context)
            break
          }
        }
        throw new Error(`Unsupported ${operation} node while folding`)
      }
      case "prio": {
        const first = formula.operands.find(op => {
          const folded = fold(op, context)
          if (folded.operation !== "const")
            throw new Error(`Unsupported ${operation} node while folding`)
          return folded.value !== undefined
        })
        result = first ? fold(first, context) : constant(undefined)
        break
      }
      case "small": {
        let smallest = undefined as ConstantNode<string | undefined> | undefined
        for (const operand of formula.operands) {
          const folded = fold(operand, context)
          if (folded.operation !== "const")
            throw new Error(`Unsupported ${operation} node while folding`)
          if (smallest?.value === undefined || (folded.value !== undefined && folded.value < smallest.value))
            smallest = folded
        }
        result = smallest ?? constant(undefined)
        break
      }
      case "match": {
        const [v1, v2, match, unmatch] = formula.operands.map((x: NumNode | StrNode) => fold(x, context))
        if (v1.operation !== "const" || v2.operation !== "const")
          throw new Error(`Unsupported ${operation} node while folding`)
        result = (v1.value === v2.value) ? match : unmatch
        break
      }
      case "threshold": {
        const [value, threshold, pass, fail] = formula.operands.map(x => fold(x, context))
        if (value.operation === "const" && threshold.operation === "const")
          result = value.value >= threshold.value ? pass : fail
        else
          result = { ...formula, operands: [value, threshold, pass, fail] }
        break
      }
      case "subscript": {
        const [index] = formula.operands.map(x => fold(x, context))
        result = (index.operation === "const")
          ? constant(formula.list[index.value])
          : { ...formula, operands: [index] }
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
          result = fold(operands[operands.length - 1], context)
        else
          result = fold({ operation: formula.accu, operands } as ComputeNode | StrPrioNode, context)
        break
      }
      case "data":
        if (formula.reset) context = origin
        const map = nextContextMap.get(context)!
        let nextContext = map.get(formula.data)
        if (!nextContext) {
          nextContext = { data: [...context.data, formula.data], processed: new Map() }
          nextContextMap.set(nextContext, new Map())
          map.set(formula.data, nextContext)
        }
        result = fold(formula.operands[0], nextContext)
        break
      default: assertUnreachable(operation)
    }

    context.processed.set(formula, result)
    return result
  }

  const context = { data: [topLevelData], processed: new Map() }
  nextContextMap.set(context, new Map())
  nextContextMap.get(origin)!.set(topLevelData, context)
  return formulas.map(x => fold(x, context))
}

export const testing = {
  constantFold, flatten, deduplicate
}
