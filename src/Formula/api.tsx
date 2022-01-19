import _charCurves from "../Character/expCurve_gen.json";
import StatMap, { unitOfKey } from "../StatMap";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { assertUnreachable, crawlObject, layeredAssignment, objectFromKeyMap, objPathValue } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { Input, input, StrictInput } from "./index";
import { constant } from "./internal";
import { allOperations } from "./optimization";
import { ComputeNode, ConstantNode, Data, DataNode, DynamicNumInput, Info, Node, ReadNode, StringNode, SubscriptNode } from "./type";
import { data, percent, prod, stringConst, subscript, sum } from "./utils";
const readNodeArrays: ReadNode[] = []
const shouldWrap = true
crawlObject(input, [], (x: any) => x.operation, (x: any) => readNodeArrays.push(x))

// TODO: Remove this conversion after changing the file format
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

function dmgNode(base: MainStatKey, lvlMultiplier: number[], move: "normal" | "charged" | "plunging" | "skill" | "burst", additional: Data = {}): Node {
  return data(input.hit.dmg, [{
    hit: {
      base: prod(input.total[base], subscript(input.lvl, lvlMultiplier)),
      move: stringConst(move), // TODO: element ?: T, reaction ?: T, critType ?: T
    },
  }, additional])
}
function dataObjForCharacterSheet(
  key: CharacterKey,
  element: ElementKey,
  weaponType: WeaponTypeKey,
  hp: { base: number, lvlCurve: string, asc: number[] },
  atk: { base: number, lvlCurve: string, asc: number[] },
  def: { base: number, lvlCurve: string, asc: number[] },
  special: { stat: MainStatKey | SubstatKey, asc: number[] },
  display: Data["display"],
  additional: Data = {},
): Data {
  function curve(array: { base: number, lvlCurve: string, asc: number[] }): Node {
    return sum(prod(array.base, subscript(input.lvl, charCurves[array.lvlCurve])), subscript(input.asc, array.asc))
  }

  const result = mergeData([{
    charKey: stringConst(key),
    charEle: stringConst(element),
    weaponType: stringConst(weaponType),
    hp: curve(hp), atk: curve(atk), def: curve(def),
    special: subscript(input.asc, special.asc, { key: special.stat }),
    premod: {
      [special.stat]: input.special,
    },
    display,
  }, additional])
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

  const result: Data = {
    base: { [mainStat.stat ?? "atk"]: input.weapon.main },
    premod: { [substat.stat]: input.weapon.sub },
    weapon: {
      key: stringConst(key), type: stringConst(type),
      main: mainStatNode, sub: substatNode,
    },
  }

  if (substat2) {
    result.weapon!.sub2 = substat2Node
    result.premod![substat2.stat] = substat2.stat !== substat.stat
      ? input.weapon.sub2 : sum(input.weapon.sub, input.weapon.sub2)
  }

  return mergeData([result, additional])
}
function dataObjForArtifact(art: ICachedArtifact, assumingMinimumMainStatLevel: number = 0): Data {
  // TODO: assume main stat level
  const stats: [ArtifactSetKey | MainStatKey | SubstatKey, number][] = []
  stats.push([art.mainStatKey, art.mainStatVal])
  art.substats.forEach(({ key, value }) => key && stats.push([key, value]))
  return {
    art: Object.fromEntries(stats.map(([key, value]) =>
      key.endsWith("_") ? [key, percent(value / 100)] : [key, constant(value)]))
  }
}
function dataObjForCharacter(char: ICachedCharacter): Data {
  return {
    lvl: constant(char.level),
    constellation: constant(char.constellation),
    asc: constant(char.ascension),

    // TODO: Check when char.elementKey can be null
    charEle: char.elementKey ? stringConst(char.elementKey) : undefined,

    talent: {
      base: {
        auto: constant(char.talent.auto),
        skill: constant(char.talent.skill),
        burst: constant(char.talent.burst),
      }
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
function mergeData(data: Data[]): Data {
  function internal(data: any[], input: any, path: string[]): any {
    if (data.length === 1) return data[0]
    if (input.operation) {
      const accumulation = (input as ReadNode).accumulation ?? "unique"
      if (accumulation === "unique") {
        if (data.length !== 1) throw new Error("Multiple entries when merging `unique`")
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
interface ContextString { value?: string }

class UIData {
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

  get(node: Node): NodeDisplay {
    const old = this.processed.get(node)
    if (old) return old

    const result = process(this._computeNode(node))
    this.processed.set(node, result)
    return result
  }
  private _computeNode(node: Node): ContextNodeDisplay {
    const old = this.nodes.get(node)
    if (old) return old

    const { operation } = node
    let result: ContextNodeDisplay
    switch (operation) {
      case "add": case "mul": case "min": case "max":
      case "res": case "sum_frac": case "threshold_add":
        result = this._compute(node); break
      case "const": result = this._constant(node); break
      case "subscript": result = this._subscript(node); break
      case "read": result = this._read(node); break
      case "data": result = this._data(node); break
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
  private readAll(path: string[]): ContextNodeDisplay[] {
    return [
      ...this.data.map(x => objPathValue(x, path) as Node).filter(x => x).map(x => this._computeNode(x)),
      ...this.parent?.readAll(path) ?? []]
  }
  private readFirstString(path: string[]): ContextString | undefined {
    const nodes = this.data.map(x => objPathValue(x, path) as StringNode).filter(x => x)
    return nodes.length ? this.getStr(nodes[0]) : this.parent?.readFirstString(path)
  }

  private _read(node: ReadNode): ContextNodeDisplay {
    let key = node.key
    if (node.suffix) {
      const suffix = this.getStr(node.suffix)
      key = [...key as string[], suffix.value ?? ""]
    }
    if (!this.hasRead(key) && this.parent)
      return this.parent._computeNode(node)

    const nodes = this.readAll(key)
    let result: ContextNodeDisplay

    if (node.accumulation === "unique")
      result = nodes.length
        ? { ...nodes[0] }
        : this._constant({ operation: "const", operands: [], info: node.info, value: NaN })
    else
      result = this._accumulate(node.accumulation, nodes)
    return mergeInfo(result, node.info)
  }
  private _data(node: DataNode): ContextNodeDisplay {
    let child = this.children.get(node.data)
    if (!child) {
      child = new UIData(node.data, this)
      this.children.set(node.data, child)
    }

    // TODO: Incorporate `info` if needed
    return child._computeNode(node.operands[0])
  }
  private _compute(node: ComputeNode): ContextNodeDisplay {
    const operation = node.operation
    const operands = node.operands.map(x => this._computeNode(x))
    return mergeInfo(this._accumulate(operation, operands), node.info)
  }
  private _subscript(node: SubscriptNode): ContextNodeDisplay {
    const operand = this._computeNode(node.operands[0])

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
  const result: (ContextNodeDisplay | string)[] = []
  strings.forEach((string, i) => {
    result.push(string)
    if (i < keys.length) {
      if ((keys[i] as any).operation) {
        result.push(keys[i] as ContextNodeDisplay)
      } else {
        const { operands, separator = ", ", shouldWrap } = keys[i] as ContextNodeDisplayList
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
  })
  return result.filter(x => x)
}
function mergeVariants(operands: ContextNodeDisplay[]): ContextNodeDisplay["variant"] {
  const unique = new Set(operands.map(x => x.variant))
  if (unique.size > 1) unique.delete(undefined)
  if (unique.size > 1) unique.delete("physical")
  return unique.values().next().value
}
function valueString(value: number, unit: "%" | "flat", fixed = -1): string {
  if (fixed === -1) {
    if (unit === "%") fixed = 1
    else fixed = Math.abs(value) < 10 ? 3 : Math.abs(value) < 1000 ? 2 : Math.abs(value) < 10000 ? 1 : 0
  }
  return unit === "%" ? `${(value * 100).toFixed(fixed)}%` : value.toFixed(fixed)
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
function computeUIData(data: Data[]): UIData {
  return new UIData(data, undefined)
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

export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeUIData, valueString,
  UIData,
}
