import KeyMap from "../KeyMap"
import { ElementKeyWithPhy } from "../Types/consts"
import { assertUnreachable, crawlObject, layeredAssignment, objPathValue } from "../Util/Util"
import { allOperations } from "./optimization"
import { ComputeNode, Data, DataNode, Info, LookupNode, Node, ReadNode, StringMatchNode, StringNode, SubscriptNode } from "./type"

const shouldWrap = true

export function valueString(value: number, unit: "%" | "flat", fixed = -1): string {
  if (fixed === -1) {
    if (unit === "%") fixed = 1
    else fixed = Math.abs(value) < 10 ? 3 : Math.abs(value) < 1000 ? 2 : Math.abs(value) < 10000 ? 1 : 0
  }
  return unit === "%" ? `${(value * 100).toFixed(fixed)}%` : value.toFixed(fixed)
}
export interface NodeDisplay {
  /** Leave this here to make sure one can use `crawlObject` on hierarchy of `NodeDisplay` */
  operation: true
  namePrefix?: string
  key?: string
  value: number
  /** Whether the node fails the conditional test (`threshold_add`, `match`, etc.) or consists solely of empty nodes */
  isEmpty: boolean
  unit: "%" | "flat"
  variant?: ElementKeyWithPhy | "success"
  formula?: Displayable
  formulas: Displayable[]
}

export class UIData {
  parent?: UIData
  children = new Map<Data[], UIData>()

  data: Data[]
  nodes = new Map<Node, ContextNodeDisplay>()
  string = new Map<StringNode, ContextString>()
  processed = new Map<Node, NodeDisplay>()

  display: any = undefined

  constructor(data: Data[], parent: UIData | undefined) {
    this.parent = parent
    this.data = data
  }

  getDisplay(): any {
    if (this.display) return this.display
    this.display = {}
    for (const data of this.data) {
      if (!data.display) continue
      crawlObject(data.display, [], (x: any) => x.operation, (x: Node, key: string[]) =>
        layeredAssignment(this.display, key, this.get(x)))
    }
    return this.display
  }
  get(node: Node): NodeDisplay {
    const old = this.processed.get(node)
    if (old) return old

    // Detect loops in dev build
    const visited = (process.env.NODE_ENV === "development") ? new Set<Node>() : undefined
    const result = computeNodeDisplay(this.computeNode(node, visited), node.info)

    this.processed.set(node, result)
    return result
  }
  getStr(node: StringNode): ContextString {
    const old = this.string.get(node)
    if (old) return old

    const { operation } = node
    let result: ContextString
    switch (operation) {
      case "sconst": result = { value: node.value }; break
      case "sread": result = this.readFirstString(node.path) ?? {}; break
      case "prio": {
        const operands = node.operands.map(x => this.getStr(x)).filter(x => x.value)
        result = { value: operands[0]?.value, }
        break
      }
      case "smatch": {
        const [str1, str2] = node.operands.slice(0, 2).map(x => this.getStr(x).value)
        result = this.getStr(str1 === str2 ? node.operands[2] : node.operands[3])
        break
      }
      case "slookup": {
        const str = this.getStr(node.operands[0])
        const tmp = node.table[str.value!] ?? node.operands[1]
        result = tmp ? this.getStr(tmp) : {}
        break
      }
      default: assertUnreachable(operation)
    }

    this.string.set(node, result)
    return result
  }

  private computeNode(node: Node, visited: Set<Node> | undefined): ContextNodeDisplay {
    const old = this.nodes.get(node)
    if (old) return old

    if (visited) {
      if (visited.has(node))
        throw { error: "Found loop", visited }
      visited.add(node)
    }

    const { operation, info } = node
    let result: ContextNodeDisplay
    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac": case "threshold_add":
        result = this._compute(node, visited); break
      case "const": result = this._constant(node.value); break
      case "subscript": result = this._subscript(node, visited); break
      case "read": result = this._read(node, visited); break
      case "data": result = this._data(node, visited); break
      case "match": case "unmatch": result = this._match(node, visited); break
      case "lookup": result = this._lookup(node, visited); break
      default: assertUnreachable(operation)
    }

