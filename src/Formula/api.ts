import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { assertUnreachable, crawlObject, layeredAssignment, objectFromKeyMap, objPathValue } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { input, NumInput, str, StrictNumInput, StrictStringInput, StringInput } from "./index";
import { constant } from "./internal";
import { allOperations } from "./optimization";
import { ComputeNode, ConstantNode, Data, DataNode, DynamicNumInput, Node, ReadNode, StringNode, StringPriorityNode, StringReadNode, SubscriptNode } from "./type";
import { data, prod, stringConst, subscript, sum } from "./utils";
const readNodeArrays: ReadNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readNodeArrays.push(x))

// TODO: Remove this conversion after changing the file format
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

const readInputArray: Node[] = [], stringInputArray: StringNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readInputArray.push(x))
crawlObject(str, [], (x: any) => x.operation, (x: any) => stringInputArray.push(x))

function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data["number"] = {}): Node {
  return data(input.hit.dmg, [{
    number: {
      hit: {
        base: prod(input.total[base], subscript(input.char.lvl, lvlMultiplier)),
      },
    }, string: {
      dmg: {
        move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
      },
    }
  }, ...(Object.keys(additional).length ? [{ number: additional, string: {} }] : [])])
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKeyWithPhy | undefined,
  hp: { base: number, lvlCurve: string, asc: number[] },
  atk: { base: number, lvlCurve: string, asc: number[] },
  def: { base: number, lvlCurve: string, asc: number[] },
  special: { stat: MainStatKey | SubstatKey, asc: number[] },
  display: Data["number"]["display"],
  additional: Data["number"] = {},
): Data {
  function curve(array: { base: number, lvlCurve: string, asc: number[] }): Node {
    return sum(prod(array.base, subscript(input.char.lvl, charCurves[array.lvlCurve])), subscript(input.char.asc, array.asc))
  }

  return {
    number: mergeDataComponents([{
      char: {
        hp: curve(hp), atk: curve(atk), def: curve(def),
        special: subscript(input.char.asc, special.asc),
      },
      base: {
        [special.stat]: input.char.special
      },
      display,
    }, additional], input), string: {
      char: {
        key: stringConst(key), special: stringConst(special.stat),
        ...(element ? { element: stringConst(element) } : {}),
      }
    }
  }
}
function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  mainStat: { stat?: "atk", base: number, lvlCurve: string, asc: number[] },
  substat: { stat: MainStatKey | SubstatKey, base: number, lvlCurve: string },
  substat2: { stat: MainStatKey | SubstatKey, refinement: number[] } | undefined,
  additional: Data["number"] = {},
): Data {
  const mainStatNode = sum(prod(mainStat.base, subscript(input.weapon.lvl, weaponCurves[mainStat.lvlCurve])), subscript(input.weapon.asc, mainStat.asc))
  const substatNode = prod(substat.base, subscript(input.weapon.lvl, weaponCurves[substat.lvlCurve]))
  const substat2Node = substat2 && subscript(input.weapon.refineIndex, substat2.refinement)

  const result: Data = {
    number: {
      base: { [mainStat.stat ?? "atk"]: mainStatNode },
      premod: {
        [substat.stat]: substatNode,
      },
      weapon: {
        main: mainStatNode, sub: substatNode,
      }
    }, string: {
      weapon: {
        key: stringConst(key),
        type: stringConst(type),
        main: stringConst(mainStat.stat ?? "atk"),
        sub: stringConst(substat.stat),
      }
    }
  }

  if (substat2) {
    result.string.weapon!.sub2 = stringConst(substat2.stat)
    result.number.weapon!.sub2 = substat2Node
    result.number.premod![substat2.stat] = substat2.stat !== substat.stat
      ? substat2Node : sum(substatNode, substat2Node!)
  }

  result.number = mergeDataComponents([result.number, additional], input)
  return result
}
function dataObjForArtifact(art: ICachedArtifact, assumingMinimumMainStatLevel: number): Data {
  // TODO: assume main stat level
  return {
    number: {
      art: {
        [art.mainStatKey]: constant(art.mainStatVal),
        ...Object.fromEntries(art.substats
          .filter((x) => x.key)
          .map(({ key, value }) => [key, constant(value)])),
        [art.setKey]: constant(1),
      },
    }, string: {}
  }
}
function dataObjForCharacter(char: ICachedCharacter): Data {
  return {
    number: {
      char: {
        lvl: constant(char.level),
        constellation: constant(char.constellation),
        asc: constant(char.ascension),

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
      }
    },
    string: {
      char: {
        // TODO: Check when char.elementKey can be null
        ...(char.elementKey ? { ele: stringConst(char.elementKey) } : {})
      },
      dmg: {
        hitMode: stringConst(char.hitMode)
      }
    },
  }
}
function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    number: {
      weapon: {
        lvl: constant(weapon.level),
        asc: constant(weapon.ascension),
        refineIndex: constant(weapon.refinement - 1),
      },
    }, string: {}
  }
}

