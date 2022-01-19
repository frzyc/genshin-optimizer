import StatMap, { unitOfKey } from "../StatMap"
import { ElementKeyWithPhy } from "../Types/consts"
import { assertUnreachable, objPathValue } from "../Util/Util"
import { allOperations } from "./optimization"
import { ComputeNode, ConstantNode, Data, DataNode, Info, Node, ReadNode, StringMatchNode, StringNode, SubscriptNode } from "./type"

const shouldWrap = true

export function valueString(value: number, unit: "%" | "flat", fixed = -1): string {
  if (fixed === -1) {
    if (unit === "%") fixed = 1
    else fixed = Math.abs(value) < 10 ? 3 : Math.abs(value) < 1000 ? 2 : Math.abs(value) < 10000 ? 1 : 0
  }
  return unit === "%" ? `${(value * 100).toFixed(fixed)}%` : value.toFixed(fixed)
}
export interface NodeDisplay {
  namePrefix?: string
  key?: string
  value: number
  unit: "%" | "flat"
  variant?: ElementKeyWithPhy | "success"
  formula: Displayable
  formulas: Displayable[]
}

export class UIData {
  parent?: UIData
  children = new Map<Data[], UIData>()

  data: Data[]
  nodes = new Map<Node, ContextNodeDisplay>()
  string = new Map<StringNode, ContextString>()
  processed = new Map<Node, NodeDisplay>()

  constructor(data: Data[], parent: UIData | undefined) {
    this.parent = parent
    this.data = data
  }

  get(node: Node, checkLoop = false): NodeDisplay {
    const old = this.processed.get(node)
    if (old) return old

    const result = process(this._computeNode(node, checkLoop ? new Set() : undefined))
    this.processed.set(node, result)
    return result
  }
  private _computeNode(node: Node, visited: Set<Node> | undefined): ContextNodeDisplay {
    const old = this.nodes.get(node)
    if (old) return old

    if (visited) {
      if (visited.has(node))
        throw { error: "Found loop", visited }
      visited.add(node)
    }

    const { operation } = node
    let result: ContextNodeDisplay
    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac": case "threshold_add":
        result = this._compute(node, visited); break
      case "const": result = this._constant(node); break
      case "subscript": result = this._subscript(node, visited); break
      case "read": result = this._read(node, visited); break
      case "data": result = this._data(node, visited); break
      case "match": case "unmatch": result = this._match(node, visited); break
      default: assertUnreachable(operation)
    }