    if (info) {
      const { namePrefix, variant, key, asConst } = info
      let { pivot } = info
      result = { ...result }

      // Pivot all keyed nodes for debugging
      // if (key) pivot = true

      if (asConst) {
        delete result.formula
        result.dependencies = new Set()
      }
      if (pivot) {
        result.mayNeedWrapping = false
        result.pivot = pivot
      }
      if (variant) result.variant = variant
      if (key) {
        result.key = key
        result.name = `${namePrefix ? namePrefix + ' ' : ''}${KeyMap.getNoUnit(key)} ${valueString(result.value, KeyMap.unit(key))}`
      }
      if (result.name && result.formula)
        result.assignment = `${result.name} = ${result.formula}`
    }

    this.nodes.set(node, result)
    return result
  }

  private readAll(path: string[], visited: Set<Node> | undefined): ContextNodeDisplay[] {
    return this.data.map(x => objPathValue(x, path) as Node).filter(x => x).map(x => this.computeNode(x, visited))
  }
  private readFirstString(path: string[]): ContextString | undefined {
    const data = this.data.map(x => objPathValue(x, path) as StringNode).find(x => x)
    return data && this.getStr(data)
  }

  private _read(node: ReadNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const { path } = node, nodes = this.readAll(path, visited)

    const result = (node.accumulation === "unique")
      ? (nodes[0] ?? illformed)
      : this._accumulate(node.accumulation, nodes)
    return result
  }
  private _lookup(node: LookupNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const key = this.getStr(node.string).value
    const selected = node.table[key!] ?? node.operands[0]
    if (!selected) throw { error: "Lookup fail", key, table: node.table, default: node.operands[0] }

    // TODO: Wrap info here instead
    return this.computeNode(selected, visited)
  }
  private _match(node: StringMatchNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const string1 = this.getStr(node.string1).value
    const string2 = this.getStr(node.string2).value
    const base = this.computeNode(node.operands[0], visited)

    return makeEmpty(base, ((string1 === string2) !== (node.operation === "match")))
  }
  private _data(node: DataNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    let child = this.children.get(node.data)
    if (!child) {
      child = new UIData([...node.data, ...this.data], this)
      this.children.set(node.data, child)
    }
    return child.computeNode(node.operands[0], visited && new Set())
  }
  private _compute(node: ComputeNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const { operation, operands } = node
    return this._accumulate(operation, operands.map(x => this.computeNode(x, visited)))
  }
  private _subscript(node: SubscriptNode, visited: Set<Node> | undefined): ContextNodeDisplay {
    const operand = this.computeNode(node.operands[0], visited)
    const value = node.list[operand.value] ?? NaN
    return this._constant(value)
  }
  private _constant(value: number): ContextNodeDisplay {
    return {
      value, pivot: false,
      empty: false,
      mayNeedWrapping: false,
      dependencies: new Set(),
    }
  }

  private _accumulate(operation: ComputeNode["operation"], operands: ContextNodeDisplay[]): ContextNodeDisplay {
    let variant: ContextNodeDisplay["variant"]

    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac":
        variant = mergeVariants(operands); break
      case "threshold_add": variant = operands[2].variant; break
      default: assertUnreachable(operation)
    }
    switch (operation) {
      case "add": case "mul": case "min": case "max":
        const identity = allOperations[operation]([])
        operands = operands.filter(operand => operand.pivot || operand.value !== identity)
        if (!operands.length)
          return variant ? { ...this._constant(identity), variant } : this._constant(identity)
    }

    let formula: { display: Displayable, dependencies: Displayable[] }
    let mayNeedWrapping = false
    switch (operation) {
      case "max": formula = fStr`Max( ${{ operands }} )`; break
      case "min": formula = fStr`Min( ${{ operands }} )`; break
      case "add": formula = fStr`${{ operands, separator: ' + ' }}`; break
      case "mul": formula = fStr`${{ operands, separator: ' * ', shouldWrap }}`; break
      case "sum_frac": formula = fStr`${{ operands: [operands[0]], shouldWrap }} / ( ${{ operands, separator: ' + ' }} )`; break
      case "res": {
        const base = operands[0].value
        if (base < 0) {
          formula = fStr`100% - ${{ operands, shouldWrap }} / 2`
          mayNeedWrapping = true
        }
        else if (base >= 0.75) formula = fStr`100% / ( ${{ operands, shouldWrap }} * 4 + 100% )`
        else {
          formula = fStr`100% - ${{ operands, shouldWrap }}`
          mayNeedWrapping = true
        }
        break
      }
      case "threshold_add":
        const value = operands[0].value, threshold = operands[1].value
        return makeEmpty(operands[2], value < threshold)
      default: assertUnreachable(operation)
    }
    switch (operation) {
      case "add": case "mul":
        if (operands.length <= 1) mayNeedWrapping = operands[0]?.mayNeedWrapping ?? true
        else if (operation === "add") mayNeedWrapping = true
    }

    const value = allOperations[operation](operands.map(x => x.value))
    const dependencies = new Set([...operands.flatMap(x =>
      x.pivot && x.assignment
        ? [x.assignment, ...x.dependencies]
        : [...x.dependencies])])
    const result: ContextNodeDisplay = {
      formula: formula.display,
      // Note:
      // We technically should use `operands.every(x => x.empty)` to
      // check for emptiness. However, we don't have any instance where
      // this could return `true`. So we're simply setting it to `false`
      // to save some computations.
      empty: false,
      value, mayNeedWrapping,
      pivot: false, dependencies,
    }
    if (variant) result.variant = variant
    return result
  }
}
type ContextNodeDisplayList = { operands: ContextNodeDisplay[], separator?: string, shouldWrap?: boolean }
function fStr(strings: TemplateStringsArray, ...list: ContextNodeDisplayList[]): { display: Displayable, dependencies: Displayable[] } {
  const dependencies = new Set<Displayable>()
  const predisplay: Displayable[] = []

  strings.forEach((string, i) => {
    predisplay.push(string)

    const key = list[i]
    if (key) {
      const { operands, shouldWrap, separator = ", " } = key
      operands.forEach((item, i, array) => {
        let itemFormula: Displayable = valueString(item.value, item.key ? KeyMap.unit(item.key) : "flat")
        if (item.pivot && item.name) itemFormula = item.name
        else if (item.formula) itemFormula = item.formula

        if (shouldWrap && item.mayNeedWrapping) {
          predisplay.push("( ")
          predisplay.push(itemFormula)
          predisplay.push(" )")
        } else {
          predisplay.push(itemFormula)
        }
        if (i + 1 < array.length) predisplay.push(separator)
        item.dependencies.forEach(x => dependencies.add(x))
      })
    }
  })
  // TODO: Update to JSX
  return { display: (predisplay as string[]).join(""), dependencies: [...dependencies] }
}
function mergeVariants(operands: ContextNodeDisplay[]): ContextNodeDisplay["variant"] {
  const unique = new Set(operands.map(x => x.variant))
  if (unique.size > 1) unique.delete(undefined)
  if (unique.size > 1) unique.delete("physical")
  return unique.values().next().value
}
function computeNodeDisplay(node: ContextNodeDisplay, info: Info | undefined): NodeDisplay {
  const { dependencies, value, variant, formula, pivot, assignment, empty } = node
  const { key, namePrefix } = info ?? {}
  return {
    operation: true,
    key, value, variant, namePrefix,
    isEmpty: empty,
    unit: (key && KeyMap.unit(key)) || "flat",
    formula, formulas: [...((pivot && assignment) ? [assignment] : []), ...dependencies]
  }
}

interface ContextString { value?: string }

interface ContextNodeDisplay {
  key?: string

  pivot: boolean
  empty: boolean

  value: number
  variant?: ElementKeyWithPhy | "success"

  dependencies: Set<Displayable>

  mayNeedWrapping: boolean

  // Don't set these manually outside of `UIData.computeNode`
  name?: Displayable
  formula?: Displayable
  assignment?: Displayable
}

const illformed: ContextNodeDisplay = {
  value: NaN, pivot: true,
  empty: false,
  dependencies: new Set,
  mayNeedWrapping: false
}
function makeEmpty(node: ContextNodeDisplay, shouldMakeEmpty: boolean): ContextNodeDisplay {
  if (!shouldMakeEmpty) return node

  const result: ContextNodeDisplay = {
    value: 0, pivot: true, empty: true, dependencies: new Set(), mayNeedWrapping: false
  }
  if (node.key) result.key = node.key
  if (node.variant) result.variant = node.variant
  return result
}
