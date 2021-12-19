import { assign, resolve } from "../Util/KeyPathUtil"
import { assertUnreachable } from "../Util/Util"
import { constant, mapContextualFormulas, mapFormulas } from "./internal"
import { ComputeNode, ConstantNode, Data, FormulaData, Node, Operation } from "./type"

const allCommutativeMonoidOperations = {
  min: (x: number[]): number => Math.min(...x),
  max: (x: number[]): number => Math.max(...x),
  add: (x: number[]): number => x.reduce((a, b) => a + b, 0),
  mul: (x: number[]): number => x.reduce((a, b) => a * b, 1),
} as const
export const allOperations = {
  ...allCommutativeMonoidOperations,
  res: ([res]: number[]): number => {
    if (res < 0) return 1 - res / 2
    else if (res >= 0.75) return 1 / (res * 4 + 1)
    return 1 - res
  },
  sum_frac: ([x, c]: number[]): number => x / (x + c),
  threshold_add: ([value, threshold, addition]: number[]): number => value >= threshold ? addition : 0,
} as const

const commutativeMonoidOperationSet = new Set(Object.keys(allCommutativeMonoidOperations) as (Node["operation"])[])

export function optimize(formulas: Node[], isFixed = (_formula: Node, _orig: Node) => false): Node[] {
  formulas = applyRead(formulas)
  formulas = constantFold(formulas, isFixed)
  formulas = flatten(formulas, isFixed)
  formulas = deduplicate(formulas)
  return formulas
}