    this.nodes.set(node, result)
    return result
  }
  getStr(node: StringNode): ContextString {
    const old = this.string.get(node)
    if (old) return old

    const { operation } = node
    let result: ContextString
    switch (operation) {
      case "sconst": result = { value: node.value }; break
      case "prio":
        const operands = node.operands.map(x => this.getStr(x)).filter(x => x.value)
        result = { value: operands[0]?.value, }
        break
      case "sread":
        let key = node.key
        if (node.suffix) {
          const suffix = this.getStr(node.suffix)
          key = [...key as string[], suffix.value ?? ""]
        }
        result = this.readFirstString(key) ?? {}
        break
      default: assertUnreachable(operation)
    }

    this.string.set(node, result)
    return result
  }

  private hasRead(path: string[]): boolean {
    return this.data.some(data => objPathValue(data, path))
  }
  private readAll(path: string[], visited: Set<Node> | undefined): ContextNodeDisplay[] {
    return [
      ...this.data.map(x => objPathValue(x, path) as Node).filter(x => x).map(x => this._computeNode(x, visited)),
      ...this.parent?.readAll(path, visited) ?? []]
  }
  private readFirstString(path: string[]): ContextString | undefined {
    const nodes = this.data.map(x => objPathValue(x, path) as StringNode).filter(x => x)
    return nodes.length ? this.getStr(nodes[0]) : this.parent?.readFirstString(path)
  }

  private _read(node: ReadNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    let key = node.key
    if (node.suffix) {
      const suffix = this.getStr(node.suffix)
      key = [...key as string[], suffix.value ?? ""]
    }
    if (!this.hasRead(key) && this.parent)
      return this.parent._computeNode(node, visited)

    const nodes = this.readAll(key, visited)
    let result: ContextNodeDisplay

    if (node.accumulation === "unique")
      result = nodes.length
        ? { ...nodes[0] }
        : this._constant({ operation: "const", operands: [], info: node.info, value: NaN })
    else
      result = this._accumulate(node.accumulation, nodes)
    return mergeInfo(result, node.info)
  }
  private _match(node: StringMatchNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const string1 = this.getStr(node.string1).value
    const string2 = typeof node.string2 === "string" ? node.string2 : this.getStr(node.string2).value

    if ((string1 === string2) === (node.operation === "match"))
      return this._computeNode(node.operands[0], visited)
    else return this._constant({ operation: "const", operands: [], value: 0 })
  }
  private _data(node: DataNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    let child = this.children.get(node.data)
    if (!child) {
      child = new UIData(node.data, this)
      this.children.set(node.data, child)
    }

    // TODO: Incorporate `info` if needed
    return child._computeNode(node.operands[0], visited && new Set())
  }
  private _compute(node: ComputeNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const operation = node.operation
    const operands = node.operands.map(x => this._computeNode(x, visited))
    return mergeInfo(this._accumulate(operation, operands), node.info)
  }
  private _subscript(node: SubscriptNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const operand = this._computeNode(node.operands[0], visited)

    const value = node.list[operand.value]
    const result = this._constant({ operation: "const", operands: [], info: node.info, value, })
    result.operation = "subscript"
    return result
  }
  private _constant(node: ConstantNode): ContextNodeDisplay {
    return mergeInfo({
      operation: "const",
      value: node.value,
      variant: undefined,
      mayNeedWrapping: false
    }, node.info)
  }

  private _accumulate(operation: ComputeNode["operation"], operands: ContextNodeDisplay[]): ContextNodeDisplay {
    let variant: ContextNodeDisplay["variant"]

    switch (operation) {
      case "add": case "min": case "max": variant = mergeVariants(operands); break
      case "threshold_add": variant = operands[2].variant; break
      case "mul": variant = mergeVariants(operands); break
      case "res":
      case "sum_frac": variant = mergeVariants(operands); break
      default: assertUnreachable(operation)
    }

    let formula: (ContextNodeDisplay | string)[] | undefined
    let mayNeedWrapping = false
    switch (operation) {
      case "max": formula = fStr`Max(${{ operands }})`; break
      case "min": formula = fStr`Min(${{ operands }})`; break
      case "add": formula = fStr`${{ operands, separator: ' + ' }}`; break
      case "mul": formula = fStr`${{ operands, separator: ' * ', shouldWrap }}`; break
      case "sum_frac": formula = fStr`${{ operands: [operands[0]], shouldWrap }} / (${{ operands }})`; break
      case "res": {
        const base = operands[0].value
        if (base < 0) {
          formula = fStr`100% - ${{ operands, shouldWrap }} / 2`
          mayNeedWrapping = true
        }
        else if (base >= 0.75) formula = fStr`100% / (${{ operands, shouldWrap }} * 4 + 100%)`
        else {
          formula = fStr`100% - ${{ operands, shouldWrap }}`
          mayNeedWrapping = true
        }
        break
      }
      case "threshold_add":
        const value = operands[0].value, threshold = operands[1].value
        if (value >= threshold) return operands[2]
        else formula = undefined
        break
      default: assertUnreachable(operation)
    }

    switch (operation) {
      case "add": case "mul":
        if (operands.length <= 1) mayNeedWrapping = operands[0]?.mayNeedWrapping ?? true
        else if (operation === "add") mayNeedWrapping = true
    }

    const value = allOperations[operation](operands.map(x => x.value))
    return {
      operation,
      formula,
      value, variant,
      mayNeedWrapping
    }
  }
}
function mergeInfo(node: ContextNodeDisplay, info: Info | undefined): ContextNodeDisplay {
  if (!info) return node
  const { namePrefix, variant, key, asConst } = info

  if (namePrefix) node.namePrefix = namePrefix
  if (variant) node.variant = variant
  if (key) {
    node.key = key
    node.mayNeedWrapping = false
  }
  if (asConst) {
    delete node.formula
    node.operation = "const"
    node.mayNeedWrapping = false
  }
  return node
}
type ContextNodeDisplayList = { operands: ContextNodeDisplay[], separator?: string, shouldWrap?: boolean }
function fStr(strings: TemplateStringsArray, ...keys: (ContextNodeDisplay | ContextNodeDisplayList)[]): (ContextNodeDisplay | string)[] {
  return strings.flatMap((string, i) => {
    const result: (ContextNodeDisplay | string)[] = [string], key = keys[i]
    if (key) {
      if ((key as any).operation) {
        result.push(keys[i] as ContextNodeDisplay)
      } else {
        const { operands, separator = ", ", shouldWrap } = key as ContextNodeDisplayList
        operands.forEach((item, i, array) => {
          if (shouldWrap && item.mayNeedWrapping) {
            result.push("(")
            result.push(item)
            result.push(")")
          } else result.push(item)
          if (i < array.length - 1)
            result.push(separator)
        })
      }
    }
    return result
  }).filter(x => x)
}
function mergeVariants(operands: ContextNodeDisplay[]): ContextNodeDisplay["variant"] {
  const unique = new Set(operands.map(x => x.variant))
  if (unique.size > 1) unique.delete(undefined)
  if (unique.size > 1) unique.delete("physical")
  return unique.values().next().value
}
function process(node: ContextNodeDisplay): NodeDisplay {
  const { namePrefix, key, value, variant } = node
  const newValue: NodeDisplay = {
    value, unit: "flat", formula: "", formulas: [],
  }
  if (key) {
    newValue.key = key
    newValue.unit = unitOfKey(key)
  }
  if (variant) newValue.variant = variant
  if (namePrefix) newValue.namePrefix = namePrefix

  const { formula, dependencies } = computeFormulaString(node)
  newValue.formula = formula
  newValue.formulas = [node, ...dependencies.filter(x => x.formula)]
    .map(x => x.formulaCache!.assignmentFormula!)
    .filter(x => x)
  return newValue
}
function computeFormulaString(node: ContextNodeDisplay): Required<ContextNodeDisplay>["formulaCache"] {
  if (node.formulaCache) return node.formulaCache

  node.formulaCache = { formula: "", dependencies: [] }
  const cache = node.formulaCache
  if (node.key) {
    const name = StatMap[node.key] ?? ""
    if (name) {
      const nameNoUnit = name.endsWith("%") ? name.slice(0, -1) : name
      cache.fullNameNoUnit = node.namePrefix ? node.namePrefix + " " + nameNoUnit : nameNoUnit
    }
  }
  if (!node.formula) return cache

  const deps = new Set<ContextNodeDisplay>()

  // TODO: Add JSX Version
  cache.formula = node.formula.map(item => {
    if (typeof item === "string") return item

    const { formula, fullNameNoUnit, dependencies } = computeFormulaString(item)
    if (fullNameNoUnit) {
      deps.add(item)
      dependencies.forEach(x => deps.add(x))
      return `${fullNameNoUnit} ${valueString(item.value, unitOfKey(item.key ?? ""))}`
    }
    if (item.formula?.length) {
      dependencies.forEach(x => deps.add(x))
      return formula
    }
    return `${valueString(item.value, unitOfKey(item.key ?? ""))}`
  }).join("")

  if (cache.fullNameNoUnit)
    cache.assignmentFormula = `${cache.fullNameNoUnit} ${valueString(node.value, unitOfKey(node.key ?? ""))} = ${cache.formula}`
  cache.dependencies = [...deps]
  return cache
}

interface ContextString { value?: string }

interface ContextNodeDisplay {
  namePrefix?: string, key?: string
  formula?: (ContextNodeDisplay | string)[]

  value: number
  variant: ElementKeyWithPhy | "success" | undefined

  formulaCache?: {
    fullNameNoUnit?: string
    formula: Displayable
    dependencies: ContextNodeDisplay[]
    assignmentFormula?: Displayable
  }

  operation: Node["operation"]
  mayNeedWrapping: boolean
}
