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

interface UnitGroup {
  parent: UnitGroup
}
interface ContextNodeDisplay {
  name?: string, key?: string
  formula?: (ContextNodeDisplay | string)[]

  value: number
  variant: ElementKeyWithPhy | "success" | undefined
  unitGroup: UnitGroup

  formulaCache?: {
    formula: Displayable,
    dependencies: ContextNodeDisplay[]
    assignmentFormula?: Displayable
  }

  operation: Node["operation"]
  operandCount: number
}
interface ContextString { value?: string }

function newUnitGroup(): UnitGroup {
  const result: UnitGroup = {} as any
  result.parent = result
  return result
}
function identifyGroup(v: UnitGroup): UnitGroup {
  if (v.parent === v) return v
  const identity = identifyGroup(v.parent)
  v.parent = identity
  return identity
}
function mergeUnitGroup(l: UnitGroup, r: UnitGroup) {
  const iL = identifyGroup(l), iR = identifyGroup(r)
  iL.parent.parent = iR.parent
}
const percentGroup = newUnitGroup()

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
      case "prio":
        const operands = node.operands.map(x => this.computeString(x)).filter(x => x.value)
        result = { value: operands[0]?.value, }
        break
      case "sread":
        let key = node.key
        if (node.suffix) {
          const suffix = this.computeString(node.suffix)
          key = [...key as string[], suffix.value ?? ""]
        }
        result = this.readFirstString(key) ?? {}
        break
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

  _read(node: ReadNode): ContextNodeDisplay {
    let key = node.key
    if (node.suffix) {
      const suffix = this.computeString(node.suffix)
      key = [...key as string[], suffix.value ?? ""]
    }
    if (!this.hasRead(key) && this.parent)
      return this.parent.compute(node, key)

    const nodes = this.readAll(key)
    let result: ContextNodeDisplay
    if (nodes.length == 1 || node.accumulation === "unique") {
      result = nodes.length ? { ...nodes[0] } : this._constant({ operation: "const", operands: [], info: node.info, value: NaN })
      const info = node.info
      if (info) {
        if (info.key) result.key = info.key
        if (info.name) result.name = info.name
        if (info.unit === "%") mergeUnitGroup(result.unitGroup, percentGroup)
        if (info.variant) result.variant = info.variant
      }
    } else {
      result = this._accumulate(node.accumulation, nodes, node.info)
    }
    if (node.asConst)
      delete result.formula
    return result
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
    const result = this._constant({ operation: "const", operands: [], info: node.info, value, })
    result.operation = "subscript"
    return result
  }
  _constant(node: ConstantNode): ContextNodeDisplay {
    const result: ContextNodeDisplay = {
      operation: "const",
      key: node.info?.key,
      value: node.value,
      unitGroup: node.info?.unit === "%" ? percentGroup : newUnitGroup(), variant: node.info?.variant,
      operandCount: 0
    }
    if (node.info?.name) result.name = node.info.name
    return result
  }

  _accumulate(operation: ComputeNode["operation"], operands: ContextNodeDisplay[], info: Node["info"]): ContextNodeDisplay {
    let unitGroup = newUnitGroup(), variant: ContextNodeDisplay["variant"]

    switch (operation) {
      case "add": case "min": case "max": {
        operands.forEach(x => mergeUnitGroup(unitGroup, x.unitGroup))
        variant = mergeVariants(operands)
        break
      }
      case "threshold_add": {
        const operand = operands[2]
        unitGroup = operand.unitGroup
        variant = operand.variant
        break
      }
      case "mul": {
        if (!info?.variant)
          variant = mergeVariants(operands)
        if (!info?.unit) {
          if (operands.length === 1)
            unitGroup = operands[0].unitGroup

          // TODO
          let found = false
          unitGroup = operands.find(x => {
            if (identifyGroup(x.unitGroup) === identifyGroup(percentGroup)) {
              if (!found) found = true
              else return true
              return false
            }
          })?.unitGroup ?? unitGroup
        }
        break
      }
      case "res":
      case "sum_frac":
        unitGroup = percentGroup
        variant = mergeVariants(operands)
        break
      default: assertUnreachable(operation)
    }

    if (info?.unit === "%") mergeUnitGroup(unitGroup, percentGroup)
    if (info?.variant) variant = info.variant

    let formula: (ContextNodeDisplay | string)[]
    switch (operation) {
      case "max": formula = fStr`Max(${{ list: operands, separator: ', ' }})`; break
      case "min": formula = fStr`Min(${{ list: operands, separator: ', ' }})`; break
      case "add": formula = fStr`${{ list: operands, separator: ' + ' }}`; break
      case "mul": formula = fStr`${{ list: operands, separator: ' * ', shouldWrap }}`; break
      case "sum_frac": formula = fStr`${{ list: [operands[0]], shouldWrap }} / ${{ list: operands }}`; break
      case "res":
        {
          const base = operands[0].value
          if (base < 0) formula = fStr`100% - ${{ list: operands, shouldWrap }} / 2`
          else if (base >= 0.75) formula = fStr`100% / (${{ list: operands, shouldWrap }} * 4 + 100%)`
          else formula = fStr`100% - ${{ list: operands, shouldWrap }}`
          break
        }
      case "threshold_add":
        const value = operands[0].value, threshold = operands[1].value
        formula = (value >= threshold) ? operands[2].formula ?? [] : []
        break
      default: assertUnreachable(operation)
    }

    const value = allOperations[operation](operands.map(x => x.value))
    const result: ContextNodeDisplay = {
      operation,
      formula,
      value, unitGroup, variant,
      operandCount: operands.length
    }
    if (info?.name) result.name = info.name
    if (info?.key) result.key = info.key
    return result
  }
}
type ContextNodeDisplayList = { list: ContextNodeDisplay[], separator?: string, shouldWrap?: (_: ContextNodeDisplay) => boolean }
function fStr(strings: TemplateStringsArray, ...keys: (ContextNodeDisplay | ContextNodeDisplayList)[]): (ContextNodeDisplay | string)[] {
  const result: (ContextNodeDisplay | string)[] = []
  strings.forEach((string, i) => {
    result.push(string)
    if (i < keys.length) {
      if ((keys[i] as any).list) {
        const { list, separator = "", shouldWrap } = keys[i] as ContextNodeDisplayList
        list.forEach((item, i, array) => {
          if (shouldWrap?.(item)) {
            result.push("(")
            result.push(item)
            result.push(")")
          } else result.push(item)
          if (i < array.length - 1)
            result.push(separator)
        })
      } else result.push(keys[i] as ContextNodeDisplay)
    }
  })
  return result
}
function mergeVariants(operands: ContextNodeDisplay[]): ContextNodeDisplay["variant"] {
  const unique = new Set(operands.map(x => x.variant))
  if (unique.size > 1) unique.delete(undefined)
  if (unique.size > 1) unique.delete("physical")
  return unique.values().next().value
}
function shouldWrap(component: ContextNodeDisplay): boolean {
  return component.operation === "add" && component.operandCount > 1
}
function valueString(node: ContextNodeDisplay): string {
  return (identifyGroup(node.unitGroup) === identifyGroup(percentGroup))
    ? `${node.value * 100}%` : `${node.value}`
}
function computeFormulaString(node: ContextNodeDisplay): { formula: Displayable, dependencies: ContextNodeDisplay[] } {
  if (node.formulaCache) return node.formulaCache

  node.formulaCache = { formula: "", dependencies: [] }
  const result = node.formulaCache
  if (!node.formula) return result

  const dependencies = new Set<ContextNodeDisplay>()

  // TODO: Add JSX Version
  result.formula = node.formula.map(item => {
    if (typeof item === "string") return item

    const { formula, dependencies: subDependencies } = computeFormulaString(item)
    if (item.name) {
      dependencies.add(item)
      subDependencies.forEach(x => dependencies.add(x))
      return `${item.name} ${valueString(item)}`
    }
    if (item.formula) {
      subDependencies.forEach(x => dependencies.add(x))
      return formula
    }
    return `${valueString(item)}`
  }).join("")

  if (node.name)
    result.assignmentFormula = `${node.name} = ${result.formula}`
  result.dependencies = [...dependencies]
  return result
}
function computeUIData(data: Data[]): UIData {
  const result: UIData = {
    values: {} as any,
    threshold: {}
  }

  const mainContext = new Context(data)
  mainContext.thresholds = result.threshold

  function process(node: ContextNodeDisplay): NodeDisplay {
    const { name, key, value, variant } = node
    const newValue: NodeDisplay = {
      name: name ?? "", value,
      unit: "flat",
      formulas: [],
    }
    if (key) newValue.key = key
    if (variant) newValue.variant = variant
    if (identifyGroup(node.unitGroup) === identifyGroup(percentGroup)) newValue.unit = "%"

    if (newValue.name) {
      const { dependencies } = computeFormulaString(node)
      newValue.formulas = [node, ...dependencies.filter(x => x.formula)]
        .map(x => x.formulaCache!.assignmentFormula!)
        .filter(x => x)
    }
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
  unit: "%" | "flat"
  variant?: ElementKeyWithPhy | "success"
  formulas: Displayable[]
}

export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeUIData,
}