export function flatten(formulas: Node[], isFixed = (_formula: Node, _orig: Node) => false): Node[] {
  const fixedNodes = new Set<Node>()

  return mapFormulas(formulas, f => f, (_formula, orig) => {
    let result = _formula
    if (commutativeMonoidOperationSet.has(_formula.operation)) {
      const formula = _formula as ComputeNode
      const { operation } = formula

      let flattened = false
      const operands = formula.operands.flatMap(dep =>
        (dep.operation === operation && !fixedNodes.has(dep)) ? (flattened = true, dep.operands) : [dep])
      result = flattened ? { ...formula, operands } : formula
    }

    if (isFixed(result, orig)) fixedNodes.add(result)
    return result
  })
}
export function deduplicate(formulas: Node[]): Node[] {
  function elementCounts<T>(array: T[]): Map<T, number> {
    const result = new Map<T, number>()
    for (const value of array) result.set(value, (result.get(value) ?? 0) + 1)
    return result
  }
  function arrayFromCounts<T>(counts: Map<T, number>): T[] {
    return [...counts].flatMap(([dep, count]) => Array(count).fill(dep))
  }

  let common = {
    counts: new Map<Node, number>(),
    formulas: new Set<Node>(),
    operation: "add" as Operation
  }

  while (true) {
    let next: typeof common | undefined

    const factored: ComputeNode = { operation: common.operation, operands: arrayFromCounts(common.counts) }

    let candidatesByOperation = new Map<Operation, [ComputeNode, Map<Node, number>][]>()
    for (const operation of Object.keys(allCommutativeMonoidOperations))
      candidatesByOperation.set(operation, [])

    formulas = mapFormulas(formulas, _formula => {
      if (common.formulas.has(_formula)) {
        const formula = _formula as ComputeNode
        const remainingCounts = new Map(common.counts)
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
      if (!commutativeMonoidOperationSet.has(_formula.operation)) return _formula
      const formula = _formula as ComputeNode

      if (next) {
        if (next.operation === formula.operation) {
          const currentCounts = elementCounts(formula.operands), commonCounts = new Map<Node, number>()
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

          const commonCounts = new Map<Node, number>()
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

    if (next) common = next
    else break
  }

  return formulas
}

/**
 * - Replace `ReadNode` with `Node` associated with its key (if applicable)
 * - Remove all `DataNode`
 * - Combine all remaining `ReadNode` with the same key
 */
export function applyRead(formulas: Node[]): Node[] {
  const contextsFromId = new Map<number, Data[]>()
  const contextsById = new Map<Data[], number>()

  const readNodes: FormulaData = {}

  let currentMaxContextId = 1

  return mapContextualFormulas(formulas, (formula, contextId) => {
    switch (formula.operation) {
      case "data": {
        const { data: contexts, operands: [baseFormula] } = formula

        let nextContextId = contextsById.get(contexts)
        if (nextContextId) return [baseFormula, nextContextId]

        nextContextId = currentMaxContextId++
        contextsFromId.set(nextContextId, contexts)
        contextsById.set(contexts, nextContextId)

        return [baseFormula, nextContextId]
      }
      case "read": {
        const path = formula.key
        const contexts = contextsFromId.get(contextId)
        const operands = contexts?.flatMap(context => {
          const formula = resolve(context.formula, path)
          return formula ? [formula] : []
        })

        if (!operands || operands.length === 0) {
          const prev = resolve(readNodes, formula.key)
          if (prev) return [prev, contextId] // Combine read nodes with the same key
          assign(readNodes, formula.key, formula)
          break
        }
        if (formula.accumulation === "unique") {
          if (operands.length > 1)
            throw new Error("Duplicate entries in unique read")
          return [{ ...formula, ...operands[0] }, contextId]
        }

        return [{ ...formula, operation: formula.accumulation, operands }, contextId]
      }
    }
    return [formula, contextId]
  }, f => f)
}

/** Replace all known values with a constant */
export function constantFold(formulas: Node[], isFixed = (_formula: Node, _orig: Node) => false): Node[] {
  const fixedNodes = new Set<Node>()

  return mapFormulas(formulas, f => f, (formula, orig) => {
    const { operation, operands } = formula
    let result = formula

    switch (operation) {
      case "subscript": {
        const [baseFormula] = operands
        if (baseFormula.operation === "const" && !fixedNodes.has(baseFormula))
          result = constant(formula.list[baseFormula.value])
        break
      }
      case "stringSubscript": {
        const [baseFormula] = operands
        if (baseFormula.operation === "string" && !fixedNodes.has(baseFormula)) {
          result = formula.list[baseFormula.value]!
          if (!result)
            throw new Error(`Unknown string ${baseFormula.value} when folding \`StringSubscriptNode\``)
        }
        break
      }
      case "threshold_add":
        const [value, threshold, addition] = operands
        if (value.operation === "const" && threshold.operation === "const" &&
          !fixedNodes.has(value) && !fixedNodes.has(threshold))
          result = value.value >= threshold.value ? addition : constant(0)
        break
      case "min": case "max": case "add": case "mul":
        const f: (_: number[]) => number = allOperations[operation]
        const numericOperands: number[] = []
        const formulaOperands: Node[] = operands.filter(formula =>
          (formula.operation !== "const" || fixedNodes.has(formula))
            ? true
            : (numericOperands.push(formula.value), false))
        const numericValue = f(numericOperands)

        if (operation === "mul" && numericValue === 0) {
          // The only (practical) degenerate case is
          //
          //  -  0 * ... = 0
          //
          // There are also
          //
          //  - max( infinity, ... ) = infinity
          //  - min( -infinity, ... ) = -infinity
          //  - infinity + ... = infinity
          //  - infinity * ... = infinity
          //
          // However, they will not appear under expected usage.
          result = constant(0)
          break
        }

        if (numericValue !== f([])) // Skip vacuous numeric
          formulaOperands.push(constant(numericValue))
        if (formulaOperands.length <= 1) result = formulaOperands[0] ?? constant(f([]))
        else result = { operation: formula.operation, operands: formulaOperands }

        break
      case "const": case "string": case "read": break
      case "sum_frac": case "res": case "data":
        if (formula.operands.every(f => f.operation === "const" && !fixedNodes.has(f))) {
          const operands = (formula.operands as ConstantNode[]).map(({ value }) => value)
          result = constant(allOperations[operation](operands))
        }
        break
      default: assertUnreachable(operation) // Exhaustive switch
    }
    if (result !== formula) result = { ...formula, ...result }
    if (isFixed(result, orig)) fixedNodes.add(result)
    return result
  })
}
