import { resolve } from "../Util/KeyPathUtil"
import { assertUnreachable } from "../Util/Util"
import { constant, forEachNodes, mapContextualFormulas, mapFormulas } from "./internal"
import { CommutativeMonoidOperation, ComputeNode, ConstantNode, Data, Node, Operation, ReadNode, StringNode } from "./type"

const allCommutativeMonoidOperations: StrictDict<CommutativeMonoidOperation, (_: number[]) => number> = {
  min: (x: number[]): number => Math.min(...x),
  max: (x: number[]): number => Math.max(...x),
  add: (x: number[]): number => x.reduce((a, b) => a + b, 0),
  mul: (x: number[]): number => x.reduce((a, b) => a * b, 1),
}
export const allOperations: StrictDict<Operation, (_: number[]) => number> = {
  ...allCommutativeMonoidOperations,
  res: ([res]: number[]): number => {
    if (res < 0) return 1 - res / 2
    else if (res >= 0.75) return 1 / (res * 4 + 1)
    return 1 - res
  },
  sum_frac: (x: number[]): number => x[0] / x.reduce((a, b) => a + b),
  threshold_add: ([value, threshold, addition]: number[]): number => value >= threshold ? addition : 0,
}

const commutativeMonoidOperationSet = new Set(Object.keys(allCommutativeMonoidOperations) as (Node["operation"])[])

