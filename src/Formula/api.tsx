import { renderIntoDocument } from "react-dom/test-utils";
import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { assertUnreachable, crawlObject, layeredAssignment, objectFromKeyMap, objPathValue } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { Input, input, StrictInput } from "./index";
import { constant } from "./internal";
import { allOperations } from "./optimization";
import { ComputeNode, ConstantNode, Data, DataNode, DynamicNumInput, Node, ReadNode, StringNode, StringPriorityNode, StringReadNode, SubscriptNode } from "./type";
import { data, prod, stringConst, subscript, sum } from "./utils";
const readNodeArrays: ReadNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readNodeArrays.push(x))

// TODO: Remove this conversion after changing the file format
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): Node {
  return data(input.hit.dmg, [{
    hit: {
      base: prod(input.total[base], subscript(input.char.lvl, lvlMultiplier)),
      move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional])
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKeyWithPhy | undefined,
  hp: { base: number, lvlCurve: string, asc: number[] },
  atk: { base: number, lvlCurve: string, asc: number[] },
  def: { base: number, lvlCurve: string, asc: number[] },
  special: { stat: MainStatKey | SubstatKey, asc: number[] },
  display: Data["display"],
  additional: Data = {},
): Data {
  function curve(array: { base: number, lvlCurve: string, asc: number[] }): Node {
    return sum(prod(array.base, subscript(input.char.lvl, charCurves[array.lvlCurve])), subscript(input.char.asc, array.asc))
  }

  const result = mergeData({
    char: {
      key: stringConst(key),

      hp: curve(hp), atk: curve(atk), def: curve(def),
      special: subscript(input.char.asc, special.asc, { key: special.stat }),
    },
    premod: {
      [special.stat]: input.char.special,
    },
    display,
  }, additional)

  if (element) result.char!.ele = stringConst(element)
  if (special.stat.endsWith("_")) result.char!.special!.info!.unit = "%"
  return result
}
function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  mainStat: { stat?: "atk", base: number, lvlCurve: string, asc: number[] },
  substat: { stat: MainStatKey | SubstatKey, base: number, lvlCurve: string },
  substat2: { stat: MainStatKey | SubstatKey, refinement: number[] } | undefined,
  additional: Data = {},
): Data {
  const mainStatNode = sum(prod(mainStat.base, subscript(input.weapon.lvl, weaponCurves[mainStat.lvlCurve])), subscript(input.weapon.asc, mainStat.asc))
  const substatNode = prod(substat.base, subscript(input.weapon.lvl, weaponCurves[substat.lvlCurve]))
  const substat2Node = substat2 && subscript(input.weapon.refineIndex, substat2.refinement, { key: substat2.stat })

  mainStatNode.info = { key: mainStat.stat ?? "atk" }
  substatNode.info = { key: substat.stat }
  if (substat2Node)
    substat2Node.info = { key: substat2.stat }

  if (mainStat.stat?.endsWith("_")) mainStatNode.info.unit = "%"
  if (substat.stat?.endsWith("_")) substatNode.info.unit = "%"
  if (substat2?.stat?.endsWith("_")) substat2Node!.info!.unit = "%"

  const result: Data = {
    base: { [mainStat.stat ?? "atk"]: mainStatNode, },
    premod: { [substat.stat]: substatNode, },
    weapon: {
      key: stringConst(key), type: stringConst(type),
      main: mainStatNode, sub: substatNode,
    },
  }

  if (substat2) {
    result.weapon!.sub2 = substat2Node
    result.premod![substat2.stat] = substat2.stat !== substat.stat
      ? substat2Node : sum(substatNode, substat2Node!)
  }

  return mergeData(result, additional)
}
function dataObjForArtifact(art: ICachedArtifact, assumingMinimumMainStatLevel: number): Data {
  // TODO: assume main stat level
  return {
    art: {
      [art.mainStatKey]: constant(art.mainStatVal),
      ...Object.fromEntries(art.substats
        .filter((x) => x.key)
        .map(({ key, value }) => [key, constant(value)])),
      [art.setKey]: constant(1),
    },
  }
}
function dataObjForCharacter(char: ICachedCharacter): Data {
  return {
    char: {
      lvl: constant(char.level),
      constellation: constant(char.constellation),
      asc: constant(char.ascension),

      // TODO: Check when char.elementKey can be null
      ...(char.elementKey ? { ele: stringConst(char.elementKey) } : {}),

      auto: constant(char.talent.auto),
      skill: constant(char.talent.skill),
      burst: constant(char.talent.burst),
    },
    // TODO: override enemy stats
    enemy: {
      res: {
        ...objectFromKeyMap(allElementsWithPhy, _ => {
          return constant(0.1)
        }),
      },
      level: constant(char.level),
    },
    conditional: {
      // TODO: Add conditional values
    },
    hit: {
      hitMode: stringConst(char.hitMode)
    }
  }
}
function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    weapon: {
      lvl: constant(weapon.level),
      asc: constant(weapon.ascension),
      refineIndex: constant(weapon.refinement - 1),
    },
  }
}
function mergeData(...data: Data[]): Data {
  function internal(data: any[], input: any, path: string[]): any {
    if (data.length === 1) return data[0]
    if (input.operation) {
      const accumulation = (input as ReadNode).accumulation ?? "unique"
      if (accumulation === "unique") {
        if (data.length !== 1) throw "Multiple entries when merging `unique`"
        return data[0]
      }
      const result: Node = { operation: accumulation, operands: data, }
      return result
    } else {
      return Object.fromEntries([...new Set(data.flatMap(x => Object.keys(x) as string[]))]
        .map(key => [key, internal(data.map(x => x[key]).filter(x => x), input[key], [...path, key])]))
    }
  }

  return data.length ? internal(data, input, []) : {}
}

