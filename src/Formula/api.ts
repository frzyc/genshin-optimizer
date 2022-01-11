import _charCurves from "../Character/expCurve_gen.json";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allArtifactSets, allElementsWithPhy, ArtifactSetKey, CharacterKey, ElementKeyWithPhy, WeaponKey, WeaponTypeKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { crawlObject, layeredAssignment, objectFromKeyMap } from "../Util/Util";
import _weaponCurves from "../Weapon/expCurve_gen.json";
import { formulaString } from "./debug";
import { input, NumInput, str, StringInput } from "./index";
import { constant } from "./internal";
import { optimize } from "./optimization";
import { ComputeNode, ConstantNode, Data, Node, NodeData, ReadNode, StringReadNode } from "./type";
import { customRead, data, max, min, prod, stringConst, subscript, sum, threshold_add } from "./utils";
import { data as EmblemOfSeveredFateData } from '../Data/Artifacts/EmblemOfSeveredFate/index_WR'
const readNodeArrays: ReadNode[] = []
crawlObject(input, [], (x: any) => x.operation, (x: any) => readNodeArrays.push(x))


// TODO: Remove this conversion
const charCurves = Object.fromEntries(Object.entries(_charCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))
const weaponCurves = Object.fromEntries(Object.entries(_weaponCurves).map(([key, value]) => [key, [0, ...Object.values(value)]]))


const nodesByArtifactSet: StrictDict<ArtifactSetKey, Dict<1 | 2 | 4, { premod: Dict<keyof Data["number"]["premod"], Node>, dmgBonus: Dict<keyof Data["number"]["dmgBonus"], Node> }>> = objectFromKeyMap(allArtifactSets, _ => ({}))
crawlObject(EmblemOfSeveredFateData.number, [], x => x.operation === "threshold_add", (node: ComputeNode, key: string[]) => {
  const { operands: [inputNode, thresholdNode, bonus] } = node;
  const inputNodeKey = (inputNode as ReadNode).key
  const set = inputNodeKey[inputNodeKey.length - 1] as ArtifactSetKey
  const threshold = (thresholdNode as ConstantNode).value.toString()
  const root = nodesByArtifactSet[set]

  if (!root || !threshold) return
  layeredAssignment(root, [threshold, key[0], key[1]], node)
})

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
type ReplaceNode<Root, NewNode> = Root extends Node ? NewNode : { [key in keyof Root]: ReplaceNode<Root[key], NewNode> }
function computeData<T extends NodeData>(nodes: T, dataList: Data[]): ReplaceNode<T, number> {
  const nodeArray: Node[] = []
  crawlObject(nodes, [], (x: any) => x.operation, (node: Node, keys: string[]) => {
    nodeArray.push(node)
  })

  const resultArray = optimize(nodeArray, dataList, _ => true).map(x => formulaString(x))
  const result = {} as any
  let i = 0
  crawlObject(nodes, [], (x: any) => x.operation, (node: Node, key: string[]) => {
    layeredAssignment(result, key, resultArray[i++])
  })

  return result
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
  dataObjForCharacterSheet, dataObjForWeaponSheet,
  dmgNode,

  mergeData, computeData, displaysFromNodes,

  nodesByArtifactSet,
}
