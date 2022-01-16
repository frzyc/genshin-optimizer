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
    substat2Node.info = {}

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

type ContextNodeDisplay = NodeDisplay & { operation: Node["operation"], unit: "%" | "flat" | undefined, origin: number }
type ContextString = { value?: string, origin: number }

class Context {
  thresholds: Dict<string, Dict<number, { path: string[], value: NodeDisplay }>> | undefined
  id: number
  allContexts: Context[]

  parent?: Context
  children = new Map<Data[], Context>()

  data: Data[]
  nodes = new Map<Node, ContextNodeDisplay>()
  string = new Map<StringNode, ContextString>()

  constructor(allContexts: Context[], data: Data[], parent?: Context) {
    this.allContexts = allContexts
    this.id = allContexts.length
    this.parent = parent
    this.data = data
    allContexts.push(this)
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
      case "const": result = this._constant(node, path); break
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
      case "sconst": result = { value: node.value, origin: 0 }; break
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
    if (!operands.length) return { origin: this.id }

    const origin = operands.reduce((prev, current) => Math.max(prev, current.origin), 0)
    if (origin !== this.id) return this.computeString(node)

    return { value: operands[0].value, origin: this.id }
  }
  _strRead(node: StringReadNode): ContextString {
    let key = node.key, origin = 0
    if (node.suffix) {
      const suffix = this.computeString(node.suffix)
      origin = Math.max(origin, suffix.origin)
      key = [...key as string[], suffix.value ?? ""]
    }

    return this.readFirstString(key) ?? { origin: this.id }
  }

  _read(node: ReadNode): ContextNodeDisplay {
    let key = node.key, origin = 0
    if (node.suffix) {
      const suffix = this.computeString(node.suffix)
      origin = Math.max(origin, suffix.origin)
      key = [...key as string[], suffix.value ?? ""]
    }

    if (!this.hasRead(key) && this.parent)
      return this.parent.compute(node, key)

    const nodes = this.readAll(key)
    origin = nodes.reduce((best, current) => Math.max(best, current.origin), origin)

    if (origin !== this.id) return this.allContexts[origin].compute(node, key)

    if (nodes.length == 1 || node.accumulation === "unique")
      return nodes[0] ?? this._constant({ operation: "const", operands: [], value: NaN }, key)

    const f = allOperations[node.accumulation]
    const value = f(nodes.map(x => x.value))

    // TODO: Compute these
    const unit = "flat"
    const variant = node.info?.variant
    const formulas = []

    return {
      operation: node.accumulation,
      name: node.info?.name ?? "",
      key: node.info?.key,
      value, unit, variant, formulas,
      origin: this.id,
    }
  }
  _data(node: DataNode, path: string[]): ContextNodeDisplay {
    let child = this.children.get(node.data)
    if (!child) {
      child = new Context(this.allContexts, node.data, this)
      this.children.set(node.data, child)
    }

    // TODO: Incorporate `info` if needed
    return child.compute(node.operands[0], path)
  }
  _compute(node: ComputeNode, path: string[]): ContextNodeDisplay {
    const operands = node.operands.map(x => this.compute(x, path))
    const origin = operands.reduce((best, current) => Math.max(current.origin, best), 0)

    if (origin !== this.id) return this.allContexts[origin].compute(node, path)

    if (this.thresholds && node.operation === "threshold_add") {
      const value = node.operands[0], threshold = node.operands[1]
      if (value.operation === "read" && threshold.operation === "const" && operands[0].value >= operands[1].value) {
        const key = [...value.key]
        if (value.suffix) key.push(this.computeString(value.suffix).value!)
        key.push(threshold.value.toString())
        layeredAssignment(this.thresholds, key.concat(...path), operands[2])
      }
    }

    // TODO: Compute these
    const unit = "flat"
    const variant = node.info?.variant
    const formulas = []

    const value = allOperations[node.operation](operands.map(x => x.value))
    return {
      operation: node.operation,
      name: node.info?.name ?? "",
      key: node.info?.key,
      value, unit, variant, formulas,
      origin: this.id,
    }
  }
  _subscript(node: SubscriptNode, path: string[]): ContextNodeDisplay {
    const operand = this.compute(node.operands[0], path)
    const origin = operand.origin

    if (origin !== this.id) this.allContexts[origin].compute(node, path)

    const value = node.list[operand.value]
    return {
      operation: node.operation,
      name: node.info?.name ?? "",
      key: node.info?.key,
      value, unit: node.info?.unit, variant: node.info?.variant, formulas: [],
      origin: this.id
    }
  }
  _constant(node: ConstantNode, path: string[]): ContextNodeDisplay {
    // All constants belong to the main context
    if (this.id !== 0) return this.allContexts[0].compute(node, path)
    return {
      operation: "const",
      name: node.info?.name ?? "",
      key: node.info?.key,
      value: node.value,
      unit: node.info?.unit, variant: node.info?.variant,
      formulas: [],
      origin: this.id,
    }
  }
}
function computeUIData(data: Data[]): UIData {
  const result: UIData = {
    values: {} as any,
    threshold: {}
  }

  const contexts: Context[] = []
  const mainContext = new Context(contexts, data)
  mainContext.thresholds = result.threshold

  crawlObject(input, [], (x: any) => x.operation, (node: any, key: any) =>
    layeredAssignment(result.values, key,
      node.operation === "read"
        ? mainContext.compute(node, key)
        : mainContext.computeString(node)))
  for (const entry of data) {
    if (entry.conditional)
      crawlObject(entry.conditional, ["conditional"], (x: any) => x.operation, (x: any, key: string[]) =>
        layeredAssignment(result.values, key, mainContext.compute(x, key)))
    if (entry.display)
      crawlObject(entry.display, ["display"], (x: any) => x.operation, (x: any, key: string[]) =>
        layeredAssignment(result.values, key, mainContext.compute(x, key)))
  }

  return result
}

interface UIData {
  values: StrictInput<NodeDisplay, { value: string }> & DynamicNumInput<NodeDisplay>
  threshold: Input<Dict<number, Input<number, never>>, never> // How this type works, we might never know
}
export interface NodeDisplay {
  /** structure negotiable */
  name: Displayable
  key: string | undefined
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