function mergeDataComponents<T extends Data["number" | "string"]>(data: T[], readNodes: any): T {
  data = data.filter(data => Object.keys(data).length)
  if (data.length <= 1) return data[0] ?? {}

  function internal(data: any[], readNodes: any): any {
    if (data.length <= 1) return data[0]

    if (readNodes.operation) {
      // Found leaf
      const readNode = readNodes as ReadNode | StringReadNode
      const accumulation = readNode.accumulation ?? "unique"

      if (accumulation === "unique")
        if (data.length > 1) throw `Found multiple entries for unique read node ${readNode.key}`
        else return data[0]

      return { ...readNode, operation: accumulation, operands: data }
    }

    return Object.fromEntries([...new Set(data.flatMap(x => Object.keys(x)) as string[])]
      .map(key => [key, internal(data.filter(data => data[key]).map(data => data[key]), readNodes[key])]))
  }

  return internal(data, readNodes)
}
function mergeData(...data: Data[]): Data {
  return {
    number: mergeDataComponents(data.map(x => x.number), input),
    string: mergeDataComponents(data.map(x => x.string), str),
  }
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
      case "const": result = { value: node.value, origin: 0 }; break
      case "prio": result = this._strPrio(node); break
      case "read": result = this._strRead(node); break
      default: assertUnreachable(operation)
    }

    this.string.set(node, result)
    return result
  }

  hasRead(path: string[]): boolean {
    return this.data.some(data => objPathValue(data.number, path) as Node)
  }
  readAll(path: string[]): ContextNodeDisplay[] {
    return [
      ...this.data.map(x => objPathValue(x.number, path) as Node).filter(x => x).map(x => this.compute(x, path)),
      ...this.parent?.readAll(path) ?? []]
  }
  readFirstString(path: string[]): ContextString | undefined {
    const nodes = this.data.map(x => objPathValue(x.string, path) as StringNode).filter(x => x)
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
      return nodes[0] ?? {
        operation: "const", origin: 0,
        name: "", value: NaN, variant: undefined,
        formulas: [],
      }

    const f = allOperations[node.accumulation]
    const value = f(nodes.map(x => x.value))

    // TODO: Compute these
    const unit = "flat"
    const variant = node.info?.variant
    const formulas = []

    return {
      operation: node.accumulation,
      name: node.info?.name ?? "",
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
  _constant(node: ConstantNode, path: string[]): ContextNodeDisplay {
    // All constants belong to the main context
    if (this.id !== 0) return this.allContexts[0].compute(node, path)
    return {
      operation: "const",
      name: node.info?.name ?? "",
      value: node.value,
      unit: node.info?.unit, variant: node.info?.variant,
      formulas: [],
      origin: this.id,
    }
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
      value, unit: node.info?.unit, variant: node.info?.variant, formulas: [],
      origin: this.id
    }
  }
}
function computeUIData(data: Data[]): UIData {
  const result: UIData = {
    number: {} as any,
    string: {} as any,
    threshold: {}
  }

  const contexts: Context[] = []
  const mainContext = new Context(contexts, data)
  mainContext.thresholds = result.threshold

  crawlObject(input, [], (x: any) => x.operation, (node: any, key: any) => {
    layeredAssignment(result.number, key, mainContext.compute(node, key))
  })
  crawlObject(str, [], (x: any) => x.operation, (node: any, key: any) => {
    layeredAssignment(result.string, key, mainContext.computeString(node))
  })
  for (const entry of data) {
    if (entry.number.conditional) {
      crawlObject(entry.number.conditional, ["conditional"], (x: any) => x.operation, (x: any, key: string[]) =>
        layeredAssignment(result.number, key, x))
    }
    if (entry.number.display) {
      crawlObject(entry.number.display, ["display"], (x: any) => x.operation, (x: any, key: string[]) =>
        layeredAssignment(result.number, key, x))
    }
  }

  return result
}

interface UIData {
  number: StrictNumInput<NodeDisplay> & DynamicNumInput<NodeDisplay>
  string: StrictStringInput<{ value: string }>
  threshold: NumInput<Dict<number, NumInput<number>>> // How this type works, we might never know
}
export interface NodeDisplay {
  /** structure negotiable */
  name: Displayable
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
