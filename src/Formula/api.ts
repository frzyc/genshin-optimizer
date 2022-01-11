import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, CharacterKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { crawlObject, layeredAssignment, objectFromKeyMap } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { formulaString } from "./debug";
import { input, NumInput, str, StringInput } from "./index";
import { constant } from "./internal";
import { optimize } from "./optimization";
import { Data, Node, ReadNode, StringReadNode } from "./type";
import { customRead, data, prod, stringConst, subscript, sum } from "./utils";

const readNodeArrays: ReadNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readNodeArrays.push(x))


// TODO: Remove this conversion
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))

function dataObjForArtifactSheets(): Data {
  // TODO: Add Artifact set effects
  return {
    number: {}, string: {}
  }
}
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
      base: {
        hp: curve(hp), atk: curve(atk), def: curve(def),
        [special.stat]: subscript(input.char.asc, special.asc),
      },
      display,
    }, additional], input), string: {
      char: {
        key: stringConst(key),
        ...(element ? { element: stringConst(element) } : {}),
      }
    }
  }
}
function dataObjForWeaponSheet(
  key: WeaponKey, type: WeaponTypeKey,
  baseAtkStat: { base?: number, lvlCurve?: string, refinement?: number[], asc?: number[] },
  stats: { stat: MainStatKey | SubstatKey, base?: number, lvlCurve?: string, refinement?: number[], asc?: number[] }[],
  additional: Data["number"] = {},
): Data {
  const result: Data = {
    number: {
      premod: {},
    }, string: {
      weapon: {
        key: stringConst(key),
        type: stringConst(type),
      }
    }
  }

  function getNode(value: { base?: number, lvlCurve?: string, refinement?: number[], asc?: number[] }): Node | undefined {
    const { base, lvlCurve, refinement, asc } = value
    const nodes: Node[] = []
    if (base && lvlCurve)
      nodes.push(prod(constant(base), subscript(input.weapon.lvl, weaponCurves[lvlCurve])))
    if (refinement) nodes.push(subscript(input.weapon.refineIndex, refinement))
    if (asc) nodes.push(subscript(input.weapon.asc, asc))

    if (nodes.length === 0) return undefined
    return nodes.length === 1 ? nodes[0] : sum(...nodes)
  }

  const baseAtkNode = getNode(baseAtkStat)
  if (baseAtkNode) result.number.base = { atk: baseAtkNode }

  for (const stat of stats) {
    const node = getNode(stat)
    if (node) result.number.premod![stat.stat] = node
  }

  result.number = mergeDataComponents([result.number, additional], input)
  return result
}
function dataObjForArtifact(art: ICachedArtifact): Data {
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
function computeData(dataList: Data[]): ComputedValues {
  const nodes = { ...input, conditional: {}, display: {} }
  const nodeArray: ReadNode[] = [...readNodeArrays]

  for (const prefix of ["conditional", "display"])
    dataList.map(x => x.number[prefix]).forEach(data =>
      crawlObject(data ?? {}, [prefix], (x: any) => x.operation, (_: any, keys: string[]) => {
        const readNode = customRead(keys)
        layeredAssignment(nodes, keys, readNode)
        nodeArray.push(readNode)
      }))

  const results = optimize(nodeArray, dataList, _ => true).map(x => formulaString(x))

  return {
    number: {
      total: {
        atk: 100,
      }
    },
    string: {

    }
  }
}
function displaysFromNodes(nodes: Data, values: ComputedValues): NumInput<NodeDisplay> {
  return {
    total: {
      atk: {
        operation: "add",
        name: "Total ATK",
        formulas: [
          "TotalATK = baseATK + ...",
          "BaseATK = char atk + ...",
        ]
      }
    }
  }
}

export interface ComputedValues {
  number: NumInput<number>
  string: StringInput<string>
}

export interface NodeDisplay {
  /** structure negotiable */
  operation: Node["operation"]
  name: Displayable
  formulas: Displayable[]
}

export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForArtifactSheets, dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeData, displaysFromNodes,
}
