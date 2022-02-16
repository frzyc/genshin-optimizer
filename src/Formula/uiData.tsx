import { uiInput } from "."
import ColorText from "../Components/ColoredText"
import KeyMap, { KeyMapPrefix, Unit } from "../KeyMap"
import { assertUnreachable, crawlObject, layeredAssignment, objPathValue } from "../Util/Util"
import { allOperations } from "./optimization"
import { ComputeNode, Data, DataNode, DisplaySub, Info, LookupNode, MatchNode, NumNode, ReadNode, StrNode, SubscriptNode, ThresholdNode, UIInput, Variant } from "./type"

const shouldWrap = true

export function valueString(value: number, unit: Unit, fixed = -1): string {
  if (!isFinite(value)) {
    if (value > 0) return `\u221E`
    if (value < 0) return `-\u221E`
    return 'NaN'
  }
  if (unit === "%") value *= 100
  else unit = '' as any
  if (Number.isInteger(value)) fixed = 0
  else if (fixed === -1) {
    if (unit === "%") fixed = 1
    else fixed = Math.abs(value) < 10 ? 3 : Math.abs(value) < 1000 ? 2 : Math.abs(value) < 10000 ? 1 : 0
  }
  return `${value.toFixed(fixed)}${unit}`
}
export interface NodeDisplay<V = number> {
  /** Leave this here to make sure one can use `crawlObject` on hierarchy of `NodeDisplay` */
  operation: true
  prefix?: KeyMapPrefix
  key?: string
  value: V
  /** Whether the node fails the conditional test (`threshold_add`, `match`, etc.) or consists solely of empty nodes */
  isEmpty: boolean
  unit: Unit
  variant?: Variant
  formula?: Displayable
  formulas: Displayable[]
}

export class UIData {
  origin: UIData
  children = new Map<Data, UIData>()

  data: Data[]
  nodes = new Map<NumNode | StrNode, ContextNodeDisplay<number | string | undefined>>()
  processed = new Map<NumNode | StrNode, NodeDisplay<number | string | undefined>>()

  display: any = undefined
  teamBuff: any = undefined

  constructor(data: Data, parent: UIData | undefined) {
    if (data === undefined) {
      // Secret *origin* initializer
      this.data = []
      this.origin = this
    } else {
      if (!parent)
        parent = new UIData(undefined as any, undefined)

      this.data = [data, ...parent.data]
      this.origin = parent.origin
    }
  }

  getDisplay(): {
    [key: string]: DisplaySub<NodeDisplay>
  } {
    if (!this.display) this.display = this.getAll(["display"])
    return this.display
  }
  getTeamBuff(): UIInput<NodeDisplay, NodeDisplay<string>> {
    if (!this.teamBuff) {
      const calculated = this.getAll(["teamBuff"]), result = {} as any
      // Convert `input` to `uiInput`
      crawlObject(uiInput, [], (x: any) => x.operation, (x: ReadNode<number> | ReadNode<string>, path: string[]) => {
        const node = objPathValue(calculated, x.path) as NumNode | undefined
        if (node) layeredAssignment(result, path, node)
      })
      this.teamBuff = result
    }
    return this.teamBuff
  }
  getAll(prefix: string[]): any {
    const result = {}
    for (const data of this.data) {
      crawlObject(objPathValue(data, prefix) ?? {}, [], (x: any) => x.operation,
        (x: NumNode, key: string[]) => layeredAssignment(result, key, this.get(x)))
    }
    return result
  }
  get(node: NumNode): NodeDisplay
  get(node: StrNode): NodeDisplay<string | undefined>
  get(node: NumNode | StrNode): NodeDisplay<number | string | undefined>
  get(node: NumNode | StrNode): NodeDisplay<number | string | undefined> {
    if (node === undefined) {
      console.trace("Please report this bug with this trace")
      return { operation: true, value: undefined, isEmpty: true, unit: "flat", formulas: [] }
    }
    const old = this.processed.get(node)
    if (old) return old

    const result = computeNodeDisplay(this.computeNode(node))
    this.processed.set(node, result)
    return result
  }
  private computeNode(node: NumNode): ContextNodeDisplay
  private computeNode(node: StrNode): ContextNodeDisplay<string | undefined>
  private computeNode(node: NumNode | StrNode): ContextNodeDisplay<number | string | undefined>
  private computeNode(node: NumNode | StrNode): ContextNodeDisplay<number | string | undefined> {
    const old = this.nodes.get(node)
    if (old) return old

    const { operation, info } = node
    let result: ContextNodeDisplay<number | string | undefined>
    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac":
        result = this._compute(node); break
      case "threshold": result = this._threshold(node); break
      case "const": result = this._constant(node.value); break
      case "subscript": result = this._subscript(node); break
      case "read": result = this._read(node); break
      case "data": result = this._data(node); break
      case "match": result = this._match(node); break
      case "lookup": result = this._lookup(node); break
      case "prio": {
        const first = node.operands.find(x => this.computeNode(x).value !== undefined)
        if (first) result = this.computeNode(first)
        else result = illformed
        break
      }
      default: assertUnreachable(operation)
    }

