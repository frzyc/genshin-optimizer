import { resolve } from "../Util/KeyPathUtil"
import { assertUnreachable } from "../Util/Util"
import { forEachNodes, mapContextualFormulas, mapFormulas } from "./internal"
import { constant } from "./utils"
import { AnyNode, CommutativeMonoidOperation, ComputeNode, ConstantNode, Data, NumNode, Operation, ReadNode, StrNode } from "./type"

const allCommutativeMonoidOperations: StrictDict<CommutativeMonoidOperation, (_: number[]) => number> = {
  min: (x: number[]): number => Math.min(...x),
  max: (x: number[]): number => Math.max(...x),
  add: (x: number[]): number => x.reduce((a, b) => a + b, 0),
  mul: (x: number[]): number => x.reduce((a, b) => a * b, 1),
}
export const allOperations: StrictDict<Operation | "threshold_add", (_: number[]) => number> = {
  ...allCommutativeMonoidOperations,
  res: ([res]: number[]): number => {
    if (res < 0) return 1 - res / 2
    else if (res >= 0.75) return 1 / (res * 4 + 1)
    return 1 - res
  },
  sum_frac: (x: number[]): number => x[0] / x.reduce((a, b) => a + b),
  threshold_add: ([value, threshold, addition]: number[]): number => value >= threshold ? addition : 0,
}

const commutativeMonoidOperationSet = new Set(Object.keys(allCommutativeMonoidOperations) as (NumNode["operation"])[])