type ContextNodeDisplay = {
  name?: string
  formula?: Displayable
  formulas: Map<ContextNodeDisplay, Displayable>

  key: string | undefined
  value: number
  variant: ElementKeyWithPhy | "success" | undefined
  unit: "%" | "flat"

  operation: Node["operation"]
}
type ContextString = { value?: string }

class Context {
  thresholds: Dict<string, Dict<number, { path: string[], value: NodeDisplay }>> | undefined

  parent?: Context
  children = new Map<Data[], Context>()

  data: Data[]
  nodes = new Map<Node, ContextNodeDisplay>()
  string = new Map<StringNode, ContextString>()

  constructor(data: Data[], parent?: Context) {
    this.parent = parent
    this.data = data
  }

  compute(node: Node, path: string[]): ContextNodeDisplay {
    const old = this.nodes.get(node)
    if (old) return old

    const { operation } = node
    let result: ContextNodeDisplay
    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac": case "threshold_add":
        result = this._compute(node, path); break
      case "const": result = this._constant(node); break
      case "subscript": result = this._subscript(node, path); break
      case "read": result = this._read(node); break
      case "data": result = this._data(node, path); break
      default: assertUnreachable(operation)
    }

    this.nodes.set(node, result)
    return result
  }
  computeString(node: StringNode): ContextString {
    const old = this.string.get(node)
    if (old) return old

    const { operation } = node
    let result: ContextString
    switch (operation) {
      case "sconst": result = { value: node.value }; break
      case "prio": result = this._strPrio(node); break
      case "sread": result = this._strRead(node); break
      default: assertUnreachable(operation)
    }

    this.string.set(node, result)
    return result
  }

  hasRead(path: string[]): boolean {
    return this.data.some(data => objPathValue(data, path))
  }
  readAll(path: string[]): ContextNodeDisplay[] {
    return [
      ...this.data.map(x => objPathValue(x, path) as Node).filter(x => x).map(x => this.compute(x, path)),
      ...this.parent?.readAll(path) ?? []]
  }
  readFirstString(path: string[]): ContextString | undefined {
    const nodes = this.data.map(x => objPathValue(x, path) as StringNode).filter(x => x)
    return nodes.length ? this.computeString(nodes[0]) : this.parent?.readFirstString(path)
  }

  _strPrio(node: StringPriorityNode): ContextString {
    const operands = node.operands
      .map(x => this.computeString(x))
      .filter(x => x.value)
    return { value: operands[0]?.value, }
  }
  _strRead(node: StringReadNode): ContextString {
    let key = node.key
    if (node.suffix) {
      const suffix = this.computeString(node.suffix)
      key = [...key as string[], suffix.value ?? ""]
    }

    return this.readFirstString(key) ?? {}
  }

  _read(node: ReadNode): ContextNodeDisplay {
    let key = node.key
    if (node.suffix) {
      const suffix = this.computeString(node.suffix)
      key = [...key as string[], suffix.value ?? ""]
    }

    if (!this.hasRead(key) && this.parent)
      return this.parent.compute(node, key)

    const nodes = this.readAll(key)

    if (nodes.length == 1 || node.accumulation === "unique") {
      const result = nodes.length ? { ...nodes[0] } : this._constant({ operation: "const", operands: [], value: NaN })
      const info = node.info
      if (info) {
        if (info.key) result.key = info.key
        if (info.name) result.name = info.name
        if (info.unit) result.unit = info.unit
        if (info.variant) result.variant = info.variant
      }
      return result
    }

    return this._accumulate(node.accumulation, nodes, node.info)
  }
  _data(node: DataNode, path: string[]): ContextNodeDisplay {
    let child = this.children.get(node.data)
    if (!child) {
      child = new Context(node.data, this)
      this.children.set(node.data, child)
    }

    // TODO: Incorporate `info` if needed
    return child.compute(node.operands[0], path)
  }
  _compute(node: ComputeNode, path: string[]): ContextNodeDisplay {
    const operation = node.operation
    const operands = node.operands.map(x => this.compute(x, path))

    if (this.thresholds && operation === "threshold_add") {
      const value = node.operands[0], threshold = node.operands[1]
      if (value.operation === "read" && threshold.operation === "const" && operands[0].value >= operands[1].value) {
        const key = [...value.key]
        if (value.suffix) key.push(this.computeString(value.suffix).value!)
        key.push(threshold.value.toString())
        layeredAssignment(this.thresholds, key.concat(...path), operands[2])
      }
    }

    return this._accumulate(operation, operands, node.info)
  }
  _subscript(node: SubscriptNode, path: string[]): ContextNodeDisplay {
    const operand = this.compute(node.operands[0], path)

    const value = node.list[operand.value]
    return {
      operation: node.operation,
      name: node.info?.name,
      key: node.info?.key,
      value, unit: node.info?.unit ?? "flat", variant: node.info?.variant, formulas: new Map(),
    }
  }
  _constant(node: ConstantNode): ContextNodeDisplay {
    return {
      operation: "const",
      name: node.info?.name,
      key: node.info?.key,
      value: node.value,
      unit: node.info?.unit ?? "flat", variant: node.info?.variant,
      formulas: new Map(),
    }
  }

  _accumulate(operation: ComputeNode["operation"], operands: ContextNodeDisplay[], info: Node["info"]): ContextNodeDisplay {
    let unit: ContextNodeDisplay["unit"] = "flat"
    let variant: ContextNodeDisplay["variant"]

    switch (operation) {
      case "add": case "min": case "max": case "threshold_add": {
        const lastOperands = operands[operands.length - 1]
        if (lastOperands) {
          unit = lastOperands.unit
          variant = lastOperands.variant
        }
        break
      }
      case "mul": {
        if (!info?.variant) {
          const variants = new Set(operands.map(x => x.variant))
          if (variants.size > 1) variants.delete(undefined)
          if (variants.size > 1) variants.delete("physical")
          variant = variants.values().next().value
        }

        if (!info?.unit &&
          !operands.find(x => x.unit === "flat") &&
          operands.find(x => x.unit === "%"))
          unit = "%"
        break
      }
      case "res":
      case "sum_frac":
        unit = "%"
        variant = operands[0].variant
        break
      default: assertUnreachable(operation)
    }

    if (info?.unit) unit = info.unit
    if (info?.variant) variant = info.variant

    let formulas = new Map<ContextNodeDisplay, Displayable>()
    const operandFormulas: Displayable[] = []
    for (const operand of operands) {
      if (operand.name) {
        operandFormulas.push(<>{addVariant(operand.name, operand.variant)} {valueWithUnit(operand.value, operand.unit)}</>)
        if (operand.formula)
          formulas.set(operand, operand.formula)
      } else {
        operandFormulas.push(operand.formula ?? addVariant(`${operand.value}`, operand.variant))
      }
      if (operand.formulas.size)
        formulas = new Map([...formulas.entries(), ...operand.formulas])
    }
    let formula: Displayable | undefined = undefined
    switch (operation) {
      case "add":
        formula = joinComponents(operandFormulas, " + ")
        break
      case "mul":
        operands.forEach((x, i) => {
          if (x.operation === "add") operandFormulas[i] = <>({operandFormulas[i]})</>
        })
        formula = joinComponents(operandFormulas, " * ")
        break
      case "max": case "min":
        formula = <>{operation === "min" ? "Min" : "Max"}({joinComponents(operandFormulas, ", ")})</>
        break
      case "res": {
        const base = operands[0].value
        if (operands[0].operation === "add")
          operandFormulas[0] = <>({operandFormulas[0]})</>
        if (base < 0) formula = <>100% - {operandFormulas[0]} / 2</>
        else if (base >= 0.75) formula = <>100% / ({operandFormulas[0]} * 4 + 100%)</>
        else formula = <>100% - {operandFormulas[0]}</>
        break
      }
      case "sum_frac": {
        const wrapped = operands[0].operation === "add" ? <>{operandFormulas[0]}</> : operandFormulas[0]
        formula = <>{wrapped} / ({joinComponents(operandFormulas, "+")})</>
        break
      }
      case "threshold_add":
        if (operands[0].value >= operands[1].value)
          formula = operandFormulas[2]
        break
      default: assertUnreachable(operation)
    }

    const value = allOperations[operation](operands.map(x => x.value))
    return {
      operation,
      name: info?.name, formula,
      key: info?.key,
      value, unit: unit ?? "flat", variant, formulas
    }
  }
}
function addVariant(string: string, variant: ContextNodeDisplay["variant"]): Displayable {
  if (!string) return string

  // TODO
  return string
}
function valueWithUnit(value: number, unit: ContextNodeDisplay["unit"]): Displayable {
  // TODO
  return `${value}`
}
function joinComponents(components: Displayable[], joiner: string) {
  return <>{components.reduce((acc, x) => acc === null ? x : <>{acc}{joiner}</>, null as unknown as Displayable)}</>
}
function computeUIData(data: Data[]): UIData {
  const result: UIData = {
    values: {} as any,
    threshold: {}
  }

  const mainContext = new Context(data)
  mainContext.thresholds = result.threshold

  function process(node: ContextNodeDisplay): NodeDisplay {
    const { name, key, value, variant, formula, formulas } = node
    const newValue: NodeDisplay = {
      name: name ?? "", value, variant,
      formulas: [] // TODO
    }
    if (key) newValue.key = key
    if (formula) newValue.formulas.push(<>{name} = {formula}</>)
    newValue.formulas = [...newValue.formulas, ...[...formulas].map(([node, formula]) => <>{node.name} = {formula}</>)]
    return newValue
  }

  crawlObject(input, [], (x: any) => x.operation, (node: any, key: any) =>
    layeredAssignment(result.values, key,
      node.operation === "read"
        ? process(mainContext.compute(node, key))
        : mainContext.computeString(node)))
  for (const entry of data) {
    if (entry.conditional)
      crawlObject(entry.conditional, ["conditional"], (x: any) => x.operation, (x: any, key: string[]) =>
        layeredAssignment(result.values, key, process(mainContext.compute(x, key))))
    if (entry.display)
      crawlObject(entry.display, ["display"], (x: any) => x.operation, (x: any, key: string[]) =>
        layeredAssignment(result.values, key, process(mainContext.compute(x, key))))
  }

  return result
}

interface UIData {
  values: StrictInput<NodeDisplay, { value: string }> & DynamicNumInput<NodeDisplay>
  threshold: Input<Dict<number, Input<number, never>>, never>
}
export interface NodeDisplay {
  name: string
  key?: string
  value: number
  variant: ElementKeyWithPhy | "success" | undefined
  formulas: Displayable[]
}

export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeUIData,
}