export function optimize(formulas: Node[], topLevelData?: Data, shouldFold = (_formula: ReadNode) => false): Node[] {
  formulas = constantFold(formulas, topLevelData, shouldFold)
  formulas = flatten(formulas)
  formulas = deduplicate(formulas)
  return formulas
}
export function precompute(formulas: Node[], binding: (readNode: ReadNode) => string): (values: Dict<string, number>) => Float32Array {
  // TODO: Use min-cut to minimize the size of interim array
  type Reference = string | number | { ins: Reference[] }

  const uniqueReadStrings = new Set<string>()
  const uniqueNumbers = new Set<number>()
  const mapping = new Map<Node, Reference>()

  forEachNodes(formulas, _ => { }, f => {
    const { operation } = f
    switch (operation) {
      case "read":
        if (f.accumulation !== "add")
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
        const value = f.value
        uniqueNumbers.add(value)
        mapping.set(f, value)
        break
      case "match": case "unmatch": case "lookup": case "subscript":
      case "data": case "reset": throw new Error(`Unsupported ${operation} node in precompute`)
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
  const locations = new Map<Node | number | string, number>()

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

function flatten(formulas: Node[]): Node[] {
  return mapFormulas(formulas, f => f, (_formula, orig) => {
    let result = _formula
    if (commutativeMonoidOperationSet.has(_formula.operation)) {
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
function deduplicate(formulas: Node[]): Node[] {
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
 * - Apply all `ReadNode`s
 * - Remove all `DataNode`s
 */
function applyRead(formulas: Node[], topLevelData?: Data, bottomUpMap = (formula: Node, _orig: Node) => formula): Node[] {
  const dataFromId = [[], topLevelData ? [topLevelData] : []], nextIdsFromCurrentIds = [new Map<Data, number>(), new Map()]
  nextIdsFromCurrentIds[0].set(topLevelData, nextIdsFromCurrentIds[1])


  function extract(formula: Node, contextId: number): [Node, number] {
    switch (formula.operation) {
      case "reset": {
        const { operands: [baseFormula] } = formula
        return extract(baseFormula, 0)
      }
      case "data": {
        const { data, operands: [baseFormula] } = formula
        const nextIds = nextIdsFromCurrentIds[contextId]
        if (nextIds.has(data)) return extract(baseFormula, nextIds.get(data)!)

        const nextId = dataFromId.length
        nextIds.set(data, nextId)
        dataFromId.push([data, ...dataFromId[contextId]])
        nextIdsFromCurrentIds.push(new Map())

        return extract(baseFormula, nextId)
      }
      case "read": {
        const data = dataFromId[contextId], { path, accumulation } = formula
        const operands = data?.map(context => resolve(context, path)!).filter(x => x)

        if (operands.length === 0)
          return [formula, contextId]
        if (accumulation === "unique")
          return extract({ ...formula, ...(operands[0] as any) }, contextId)
        return [{ ...formula, operation: accumulation, operands }, contextId]
      }
      case "match": case "unmatch": {
        const string1 = resolveStringNode(formula.string1, dataFromId[contextId])
        const string2 = typeof formula.string2 === "string" ? formula.string2 : resolveStringNode(formula.string2, dataFromId[contextId])

        if ((string1 === string2) === (formula.operation === "match"))
          return extract(formula.operands[0], contextId)
        else return [constant(0), contextId]
      }
      case "lookup": {
        const string = resolveStringNode(formula.string, dataFromId[contextId]);
        const selected = formula.table[string!] ?? formula.operands[0] ?? constant(NaN)
        return extract(selected, contextId)
      }
    }
    return [formula, contextId]
  }

  return mapContextualFormulas(formulas, 1, extract, bottomUpMap)
}

/**
 * Replace nodes with known values with appropriate constants,
 * avoiding removal of any nodes that pass `isFixed` predicate
 */
export function constantFold(formulas: Node[], topLevelData?: Data, shouldFold = (_formula: ReadNode) => false): Node[] {
  return applyRead(formulas, topLevelData, formula => {
    const { operation, operands } = formula
    let result = formula

    switch (operation) {
      case "threshold_add":
        const [value, threshold, addition] = operands
        if (value.operation === "const" && threshold.operation === "const")
          result = value.value >= threshold.value ? addition : constant(0)
        break
      case "min": case "max": case "add": case "mul":
        const f = allOperations[operation]
        const numericOperands: number[] = []
        const formulaOperands: Node[] = operands.filter(formula =>
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
      case "subscript": case "sum_frac": case "res":
        if (formula.operands.every(f => f.operation === "const")) {
          const operands = (formula.operands as ConstantNode[]).map(({ value }) => value)
          const f = operation === "subscript"
            ? ([index]: number[]) => formula.list[index]
            : allOperations[operation]
          result = constant(f(operands))
        }
        break
      case "read":
        if (shouldFold(formula)) {
          switch (formula.accumulation) {
            case "add": return constant(0)
            case "max": return constant(-Infinity)
            case "min": return constant(Infinity)
            case "mul": return constant(1)
            case "unique": return constant(NaN)
          }
        }
        break
      case "const": break
      case "match": case "unmatch":
      case "data": case "reset": case "lookup": throw new Error("Unreachable")
      default: assertUnreachable(operation) // Exhaustive switch
    }
    if (result !== formula) result = { ...formula, ...result }
    return result
  })
}

function resolveStringNode(node: StringNode, data: Data[]): string | undefined {
  const { operation } = node
  switch (operation) {
    case "sconst": return node.value
    case "sread": {
      const path = node.path, operands = data.flatMap(context => {
        const formula = resolve(context, path) as StringNode | undefined
        return formula ? [formula] : []
      })

      return operands.length ? resolveStringNode(operands[0], data) : undefined
    }
    case "prio": {
      const { operands } = node
      for (const operand of operands) {
        const node = resolveStringNode(operand, data)
        if (node) return node
      }
      return undefined
    }
    case "smatch": {
      const [string1, string2] = node.operands.map(x => resolveStringNode(x, data))
      return resolveStringNode(string1 === string2 ? node.operands[2] : node.operands[3], data)
    }
    case "slookup": {
      const string = resolveStringNode(node.operands[0], data)
      const tmp = node.table[string!] ?? node.operands[1]
      return tmp && resolveStringNode(tmp, data)
    }
    default: assertUnreachable(operation)
  }
}

export const testing = {
  constantFold, flatten, deduplicate
}