    if (info) {
      const { key, prefix, source, variant, asConst } = info
      let { pivot } = info
      result = { ...result }

      // Pivot all keyed nodes for debugging
      // if (key) pivot = true

      if (key) result.key = key
      if (prefix) result.prefix = prefix
      if (source) result.source = source
      if (variant) result.variant = variant
      if (pivot) result.pivot = pivot

      if (asConst) {
        delete result.formula
        delete result.assignment
        result.dependencies = new Set()
      }
      if (result.pivot || !result.formula)
        result.mayNeedWrapping = false
    }
    createDisplay(result)

    this.nodes.set(node, result)
    return result
  }

  private readAll(path: readonly string[]): ContextNodeDisplay<number | string | undefined>[] {
    return this.data.map(x => objPathValue(x, path) as NumNode | StrNode).filter(x => x).map(x => this.computeNode(x))
  }
  private readFirst(path: readonly string[]): ContextNodeDisplay<number | string | undefined> | undefined {
    const data = this.data.map(x => objPathValue(x, path) as NumNode | StrNode).find(x => x)
    return data && this.computeNode(data)
  }

  private _read(node: ReadNode<number | string | undefined>): ContextNodeDisplay<number | string | undefined> {
    const { path } = node
    const result = (node.accu === undefined)
      ? this.readFirst(path) ?? (node.type === "string" ? this._constant(undefined) : illformed)
      : this._accumulate(node.accu, this.readAll(path) as ContextNodeDisplay[])
    return result
  }
  private _lookup(node: LookupNode<NumNode | StrNode>): ContextNodeDisplay<number | string | undefined> {
    const key = this.computeNode(node.operands[0]).value
    const selected = node.table[key!] ?? node.operands[1]
    if (!selected)
      throw new Error(`Lookup Fail with key ${key}`)
    return this.computeNode(selected)
  }
  private _match(node: MatchNode<StrNode | NumNode, StrNode | NumNode>): ContextNodeDisplay<number | string | undefined> {
    const [v1Node, v2Node, matchNode, unmatchNode] = node.operands
    const v1 = this.computeNode(v1Node), v2 = this.computeNode(v2Node)
    const matching = v1.value === v2.value
    let result = this.computeNode(matching ? matchNode : unmatchNode)
    return ((matching && node.emptyOn === "match") || (!matching && node.emptyOn === "unmatch"))
      ? makeEmpty(result.value) : result
  }
  private _threshold(node: ThresholdNode<NumNode | StrNode>): ContextNodeDisplay<number | string | undefined> {
    const [valueNode, thresholdNode, pass, fail] = node.operands
    const value = this.computeNode(valueNode), threshold = this.computeNode(thresholdNode)
    const result = value.value >= threshold.value ? this.computeNode(pass) : this.computeNode(fail)
    return (value.value >= threshold.value) === (node.emptyOn === "l") ? result : makeEmpty(result.value)
  }
  private _data(node: DataNode<NumNode | StrNode>): ContextNodeDisplay<number | string | undefined> {
    let child = this.children.get(node.data)
    if (!child) {
      child = new UIData(node.data, node.reset ? this.origin : this)
      this.children.set(node.data, child)
    }
    return child.computeNode(node.operands[0])
  }
  private _compute(node: ComputeNode): ContextNodeDisplay {
    const { operation, operands } = node
    return this._accumulate(operation, operands.map(x => this.computeNode(x)))
  }
  private _subscript(node: SubscriptNode<number>): ContextNodeDisplay {
    const operand = this.computeNode(node.operands[0])
    const value = node.list[operand.value] ?? NaN
    return this._constant(value)
  }
  private _constant<V>(value: V): ContextNodeDisplay<V> {
    return {
      value, pivot: false,
      empty: false,
      mayNeedWrapping: false,
      dependencies: new Set(),
    }
  }
  private _accumulate(operation: ComputeNode["operation"], operands: ContextNodeDisplay[]): ContextNodeDisplay {
    let variant: Variant | undefined
    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac":
        variant = mergeVariants(operands); break
      default: assertUnreachable(operation)
    }
    switch (operation) {
      case "add": case "mul": case "min": case "max":
        const identity = allOperations[operation]([])
        if (process.env.NODE_ENV !== "development")
          operands = operands.filter(operand => operand.value !== identity)
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
      empty: operands.every(x => x.empty),
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
        let itemFormula: Displayable
        if (!item.pivot && item.formula) itemFormula = item.formula
        else itemFormula = createFormulaComponent(item)

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
  return { display: mergeFormulaComponents(predisplay), dependencies: [...dependencies] }
}
function mergeVariants<V>(operands: ContextNodeDisplay<V>[]): ContextNodeDisplay<V>["variant"] {
  const unique = new Set(operands.map(x => x.variant))
  if (unique.size > 1) unique.delete(undefined)
  if (unique.size > 1) unique.delete("physical")
  return unique.values().next().value
}
function computeNodeDisplay<V>(node: ContextNodeDisplay<V>): NodeDisplay<V> {
  const { key, prefix, dependencies, value, variant, formula, assignment, empty } = node
  return {
    operation: true,
    key, value, variant, prefix,
    isEmpty: empty,
    unit: (key && KeyMap.unit(key)) || "flat",
    formula, formulas: [...(assignment ? [assignment] : []), ...dependencies]
  }
}