export function optimize(formulas: NumNode[], topLevelData: Data, shouldFold = (_formula: ReadNode<number | string | undefined>) => false): NumNode[] {
  formulas = constantFold(formulas, topLevelData, shouldFold)
  formulas = flatten(formulas)
  formulas = deduplicate(formulas)
  return formulas
}
export function precompute(formulas: NumNode[], binding: (readNode: ReadNode<number>) => string): (values: Dict<string, number>) => Float32Array {
  // TODO: Use min-cut to minimize the size of interim array
  type Reference = string | number | { ins: Reference[] }

  const uniqueReadStrings = new Set<string>()
  const uniqueNumbers = new Set<number>()
  const mapping = new Map<NumNode, Reference>()

  forEachNodes(formulas, _ => { }, f => {
    const { operation } = f
    switch (operation) {
      case "read":
        if (f.accu !== "add")
          throw new Error(`Unsupported ${operation} node in precompute`)
        const name = binding(f)
        uniqueReadStrings.add(name)
        mapping.set(f, name)
        break
      case "add": case "min": case "max": case "mul":
      case "threshold_add": case "res": case "sum_frac":
        mapping.set(f, { ins: f.operands.map(op => mapping.get(op)!) })
        break
      case "const":
        if (typeof f.value !== "number")
          throw new Error("Found string constant while precomputing")
        const value = f.value
        uniqueNumbers.add(value)
        mapping.set(f as ConstantNode<number>, value)
        break
      case "match": case "lookup": case "subscript":
      case "prio":
      case "data": throw new Error(`Unsupported ${operation} node in precompute`)
      default: assertUnreachable(operation)
    }
  })

  /**
   * [ Outputs , Input , Constants, Deduplicated Compute ]
   *
   * Note that only Compute nodes are deduplicated. Outputs are arranged
   * in the same order as formulas even when they are duplicated. Inputs
   * are arranged in the same order as the read strings, even when they
   * overlap with outputs. If an output is a constant or a compute node,
   * only put the data in the output region.
   */
  const locations = new Map<NumNode | number | string, number>()

  const readStrings = [...uniqueReadStrings], readOffset = formulas.length
  const constValues = [...uniqueNumbers]
  const computations: { out: number, ins: number[], op: (_: number[]) => number }[] = []

  formulas.forEach((f, i) => {
    locations.set(f, i)
    if (f.operation === "const") locations.set(f.value, i)
  })
  // After this line, if some outputs are also read node, `locations`
  // will point to the one in the read node portion instead.
  readStrings.forEach((str, i) => locations.set(str, i + formulas.length))
  let offset = formulas.length + readStrings.length
  constValues.forEach(value => locations.has(value) || locations.set(value, offset++))

  // `locations` is stable from this point on. We now only append new values.
  // There is no change to existing values.
  //
  // DO NOT read from `location` prior to this line.
  mapping.forEach((ref, node) => {
    if (typeof ref !== "object") {
      locations.set(node, locations.get(ref)!)
      return
    }
    if (!locations.has(node)) locations.set(node, offset++)
    computations.push({
      out: locations.get(node)!,
      ins: node.operands.map(op => locations.get(op)!),
      op: allOperations[node.operation]
    })
  })

  const buffer = new Float32Array(offset)
  buffer.forEach((_, i, array) => array[i] = NaN)
  uniqueNumbers.forEach(number => buffer[locations.get(number)!] = number)

  // Copy target for when some outputs are duplicated
  const copyList = formulas.map((node, i) => {
    const src = locations.get(node)!
    return src !== i ? [src, i] : undefined!
  }).filter(x => x)
  const copyFormula = copyList.length ? () => {
    copyList.forEach(([src, dst]) => buffer[dst] = buffer[src])
  } : undefined

  return values => {
    readStrings.forEach((id, i) => buffer[readOffset + i] = values[id] ?? 0)
    computations.forEach(({ out, ins, op }) => buffer[out] = op(ins.map(i => buffer[i])))
    copyFormula?.()
    return buffer
  }
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

  let common = {
    counts: new Map<NumNode, number>(),
    formulas: new Set<NumNode>(),
    operation: "add" as Operation
  }

  while (true) {
    let next: typeof common | undefined

    const factored: ComputeNode = { operation: common.operation, operands: arrayFromCounts(common.counts) }

    let candidatesByOperation = new Map<Operation, [ComputeNode, Map<NumNode, number>][]>()
    for (const operation of Object.keys(allCommutativeMonoidOperations))
      candidatesByOperation.set(operation, [])

    formulas = mapFormulas(formulas, _formula => {
      if (common.formulas.has(_formula as NumNode)) {
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

    if (next) common = next
    else break
  }

  return formulas
}

/**
 * Replace nodes with known values with appropriate constants,
 * avoiding removal of any nodes that pass `isFixed` predicate
 */
export function constantFold(formulas: NumNode[], topLevelData: Data, shouldFold = (_formula: ReadNode<number | string | undefined>) => false): NumNode[] {
  return applyRead(formulas, topLevelData, formula => {
    const { operation } = formula
    let result = formula

    switch (operation) {
      case "threshold_add":
        const [value, threshold, addition] = formula.operands
        if (value.operation === "const" && threshold.operation === "const")
          result = value.value >= threshold.value ? addition : constant(0)
        break
      case "min": case "max": case "add": case "mul":
        const f = allOperations[operation]
        const numericOperands: number[] = []
        const formulaOperands: NumNode[] = formula.operands.filter(formula =>
          (formula.operation !== "const")
            ? true
            : (numericOperands.push(formula.value), false))
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
        else result = { operation: formula.operation, operands: formulaOperands }
        break
      case "sum_frac": case "res":
        if (formula.operands.every(f => f.operation === "const")) {
          const operands = (formula.operands as ConstantNode<number>[]).map(({ value }) => value)
          result = constant(allOperations[operation](operands))
        }
        break
      case "read":
        if (shouldFold(formula)) {
          switch (formula.accu) {
            case "add": return constant(0)
            case "max": return constant(-Infinity)
            case "min": return constant(Infinity)
            case "mul": return constant(1)
            case undefined: return formula.type === "string" ? constant(undefined) : constant(NaN)
          }
        }
        break
      case "subscript":
        const [index] = formula.operands
        if (index.operation !== "const")
          throw new Error(`${operation} node must be known at optimization time`)
        result = constant(formula.list[index.value]) as NumNode | StrNode
        break
      case "match": {
        const [v1, v2, match, unmatch] = formula.operands
        if (v1.operation !== "const" || v2.operation !== "const")
          throw new Error(`${operation} node must be known at optimization time`)
        result = (v1.value === v2.value) ? match : unmatch
        break
      }
      case "lookup": {
        const [index, defaultNode] = formula.operands
        if (index.operation !== "const")
          throw new Error(`${operation} node must be known at optimization time`)
        const selected = formula.table[index.value!] ?? defaultNode
        if (selected === undefined)
          throw new Error("Found lookup node without value")
        result = selected
        break
      }
      case "prio": {
        const string = formula.operands.find(x => x.operation === "const" && x.value !== undefined)
        if (!string)
          throw new Error(`${operation} node must be known at optimization time`)
        result = string
        break
      }
      case "const": break
      case "data": throw new Error("Unreachable")
      default: assertUnreachable(operation) // Exhaustive switch
    }
    return result
  })
}

/**
 * - Apply all `ReadNode`s
 * - Remove all `DataNode`s
 */
function applyRead(formulas: NumNode[], topLevelData: Data, bottomUpMap = (formula: NumNode | StrNode, _orig: NumNode | StrNode) => formula): NumNode[] {
  const dataFromId = [[], topLevelData ? [topLevelData] : []], nextIdsFromCurrentIds = [new Map<Data, number>(), new Map<Data, number>()]
  nextIdsFromCurrentIds[0].set(topLevelData, 1)

  function topDown(_formula: AnyNode, contextId: number): [AnyNode, number] {
    const formula = _formula as NumNode | StrNode
    switch (formula.operation) {
      case "data": {
        const { data, operands: [baseFormula] } = formula
        if (formula.reset) contextId = 0
        const nextIds = nextIdsFromCurrentIds[contextId]
        if (nextIds.has(data)) return topDown(baseFormula, nextIds.get(data)!)

        const nextId = dataFromId.length
        nextIds.set(data, nextId)
        dataFromId.push([data, ...dataFromId[contextId]])
        nextIdsFromCurrentIds.push(new Map())

        return topDown(baseFormula, nextId)
      }
      case "read": {
        const data = dataFromId[contextId], { path, accu } = formula
        const operands = data?.map(context => resolve(context, path) as NumNode | StrNode).filter(x => x)

        if (operands.length === 0)
          return [formula, contextId]
        if (accu === undefined)
          return topDown({ ...formula, ...(operands[0] as any) }, contextId)
        return [{ ...formula, operation: accu, operands }, contextId]
      }
    }
    return [formula, contextId]
  }

  return mapContextualFormulas(formulas, 1, topDown, bottomUpMap as any)
}

export const testing = {
  constantFold, flatten, deduplicate
}