//* Comment/uncomment this line to toggle between string formulas and JSX formulas
function createDisplay(node: ContextNodeDisplay<number | string | undefined>) {
  const { key, value, formula, prefix, source, variant } = node
  if (typeof value !== "number") return
  node.valueDisplay = <ColorText color="info">{valueString(value, key ? KeyMap.unit(key) : "flat")}</ColorText>
  if (key && key !== '_') {
    const prefixDisplay = (prefix && !source) ? <>{KeyMap.getPrefixStr(prefix)} </> : <></>
    // TODO: Convert `source` key to actual name
    const sourceDisplay = source ? <ColorText color="secondary"> ({source})</ColorText> : null
    node.name = <><ColorText color={variant}>{prefixDisplay}{KeyMap.getNoUnit(key!)}</ColorText>{sourceDisplay}</>

    if (formula)
      node.assignment = <div id="formula">{node.name} {node.valueDisplay} = {formula}</div>
  }
}
function createFormulaComponent(node: ContextNodeDisplay): Displayable {
  const { name, valueDisplay } = node
  //TODO: change formula size in the formula display element instead
  return name ? <><span style={{ fontSize: "85%" }}>{name}</span> {valueDisplay}</> : valueDisplay!
}
function mergeFormulaComponents(components: Displayable[]): Displayable {
  return <>{components.map((x, i) => <span key={i}>{x}</span>)}</>
}
/*/
function createDisplay(node: ContextNodeDisplay<number | string | undefined>) {
  const { key, value, formula, prefix, source, variant } = node
  if (typeof value !== "number") return
  node.valueDisplay = valueString(value, key ? KeyMap.unit(key) : "flat")
  if (key && key !== '_') {
    const prefixDisplay = (prefix && !source) ? `${KeyMap.getPrefixStr(prefix)} ` : ""
    // TODO: Convert `source` key to actual name
    const sourceDisplay = source ? ` ${source}` : ""
    node.name = `${prefixDisplay}${KeyMap.getNoUnit(key!)}${sourceDisplay}`

    if (formula)
      node.assignment = `${node.name} ${node.valueDisplay} = ${formula}`
  }
}
function createFormulaComponent(node: ContextNodeDisplay): Displayable {
  const { name, valueDisplay } = node
  return name ? `${name} ${valueDisplay}` : valueDisplay!
}
function mergeFormulaComponents(components: Displayable[]): Displayable {
  return (components as string[]).join("")
}
//*/

interface ContextNodeDisplay<V = number> {
  key?: Info["key"]
  prefix?: Info["prefix"]
  source?: Info["source"]
  variant?: Info["variant"]

  pivot: boolean
  empty: boolean

  value: V

  dependencies: Set<Displayable>

  mayNeedWrapping: boolean

  // Don't set these manually outside of `UIData.computeNode`
  name?: Displayable
  valueDisplay?: Displayable
  formula?: Displayable
  assignment?: Displayable
}

const illformed: ContextNodeDisplay = {
  value: NaN, pivot: true,
  empty: false,
  dependencies: new Set(),
  mayNeedWrapping: false
}
function makeEmpty(emptyValue: number): ContextNodeDisplay<number>
function makeEmpty(emptyValue: string | undefined): ContextNodeDisplay<string | undefined>
function makeEmpty(emptyValue: number | string | undefined): ContextNodeDisplay<number | string | undefined>
function makeEmpty(emptyValue: number | string | undefined): ContextNodeDisplay<number | string | undefined> {
  return {
    value: emptyValue, pivot: false, empty: true, dependencies: new Set(), mayNeedWrapping: false
  }
}
